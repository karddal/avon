from uuid import UUID

from sqlalchemy.orm import Session

from app.models.notification import Notification

def write_notification(recipient: str, unit_id: UUID | None, title: str, body: str, session: Session) -> Notification:
    """
    Writes a notification to the database.
    :param session: FastAPI db session
    :param recipient: The user id of the recipient of the notification
    :param unit_id: The unit id of the of the notification, if null, sent as a System Notification
    :param title: The title of the notification
    :param body: The body of the notification
    """

    to_insert = Notification(
            recipient_id=recipient,
            unit_id=unit_id,
            title=title,
            body=body,
        )

    session.add(
       to_insert
    )

    session.commit()
    session.refresh(to_insert)

    return to_insert
    