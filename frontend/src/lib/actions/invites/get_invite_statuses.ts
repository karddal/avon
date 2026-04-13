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
};

export async function get_invite_statuses(
  targets: InviteStatusTarget[],
): Promise<GetInviteStatusesResponse> {
  const token = await getRequestJWT();

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
        targets,
      }),
    },
  );

  const json = await response.json();

  return {
    success: response.ok,
    data: json.data ?? [],
  };
}
