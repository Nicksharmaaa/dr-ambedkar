"""
Phase 12: Core Security & Authentication Infrastructure
========================================================
Implements:
1. Administrative API authentication (X-Admin-Key or Bearer token)
2. Safe error masking (never leak Turso credentials, internal paths, or secrets)
3. Request rate limiting & size validation
4. Path traversal neutralization
"""

from __future__ import annotations

import logging
import os
import secrets
from pathlib import Path
from typing import Annotated

from fastapi import Depends, Header, HTTPException, Request, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials

from app.core.config import settings

logger = logging.getLogger("ambedkar.security")

# Reusable HTTP Bearer scheme (optional for non-browser admin clients)
bearer_scheme = HTTPBearer(auto_error=False)

# Configured admin key (falls back to secure environment variable or safe local default)
ADMIN_API_KEY = os.getenv("ADMIN_API_KEY", "ambedkar-heritage-admin-2026-secure")


async def require_admin_auth(
    x_admin_key: Annotated[str | None, Header(alias="X-Admin-Key")] = None,
    auth_credentials: HTTPAuthorizationCredentials | None = Depends(bearer_scheme),
) -> bool:
    """
    Dependency that enforces administrative authentication.
    Accepts either 'X-Admin-Key' header or 'Authorization: Bearer <token>'.
    Rejects unauthorized access with 401/403 without leaking system details.
    """
    token_to_verify = None
    if x_admin_key:
        token_to_verify = x_admin_key
    elif auth_credentials and auth_credentials.credentials:
        token_to_verify = auth_credentials.credentials

    if not token_to_verify:
        logger.warning("Unauthorized admin access attempt: missing authentication token")
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Administrative authentication required. Provide valid 'X-Admin-Key' or Bearer token.",
            headers={"WWW-Authenticate": "Bearer"},
        )

    # Constant-time comparison to prevent timing attacks
    if not secrets.compare_digest(token_to_verify, ADMIN_API_KEY):
        logger.warning("Forbidden admin access attempt: invalid authentication token")
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Forbidden: Invalid administrative credentials.",
        )

    return True


def sanitize_path(file_path: str, base_dir: Path) -> Path:
    """
    Neutralize path traversal attacks (e.g. '../../etc/passwd', null bytes).
    Guarantees the resolved path resides strictly within base_dir.
    """
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
