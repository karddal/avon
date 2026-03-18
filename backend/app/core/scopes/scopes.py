import logging
from enum import Enum
from typing import Annotated
from uuid import UUID

import jwt
from fastapi import Depends, status
from fastapi.exceptions import HTTPException
from fastapi.security.http import HTTPAuthorizationCredentials
from sqlmodel import Session, select

from app.core.jwt_utils import verify_token_and_get_user
from app.core.settings import settings
from app.db.session import get_session
from app.models.unit_enrollment import UnitEnrollment

logger = logging.getLogger("permissions")


class ResourceType(Enum):
    """
    Resources that have permission scopes.
    """

    UNIT = "unit"
    PROGRAMME = "programme"

class FERoles(Enum):
    ADMIN = "admin"
    USER = "user"
    LECTURER = "lecturer"

class Scopes(Enum):
    """
    Permission scopes.
    """

    # Unit related scopes, coursework belongs to a unit so perms from that
    UNIT_READ = "unit:read"  # Read unit information
    UNIT_SEND_NOTIFICATION = "unit:send_notification"  # Send a notification
    UNIT_MANAGE = "unit:manage"  # Manage unit name, code, description, colour
    UNIT_ENROLL = "unit:enroll"  # Manage unit enrollment
    UNIT_DELETE = "unit:delete"  # Delete unit
    UNIT_COURSEWORK_CREATE = "unit:coursework_create"  # Create coursework for a unit
    UNIT_COURSEWORK_MANAGE = "unit:coursework_manage"  # Manage coursework name, description, due date, colour
    UNIT_COURSEWORK_DELETE = "unit:coursework_delete"  # Delete coursework for a unit
    UNIT_COURSEWORK_GITLAB = "unit:coursework_gitlab"  # Manage coursework GitLab
    UNIT_COURSEWORK_ENGINE = "unit:coursework_engine"  # Manage Engine for coursework

    COURSEWORK_ALL = "coursework:all" # Read all courseworks

    # Programme related scopes
    PROGRAMME_CREATE = "programme:create"
    PROGRAMME_CREATE_UNIT = "programme:create_unit"


# The scopes that you get for having a specific unit enrollment
ENROLLMENT_TYPE_SCOPES: dict[str, list[Scopes]] = {
    "student": [Scopes.UNIT_READ],  # a student on a unit can read all that unit info
    "lecturer": [
        Scopes.UNIT_READ,
        Scopes.UNIT_MANAGE,
        Scopes.UNIT_SEND_NOTIFICATION,
        Scopes.UNIT_COURSEWORK_CREATE,
        Scopes.UNIT_COURSEWORK_MANAGE,
        Scopes.UNIT_COURSEWORK_DELETE,
        Scopes.UNIT_COURSEWORK_GITLAB,
        Scopes.UNIT_COURSEWORK_ENGINE,
    ],
    "owner": [
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
    logger.debug("resolving scopes for unit, fetching unit enrollment")
    enrollment = session.exec(
        select(UnitEnrollment)
        .where(UnitEnrollment.unit_id == unit_id)
        .where(UnitEnrollment.user_id == user_id)
    ).first()

    if not enrollment:
        logger.debug("no enrollment found, so no scopes are valid for this unit.")
        return set()

    scopes = ENROLLMENT_TYPE_SCOPES.get(enrollment.type, [])

    logger.debug(
        f"scopes due to enrollment type {enrollment.type} added, they are {scopes}"
    )
    return set(scopes)


async def resolve_programme_scopes(
    user_id,
    programme_id: UUID,
    session: Session,
) -> set[Scopes]:
    # stub for now, as only admin can create programmes.
    return set()


ROLE_TYPE_SCOPES = {
    "admin": [s for s in Scopes],  # admin role grants access to all scopes
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
    resource_id: UUID | None

    def __init__(self, type, id):
        if isinstance(type, ResourceType):
            self.resource_type = type
        else:
            type_name = getattr(type, "__name__", str(type)).lower()
            if type_name == "unit":
                self.resource_type = ResourceType.UNIT
            elif type_name == "programme":
                self.resource_type = ResourceType.PROGRAMME
            else:
                raise ValueError(f"Unsupported resource type: {type}")
        self.resource_id = id


async def authenticate_user(
    resource: ResourceInformation | None,
    token: HTTPAuthorizationCredentials | None,
    session: Annotated[Session, Depends(dependency=get_session)],
) -> AuthenticatedUser:
    """
    Authenticate a user and retrieve their scopes. Any user role based scopes are returned automatically.
    Optionally, provide a Resource and any scopes that they have for that resource are also returned.
    """


    if settings.ignore_auth:
        logger.debug("ignore auth mode set, so authenticating as admin")
        user = AuthenticatedUser(
            user_id="aaaa", scopes=set([s for s in Scopes]), fe_role="testing"
        )
        logger.debug(user)
        return user

    try:
        current_user = verify_token_and_get_user(token.credentials)
        user_id = current_user.user_id
        role = current_user.role
        if role is None:
            logger.debug("role field not set on jwt, could not validate credentials")
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Could not validate credentials",
                headers={"WWW-Authenticate": "Bearer"},
            )

        scopes: set[Scopes] = set()
        role_scopes = ROLE_TYPE_SCOPES.get(role)
        if role_scopes:
            logger.debug(f"role of {role} found, adding scopes {role_scopes}")
            scopes.update(role_scopes)

        if resource and resource.resource_id:
            resolver = RESOURCE_TYPE_RESOLVERS.get(resource.resource_type)
            if resolver:
                scopes.update(await resolver(user_id, resource.resource_id, session))

        auth_user = AuthenticatedUser(user_id=user_id, scopes=scopes, fe_role=role)
        logger.debug(
            f"authenticated user, user_id={auth_user.user_id}, scopes={auth_user.scopes}"
        )
        return auth_user
    except jwt.exceptions.InvalidTokenError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Could not validate credentials",
            headers={"WWW-Authenticate": "Bearer"},
        )


async def require_scopes(
    resource: ResourceInformation,
    *required_scopes: Scopes,
    token: HTTPAuthorizationCredentials | None,
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

async def require_role(
    role: FERoles,
    token: HTTPAuthorizationCredentials | None,
    session: Session,
):
    """
    A more generic check that only requires a specific role.
    """
    user = await authenticate_user(
        resource=None,
        token=token,
        session=session,
    )

    if user.fe_role == role:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED,
        detail=f"Authentication error. Not correct role: {role}")

    return True
