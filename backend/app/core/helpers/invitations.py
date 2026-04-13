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
            project_ids = {target.project_id for target in targets}
            project_state: dict[str, tuple[set[str], set[str]]] = {}

            for project_id in project_ids:
                invites_response = await client.get(
                    f"{BASE_URL}/projects/{project_id}/invitations",
                    headers={
                        "PRIVATE-TOKEN": TOKEN,
                        "Content-Type": "application/json",
                    },
                    timeout=10.0,
                )
                members_response = await client.get(
                    f"{BASE_URL}/projects/{project_id}/members/all",
                    headers={
                        "PRIVATE-TOKEN": TOKEN,
                        "Content-Type": "application/json",
                    },
                    params={"per_page": 100},
                    timeout=10.0,
                )

                try:
                    invites_data = invites_response.json()
                except ValueError:
                    invites_data = []

                try:
                    members_data = members_response.json()
                except ValueError:
                    members_data = []

                invited_emails = {
                    invite["invite_email"].lower()
                    for invite in invites_data
                    if isinstance(invite, dict) and invite.get("invite_email")
                }
                member_emails = {
                    member["email"].lower()
                    for member in members_data
                    if isinstance(member, dict) and member.get("email")
                }

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
