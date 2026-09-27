"""
Core Security & Authentication Infrastructure — Institutional RBAC
===================================================================
Implements:
1. Cryptographic JWT Bearer token issuance & validation (RFC 7519 HS256).
2. Institutional Role-Based Access Control (RBAC):
   - 'public' / 'visitor' / 'student': Read, Search, Media, Timeline, Assistant
   - 'researcher': Read, Search + Bulk Export, Research Pack (.ZIP), Citation Suites
   - 'archivist': Researcher + Ingest, Upload, Metadata Edit, OCR Review & Approval
   - 'admin': Full System Access, User Management, Schema Migrations, Audit Inspection
3. Audit Event Logging (PostgreSQL audit_events table).
4. Path traversal neutralization & safe error masking.
"""

from __future__ import annotations

import base64
import hashlib
import hmac
import json
import logging
import os
import secrets
import time
from pathlib import Path
from typing import Annotated, Any

from fastapi import Depends, Header, HTTPException, Query, Request, status
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from pydantic import BaseModel, Field

from app.core.config import settings

logger = logging.getLogger("ambedkar.security")

# Reusable HTTP Bearer scheme
bearer_scheme = HTTPBearer(auto_error=False)

# Configured server-side admin secret (kept strictly on server, never sent to browser)
ADMIN_API_KEY = os.getenv("ADMIN_API_KEY", "ambedkar-heritage-admin-2026-secure")
JWT_SECRET_KEY = os.getenv("JWT_SECRET_KEY", "ambedkar-heritage-platform-secret-2026-production")

# Canonical Role Definitions
ROLE_PERMISSIONS: dict[str, list[str]] = {
    "public": [
        "documents:read",
        "search:read",
        "media:read",
        "timeline:read",
        "assistant:read",
        "memorials:read",
        "stories:read",
    ],
    "student": [
        "documents:read",
        "search:read",
        "media:read",
        "timeline:read",
        "assistant:read",
        "memorials:read",
        "stories:read",
        "quest:play",
    ],
    "researcher": [
        "documents:read",
        "search:read",
        "media:read",
        "timeline:read",
        "assistant:read",
        "memorials:read",
        "stories:read",
        "quest:play",
        "documents:export",
        "collections:export_pack",
        "citations:export",
        "collection:manage",
    ],
    "archivist": [
        "documents:read",
        "search:read",
        "media:read",
        "timeline:read",
        "assistant:read",
        "memorials:read",
        "stories:read",
        "quest:play",
        "documents:export",
        "collections:export_pack",
        "citations:export",
        "collection:manage",
        "documents:upload",
        "documents:edit",
        "ocr:review",
        "ingest:manage",
        "preservation:audit",
    ],
    "admin": [
        "*:*",
    ],
}


class UserSession(BaseModel):
    user_id: str
    username: str
    email: str
    role: str
    full_name: str = ""
    permissions: list[str] = Field(default_factory=list)

    def has_permission(self, resource: str, action: str) -> bool:
        if "*:*" in self.permissions or self.role == "admin":
            return True
        needed = f"{resource}:{action}"
        wildcard = f"{resource}:*"
        return needed in self.permissions or wildcard in self.permissions


# ── JWT Token Utilities (RFC 7519 Compliant HS256) ───────────────────────────

def create_access_token(data: dict[str, Any], expires_in_seconds: int = 86400 * 7) -> str:
    """Issue a cryptographically signed HMAC-SHA256 JWT access token."""
    header = {"alg": "HS256", "typ": "JWT"}
    payload = data.copy()
    now = int(time.time())
    payload["exp"] = now + expires_in_seconds
    payload["iat"] = now

    b64_header = base64.urlsafe_b64encode(json.dumps(header, separators=(",", ":")).encode()).decode().rstrip("=")
    b64_payload = base64.urlsafe_b64encode(json.dumps(payload, separators=(",", ":")).encode()).decode().rstrip("=")

    message = f"{b64_header}.{b64_payload}".encode("utf-8")
    signature = hmac.new(JWT_SECRET_KEY.encode("utf-8"), message, hashlib.sha256).digest()
    b64_sig = base64.urlsafe_b64encode(signature).decode().rstrip("=")

    return f"{b64_header}.{b64_payload}.{b64_sig}"


def decode_access_token(token: str) -> dict[str, Any] | None:
    """Verify cryptographic signature and expiration of an access token."""
    try:
        parts = token.split(".")
        if len(parts) != 3:
            return None
        b64_header, b64_payload, b64_sig = parts
        message = f"{b64_header}.{b64_payload}".encode("utf-8")
        expected_sig = hmac.new(JWT_SECRET_KEY.encode("utf-8"), message, hashlib.sha256).digest()
        expected_b64_sig = base64.urlsafe_b64encode(expected_sig).decode().rstrip("=")

        if not hmac.compare_digest(b64_sig, expected_b64_sig):
            return None

        # Add base64 padding
        padded_payload = b64_payload + "=" * (-len(b64_payload) % 4)
        payload = json.loads(base64.urlsafe_b64decode(padded_payload.encode()).decode("utf-8"))

        if payload.get("exp", 0) < int(time.time()):
            logger.warning("Rejected expired access token")
            return None

        return payload
    except Exception as e:
        logger.warning(f"Error decoding access token: {e}")
        return None


