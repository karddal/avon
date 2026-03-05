from enum import Enum
from typing import Annotated
from uuid import UUID

import jwt
from fastapi import Depends, status
from fastapi.exceptions import HTTPException
from fastapi.requests import Request
from fastapi.security.http import HTTPAuthorizationCredentials
from sqlmodel import Session, select

from app.core.security import get_bearer, jwks_client
from app.core.settings import settings
from app.db.session import get_session
from app.models.unit_enrollment import UnitEnrollment


class ResourceType(Enum):
    """
    Resources that have permission scopes.
    """

    UNIT = "unit"
    PROGRAMME = "programme"


class Scopes(Enum):
    """
    Permission scopes.
    """

    ADMIN = "admin:all"  # Access all areas

    # Unit related scopes
    UNIT_READ = "unit:read"  # Read unit information
    UNIT_SEND_NOTIFICATION = "unit:send_notification"  # Send a notification
    UNIT_MANAGE = "unit:manage"  # Manage unit name, code, description, colour
    UNIT_ENROLL = "unit:enroll"  # Manage unit enrollment
    UNIT_DELETE = "unit:delete"  # Delete unit
    UNIT_COURSEWORK_CREATE = "unit:coursework_create"  # Create coursework
    UNIT_COURSEWORK_MANAGE = "unit:coursework_manage"  # Manage coursework name, description, due date, colour
    UNIT_COURSEWORK_DELETE = "unit:coursework_delete"  # Delete coursework
    UNIT_COURSEWORK_GITLAB = "unit:coursework_gitlab"  # Manage coursework GitLab
    UNIT_COURSEWORK_ENGINE = "unit:coursework_engine"  # Manage Engine for coursework

    # Programme related scopes
    PROGRAMME_CREATE = "programme:create"
    PROGRAMME_CREATE_UNIT = "programme:create_unit"


# The scopes that you get for having a specific unit enrollment
ENROLLMENT_TYPE_SCOPES: dict[str, list[Scopes]] = {
    "student": [Scopes.UNIT_READ],
    "lecturer": [
        Scopes.UNIT_READ,
        Scopes.UNIT_MANAGE,
        Scopes.UNIT_ENROLL,
        Scopes.UNIT_DELETE,
        Scopes.UNIT_SEND_NOTIFICATION,
        Scopes.UNIT_COURSEWORK_CREATE,
        Scopes.UNIT_COURSEWORK_MANAGE,
        Scopes.UNIT_COURSEWORK_DELETE,
        Scopes.UNIT_COURSEWORK_GITLAB,
        Scopes.UNIT_COURSEWORK_ENGINE,
    ],
}


async def resolve_unit_scopes(
    user_id, unit_id: UUID, session: Annotated[Session, Depends(dependency=get_session)]
) -> set[Scopes]:
    """Fetches scopes from a unit and a user id."""
    enrollment = session.exec(
        select(UnitEnrollment).where(
            UnitEnrollment.unit_id == unit_id and UnitEnrollment.user_id == user_id
        )
    ).one_or_none()

    if not enrollment:
        return set()

    return set(ENROLLMENT_TYPE_SCOPES.get(enrollment.type, []))


async def resolve_programme_scopes(
    user_id,
    programme_id: UUID,
    session: Session,
) -> set[Scopes]:
    # stub for now, as only admin can create programmes.
    return set()


ROLE_TYPE_SCOPES = {
    "admin": [Scopes.ADMIN],  # admin role grants access to admin scope
    "lecturer": [],  # lecturer role grants no default access
    "user": [],  # user role grants no default access
}

RESOURCE_TYPE_RESOLVERS = {ResourceType.UNIT: resolve_unit_scopes}


class AuthenticatedUser:
    """
    A user that has been authenticated into the system.
    """

    user_id: str
    scopes: set[Scopes]
    fe_role: str

    def __init__(self, user_id, scopes, fe_role) -> None:
        self.user_id = user_id
        self.scopes = scopes
        self.fe_role = fe_role


class ResourceInformation:
    """
    A resource and its id. For cleaner typing for authenticate user function.
    """

    resource_type: ResourceType
    resource_id: UUID

    def __init__(self, type, id):
        self.resource_type = type
        self.resource_id = id


async def authenticate_user(
    resource: ResourceInformation | None,
    token: HTTPAuthorizationCredentials,
    session: Annotated[Session, Depends(dependency=get_session)],
) -> AuthenticatedUser:
    """
    Authenticate a user and retrieve their scopes. Any user role based scopes are returned automatically.
    Optionally, provide a Resource and any scopes that they have for that resource are also returned.
    """

    if settings.ignore_auth:
        return AuthenticatedUser(
            user_id="aaaa", scopes=[Scopes.ADMIN], fe_role="testing"
        )

    try:
        signing_key = jwks_client.get_signing_key_from_jwt(token.credentials)
        payload = jwt.decode(
            token.credentials,
            signing_key,
            audience=settings.jwt_audience,
            issuer=settings.jwt_issuer,
            algorithms=["EdDSA"],
        )
        user_id = payload.get("sub")
        if user_id is None:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Could not validate credentials",
                headers={"WWW-Authenticate": "Bearer"},
            )

        role = payload.get("role")
        if role is None:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Could not validate credentials",
                headers={"WWW-Authenticate": "Bearer"},
            )

        scopes: set[Scopes] = set()

        role_scopes = ROLE_TYPE_SCOPES.get(role)
        if role_scopes:
            scopes.update(role_scopes)

        if resource:
            resolver = RESOURCE_TYPE_RESOLVERS.get(resource.resource_type)
            if resolver:
                scopes.update(await resolver(user_id, resource.resource_id, session))

        return AuthenticatedUser(user_id=user_id, scopes=scopes, fe_role=role)
    except jwt.exceptions.InvalidTokenError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Could not validate credentials",
            headers={"WWW-Authenticate": "Bearer"},
        )


async def require_scopes(
    resource: ResourceInformation,
    *required_scopes: Scopes,
    token: HTTPAuthorizationCredentials,
    session: Session,
):
    user = await authenticate_user(
        resource=resource,
        token=token,
        session=session,
    )

    required = set(required_scopes)
    missing = required - user.scopes
    if missing:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=f"Authentication error. Missing scopes: {missing}",
        )

    return user
