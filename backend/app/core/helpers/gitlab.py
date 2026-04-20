import base64
import io
import os
import re
import zipfile
from pathlib import PurePosixPath  #Just easier path hadnling
from urllib.parse import quote, urlparse

import httpx
from fastapi import HTTPException, UploadFile

from app.core.settings import settings

TOKEN = settings.gitlab_api_token
BASE_URL = settings.gitlab_base_url
ROOT_ID = settings.gitlab_root_id

# Programme CRUD

def generate_gitlab_path(name: str) -> str:
    path = name.lower().strip()
    path = re.sub(r'[^a-z0-9]+', '-', path)
    return path.strip('-')


async def gl_create_programme(name):
    if not TOKEN or not BASE_URL:
        raise HTTPException(status_code=500, detail="Missing GitLab configuration")

    path = generate_gitlab_path(name)

    async with httpx.AsyncClient() as client:
        try:
            response = await client.post(
                f"{BASE_URL}/groups",
                headers={
                    "PRIVATE-TOKEN": TOKEN,
                    "Content-Type": "application/json",
                },
                json={
                    "name": name,
                    "path": path,
                    "parent_id": ROOT_ID,
                    "visibility": "private",
                    "description": f"Root group for the {name} programme.",
                },
                timeout=10.0
            )

            data = response.json()
            if response.status_code != 201:
                return {
                    "success": False,
                    "error": data.get("message") or "Failed to create GitLab group"
                }

        except httpx.RequestError as err:
            raise HTTPException(status_code=500, detail="Internal Server Error when connecting to GitLab")

    return {
        "success": True,
        "gitlabGroupId": data.get("id"),
        "webUrl": data.get("web_url"),
        "path": data.get("path"),
    }

async def gl_delete_programme(gitlab_group_id):
    if not TOKEN or not BASE_URL:
        raise HTTPException(status_code=500, detail="Missing GitLab configuration")

    async with httpx.AsyncClient() as client:
            try:
                response = await client.delete(
                    f"{BASE_URL}/groups/{gitlab_group_id}",
                    headers={
                        "PRIVATE-TOKEN": TOKEN,
                        "Content-Type": "application/json",
                    }, timeout=10.0
                )

                data = response.json()

                if response.status_code != 202:
                    return {
                        "success": False,
                        "error": data.get("message") or "Failed to delete GitLab group"
                    }

            except httpx.RequestError as err:
                raise HTTPException(status_code=500, detail="Internal Server Error when connecting to GitLab")
    return {
        "success": True
    }

async def gl_update_programme(gitlab_group_id, name):
    if not TOKEN or not BASE_URL:
        raise HTTPException(status_code=500, detail="Missing GitLab configuration")

    async with httpx.AsyncClient() as client:
        try:
            response = await client.put(
                f"{BASE_URL}/groups/{gitlab_group_id}",
                headers={
                    "PRIVATE-TOKEN": TOKEN,
                    "Content-Type": "application/json",
                },params = {
                    "name": name
                },timeout=10.0,
            )

            data = response.json()

            if response.status_code != 200:
                return {
                    "success": False,
                    "error": data.get("message") or "Failed to update GitLab group"
                }
        except httpx.RequestError as err:
            raise HTTPException(status_code=500, detail="Internal Server Error when connecting to GitLab")
    return {
        "success": True,
        "gitlabGroupId": data.get("id"),
        "name" : data.get("name"),
    }


# Unit CRUD

async def gl_create_unit(name, programme_id):
    if not TOKEN or not BASE_URL:
        raise HTTPException(status_code=500, detail="Missing GitLab configuration")

    path = generate_gitlab_path(name)

    async with httpx.AsyncClient() as client:
        try:
            response = await client.post(
                f"{BASE_URL}/groups",
                headers={
                    "PRIVATE-TOKEN": TOKEN,
                    "Content-Type": "application/json",
                },
                json={
                    "name": name,
                    "path": path,
                    "parent_id": programme_id,
                    "visibility": "private",
                    "description": f"Root group for the {name} unit.",
                },
                timeout=10.0
            )

            data = response.json()

            if response.status_code != 201:
                return {
                    "success": False,
                    "error": data.get("message") or "Failed to create GitLab group"
                }

        except httpx.RequestError as err:
            raise HTTPException(status_code=500, detail="Internal Server Error when connecting to GitLab")

    return {
        "success": True,
        "gitlabGroupId": data.get("id"),
        "webUrl": data.get("web_url"),
        "path": data.get("path"),
    }

