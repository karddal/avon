from types import SimpleNamespace

import httpx
import pytest
from fastapi import HTTPException

from app.core.helpers import invitations
from app.schemas.project import ProjectInviteStatusTarget


class FakeResponse:
    def __init__(self, status_code=200, data=None, headers=None, text="response"):
        self.status_code = status_code
        self._data = data if data is not None else []
        self.headers = headers or {}
        self.text = text

    def json(self):
        if isinstance(self._data, Exception):
            raise self._data
        return self._data

    def raise_for_status(self):
        if self.status_code >= 400:
            raise httpx.HTTPStatusError(
                "bad response",
                request=httpx.Request("GET", "https://gitlab.example"),
                response=httpx.Response(self.status_code, text=self.text),
            )


class FakeAsyncClient:
    def __init__(self, responses):
        self.responses = list(responses)
        self.calls = []

    async def __aenter__(self):
        return self

    async def __aexit__(self, exc_type, exc, tb):
        return None

    async def get(self, url, **kwargs):
        self.calls.append(("get", url, kwargs))
        return self.responses.pop(0)

    async def post(self, url, **kwargs):
        self.calls.append(("post", url, kwargs))
        return self.responses.pop(0)

    async def delete(self, url, **kwargs):
        self.calls.append(("delete", url, kwargs))
        return self.responses.pop(0)


@pytest.fixture(autouse=True)
def gitlab_config(monkeypatch):
    monkeypatch.setattr(invitations, "TOKEN", "token")
    monkeypatch.setattr(invitations, "BASE_URL", "https://gitlab.example/api/v4")


def patch_client(monkeypatch, fake_client):
    monkeypatch.setattr(
        invitations.httpx,
        "AsyncClient",
        lambda *args, **kwargs: fake_client,
    )
    return fake_client


def test_extract_email_helpers_ignore_malformed_entries():
    assert invitations.extract_invited_emails(
        [{"invite_email": "A@EXAMPLE.COM"}, {"other": "ignored"}, "bad"]
    ) == {"a@example.com"}
    assert invitations.extract_member_emails(
        [{"email": "B@EXAMPLE.COM"}, {"other": "ignored"}, "bad"]
    ) == {"b@example.com"}


@pytest.mark.asyncio
async def test_gitlab_list_request_coerces_non_list_json_to_empty_list():
    async def get(*args, **kwargs):
        return FakeResponse(data={"not": "a-list"})

    client = SimpleNamespace(
        get=get
    )

    data, response = await invitations.gitlab_get_list(client, "https://gitlab")

    assert data == []
    assert response.status_code == 200


@pytest.mark.asyncio
async def test_paginated_list_fetch_follows_next_page_headers(monkeypatch):
    fake_client = FakeAsyncClient(
        [
            FakeResponse(data=[{"id": 1}, "ignored"], headers={"x-next-page": "2"}),
            FakeResponse(data=[{"id": 2}], headers={}),
        ]
    )

    results = await invitations.fetch_paginated_list(fake_client, "https://gitlab")

    assert results == [{"id": 1}, {"id": 2}]
    assert fake_client.calls[0][2]["params"]["page"] == 1
    assert fake_client.calls[1][2]["params"]["page"] == 2


@pytest.mark.asyncio
async def test_lookup_invited_and_member_emails_by_query():
    invited_client = FakeAsyncClient(
        [
            FakeResponse(data=[{"invite_email": "a@example.com"}]),
            FakeResponse(data=[]),
        ]
    )
    member_client = FakeAsyncClient(
        [
            FakeResponse(data=[{"email": "b@example.com"}]),
            FakeResponse(data=[]),
        ]
    )

    invited = await invitations.lookup_invited_emails_by_query(
        invited_client,
        "123",
        {"a@example.com"},
    )
    members = await invitations.lookup_member_emails_by_query(
        member_client,
        "123",
        {"b@example.com"},
    )

    assert invited == {"a@example.com"}
    assert members == {"b@example.com"}


