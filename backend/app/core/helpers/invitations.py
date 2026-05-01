from dotenv import load_dotenv
import os
from urllib.parse import quote

from fastapi import HTTPException
import httpx
from app.schemas.project import (
    ProjectInviteListResponse,
    ProjectInviteResult,
    ProjectInviteStatusBatchResponse,
    ProjectInviteStatusResult,
    ProjectInviteStatusTarget,
)

load_dotenv()
TOKEN = os.getenv("GITLAB_API_TOKEN")
BASE_URL = os.getenv("GITLAB_BASE_URL")
QUERY_LOOKUP_THRESHOLD = 2
GITLAB_PAGE_SIZE = 100


async def gl_inv_add_user(
    user_emails: list[str],
    project_id: str,
    access_level: int = 30,
    expires_at: str | None = None,
) -> ProjectInviteResult:
    """
    Invite one or more users to a GitLab project.

    Args:
        user_emails: Email addresses of the users to invite.
        project_id: GitLab project ID.
        access_level: GitLab access level to assign to the user.
            Defaults to 30, which is Developer.
        expires_at: Optional invite expiry date in YYYY-MM-DD format.

    Returns:
        A result dictionary containing:
            success: True if the invitation succeeded, otherwise False.
            error: Error message when the invitation fails.
    """
    if not TOKEN or not BASE_URL:
        raise HTTPException(status_code=500, detail="Missing GitLab configuration")

    async with httpx.AsyncClient() as client:
        try:
            payload = {
                "email": ",".join(user_emails),
                "access_level": access_level,
                "invite_source": "Avon",
            }
            if expires_at:
                payload["expires_at"] = expires_at

            response = await client.post(
                f"{BASE_URL}/projects/{project_id}/invitations",
                headers={
                    "PRIVATE-TOKEN": TOKEN,
                    "Content-Type": "application/json",
                },
                json=payload,
                timeout=10.0,
            )

            if response.status_code == 201:
                return ProjectInviteResult(success=True)

            try:
                data = response.json()
            except ValueError:
                data = {}

            return ProjectInviteResult(
                success=False,
                error=data.get("message") or "Failed to invite user.",
            )
        except httpx.RequestError as err:
            print(f"Network Error: {err}")
            raise HTTPException(
                status_code=500,
                detail="Internal Server Error when connecting to GitLab",
            )
        except httpx.HTTPStatusError as err:
            raise HTTPException(
                status_code=err.response.status_code,
                detail=f"GitLab request failed for project invites: {err.response.text}",
            )


async def gl_inv_batch_get_statuses(
    targets: list[ProjectInviteStatusTarget],
) -> ProjectInviteStatusBatchResponse:
    """
    Get invitation status for multiple project/email targets.

    Status rules:
        accepted: email is already a project member
        invited: email has a pending invitation
        not_invited: neither of the above
    """
    if not TOKEN or not BASE_URL:
        raise HTTPException(status_code=500, detail="Missing GitLab configuration")

    async with httpx.AsyncClient() as client:
        try:
            project_targets: dict[str, list[ProjectInviteStatusTarget]] = {}
            for target in targets:
                normalized_target = ProjectInviteStatusTarget(
                    project_id=target.project_id,
                    user_email=target.user_email.lower(),
                )
                project_targets.setdefault(target.project_id, []).append(
                    normalized_target
                )

            project_state: dict[str, tuple[set[str], set[str]]] = {}

            for project_id, project_items in project_targets.items():
                target_emails = {target.user_email for target in project_items}

                if len(target_emails) <= QUERY_LOOKUP_THRESHOLD:
                    invited_emails = await lookup_invited_emails_by_query(
                        client=client,
                        project_id=project_id,
                        emails=target_emails,
                    )
                    member_emails = await lookup_member_emails_by_query(
                        client=client,
                        project_id=project_id,
                        emails=target_emails,
                    )
                else:
                    invited_emails = await _fetch_all_project_invited_emails(
                        client=client,
                        project_id=project_id,
                    )
                    member_emails = await _fetch_all_project_member_emails(
                        client=client,
                        project_id=project_id,
                    )

                project_state[project_id] = (invited_emails, member_emails)

            results = []
            for target in targets:
                invited_emails, member_emails = project_state[target.project_id]
                normalized_email = target.user_email.lower()

                if normalized_email in member_emails:
                    status = "accepted"
                elif normalized_email in invited_emails:
                    status = "invited"
                else:
                    status = "not_invited"

                results.append(
                    ProjectInviteStatusResult(
                        project_id=target.project_id,
                        user_email=target.user_email,
                        status=status,
                    )
                )

            return ProjectInviteStatusBatchResponse(success=True, data=results)
        except httpx.RequestError as err:
            print(f"Network Error: {err}")
            raise HTTPException(
                status_code=500,
                detail="Internal Server Error when connecting to GitLab",
            )
        except httpx.HTTPStatusError as err:
            raise HTTPException(
                status_code=err.response.status_code,
                detail=f"GitLab request failed for project invite statuses: {err.response.text}",
            )


def _gitlab_headers() -> dict[str, str]:
    return {
        "PRIVATE-TOKEN": TOKEN,
        "Content-Type": "application/json",
    }


def extract_invited_emails(data: list[dict]) -> set[str]:
    return {
        invite["invite_email"].lower()
        for invite in data
        if isinstance(invite, dict) and invite.get("invite_email")
    }