async def gl_delete_unit(gitlab_group_id):
    if not TOKEN or not BASE_URL:
        raise HTTPException(status_code=500, detail="Missing GitLab configuration")

    async with httpx.AsyncClient() as client:
            try:
                response = await client.delete(
                    f"{BASE_URL}/groups/{gitlab_group_id}",
                    headers={
                        "PRIVATE-TOKEN": TOKEN,
                        "Content-Type": "application/json",
                    }, timeout=10.0
                )

                data = response.json()
                if response.status_code != 202:
                    return {
                        "success": False,
                        "error": data.get("message") or "Failed to delete GitLab group"
                    }

            except httpx.RequestError as err:
                raise HTTPException(status_code=500, detail="Internal Server Error when connecting to GitLab")
    return {
        "success": True
    }

async def gl_update_unit(gitlab_group_id, name):
    if not TOKEN or not BASE_URL:
        raise HTTPException(status_code=500, detail="Missing GitLab configuration")

    async with httpx.AsyncClient() as client:
        try:
            response = await client.put(
                f"{BASE_URL}/groups/{gitlab_group_id}",
                headers={
                    "PRIVATE-TOKEN": TOKEN,
                    "Content-Type": "application/json",
                },params = {
                    "name": name
                },timeout=10.0,
            )

            data = response.json()

            if response.status_code != 200:
                return {
                    "success": False,
                    "error": data.get("message") or "Failed to update GitLab group"
                }
        except httpx.RequestError as err:
            raise HTTPException(status_code=500, detail="Internal Server Error when connecting to GitLab")
    return {
        "success": True,
        "gitlabGroupId": data.get("id"),
        "name" : data.get("name"),
    }

# Coursework CRUD

async def gl_create_coursework(name, unit_id):
    if not TOKEN or not BASE_URL:
        raise HTTPException(status_code=500, detail="Missing GitLab configuration")

    path = generate_gitlab_path(name)

    async with httpx.AsyncClient() as client:
        try:
            response = await client.post(
                f"{BASE_URL}/groups",
                headers={
                    "PRIVATE-TOKEN": TOKEN,
                    "Content-Type": "application/json",
                },
                json={
                    "name": name,
                    "path": path,
                    "parent_id": unit_id,
                    "visibility": "private",
                    "description": f"Root group for the {name} coursework.",
                },
                timeout=10.0
            )

            data = response.json()

            if response.status_code != 201:
                return {
                    "success": False,
                    "error": data.get("message") or "Failed to create GitLab group"
                }

        except httpx.RequestError as err:
            raise HTTPException(status_code=500, detail="Internal Server Error when connecting to GitLab")

    return {
        "success": True,
        "gitlabGroupId": data.get("id"),
        "webUrl": data.get("web_url"),
        "path": data.get("path"),
    }

async def gl_create_template_group(coursework_id):
    if not TOKEN or not BASE_URL:
        raise HTTPException(status_code=500, detail="Missing GitLab configuration")

    async with httpx.AsyncClient() as client:
        try:
            response = await client.post(
                f"{BASE_URL}/groups",
                headers={
                    "PRIVATE-TOKEN": TOKEN,
                    "Content-Type": "application/json",
                },
                json={
                    "name": "templates01",
                    "path": "templates01",
                    "parent_id": coursework_id,
                    "visibility": "private",
                    "description": "Template group",
                },
                timeout=10.0
            )
            data = response.json()

            if response.status_code != 201:
                return {
                    "success": False,
                    "error": data.get("message") or "Failed to create GitLab group"
                }

        except httpx.RequestError as err:
            raise HTTPException(status_code=500, detail="Internal Server Error when connecting to GitLab")

    return {
        "success": True,
        "gitlabGroupId": data.get("id"),
        "webUrl": data.get("web_url"),
        "path": data.get("path"),
    }

