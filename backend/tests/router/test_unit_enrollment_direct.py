from types import SimpleNamespace
from uuid import uuid4

import pytest
from fastapi import HTTPException
from sqlmodel import select

from app.models.unit_enrollment import UnitEnrollment
from app.routers import unit_enrollment
from app.schemas.unit_enrollment import (
    UnitEnrollmentBatchCreate,
    UnitEnrollmentBatchDelete,
    UnitEnrollmentBatchTransfer,
    UnitEnrollmentOwner,
)
from tests.helpers.factories import create_students, create_unit


@pytest.fixture
def token():
    return SimpleNamespace(credentials="token")


@pytest.fixture(autouse=True)
def allow_scope(monkeypatch):
    async def allowed(*args, **kwargs):
        return None

    monkeypatch.setattr(unit_enrollment, "require_scopes", allowed)


@pytest.mark.asyncio
async def test_batch_unenroll_removes_students_except_omitted(session, token):
    unit = create_unit(session)
    keep = create_students(session, unit.id)
    remove = create_students(session, unit.id)
    keep_user_id = keep.user_id
    remove_user_id = remove.user_id

    response = await unit_enrollment.unenroll_unit(
        UnitEnrollmentBatchDelete(unit_id=unit.id, omitted_user_ids=[keep_user_id]),
        session,
        token,
    )

    assert response == {"message": "users un-enrolled successfully, excluding omitted "}
    assert session.get(UnitEnrollment, (unit.id, keep_user_id)) is not None
    assert session.get(UnitEnrollment, (unit.id, remove_user_id)) is None


@pytest.mark.asyncio
async def test_batch_unenroll_409s_when_no_students_to_remove(session, token):
    unit = create_unit(session)

    with pytest.raises(HTTPException) as exc:
        await unit_enrollment.unenroll_unit(
            UnitEnrollmentBatchDelete(unit_id=unit.id, omitted_user_ids=[]),
            session,
            token,
        )

    assert exc.value.status_code == 409


@pytest.mark.asyncio
async def test_transfer_unit_members_moves_students_to_targets(session, token):
    source = create_unit(session)
    target = create_unit(session)
    existing_target = create_students(session, target.id)
    moving = create_students(session, source.id)
    omitted = create_students(session, source.id)
    existing_target_user_id = existing_target.user_id
    moving_user_id = moving.user_id
    omitted_user_id = omitted.user_id
    session.add(
        UnitEnrollment(unit_id=source.id, user_id=existing_target_user_id, type="student")
    )
    session.commit()

    response = await unit_enrollment.transfer_unit_members(
        UnitEnrollmentBatchTransfer(
            unitIdFrom=source.id,
            unitIdsTo=[target.id],
            omittedMembers=[omitted_user_id],
        ),
        session,
        token,
    )

    assert response == {"message": "users transferred successfully"}
    assert session.get(UnitEnrollment, (source.id, moving_user_id)) is None
    assert session.get(UnitEnrollment, (target.id, moving_user_id)) is not None
    assert session.get(UnitEnrollment, (source.id, omitted_user_id)) is not None
    target_members = session.exec(
        select(UnitEnrollment).where(
            UnitEnrollment.unit_id == target.id,
            UnitEnrollment.user_id == existing_target_user_id,
        )
    ).all()
    assert len(target_members) == 1


@pytest.mark.asyncio
async def test_transfer_unit_members_404s_for_missing_target(session, token):
    source = create_unit(session)

    with pytest.raises(HTTPException) as exc:
        await unit_enrollment.transfer_unit_members(
            UnitEnrollmentBatchTransfer(
                unitIdFrom=source.id,
                unitIdsTo=[uuid4()],
                omittedMembers=[],
            ),
            session,
            token,
        )

    assert exc.value.status_code == 404


@pytest.mark.asyncio
async def test_batch_enroll_lecturers_adds_lecturer_enrollments(session, token):
    unit = create_unit(session)

    response = await unit_enrollment.enroll_unit_batch_lecturers(
        UnitEnrollmentBatchCreate(unit_id=unit.id, user_ids=["lecturer-1", "lecturer-2"]),
        session,
        token,
    )

    assert response == {"message": "2 users enrolled successfully"}
    assert session.get(UnitEnrollment, (unit.id, "lecturer-1")).type == "lecturer"


@pytest.mark.asyncio
async def test_batch_enroll_lecturers_rejects_duplicates(session, token):
    unit = create_unit(session)
    session.add(UnitEnrollment(unit_id=unit.id, user_id="lecturer-1", type="lecturer"))
    session.commit()

    with pytest.raises(HTTPException) as exc:
        await unit_enrollment.enroll_unit_batch_lecturers(
            UnitEnrollmentBatchCreate(unit_id=unit.id, user_ids=["lecturer-1"]),
            session,
            token,
        )

    assert exc.value.status_code == 409


def test_create_owner_enrollment_adds_owner(session):
    unit = create_unit(session)

    owner = unit_enrollment.create_owner_enrollment(unit.id, "owner-1", session)
    session.commit()

    assert owner.type == "owner"
    assert session.get(UnitEnrollment, (unit.id, "owner-1")) is not None


def test_create_owner_enrollment_rejects_existing_owner(session):
    unit = create_unit(session)
    session.add(UnitEnrollment(unit_id=unit.id, user_id="owner-1", type="owner"))
    session.commit()

    with pytest.raises(HTTPException) as exc:
        unit_enrollment.create_owner_enrollment(unit.id, "owner-2", session)

    assert exc.value.status_code == 400


@pytest.mark.asyncio
async def test_get_owner_of_unit_returns_owner(session, token):
    unit = create_unit(session)
    session.add(UnitEnrollment(unit_id=unit.id, user_id="owner-1", type="owner"))
    session.commit()

    assert await unit_enrollment.get_owner_of_unit(unit.id, session, token) == "owner-1"


@pytest.mark.asyncio
async def test_get_owner_of_unit_404s_without_owner(session, token):
    unit = create_unit(session)

    with pytest.raises(HTTPException) as exc:
        await unit_enrollment.get_owner_of_unit(unit.id, session, token)

    assert exc.value.status_code == 404


@pytest.mark.asyncio
async def test_transfer_owner_creates_new_owner_enrollment(session, token):
    unit = create_unit(session)
    session.add(UnitEnrollment(unit_id=unit.id, user_id="owner-1", type="owner"))
    session.commit()

    response = await unit_enrollment.transfer_owner(
        unit.id,
        UnitEnrollmentOwner(user_id="owner-2"),
        session,
        token,
    )

    assert response.previous_owner == "owner-1"
    assert response.new_owner == "owner-2"
    assert session.get(UnitEnrollment, (unit.id, "owner-1")).type == "lecturer"
    assert session.get(UnitEnrollment, (unit.id, "owner-2")).type == "owner"


@pytest.mark.asyncio
async def test_transfer_owner_404s_without_current_owner(session, token):
    unit = create_unit(session)

    with pytest.raises(HTTPException) as exc:
        await unit_enrollment.transfer_owner(
            unit.id,
            UnitEnrollmentOwner(user_id="owner-2"),
            session,
            token,
        )

    assert exc.value.status_code == 404
