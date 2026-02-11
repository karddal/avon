import re

from fastapi import HTTPException
import httpx
from dotenv import load_dotenv
import os

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
                print("inside")
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

async def gl_create_template_group(coursework_id):
    if not TOKEN or not BASE_URL:
        raise HTTPException(status_code=500, detail="Missing GitLab configuration")
        
    async with httpx.AsyncClient() as client:
        try:
            print("point")
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
            print("point")
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

async def gl_create_template_project(group_id):
    print("inside", TOKEN, BASE_URL)
    if not TOKEN or not BASE_URL:
        raise HTTPException(status_code=500, detail="Missing GitLab configuration")
    
    print("point")
    async with httpx.AsyncClient(base_url=BASE_URL) as client:
        print("par")
        try:
            print(1)
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
            print(2)
            data = response.json()
            if response.status_code != 201:
                return {
                    "success": False,
                    "error": data.get("message") or "Failed to create GitLab group"
                }

        except httpx.RequestError as err:
            print(3)
            print(f"Network Error: {err}")
            raise HTTPException(status_code=500, detail="Internal Server Error when connecting to GitLab")
    
    return data

async def gl_create_fork(name, user_id, group_id, template_id):
    if not TOKEN or not BASE_URL:
        raise HTTPException(status_code=500, detail="Missing GitLab configuration")
    
    print("point")
    name = name+"-"+user_id
    path = generate_gitlab_path(name)
    async with httpx.AsyncClient(base_url=BASE_URL) as client:
        print("par")
        try:
            print("a")
            response = await client.post(
                f"/projects/"+template_id+"/fork",
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
            print("b")
            data = response.json()
            if response.status_code != 201:
                return {
                    "success": False,
                    "error": data.get("message") or "Failed to create GitLab group"
                }

        except httpx.RequestError as err:
            print(3)
            print(f"Network Error: {err}")
            raise HTTPException(status_code=500, detail="Internal Server Error when connecting to GitLab")
    
    return data 

async def gl_create_project(name, user_id, group_id, template_group_id, template_id):
    print("inside", TOKEN, BASE_URL)
    print(template_group_id, template_id)
    if not TOKEN or not BASE_URL:
        raise HTTPException(status_code=500, detail="Missing GitLab configuration")
    
    print("point")
    name = name+"-"+user_id
    path = generate_gitlab_path(name)
    async with httpx.AsyncClient(base_url=BASE_URL) as client:
        print("par")
        try:
            print("a")
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
            print("b")
            data = response.json()
            if response.status_code != 201:
                return {
                    "success": False,
                    "error": data.get("message") or "Failed to create GitLab group"
                }

        except httpx.RequestError as err:
            print(3)
            print(f"Network Error: {err}")
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
            print(3)
            print(f"Network Error: {err}")
            raise HTTPException(status_code=500, detail="Internal Server Error when connecting to GitLab")
    
    project_data = {"id": data["id"], "name": data["name"], "path": data["path"], "web_url": data["web_url"]}
    return project_data

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
            print(3)
            print(f"Network Error: {err}")
            raise HTTPException(status_code=500, detail="Internal Server Error when connecting to GitLab")
    
    return response.status_code
    

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
            # print(data[0]["id"], data[0]["name"])
            # print(data.name, data.id)
            if response.status_code != 200:
                return {
                    "success": False,
                    "error": "Failed to find "
                }

        except httpx.RequestError as err:
            print(3)
            print(f"Network Error: {err}")
            raise HTTPException(status_code=500, detail="Internal Server Error when connecting to GitLab")

    coursework_data = []
    for coursework in data:
        coursework_data.append({"id": coursework["id"], "name": coursework["name"], "path":coursework["path"], "web_url":coursework["web_url"]})
    return coursework_data

async def gl_delete_projects(group_id: int):
    status = {"deleted": [], "failed": []}
    if project["name"] != "skeleton-code":
        projects_to_delete = await gl_get_projects(group_id)
    print(projects_to_delete)
    for project in projects_to_delete:
        if project["name"] != "skeleton-code":
            status_code = await gl_delete_project(project["id"])
        if status_code == 202:
            status["deleted"].append(project["name"])
        else:
            status["failed"].append(project["name"])
    return status