async def gl_create_template_project(group_id):
    if not TOKEN or not BASE_URL:
        raise HTTPException(status_code=500, detail="Missing GitLab configuration")

    async with httpx.AsyncClient(base_url=BASE_URL) as client:
        try:
            response = await client.post(
                "/projects/",
                headers={
                    "PRIVATE-TOKEN": TOKEN,
                    "Content-Type": "application/json",
                },
                json={
                    "name": "skeleton-code",
                    "path": "skeleteon-code",
                    "namespace_id":group_id,
                    "description":"Skeleton Code",
                },
                timeout=10.0
            )
            data = response.json()
            if response.status_code != 201:
                return {
                    "success": False,
                    "error": data.get("message") or "Failed to create GitLab group"
                }

        except httpx.RequestError as err:
            raise HTTPException(status_code=500, detail="Internal Server Error when connecting to GitLab")

    return data

async def gl_create_skeleton_code(group_id, coursework_name):
    if not TOKEN or not BASE_URL:
        raise HTTPException(status_code=500, detail="Missing GitLab configuration")

    name = "skeleton-code"
    path = generate_gitlab_path(name)
    async with httpx.AsyncClient(base_url=BASE_URL) as client:
        try:
            response = await client.post(
                "/projects/",
                headers={
                    "PRIVATE-TOKEN": TOKEN,
                    "Content-Type": "application/json",
                },
                json={
                    "name": name,
                    "path": path,
                    "namespace_id": group_id,
                    "description": "The skeleton code for the " + coursework_name + " coursework"
                }
            )
            data = response.json()
            if response.status_code != 201:
                return {
                    "success": False,
                    "error": data.get("message") or "Failed to create GitLab group"
                }

        except httpx.RequestError as err:
            raise HTTPException(status_code=500, detail="Internal Server Error when connecting to GitLab")

    return response


async def gl_create_fork(name, user_id, group_id, template_id):
    if not TOKEN or not BASE_URL:
        raise HTTPException(status_code=500, detail="Missing GitLab configuration")

    name = name+"-"+user_id
    path = generate_gitlab_path(name)
    async with httpx.AsyncClient(base_url=BASE_URL) as client:
        try:
            response = await client.post(
                "/projects/"+template_id+"/fork",
                headers={
                    "PRIVATE-TOKEN": TOKEN,
                    "Content-Type": "application/json",
                },
                json={
                    "name": name,
                    "path": path,
                    "namespace_id":group_id,
                    "description":"Project repo for " + user_id,
                },
                timeout=10.0
            )
            data = response.json()
            if response.status_code != 201:
                return {
                    "success": False,
                    "error": data.get("message") or "Failed to create GitLab group"
                }

        except httpx.RequestError as err:
            raise HTTPException(status_code=500, detail="Internal Server Error when connecting to GitLab")

    print("CREATE FORK DATA: ", data)
    return data

async def gl_create_project(name, user_id, group_id, template_group_id, template_id):
    if not TOKEN or not BASE_URL:
        raise HTTPException(status_code=500, detail="Missing GitLab configuration")

    name = name+"-"+user_id
    path = generate_gitlab_path(name)
    async with httpx.AsyncClient(base_url=BASE_URL) as client:
        try:
            response = await client.post(
                "/projects/",
                headers={
                    "PRIVATE-TOKEN": TOKEN,
                    "Content-Type": "application/json",
                },
                json={
                    "name": name,
                    "path": path,
                    "namespace_id":group_id,
                    "description":"Project repo for " + user_id,
                    "use_custom_template": "true",
                    # "group_with_project_templates_id": 124803838,
                    # "template_project_id": 79388377
                    "group_with_project_templates_id": template_group_id,
                    "template_project_id": template_id
                },
                timeout=10.0
            )
            data = response.json()
            if response.status_code != 201:
                return {
                    "success": False,
                    "error": data.get("message") or "Failed to create GitLab group"
                }

        except httpx.RequestError as err:
            raise HTTPException(status_code=500, detail="Internal Server Error when connecting to GitLab")

    return data

