import re
import base64
import io
import zipfile
from pathlib import PurePosixPath #Just easier path hadnling
from fastapi import HTTPException, UploadFile
import httpx
from dotenv import load_dotenv
import os

load_dotenv()
TOKEN = os.getenv("GITLAB_API_TOKEN")
BASE_URL = os.getenv("GITLAB_BASE_URL")
ROOT_ID = os.getenv("GITLAB_ROOT_ID")

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
            print(f"Network Error: {err}")
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
                print(data)

                if response.status_code != 202:
                    return {
                        "success": False,
                        "error": data.get("message") or "Failed to delete GitLab group"
                    }
                
            except httpx.RequestError as err:
                print(f"Network Error: {err}")
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
            print(f"Network Error: {err}")
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
            print(f"Network Error: {err}")
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
                print(f"Network Error: {err}")
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
            print(f"Network Error: {err}")
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
            print(f"Network Error: {err}")
            raise HTTPException(status_code=500, detail="Internal Server Error when connecting to GitLab")
        
    return {
        "success": True,
        "gitlabGroupId": data.get("id"),
        "webUrl": data.get("web_url"),
        "path": data.get("path"),
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
            print(f"Network Error: {err}")
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


# All file stuff is done in memory, as automatically delted after use, and we set limits on file size anyway
async def check_file_safe(file: UploadFile):
    MAX_COMPRESSED = 10 * 1024 * 1024
    MAX_UNCOMPRESSED = 50 * 1024 * 1024
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



    contents = await file.read()
    zip_buffer = io.BytesIO(contents)

    with zipfile.ZipFile(zip_buffer, "r") as zip_ref:    
        # print(zip_ref.namelist())
        # print(curent_paths)

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
                print(data)

                if response.status_code != 202:
                    return {
                        "success": False,
                        "error": data.get("message") or "Failed to delete GitLab group"
                    }
                
            except httpx.RequestError as err:
                print(f"Network Error: {err}")
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
            print(f"Network Error: {err}")
            raise HTTPException(status_code=500, detail="Internal Server Error when connecting to GitLab")
    return {
        "success": True,
        "gitlabGroupId": data.get("id"),
        "name" : data.get("name"),
    }
