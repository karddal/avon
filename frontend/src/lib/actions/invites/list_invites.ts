"use server";

import { getRequestJWT } from "@/lib/auth-utils";

type ListInvitesResponse = {
  success: boolean;
  data: unknown;
};

export async function list_invites(
  project_id: string,
  email?: string,
): Promise<ListInvitesResponse> {
  const token = await getRequestJWT();
  const data = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL}/projects/${project_id}/invites/list`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      cache: "no-cache",
      body: JSON.stringify({
        email,
      }),
    },
  );

  const json = await data.json();

  return {
    success: data.ok,
    data: json,
  };
}