# ── Dependency: Get Current User ─────────────────────────────────────────────

async def get_current_user(
    auth_credentials: HTTPAuthorizationCredentials | None = Depends(bearer_scheme),
    token_param: str | None = Query(default=None, alias="token"),
    x_admin_key: Annotated[str | None, Header(alias="X-Admin-Key")] = None,
) -> UserSession:
    """
    Extracts and authenticates user session from Bearer JWT, Query Token, or Server Admin Key.
    If unauthenticated, returns an anonymous Visitor/Public UserSession.
    """
    # 1. Check Bearer token or URL token parameter
    token = None
    if auth_credentials and auth_credentials.credentials:
        token = auth_credentials.credentials.strip()
    elif token_param:
        token = token_param.strip()

    if token:
        payload = decode_access_token(token)
        if payload:
            role = payload.get("role", "public")
            permissions = ROLE_PERMISSIONS.get(role, ROLE_PERMISSIONS["public"])
            return UserSession(
                user_id=payload.get("user_id", "usr_unknown"),
                username=payload.get("username", "user"),
                email=payload.get("email", ""),
                role=role,
                full_name=payload.get("full_name", ""),
                permissions=permissions,
            )

    # 2. Server-side admin key support (for automated CLI / backend tests)
    if x_admin_key and secrets.compare_digest(x_admin_key, ADMIN_API_KEY):
        return UserSession(
            user_id="usr_admin_cli",
            username="admin_cli",
            email="admin@ambedkar-heritage.gov.in",
            role="admin",
            full_name="System Administrator (CLI)",
            permissions=["*:*"],
        )

    # 3. Default Anonymous Visitor session
    return UserSession(
        user_id="usr_anonymous",
        username="visitor",
        email="",
        role="public",
        full_name="Institutional Visitor",
        permissions=ROLE_PERMISSIONS["public"],
    )


# ── Dependency Factories for Authorization ────────────────────────────────────

def require_role(allowed_roles: list[str]):
    """Enforces that the authenticated user possesses one of the allowed roles."""
    async def role_checker(user: UserSession = Depends(get_current_user)) -> UserSession:
        if user.role == "admin" or user.role in allowed_roles:
            return user
        logger.warning(f"Access denied for user {user.username} ({user.role}) - requires {allowed_roles}")
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail=f"Access forbidden: requires one of the following institutional roles: {', '.join(allowed_roles)}. Current role: '{user.role}'.",
        )
    return role_checker


def require_permission(resource: str, action: str):
    """Enforces that the authenticated user possesses a specific permission."""
    async def perm_checker(user: UserSession = Depends(get_current_user)) -> UserSession:
        if user.has_permission(resource, action):
            return user
        logger.warning(f"Permission denied for {user.username}: requires {resource}:{action}")
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail=f"Access forbidden: missing required institutional permission '{resource}:{action}'.",
        )
    return perm_checker


async def require_admin_auth(
    user: UserSession = Depends(get_current_user),
) -> bool:
    """Enforces administrator credentials."""
    if user.role != "admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Forbidden: Administrator credentials required.",
        )
    return True


# ── Audit Event Helper ────────────────────────────────────────────────────────

async def log_audit_event(
    db: Any,
    user_id: str,
    action: str,
    resource: str,
    resource_id: str | None = None,
    details: str | None = None,
    ip_address: str | None = None,
) -> None:
    """Records an immutable audit event in the database."""
    try:
        event_id = f"evt_{secrets.token_hex(8)}"
        created_at = time.strftime("%Y-%m-%d %H:%M:%S")
        await db.execute(
            """
            INSERT INTO audit_events (id, user_id, action, resource, resource_id, details, ip_address, created_at)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)
            """,
            [event_id, user_id, action, resource, resource_id or "", details or "", ip_address or "", created_at],
        )
    except Exception as e:
        logger.error(f"Failed to record audit event: {e}")


# ── Path Traversal Neutralization ─────────────────────────────────────────────

def sanitize_path(file_path: str, base_dir: Path) -> Path:
    """Neutralize path traversal attacks. Guarantees resolved path resides strictly within base_dir."""
    if "\x00" in file_path:
        raise ValueError("Null byte injection detected in path")

    clean_path = (base_dir / file_path.lstrip("/\\")).resolve()
    base_resolved = base_dir.resolve()

    if not str(clean_path).startswith(str(base_resolved)):
        logger.error(
            "Path traversal attempt blocked",
            extra={"attempted": file_path, "resolved": str(clean_path)},
        )
        raise ValueError("Path traversal violation: Access outside base directory prohibited")

    return clean_path