async def gl_get_project(project_id):
    if not TOKEN or not BASE_URL:
        raise HTTPException(status_code=500, detail="Missing GitLab configuration")

    async with httpx.AsyncClient(base_url=BASE_URL) as client:
        try:
            response = await client.get(
                f"/projects/{project_id}",
                headers={
                    "PRIVATE-TOKEN": TOKEN,
                    "Content-Type": "application/json"
                },
                timeout=10.0
            )
            data = response.json()
        except httpx.RequestError as err:
            raise HTTPException(status_code=500, detail="Internal Server Error when connecting to GitLab")

    project_data = {"id": data["id"], "name": data["name"], "path": data["path"], "web_url": data["web_url"]}
    return project_data

def gitlab_project_path_from_repo_url(repo_url: str) -> str:
    parsed = urlparse(repo_url)
    project_path = parsed.path.strip("/")
    if project_path.endswith(".git"):
        project_path = project_path[:-4]
    return project_path

async def gl_get_project_commits(project_path: str, per_page: int = 5):
    """This function returns commits to MAIN!!!/default branch because it doesn't specify ref_name"""
    if not TOKEN or not BASE_URL:
        raise HTTPException(status_code=500, detail="Missing GitLab configuration")

    encoded_project_path = quote(project_path, safe="")

    async with httpx.AsyncClient(base_url=BASE_URL) as client:
        try:
            response = await client.get(
                f"/projects/{encoded_project_path}/repository/commits",
                headers={
                    "PRIVATE-TOKEN": TOKEN,
                    "Content-Type": "application/json"
                },
                params={"per_page": per_page, "with_stats": "true"},
                timeout=10.0
            )
            data = response.json()
            if response.status_code != 200:
                return {
                    "success": False,
                    "error": data.get("message") or "Failed to fetch project commits"
                }
        except httpx.RequestError as err:
            print(f"Network Error: {err}")
            raise HTTPException(status_code=500, detail="Internal Server Error when connecting to GitLab")

    return data

async def gl_get_commit_count(project_path: str, sha: str):
    if not TOKEN or not BASE_URL:
        raise HTTPException(status_code=500, detail="Missing GitLab configuration")

    encoded_project_path = quote(project_path, safe="")
    encoded_sha = quote(sha, safe="")

    async with httpx.AsyncClient(base_url=BASE_URL) as client:
        try:
            response = await client.get(
                f"/projects/{encoded_project_path}/repository/commits/{encoded_sha}/sequence",
                headers={
                    "PRIVATE-TOKEN": TOKEN,
                    "Content-Type": "application/json"
                },
                timeout=10.0
            )
            data = response.json()
            if response.status_code != 200:
                return {
                    "success": False,
                    "error": data.get("message") or "Failed to fetch commit count"
                }
        except httpx.RequestError as err:
            print(f"Network Error: {err}")
            raise HTTPException(status_code=500, detail="Internal Server Error when connecting to GitLab")

    return data

async def gl_get_project_tree(project_path: str):
    if not TOKEN or not BASE_URL:
        raise HTTPException(status_code=500, detail="Missing GitLab configuration")

    encoded_project_path = quote(project_path, safe="")

    async with httpx.AsyncClient(base_url=BASE_URL) as client:
        try:
            response = await client.get(
                f"/projects/{encoded_project_path}/repository/tree",
                headers={
                    "PRIVATE-TOKEN": TOKEN,
                    "Content-Type": "application/json"
                },
                params={
                    "recursive": "true",
                    "per_page": "1000",
                },
                timeout=10.0
            )
            if response.status_code == 404:
                return []
            data = response.json()
            if response.status_code != 200:
                return {
                    "success": False,
                    "error": data.get("message") or "Failed to fetch project tree"
                }
        except httpx.RequestError as err:
            print(f"Network Error: {err}")
            raise HTTPException(status_code=500, detail="Internal Server Error when connecting to GitLab")

    return data

async def gl_delete_project(project_id):
    if not TOKEN or not BASE_URL:
        raise HTTPException(status_code=500, detail="Missing GitLab configuration")

    async with httpx.AsyncClient(base_url=BASE_URL) as client:
        try:
            response = await client.delete(
                f"/projects/{project_id}",
                headers={
                    "PRIVATE-TOKEN": TOKEN,
                    "Content-Type": "application/json"
                },
                timeout=10.0
            )

        except httpx.RequestError as err:
            raise HTTPException(status_code=500, detail="Internal Server Error when connecting to GitLab")

    return response