def extract_member_emails(data: list[dict]) -> set[str]:
    return {
        member["email"].lower()
        for member in data
        if isinstance(member, dict) and member.get("email")
    }


async def gitlab_get_list(
    client: httpx.AsyncClient,
    url: str,
    params: dict | None = None,
) -> tuple[list[dict], httpx.Response]:
    response = await client.get(
        url,
        headers=_gitlab_headers(),
        params=params,
        timeout=10.0,
    )
    response.raise_for_status()
    try:
        data = response.json()
    except ValueError:
        data = []
    if not isinstance(data, list):
        data = []
    return data, response


async def fetch_paginated_list(
    client: httpx.AsyncClient,
    url: str,
    params: dict | None = None,
) -> list[dict]:
    page = 1
    results: list[dict] = []
    while True:
        request_params = {"page": page, "per_page": GITLAB_PAGE_SIZE}
        if params:
            request_params.update(params)

        data, response = await gitlab_get_list(
            client=client,
            url=url,
            params=request_params,
        )
        results.extend(item for item in data if isinstance(item, dict))

        next_page = response.headers.get("x-next-page")
        if not next_page:
            break
        page = int(next_page)

    return results


async def _fetch_all_project_invited_emails(
    client: httpx.AsyncClient,
    project_id: str,
) -> set[str]:
    data = await fetch_paginated_list(
        client=client,
        url=f"{BASE_URL}/projects/{project_id}/invitations",
    )
    return extract_invited_emails(data)


async def _fetch_all_project_member_emails(
    client: httpx.AsyncClient,
    project_id: str,
) -> set[str]:
    data = await fetch_paginated_list(
        client=client,
        url=f"{BASE_URL}/projects/{project_id}/members/all",
    )
    return extract_member_emails(data)


async def lookup_invited_emails_by_query(
    client: httpx.AsyncClient,
    project_id: str,
    emails: set[str],
) -> set[str]:
    invited_emails: set[str] = set()
    for email in emails:
        data, _ = await gitlab_get_list(
            client=client,
            url=f"{BASE_URL}/projects/{project_id}/invitations",
            params={"query": email},
        )
        extracted_emails = extract_invited_emails(data)
        if email in extracted_emails:
            invited_emails.add(email)
    return invited_emails


async def lookup_member_emails_by_query(
    client: httpx.AsyncClient,
    project_id: str,
    emails: set[str],
) -> set[str]:
    member_emails: set[str] = set()
    for email in emails:
        data, _ = await gitlab_get_list(
            client=client,
            url=f"{BASE_URL}/projects/{project_id}/members/all",
            params={"query": email, "per_page": GITLAB_PAGE_SIZE},
        )
        extracted_emails = extract_member_emails(data)
        if email in extracted_emails:
            member_emails.add(email)
    return member_emails
  
async def gl_inv_list(
    project_id: str,
    email: str | None = None,
) -> ProjectInviteListResponse:
    """
    List invitations for a GitLab project.

    Args:
        project_id: GitLab project ID.
        email: Optional email address to filter invitations by.
            If given, it is sent to the GitLab invitations API
            as the `query` parameter.

    Returns:
        A result dictionary containing:
            success: True if the request succeeded, otherwise False.
            data: Invitation data returned by GitLab when successful.
            error: Error message when the request fails.
    """
    if not TOKEN or not BASE_URL:
        raise HTTPException(status_code=500, detail="Missing GitLab configuration")

    async with httpx.AsyncClient() as client:
        try:
            response = await client.get(
                f"{BASE_URL}/projects/{project_id}/invitations",
                headers={
                    "PRIVATE-TOKEN": TOKEN,
                    "Content-Type": "application/json",
                },
                params={"query": email} if email else None,
                timeout=10.0,
            )
            try:
                data = response.json()
            except ValueError:
                data = {}

            if response.status_code == 200:
                return ProjectInviteListResponse(success=True, data=data)

            return ProjectInviteListResponse(
                success=False,
                data={},
                error=data.get("message")
                or f"Failed to get current invitations for project {project_id}.",
            )

        except httpx.RequestError as err:
            print(f"Network Error: {err}")
            raise HTTPException(
                status_code=500,
                detail="Internal Server Error when connecting to GitLab",
            )


async def gl_inv_delete(
    user_email: str,
    project_id: str,
) -> ProjectInviteResult:
    """
    Delete a pending invitation from a GitLab project.

    Args:
        user_email: Email address of the invited user to remove.
        project_id: GitLab project ID.

    Returns:
        A result dictionary containing:
            success: True if the invitation was deleted, otherwise False.
            error: Error message when the request fails.
    """
    if not TOKEN or not BASE_URL:
        raise HTTPException(status_code=500, detail="Missing GitLab configuration")

    async with httpx.AsyncClient() as client:
        try:
            response = await client.delete(
                f"{BASE_URL}/projects/{project_id}/invitations/{quote(user_email, safe='')}",
                headers={
                    "PRIVATE-TOKEN": TOKEN,
                    "Content-Type": "application/json",
                },
                timeout=10.0,
            )

            if response.status_code == 204:
                return ProjectInviteResult(success=True)

            try:
                data = response.json()
            except ValueError:
                data = {}

            return ProjectInviteResult(
                success=False,
                error=data.get("message") or "Failed to delete invitation.",
            )

        except httpx.RequestError as err:
            print(f"Network Error: {err}")
            raise HTTPException(
                status_code=500,
                detail="Internal Server Error when connecting to GitLab",
            )