@pytest.mark.asyncio
async def test_gl_inv_add_user_success_and_failure(monkeypatch):
    fake_client = patch_client(
        monkeypatch,
        FakeAsyncClient(
            [
                FakeResponse(status_code=201, data={}),
                FakeResponse(status_code=400, data={"message": "bad invite"}),
            ]
        ),
    )

    success = await invitations.gl_inv_add_user(
        ["a@example.com"],
        "123",
        expires_at="2026-05-01",
    )
    failure = await invitations.gl_inv_add_user(["b@example.com"], "123")

    assert success.success is True
    assert failure.success is False
    assert failure.error == "bad invite"
    assert fake_client.calls[0][2]["json"]["expires_at"] == "2026-05-01"


@pytest.mark.asyncio
async def test_gl_inv_add_user_requires_configuration(monkeypatch):
    monkeypatch.setattr(invitations, "TOKEN", None)

    with pytest.raises(HTTPException) as exc:
        await invitations.gl_inv_add_user(["a@example.com"], "123")

    assert exc.value.status_code == 500


@pytest.mark.asyncio
async def test_gl_inv_batch_get_statuses_uses_query_lookup_for_small_batches(monkeypatch):
    async def invited(**kwargs):
        return {"invited@example.com"}

    async def members(**kwargs):
        return {"member@example.com"}

    monkeypatch.setattr(
        invitations,
        "lookup_invited_emails_by_query",
        invited,
    )
    monkeypatch.setattr(
        invitations,
        "lookup_member_emails_by_query",
        members,
    )
    monkeypatch.setattr(invitations, "QUERY_LOOKUP_THRESHOLD", 10)
    patch_client(monkeypatch, FakeAsyncClient([]))

    result = await invitations.gl_inv_batch_get_statuses(
        [
            ProjectInviteStatusTarget(project_id="123", user_email="member@example.com"),
            ProjectInviteStatusTarget(project_id="123", user_email="invited@example.com"),
            ProjectInviteStatusTarget(project_id="123", user_email="new@example.com"),
        ]
    )

    assert [item.status for item in result.data] == [
        "accepted",
        "invited",
        "not_invited",
    ]


@pytest.mark.asyncio
async def test_gl_inv_batch_get_statuses_uses_full_fetch_for_large_batches(monkeypatch):
    async def invited(**kwargs):
        return {"invited@example.com"}

    async def members(**kwargs):
        return {"member@example.com"}

    monkeypatch.setattr(invitations, "_fetch_all_project_invited_emails", invited)
    monkeypatch.setattr(invitations, "_fetch_all_project_member_emails", members)
    monkeypatch.setattr(invitations, "QUERY_LOOKUP_THRESHOLD", 1)
    patch_client(monkeypatch, FakeAsyncClient([]))

    result = await invitations.gl_inv_batch_get_statuses(
        [
            ProjectInviteStatusTarget(project_id="123", user_email="member@example.com"),
            ProjectInviteStatusTarget(project_id="123", user_email="new@example.com"),
        ]
    )

    assert [item.status for item in result.data] == ["accepted", "not_invited"]


@pytest.mark.asyncio
async def test_gl_inv_list_success_and_failure(monkeypatch):
    fake_client = patch_client(
        monkeypatch,
        FakeAsyncClient(
            [
                FakeResponse(status_code=200, data=[{"email": "a@example.com"}]),
                FakeResponse(status_code=400, data={"message": "bad list"}),
            ]
        ),
    )

    success = await invitations.gl_inv_list("123", email="a@example.com")
    failure = await invitations.gl_inv_list("123")

    assert success.success is True
    assert success.data == [{"email": "a@example.com"}]
    assert failure.success is False
    assert failure.error == "bad list"
    assert fake_client.calls[0][2]["params"] == {"query": "a@example.com"}


@pytest.mark.asyncio
async def test_gl_inv_delete_success_and_failure(monkeypatch):
    fake_client = patch_client(
        monkeypatch,
        FakeAsyncClient(
            [
                FakeResponse(status_code=204, data={}),
                FakeResponse(status_code=404, data={"message": "missing"}),
            ]
        ),
    )

    success = await invitations.gl_inv_delete("a@example.com", "123")
    failure = await invitations.gl_inv_delete("b@example.com", "123")

    assert success.success is True
    assert failure.success is False
    assert failure.error == "missing"
    assert fake_client.calls[0][1].endswith("/a%40example.com")
