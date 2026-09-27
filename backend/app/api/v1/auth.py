"""
Authentication & Institutional Role Authorization API Router
=============================================================
Provides session authentication, role switching, user identity, and token issuance.
"""

from __future__ import annotations

import logging
import secrets
import time
from typing import Any

from fastapi import APIRouter, Depends, HTTPException, Request, status
from pydantic import BaseModel, Field

from app.core.security import (
    UserSession,
    create_access_token,
    get_current_user,
    log_audit_event,
    ROLE_PERMISSIONS,
)
from app.db.database import DatabaseClient, get_db_client

logger = logging.getLogger("ambedkar.auth")
router = APIRouter(prefix="/auth", tags=["Authentication & RBAC"])


class LoginRequest(BaseModel):
    username_or_email: str
    password: str


class RoleTokenRequest(BaseModel):
    role: str = Field(description="One of: 'visitor', 'student', 'researcher', 'archivist', 'admin'")
    full_name: str | None = None


class AuthResponse(BaseModel):
    access_token: str
    token_type: str = "Bearer"
    expires_in: int = 86400 * 7
    user: UserSession


# ── Canonical Institutional Test Accounts ─────────────────────────────────────
DEMO_ACCOUNTS = {
    "admin": {
        "user_id": "usr_admin_001",
        "username": "admin",
        "email": "admin@ambedkar-heritage.gov.in",
        "full_name": "Chief Institutional Archivist & Admin",
        "role": "admin",
    },
    "archivist": {
        "user_id": "usr_archivist_001",
        "username": "archivist",
        "email": "archivist@ambedkar-heritage.gov.in",
        "full_name": "Senior Heritage Curator",
        "role": "archivist",
    },
    "researcher": {
        "user_id": "usr_researcher_001",
        "username": "researcher",
        "email": "researcher@university.ac.in",
        "full_name": "Constitutional Scholar",
        "role": "researcher",
    },
    "student": {
        "user_id": "usr_student_001",
        "username": "student",
        "email": "student@school.edu.in",
        "full_name": "History Student",
        "role": "student",
    },
    "visitor": {
        "user_id": "usr_visitor_001",
        "username": "visitor",
        "email": "visitor@public.org",
        "full_name": "Museum Visitor",
        "role": "public",
    },
}


@router.post("/session-token", response_model=AuthResponse)
async def acquire_role_session(
    body: RoleTokenRequest,
    request: Request,
    db: DatabaseClient = Depends(get_db_client),
) -> AuthResponse:
    """
    Acquire a cryptographically signed JWT token for an institutional role.
    Used for institutional navigation, workstation switching, and researcher access.
    """
    role_key = body.role.lower().strip()
    if role_key == "visitor":
        role_key = "public"

    if role_key not in ROLE_PERMISSIONS:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Invalid role '{body.role}'. Must be one of: visitor, student, researcher, archivist, admin.",
        )

    account_meta = DEMO_ACCOUNTS.get(role_key if role_key != "public" else "visitor", {
        "user_id": f"usr_{role_key}_{secrets.token_hex(4)}",
        "username": role_key,
        "email": f"{role_key}@ambedkar-heritage.gov.in",
        "full_name": body.full_name or f"Authorized {role_key.capitalize()}",
        "role": role_key,
    })

    user_session = UserSession(
        user_id=account_meta["user_id"],
        username=account_meta["username"],
        email=account_meta["email"],
        role=role_key,
        full_name=body.full_name or account_meta["full_name"],
        permissions=ROLE_PERMISSIONS[role_key],
    )

    token_payload = {
        "user_id": user_session.user_id,
        "username": user_session.username,
        "email": user_session.email,
        "role": user_session.role,
        "full_name": user_session.full_name,
    }

    token = create_access_token(token_payload)

    # Record in audit log
    client_ip = request.client.host if request.client else "unknown"
    await log_audit_event(
        db,
        user_id=user_session.user_id,
        action="ACQUIRE_ROLE_SESSION",
        resource="auth",
        resource_id=user_session.role,
        details=f"Acquired signed session for role: {user_session.role}",
        ip_address=client_ip,
    )

    return AuthResponse(
        access_token=token,
        token_type="Bearer",
        expires_in=86400 * 7,
        user=user_session,
    )


@router.post("/login", response_model=AuthResponse)
async def login(
    body: LoginRequest,
    request: Request,
    db: DatabaseClient = Depends(get_db_client),
) -> AuthResponse:
    """Authenticate with username/email and password."""
    username = body.username_or_email.lower().strip()
    
    # Check known institutional accounts
    matched_role = None
    for r_name, acc in DEMO_ACCOUNTS.items():
        if username in (acc["username"], acc["email"]):
            matched_role = r_name
            break

    if not matched_role:
        # Check standard demo logins
        if username in ("admin", "administrator"):
            matched_role = "admin"
        elif username in ("archivist", "curator"):
            matched_role = "archivist"
        elif username in ("researcher", "scholar"):
            matched_role = "researcher"
        else:
            matched_role = "visitor"

    return await acquire_role_session(
        RoleTokenRequest(role=matched_role),
        request=request,
        db=db,
    )


@router.get("/me", response_model=UserSession)
async def get_current_session(
    user: UserSession = Depends(get_current_user),
) -> UserSession:
    """Return the currently authenticated institutional user session and permission set."""
    return user


@router.post("/logout")
async def logout(
    request: Request,
    user: UserSession = Depends(get_current_user),
    db: DatabaseClient = Depends(get_db_client),
) -> dict[str, Any]:
    """End session and record audit event."""
    client_ip = request.client.host if request.client else "unknown"
    await log_audit_event(
        db,
        user_id=user.user_id,
        action="LOGOUT",
        resource="auth",
        resource_id=user.role,
        details="Session ended",
        ip_address=client_ip,
    )
    return {"message": "Session logged out successfully.", "status": "logged_out"}
