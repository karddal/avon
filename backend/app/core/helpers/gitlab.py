import re
import base64
import io
import zipfile
from pathlib import PurePosixPath #Just easier path hadnling
from fastapi import HTTPException, UploadFile
import httpx
from dotenv import load_dotenv
import os
from urllib.parse import quote

load_dotenv()
TOKEN = os.getenv("GITLAB_API_TOKEN")
BASE_URL = os.getenv("GITLAB_BASE_URL")
ROOT_ID = os.getenv("GITLAB_ROOT_ID")


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
            print(f"Network Error: {err}")
            raise HTTPException(status_code=500, detail="Internal Server Error when connecting to GitLab")
        
    return {
        "success": True,
        "gitlabGroupId": data.get("id"),
        "webUrl": data.get("web_url"),
        "path": data.get("path"),
    }

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
            print(f"Network Error: {err}")
            raise HTTPException(status_code=500, detail="Internal Server Error when connecting to GitLab")
        
    return {
        "success": True,
        "gitlabGroupId": data.get("id"),
        "webUrl": data.get("web_url"),
        "path": data.get("path"),
    }

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
            print(f"Network Error: {err}")
            raise HTTPException(status_code=500, detail="Internal Server Error when connecting to GitLab")
        
    return {
        "success": True,
        "gitlabGroupId": data.get("id"),
        "webUrl": data.get("web_url"),
        "path": data.get("path"),
    }

async def gl_template_existance(coursework_id):
    if not TOKEN or not BASE_URL:
        raise HTTPException(status_code=500, detail="Missing GitLab configuration")

    async with httpx.AsyncClient() as client:
        try:
            response = await client.get(
                f"{BASE_URL}/groups/{coursework_id}",
                headers={
                    "PRIVATE-TOKEN": TOKEN,
                },
                timeout=10.0,
            )
            if response.status_code != 200:
                return {
                    "success": False,
                    "error": response.json().get("message") or "Failed to get GitLab group"
                }

            data = response.json()
            full_path = data["full_path"]

        except httpx.RequestError as err:
            print(f"Network Error: {err}")
            raise HTTPException(
                status_code=500,
                detail="Internal Server Error when connecting to GitLab"
            )

        encoded_path = quote(f"{full_path}/template", safe="")

        try:
            existence_response = await client.get(
                f"{BASE_URL}/projects/{encoded_path}",
                headers={
                    "PRIVATE-TOKEN": TOKEN,
                },
                timeout=10.0,
            )
            if existence_response.status_code == 404:
                return {"exists": False, "templateProjectId": None}

            if existence_response.status_code != 200:
                raise HTTPException(
                    status_code=500,
                    detail="Template lookup failed"
                )
            print("templayeproject ODDDSS\n\n\n\n :", existence_response.json()["id"])
            return {"exists": True, "templateProjectId":existence_response.json()["id"]}

        except httpx.RequestError as err:
            print(f"Network Error: {err}")
            raise HTTPException(
                status_code=500,
                detail="Internal Server Error when connecting to GitLab"
            )

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
            print(f"Network Error: {err}")
            raise HTTPException(
                status_code=500,
                detail="Internal Server Error when connecting to GitLab",
            )
    return {
        "httpsCloneUrl": data["http_url_to_repo"],
        "sshCloneUrl": data["ssh_url_to_repo"],
    }

async def gl_template_files(template_id):
    if not TOKEN or not BASE_URL:
        raise HTTPException(status_code=500, detail="Missing GitLab configuration")
    #print("yyoyo beeping brev")
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
            print(f"Network Error: {err}")
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
            print(f"Network Error: {err}")
            raise HTTPException(
                status_code=500,
                detail="Internal Server Error when connecting to GitLab",
            )
    return {
        "http": data["http_url_to_repo"],
        "ssh": data["ssh_url_to_repo"],
    }

async def gl_upload_zip(templateId: str, file: UploadFile):
    if not TOKEN or not BASE_URL:
        raise HTTPException(status_code=500, detail="Missing GitLab configuration")
    
    commit_actions = []
    contents = await file.read()
    zip_buffer = io.BytesIO(contents)

    with zipfile.ZipFile(zip_buffer, "r") as zip_ref:

        file_list = zip_ref.namelist()

        file_entries = []
        dir_entries = []
        for temp in file_list:
            if (temp.endswith("/")):
                dir_entries.append(temp)
            else:
                file_entries.append(temp)

        dir_with_files = set() # O(1) lookup

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

    return {"success": True}

async def gl_overwrite_zip(templateId: str, file: UploadFile):
    if not TOKEN or not BASE_URL:
        raise HTTPException(status_code=500, detail="Missing GitLab configuration")
    
    current_files = await gl_template_files(templateId)
    curent_paths = set()
    for tempFile in current_files:
        if (tempFile["type"] == "blob"): # Only need fiels in comparison as we only commit files not directories, gitlab infers that (gitlab repository/tree includes directories as type tree)
            curent_paths.add(tempFile["path"]) 

    contents = await file.read()
    zip_buffer = io.BytesIO(contents)

    with zipfile.ZipFile(zip_buffer, "r") as zip_ref:
    
        print(zip_ref.namelist())
        print(curent_paths)
        file_list = zip_ref.namelist()

        commit_actions = []

        for filename in file_list:
            if filename.endswith("/"):
                continue

            file_bytes = zip_ref.read(filename)

            encoded_content = base64.b64encode(file_bytes).decode("utf-8")

            if filename in curent_paths:
                action_type = "update"
            else:
                action_type = "create"

            commit_actions.append({
                "action": action_type,
                "file_path": filename,
                "content": encoded_content,
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
