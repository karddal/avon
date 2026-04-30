import io
import zipfile

import httpx
import pytest
from fastapi import HTTPException, UploadFile

from app.core.helpers import gitlab


class FakeResponse:
    def __init__(self, status_code=200, data=None, headers=None, text="response"):
        self.status_code = status_code
        self._data = data if data is not None else {}
        self.headers = headers or {}
        self.text = text

    def json(self):
        return self._data


class FakeAsyncClient:
    instances = []

    def __init__(self, responses=None, *args, **kwargs):
        self.responses = responses if responses is not None else []
        self.calls = []
        FakeAsyncClient.instances.append(self)

    async def __aenter__(self):
        return self

    async def __aexit__(self, exc_type, exc, tb):
        return None

    async def post(self, url, **kwargs):
        self.calls.append(("post", url, kwargs))
        return self.responses.pop(0)

    async def get(self, url, **kwargs):
        self.calls.append(("get", url, kwargs))
        return self.responses.pop(0)

    async def put(self, url, **kwargs):
        self.calls.append(("put", url, kwargs))
        return self.responses.pop(0)

    async def delete(self, url, **kwargs):
        self.calls.append(("delete", url, kwargs))
        return self.responses.pop(0)


@pytest.fixture(autouse=True)
def gitlab_config(monkeypatch):
    monkeypatch.setattr(gitlab, "TOKEN", "token")
    monkeypatch.setattr(gitlab, "BASE_URL", "https://gitlab.example/api/v4")
    monkeypatch.setattr(gitlab, "ROOT_ID", "root")
    FakeAsyncClient.instances.clear()


def patch_client(monkeypatch, responses):
    shared_responses = list(responses)

    def factory(*args, **kwargs):
        return FakeAsyncClient(responses=shared_responses, *args, **kwargs)

    monkeypatch.setattr(gitlab.httpx, "AsyncClient", factory)


def zip_upload_file(entries: dict[str, bytes]) -> UploadFile:
    buffer = io.BytesIO()
    with zipfile.ZipFile(buffer, "w") as archive:
        for name, content in entries.items():
            archive.writestr(name, content)
    buffer.seek(0)
    return UploadFile(filename="template.zip", file=buffer)


def test_generate_gitlab_path_and_project_path_parsing():
    assert gitlab.generate_gitlab_path("  COMS 20017: Intro_to SEP! ") == "coms-20017-intro-to-sep"
    assert (
        gitlab.gitlab_project_path_from_repo_url(
            "https://gitlab.example/group/subgroup/repo.git"
        )
        == "group/subgroup/repo"
    )


@pytest.mark.asyncio
async def test_gitlab_group_crud_helpers_success(monkeypatch):
    patch_client(
        monkeypatch,
        [
            FakeResponse(201, {"id": 1, "web_url": "url", "path": "programme"}),
            FakeResponse(200, {"id": 1, "name": "New Programme"}),
            FakeResponse(202, {}),
        ],
    )

    created = await gitlab.gl_create_programme("Programme")
    updated = await gitlab.gl_update_programme(1, "New Programme")
    deleted = await gitlab.gl_delete_programme(1)

    assert created == {
        "success": True,
        "gitlabGroupId": 1,
        "webUrl": "url",
        "path": "programme",
    }
    assert updated == {"success": True, "gitlabGroupId": 1, "name": "New Programme"}
    assert deleted == {"success": True}


@pytest.mark.asyncio
async def test_gitlab_group_crud_helpers_return_api_errors(monkeypatch):
    patch_client(
        monkeypatch,
        [
            FakeResponse(400, {"message": "create failed"}),
            FakeResponse(400, {"message": "update failed"}),
            FakeResponse(400, {"message": "delete failed"}),
        ],
    )

    assert await gitlab.gl_create_unit("Unit", 1) == {
        "success": False,
        "error": "create failed",
    }
    assert await gitlab.gl_update_unit(1, "Unit") == {
        "success": False,
        "error": "update failed",
    }
    assert await gitlab.gl_delete_unit(1) == {
        "success": False,
        "error": "delete failed",
    }


@pytest.mark.asyncio
async def test_gitlab_helpers_raise_for_missing_config(monkeypatch):
    monkeypatch.setattr(gitlab, "TOKEN", None)

    with pytest.raises(HTTPException) as exc:
        await gitlab.gl_create_programme("Programme")

    assert exc.value.status_code == 500