async def gl_get_projects(group_id):
    if not TOKEN or not BASE_URL:
        raise HTTPException(status_code=500, detail="Missing GitLab configuration")

    async with httpx.AsyncClient(base_url=BASE_URL) as client:
        try:
            response = await client.get(
                f"/groups/{group_id}/projects/",
                headers={
                    "PRIVATE-TOKEN": TOKEN,
                    "Content-Type": "application/json",
                },
                timeout=10.0
            )
            data = response.json()
            if response.status_code != 200:
                return {
                    "success": False,
                    "error": "Failed to find "
                }

        except httpx.RequestError as err:
            raise HTTPException(status_code=500, detail="Internal Server Error when connecting to GitLab")

    coursework_data = []
    for coursework in data:
        coursework_data.append({"id": coursework["id"], "name": coursework["name"], "path":coursework["path"], "web_url":coursework["web_url"]})
    return coursework_data

async def gl_delete_projects(group_id: int):
    status = {"deleted": [], "failed": []}
    projects_to_delete = await gl_get_projects(group_id)
    for project in projects_to_delete:
        if project["name"] != "skeleton-code":
            status_code = await gl_delete_project(project["id"])
        if status_code.status_code == 202:
            status["deleted"].append(project["name"])
        else:
            status["failed"].append(project["name"])
    return status

async def gl_delete_coursework(gitlab_group_id):
    if not TOKEN or not BASE_URL:
        raise HTTPException(status_code=500, detail="Missing GitLab configuration")

    async with httpx.AsyncClient() as client:
            try:
                response = await client.delete(
                    f"{BASE_URL}/groups/{gitlab_group_id}",
                    headers={
                        "PRIVATE-TOKEN": TOKEN,
                        "Content-Type": "application/json",
                    }, timeout=10.0
                )

                data = response.json()

                if response.status_code != 202:
                    return {
                        "success": False,
                        "error": data.get("message") or "Failed to delete GitLab group"
                    }

            except httpx.RequestError as err:
                raise HTTPException(status_code=500, detail="Internal Server Error when connecting to GitLab")

    return {
        "success": True
    }

async def gl_update_coursework(gitlab_group_id, name):
    if not TOKEN or not BASE_URL:
        raise HTTPException(status_code=500, detail="Missing GitLab configuration")

    async with httpx.AsyncClient() as client:
        try:
            response = await client.put(
                f"{BASE_URL}/groups/{gitlab_group_id}",
                headers={
                    "PRIVATE-TOKEN": TOKEN,
                    "Content-Type": "application/json",
                },params = {
                    "name": name
                },timeout=10.0,
            )

            data = response.json()

            if response.status_code != 200:
                return {
                    "success": False,
                    "error": data.get("message") or "Failed to update GitLab group"
                }
        except httpx.RequestError as err:
            raise HTTPException(status_code=500, detail="Internal Server Error when connecting to GitLab")
    return {
        "success": True,
        "gitlabGroupId": data.get("id"),
        "name" : data.get("name"),
    }

async def gl_activate_template_project(coursework_id):
    if not TOKEN or not BASE_URL:
        raise HTTPException(status_code=500, detail="Missing GitLab configuration")

    path = generate_gitlab_path("Template")

    async with httpx.AsyncClient() as client:
        try:
            response = await client.post(
                f"{BASE_URL}/projects",
                headers={
                    "PRIVATE-TOKEN": TOKEN,
                    "Content-Type": "application/json",
                },
                json={
                    "name": "Template",
                    "path": path,
                    "namespace_id": coursework_id,
                    "visibility": "private",
                    "initialize_with_readme": False,
                },
                timeout=10.0,
            )

            if response.status_code != 201:
                return {
                    "success": False,
                    "error": response.json().get("message") or "Failed to create template project",
                }

            data = response.json()

        except httpx.RequestError as err:
            raise HTTPException(
                status_code=500,
                detail="Internal Server Error when connecting to GitLab",
            )
    return {
        "templateGitLabId": data["id"],
    }

