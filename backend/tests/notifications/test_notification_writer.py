from app.notifications.notification import write_notification


def test_write_notification_persists_and_refreshes_notification(session):
    notification = write_notification(
        recipient="student@example.com",
        unit_id=None,
        title="System update",
        body="A notification body",
        session=session,
    )

    assert notification.id is not None
    assert notification.recipient_id == "student@example.com"
    assert notification.unit_id is None
    assert notification.title == "System update"
    assert notification.body == "A notification body"
    assert notification.viewed is False