@pytest.mark.asyncio
async def test_coursework_and_template_helpers(monkeypatch):
    patch_client(
        monkeypatch,
        [
            FakeResponse(201, {"id": 10, "web_url": "cw-url", "path": "coursework"}),
            FakeResponse(200, {"id": 10, "name": "Updated"}),
            FakeResponse(202, {}),
            FakeResponse(201, {"id": 11, "web_url": "template-url", "path": "templates01"}),
            FakeResponse(201, {"id": 12, "name": "skeleton-code"}),
            FakeResponse(201, {"id": 13, "name": "skeleton-code"}),
        ],
    )

    assert await gitlab.gl_create_coursework("Coursework", 1) == {
        "success": True,
        "gitlabGroupId": 10,
        "webUrl": "cw-url",
        "path": "coursework",
    }
    assert await gitlab.gl_update_coursework(10, "Updated") == {
        "success": True,
        "gitlabGroupId": 10,
        "name": "Updated",
    }
    assert await gitlab.gl_delete_coursework(10) == {"success": True}
    assert await gitlab.gl_create_template_group(10) == {
        "success": True,
        "gitlabGroupId": 11,
        "webUrl": "template-url",
        "path": "templates01",
    }
    assert await gitlab.gl_create_template_project(11) == {
        "id": 12,
        "name": "skeleton-code",
    }
    skeleton_response = await gitlab.gl_create_skeleton_code(11, "Coursework")
    assert skeleton_response.status_code == 201


@pytest.mark.asyncio
async def test_project_helpers(monkeypatch):
    patch_client(
        monkeypatch,
        [
            FakeResponse(201, {"id": 99, "http_url_to_repo": "https://gitlab/repo.git"}),
            FakeResponse(200, {"id": 99, "name": "repo", "path": "repo", "web_url": "url"}),
            FakeResponse(200, [{"id": 1, "short_id": "a", "title": "commit"}]),
            FakeResponse(200, {"count": 7}),
            FakeResponse(200, [{"path": "src/app.py", "type": "blob"}]),
            FakeResponse(202, {}),
            FakeResponse(
                200,
                [{"id": 99, "name": "repo", "path": "repo", "web_url": "url"}],
            ),
        ],
    )

    assert await gitlab.gl_create_fork("Coursework", "student", 1, 2) == {
        "id": 99,
        "http_url_to_repo": "https://gitlab/repo.git",
    }
    assert await gitlab.gl_get_project(99) == {
        "id": 99,
        "name": "repo",
        "path": "repo",
        "web_url": "url",
    }
    assert await gitlab.gl_get_project_commits("group/repo") == [
        {"id": 1, "short_id": "a", "title": "commit"}
    ]
    assert await gitlab.gl_get_commit_count("group/repo", "abc") == {"count": 7}
    assert await gitlab.gl_get_project_tree("group/repo") == [
        {"path": "src/app.py", "type": "blob"}
    ]
    assert (await gitlab.gl_delete_project(99)).status_code == 202
    assert await gitlab.gl_get_projects(1) == [
        {"id": 99, "name": "repo", "path": "repo", "web_url": "url"}
    ]


@pytest.mark.asyncio
async def test_project_helpers_return_failure_payloads(monkeypatch):
    patch_client(
        monkeypatch,
        [
            FakeResponse(400, {"message": "fork failed"}),
            FakeResponse(400, {"message": "commit failed"}),
            FakeResponse(404, {"message": "missing"}),
            FakeResponse(400, {"message": "tree failed"}),
            FakeResponse(400, {"message": "projects failed"}),
        ],
    )

    assert await gitlab.gl_create_fork("Coursework", "student", 1, 2) == {
        "success": False,
        "error": "fork failed",
    }
    assert await gitlab.gl_get_project_commits("group/repo") == {
        "success": False,
        "error": "commit failed",
    }
    assert await gitlab.gl_get_project_tree("group/repo") == []
    assert await gitlab.gl_get_project_tree("group/repo") == {
        "success": False,
        "error": "tree failed",
    }
    assert await gitlab.gl_get_projects(1) == {
        "success": False,
        "error": "Failed to find ",
    }