async def gl_template_files(template_id):
    if not TOKEN or not BASE_URL:
        raise HTTPException(status_code=500, detail="Missing GitLab configuration")
    async with httpx.AsyncClient() as client:
        try:
            response = await client.get(
                f"{BASE_URL}/projects/{template_id}/repository/tree",
                headers={
                    "PRIVATE-TOKEN": TOKEN,
                },
                params={
                    "recursive":"true",
                    "per_page":"1000"
                },
                timeout=10.0,
            )

            if response.status_code == 404: #If 404 then empty, as we have established that the repo has to exist on the webpage
                return []

            if response.status_code != 200:
                raise HTTPException(
                    status_code=response.status_code,
                    detail="gitlab reponse is not status 200"
                )

            data = response.json()
        except httpx.RequestError as err:
            raise HTTPException(
                status_code=500,
                detail="Internal Server Error when connecting to GitLab",
            )
    return data

async def gl_template_urls(template_id):
    if not TOKEN or not BASE_URL:
        raise HTTPException(status_code=500, detail="Missing GitLab configuration")

    async with httpx.AsyncClient() as client:
        try:
            response = await client.get(
                f"{BASE_URL}/projects/{template_id}",
                headers={
                    "PRIVATE-TOKEN": TOKEN,
                    "Content-Type": "application/json",
                },
                timeout=10.0,
            )

            if response.status_code != 200:
                raise HTTPException(
                    status_code=response.status_code,
                    detail="gitlab reponse is not status 200"
                )

            data = response.json()

        except httpx.RequestError as err:
            raise HTTPException(
                status_code=500,
                detail="Internal Server Error when connecting to GitLab",
            )
    return {
        "http": data["http_url_to_repo"],
        "ssh": data["ssh_url_to_repo"],
    }


# All file stuff is done in memory, as automatically delted after use, and we set limits on file size anyway
async def check_file_safe(file: UploadFile):
    MAX_COMPRESSED = 10 * 1024 * 1024 # 10MB
    MAX_UNCOMPRESSED = 50 * 1024 * 1024 # 500MB
    MAX_FILES = 1000

    if not file.filename or not file.filename.lower().endswith(".zip"):
        raise HTTPException(status_code=400, detail="File must be a .zip file")


    buffer = io.BytesIO()
    total_bytes_read = 0

    # To check if too large (zip bomb protection)
    while True:
        chunk = await file.read(1024 * 1024)  # Read in 1MB chunks
        if not chunk:
            break

        total_bytes_read += len(chunk)
        if total_bytes_read > MAX_COMPRESSED:
            raise HTTPException(status_code=453, detail="Compressed file size exceeds limit")
        buffer.write(chunk)

    buffer.seek(0)

    # Try opne it safely
    try:
        zip_ref = zipfile.ZipFile(buffer, "r")
    except zipfile.BadZipFile:
        raise HTTPException(status_code=453, detail="Invalid ZIP file")

    # Validate contents of it (not too many files, not too large uncompressed, valid / correct paths as well)
    total_uncompressed = 0
    file_count = 0

    for info in zip_ref.infolist():
        # File count checking
        file_count += 1
        if file_count > MAX_FILES:
            raise HTTPException(453, "Too many files in ZIP")
        # Uncompressed size checking
        total_uncompressed += info.file_size
        if total_uncompressed > MAX_UNCOMPRESSED:
            raise HTTPException(453, "Uncompressed size too large")

        # Link validation
        normalized = os.path.normpath(info.filename)
        if normalized.startswith("..") or os.path.isabs(normalized):
            raise HTTPException(453, "Invalid file path in ZIP")

        # Reject symlinks
        if (info.external_attr >> 16) & 0o120000 == 0o120000:
            raise HTTPException(453, "Symlinks not allowed")

    return zip_ref

