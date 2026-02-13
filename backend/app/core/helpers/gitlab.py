import re

from fastapi import HTTPException
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
        "success" : True
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
                    "per_page":"100"
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