@pytest.mark.asyncio
async def test_group_detail_and_recursive_project_helpers(monkeypatch):
    patch_client(
        monkeypatch,
        [
            FakeResponse(200, [{"id": 1}], headers={"X-Next-Page": "2"}),
            FakeResponse(200, [{"id": 2}], headers={}),
            FakeResponse(200, {"id": 123, "name": "Group"}),
        ],
    )

    assert await gitlab.gl_get_group_projects_recursive("123") == [
        {"id": 1},
        {"id": 2},
    ]
    assert await gitlab.gl_get_group_details("123") == {"id": 123, "name": "Group"}


@pytest.mark.asyncio
async def test_delete_projects_skips_skeleton_code(monkeypatch):
    async def fake_get_projects(group_id):
        return [
            {"id": 1, "name": "student-repo"},
            {"id": 2, "name": "skeleton-code"},
        ]

    async def fake_delete_project(project_id):
        return FakeResponse(202, {})

    monkeypatch.setattr(gitlab, "gl_get_projects", fake_get_projects)
    monkeypatch.setattr(gitlab, "gl_delete_project", fake_delete_project)

    assert await gitlab.gl_delete_projects(1) == {
        "deleted": ["student-repo", "skeleton-code"],
        "failed": [],
    }


@pytest.mark.asyncio
async def test_template_url_and_file_helpers(monkeypatch):
    patch_client(
        monkeypatch,
        [
            FakeResponse(201, {"id": 500}),
            FakeResponse(200, [{"path": "README.md", "type": "blob"}]),
            FakeResponse(
                200,
                {
                    "http_url_to_repo": "https://gitlab/repo.git",
                    "ssh_url_to_repo": "git@gitlab:repo.git",
                },
            ),
            FakeResponse(404, {}),
        ],
    )

    assert await gitlab.gl_activate_template_project(1) == {"templateGitLabId": 500}
    assert await gitlab.gl_template_files(500) == [
        {"path": "README.md", "type": "blob"}
    ]
    assert await gitlab.gl_template_urls(500) == {
        "http": "https://gitlab/repo.git",
        "ssh": "git@gitlab:repo.git",
    }
    assert await gitlab.gl_template_files(500) == []


@pytest.mark.asyncio
async def test_check_file_safe_accepts_valid_zip_and_rejects_bad_inputs():
    valid = await gitlab.check_file_safe(zip_upload_file({"src/app.py": b"print(1)"}))
    assert valid.namelist() == ["src/app.py"]

    with pytest.raises(HTTPException) as wrong_extension:
        await gitlab.check_file_safe(UploadFile(filename="template.txt", file=io.BytesIO(b"bad")))
    assert wrong_extension.value.status_code == 400

    with pytest.raises(HTTPException) as bad_zip:
        await gitlab.check_file_safe(UploadFile(filename="template.zip", file=io.BytesIO(b"bad")))
    assert bad_zip.value.status_code == 453


@pytest.mark.asyncio
async def test_zip_upload_helpers_build_commit_actions(monkeypatch):
    patch_client(
        monkeypatch,
        [
            FakeResponse(201, {"id": 500}),
            FakeResponse(201, {}),
            FakeResponse(200, [{"path": "old.py", "type": "blob"}]),
            FakeResponse(201, {}),
        ],
    )

    uploaded = await gitlab.gl_upload_zip(
        "coursework",
        zip_upload_file({"src/app.py": b"print(1)", "empty/": b""}),
    )
    overwritten = await gitlab.gl_overwrite_zip(
        "500",
        zip_upload_file({"src/app.py": b"print(2)"}),
    )

    assert uploaded == {"templateId": 500}
    assert overwritten == {"success": True}
    upload_actions = FakeAsyncClient.instances[1].calls[0][2]["json"]["actions"]
    overwrite_actions = FakeAsyncClient.instances[3].calls[0][2]["json"]["actions"]
    assert {action["file_path"] for action in upload_actions} == {
        "src/app.py",
        "empty/.gitkeep",
    }
    assert {"action": "delete", "file_path": "old.py"} in overwrite_actions


@pytest.mark.asyncio
async def test_gl_create_project_success_and_failure(monkeypatch):
    patch_client(
        monkeypatch,
        [
            FakeResponse(201, {"id": 1, "name": "Coursework-student"}),
            FakeResponse(400, {"message": "create project failed"}),
        ],
    )

    assert await gitlab.gl_create_project("Coursework", "student", 1, 2, 3) == {
        "id": 1,
        "name": "Coursework-student",
    }
    assert await gitlab.gl_create_project("Coursework", "student", 1, 2, 3) == {
        "success": False,
        "error": "create project failed",
    }
