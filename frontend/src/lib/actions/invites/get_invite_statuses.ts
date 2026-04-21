"use server";

import { getRequestJWT } from "@/lib/auth-utils";

type InviteStatusTarget = {
  project_id: string;
  user_email: string;
};

export type InviteStatusResult = {
  project_id: string;
  user_email: string;
  status: "accepted" | "invited" | "not_invited";
};

type GetInviteStatusesResponse = {
  success: boolean;
  data: InviteStatusResult[];
  error?: string;
};

export async function get_invite_statuses(
  targets: InviteStatusTarget[],
): Promise<GetInviteStatusesResponse> {
  const token = await getRequestJWT();
  const normalizedTargets = targets.map((target) => ({
    project_id: target.project_id,
    user_email: target.user_email.toLowerCase(),
  }));

  const response = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL}/projects/invites/statuses`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      cache: "no-cache",
      body: JSON.stringify({
        targets: normalizedTargets,
      }),
    },
  );

  const json = await response.json();
  const data = Array.isArray(json.data) ? json.data : [];
  const error =
    typeof json.detail === "string"
      ? json.detail
      : typeof json.error === "string"
        ? json.error
        : undefined;

  return {
    success: response.ok,
    data,
    error,
  };
}
