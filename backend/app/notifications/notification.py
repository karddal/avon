from typing import Annotated

from fastapi import BackgroundTasks, Depends, FastAPI
from sqlalchemy.orm import Session

from app.db.session import SessionDep, get_session
from app.models.notification import Notification

session_dependency = Annotated[Session, Depends(get_session)]


def write_notification(recipient: str, author: str, title: str, body: str, session: session_dependency) -> Notification:
    """
    Writes a notification to the database.
    :param session: FastAPI db session
    :param recipient: The user id of the recipient of the notification
    :param author: The user id of the author of the notification
    :param title: The title of the notification
    :param body: The body of the notification
    """

    to_insert = Notification(
            recipient_id=recipient,
            author_id=author,
            title=title,
            body=body,
        )

    session.add(
       to_insert
    )

    session.refresh(to_insert)

    return to_insert
    