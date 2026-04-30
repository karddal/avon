from uuid import uuid4

from app.models.base_image import BaseImage
from tests.helpers.factories import create_coursework, create_unit


def test_get_base_images_admin_lists_images(client, session, monkeypatch):
    async def allow_admin(*args, **kwargs):
        return None

    monkeypatch.setattr("app.routers.base_image.require_role", allow_admin)
    image = BaseImage(
        name="Python",
        description="Python image",
        task_definition="python-task",
    )
    session.add(image)
    session.commit()

    response = client.get("/base_image/")

    assert response.status_code == 200
    assert response.json()["images"][0]["name"] == "Python"


def test_create_base_image_rejects_duplicates(client, session, monkeypatch):
    async def allow_admin(*args, **kwargs):
        return None

    monkeypatch.setattr("app.routers.base_image.require_role", allow_admin)
    payload = {
        "name": "Python",
        "description": "Python image",
        "task_definition": "python-task",
    }
    session.add(BaseImage(**payload))
    session.commit()

    response = client.post("/base_image/create", json=payload)

    assert response.status_code == 400
    assert response.json()["detail"] == "Base image with that data already exists"


def test_create_base_image_persists_new_image(client, monkeypatch):
    async def allow_admin(*args, **kwargs):
        return None

    monkeypatch.setattr("app.routers.base_image.require_role", allow_admin)

    response = client.post(
        "/base_image/create",
        json={
            "name": "Node",
            "description": "Node image",
            "task_definition": "node-task",
        },
    )

    assert response.status_code == 201
    assert response.json()["name"] == "Node"
    assert response.json()["is_active"] is True


def test_set_base_image_active_status_updates_image(client, session, monkeypatch):
    async def allow_admin(*args, **kwargs):
        return None

    monkeypatch.setattr("app.routers.base_image.require_role", allow_admin)
    image = BaseImage(
        name="Python",
        description="Python image",
        task_definition="python-task",
    )
    session.add(image)
    session.commit()

    response = client.post(
        f"/base_image/{image.id}/mark_status",
        json={"new_active_status": False},
    )

    assert response.status_code == 200
    assert response.json() == {
        "base_image_id": str(image.id),
        "new_is_active": False,
    }


def test_set_base_image_active_status_404s_for_missing_image(client, monkeypatch):
    async def allow_admin(*args, **kwargs):
        return None

    monkeypatch.setattr("app.routers.base_image.require_role", allow_admin)

    response = client.post(
        f"/base_image/{uuid4()}/mark_status",
        json={"new_active_status": False},
    )

    assert response.status_code == 404


def test_delete_base_image_removes_unused_image(client, session, monkeypatch):
    async def allow_admin(*args, **kwargs):
        return None

    monkeypatch.setattr("app.routers.base_image.require_role", allow_admin)
    image = BaseImage(
        name="Python",
        description="Python image",
        task_definition="python-task",
    )
    session.add(image)
    session.commit()

    response = client.delete(f"/base_image/{image.id}")

    assert response.status_code == 200
    assert response.json() == {"message": "Base image deleted."}


def test_delete_base_image_rejects_in_use_image(client, session, monkeypatch):
    async def allow_admin(*args, **kwargs):
        return None

    monkeypatch.setattr("app.routers.base_image.require_role", allow_admin)
    image = BaseImage(
        name="Python",
        description="Python image",
        task_definition="python-task",
    )
    session.add(image)
    session.commit()
    unit = create_unit(session)
    coursework = create_coursework(session, unit.id)
    coursework.base_image_id = image.id
    session.add(coursework)
    session.commit()

    response = client.delete(f"/base_image/{image.id}")

    assert response.status_code == 406
    assert "Base image is in use" in response.json()["detail"]


def test_delete_base_image_404s_for_missing_image(client, monkeypatch):
    async def allow_admin(*args, **kwargs):
        return None

    monkeypatch.setattr("app.routers.base_image.require_role", allow_admin)

    response = client.delete(f"/base_image/{uuid4()}")

    assert response.status_code == 404
