from unittest.mock import patch

from fastapi.security import HTTPAuthorizationCredentials
from sqlmodel import Session

from app.core.settings import settings
from app.models.unit_enrollment import UnitEnrollment
from app.schemas.security import CurrentUser
from tests.helpers.factories import create_notification, create_unit


def test_get_notification_rejects_non_recipient(client, session: Session, auth_override):
    notification = create_notification(session)

    response = client.get(f"/notification/{notification.id}")

    assert response.status_code == 403
    assert response.json()["detail"] == "Access denied"


def test_create_notification_requires_send_notification_scope(client, session: Session, auth_override):
    previous_ignore_auth = settings.ignore_auth
    settings.ignore_auth = False

    try:
        unit = create_unit(session)
        requesting_user = "student-user"
        session.add(UnitEnrollment(unit_id=unit.id, user_id=requesting_user, type="student"))
        session.commit()

        fake_token = HTTPAuthorizationCredentials(
            scheme="Bearer",
            credentials="fake.jwt.token",
        )

        def override_get_bearer():
            yield fake_token

        from app.core.security import get_bearer
        from app.main import app

        app.dependency_overrides[get_bearer] = override_get_bearer

        with patch(
            "app.core.scopes.scopes.verify_token_and_get_user",
            return_value=CurrentUser(user_id=requesting_user, role="user"),
        ):
            response = client.post(
                "/notification/create",
                json={
                    "unit_id": str(unit.id),
                    "title": "Blocked",
                    "body": "This should not send",
                },
            )

        assert response.status_code == 401
        assert "Missing scopes" in response.json()["detail"]
    finally:
        settings.ignore_auth = previous_ignore_auth
        from app.core.security import get_bearer
        from app.main import app

        app.dependency_overrides.pop(get_bearer, None)