async def gl_upload_zip(courseworkGitLabId: str, file: UploadFile):
    if not TOKEN or not BASE_URL:
        raise HTTPException(status_code=500, detail="Missing GitLab configuration")


    commit_actions = []

    zip_ref = await check_file_safe(file)

    file_list = zip_ref.namelist()

    file_entries = []
    dir_entries = []
    for temp in file_list:
        if (temp.endswith("/")):
            dir_entries.append(temp)
        else:
            file_entries.append(temp)

    dir_with_files = set() # O(1) lookup

    activationResult = await gl_activate_template_project(courseworkGitLabId)

    templateId = activationResult["templateGitLabId"]

    # Do file entries first
    for filename in file_entries:

        file_bytes = zip_ref.read(filename)

        encoded_content = base64.b64encode(file_bytes).decode("utf-8")

        commit_actions.append({
            "action": "create",
            "file_path": filename,
            "content": encoded_content,
            "encoding": "base64",
        })

        parent_dir = PurePosixPath(filename).parent
        while str(parent_dir) != ".":
            dir_with_files.add(str(parent_dir) + "/")
            parent_dir = parent_dir.parent

    empty_dirs = []
    for directory in dir_entries:
        if directory not in dir_with_files:
            empty_dirs.append(directory)

    for directory in empty_dirs:
        gitkeep_path = directory + ".gitkeep"

        commit_actions.append({
            "action": "create",
            "file_path": gitkeep_path,
            "content": base64.b64encode(b"").decode("utf-8"),
            "encoding": "base64",
        })

    async with httpx.AsyncClient() as client:
        response = await client.post(
            f"{BASE_URL}/projects/{templateId}/repository/commits",
            headers={"PRIVATE-TOKEN": TOKEN},
            json={
                "branch": "main",
                "commit_message": "Upload template ZIP",
                "actions": commit_actions,
            }
        )

        if response.status_code != 201:
            raise HTTPException(
                status_code=response.status_code,
                detail=response.text
            )

    return {"templateId": templateId}

async def gl_overwrite_zip(templateId: str, file: UploadFile):
    if not TOKEN or not BASE_URL:
        raise HTTPException(status_code=500, detail="Missing GitLab configuration")

    commit_actions = []

    current_files = await gl_template_files(templateId)

    file_paths = set()
    dir_paths = set()
    for tempFile in current_files:
        if (tempFile["type"] == "blob"): # Only need fiels in comparison as we only commit files not directories, gitlab infers that (gitlab repository/tree includes directories as type tree)
            file_paths.add(tempFile["path"])
        else:
            dir_paths.add(tempFile["path"])

    zip_ref = await check_file_safe(file)

    file_list = zip_ref.namelist()

    file_entries = set()
    dir_entries = set()
    for temp in file_list:
        if (temp.endswith("/")):
            dir_entries.add(temp)
        else:
            file_entries.add(temp)

    dir_with_files = set() # O(1) lookup

    # Do file entries first
    for filename in file_entries:

        file_bytes = zip_ref.read(filename)

        encoded_content = base64.b64encode(file_bytes).decode("utf-8")

        if filename in file_paths:
            action_type = "update"
        else:
            action_type = "create"

        commit_actions.append({
            "action": action_type,
            "file_path": filename,
            "content": encoded_content,
            "encoding": "base64",
        })

        parent_dir = PurePosixPath(filename).parent
        while str(parent_dir) != ".":
            dir_with_files.add(str(parent_dir) + "/")
            parent_dir = parent_dir.parent

        file_paths.discard(filename)

    for filename in file_paths:
        commit_actions.append({
            "action": "delete",
            "file_path": filename,
        })


    # Which directories don't have anything in them, (gitlab won't handle adding empty dirs, so put .gitkeep in them)
    empty_dirs = []
    for directory in dir_entries:
        if directory not in dir_with_files:
            empty_dirs.append(directory)

    for directory in empty_dirs:
        gitkeep_path = directory + ".gitkeep"

        if gitkeep_path in file_paths:
            action_type = "update"
        else:
            action_type = "create"

        commit_actions.append({
            "action": "create",
            "file_path": gitkeep_path,
            "content": base64.b64encode(b"").decode("utf-8"),
            "encoding": "base64",
        })

    async with httpx.AsyncClient() as client:
        response = await client.post(
            f"{BASE_URL}/projects/{templateId}/repository/commits",
            headers={"PRIVATE-TOKEN": TOKEN},
            json={
                "branch": "main",
                "commit_message": "Upload template ZIP",
                "actions": commit_actions,
            }
        )

        if response.status_code != 201:
            raise HTTPException(
                status_code=response.status_code,
                detail=response.text
            )

    return {"success": True}
