import datetime
from collections import defaultdict
from typing import Annotated

from fastapi import APIRouter, Depends
from sqlalchemy import exists
from sqlalchemy.orm import with_loader_criteria
from sqlalchemy.orm.strategy_options import selectinload
from sqlmodel import Session, select
from starlette import status

from app.core.security import get_current_user, get_current_user_with_role
from app.db.session import get_session
from app.models.notification import Notification
from app.models.programme import Programme
from app.models.unit import Unit, UnitWithCourseworks
from app.models.unit_enrollment import UnitEnrollment
from app.schemas.coursework import CourseworkRead
from app.schemas.notification import Notifications, ReadNotification, UnitWithNotifs, \
    NotificationsUnreadExist
from app.schemas.security import CurrentUser
from app.schemas.unit import UnitAll, UnitAllByGroup, UnitRead

router = APIRouter(prefix="/me", tags=["me"])
session_dependency = Annotated[Session, Depends(get_session)]

@router.get("/units", response_model=UnitAll)
async def me_units(session: session_dependency, me: str = Depends(get_current_user)):
    results = session.exec(
        select(Unit).join(UnitEnrollment).where(UnitEnrollment.user_id == me)
    ).all()
    return UnitAll(
        units=results
    )

@router.get("/units/active", response_model=UnitAll)
async def me_active_units(
        session: session_dependency,
        me: CurrentUser = Depends(get_current_user_with_role),
):
    today = datetime.date.today()

    statement = select(Unit)

    if not me.is_admin:
        statement = statement.join(UnitEnrollment).where(UnitEnrollment.user_id == me.user_id)

    results = session.exec(statement).all()

    filtered = [
        UnitRead.model_validate(unit)
        for unit in results
        if unit.programme.start_date <= today <= unit.programme.end_date
    ]

    return UnitAll(
        units=filtered
    )

@router.get("/units-by-programme", response_model=UnitAllByGroup)
async def me_units_by_programme(session: session_dependency, me: str = Depends(get_current_user)):
    results = session.exec(
        select(Programme)
        .where(
            Programme.units.any(
                Unit.enrollments.any(
                    UnitEnrollment.user_id == me
                )
            )
        ).options(
            selectinload(Programme.units),
            with_loader_criteria(
                Unit,
                Unit.enrollments.any(
                    UnitEnrollment.user_id == me
                )
            )
        )).all()
    return UnitAllByGroup(programmes=results)



@router.get("/courseworks")
async def me_courseworks(
    session: session_dependency, me: str = Depends(get_current_user)
):
    statement = select(Unit).join(UnitEnrollment).where(UnitEnrollment.user_id == me)
    units = list(session.exec(statement))
    results = [UnitWithCourseworks.model_validate(UnitWithCourseworks(
        id=unit.id,
        unit_code=unit.unit_code,
        name=unit.name,
        programme_start_date=unit.programme.start_date,
        programme_end_date=unit.programme.end_date,
        courseworks=unit.courseworks
    )).model_dump() for unit in units]
    return results

@router.get("/courseworks/active", response_model=list[CourseworkRead])
async def me_active_courseworks(
    session: session_dependency,
    me: CurrentUser = Depends(get_current_user_with_role),
):
    # statement = select(Unit).join(UnitEnrollment).where(UnitEnrollment.user_id == me)
    # units = list(session.exec(statement))
    # results = [UnitWithCourseworks.model_validate(unit).model_dump() for unit in units]

    today = datetime.datetime.now()

    statement = select(Unit)

    if not me.is_admin:
        statement = statement.join(UnitEnrollment).where(UnitEnrollment.user_id == me.user_id)

    units = session.exec(statement).all()

    courseworks = [coursework for unit in units for coursework in unit.courseworks]
    filtered = [coursework for coursework in courseworks if coursework.due_date >= today]

    return [
        CourseworkRead.model_validate(coursework)
        for coursework in filtered
    ]

@router.get("/notifications", response_model=Notifications)
async def me_notifications(session: session_dependency, me: str = Depends(get_current_user)):
    """Sends notifications from active units"""
    my_notifications = list(session.exec(
        select(Notification).where(Notification.recipient_id == me)
    ).all())
    today = datetime.date.today()
    filtered = filter(lambda notification: notification.unit.programme.start_date <= today <= notification.unit.programme.end_date, my_notifications)

    system_notifications = []
    others: defaultdict[Unit, list] = defaultdict(list)

    for notification in filtered:
        if not notification.unit:
            system_notifications.append(ReadNotification(

            id=notification.id, title=notification.title, body=notification.body, created_at=notification.created_at, viewed=notification.viewed))
        else:
            others[notification.unit].append(ReadNotification(
                id=notification.id, title=notification.title, body=notification.body,
                created_at=notification.created_at, viewed=notification.viewed))
    units_with_notifs = []
    for unit, notifs in others.items():
        units_with_notifs.append(UnitWithNotifs(
            unit_id=unit.id,
            unit_name=unit.name,
            unit_code=unit.unit_code,
            notifications=notifs,
        ))

    return Notifications(
        system_notifications=system_notifications,
        notifications=units_with_notifs
    )

@router.get("/notifications/unread_exists", response_model=NotificationsUnreadExist)
async def me_have_unread_notifications(session: session_dependency, me: str = Depends(get_current_user)):
    # ruff: noqa e712
    result = session.scalar(exists().where(Notification.recipient_id == me).where(Notification.viewed == False).select())
    return NotificationsUnreadExist(
        have_unread_notifications=result
    )


@router.get("/notifications/mark_all_read", status_code=status.HTTP_200_OK)
async def me_mark_all_notifications_read(session: session_dependency, me: str = Depends(get_current_user)):
    me_notifs = list(session.exec(
        select(Notification).where(Notification.recipient_id == me)
        .where(Notification.viewed == False)
    ).all())

    for notification in me_notifs:
        notification.viewed = True
        session.add(notification)
        session.commit()

    me_notifs = list(session.exec(
        select(Notification).where(Notification.recipient_id == me)
        # ruff: noqa e712
        .where(Notification.viewed == False)
    ).all())
    return status.HTTP_200_OK