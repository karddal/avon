"use server";

import { getRequestJWT } from "@/lib/auth-utils";

type DeleteInviteResponse = {
  success: boolean;
  data: unknown;
};

export async function delete_invite(
  project_id: string,
  user_email: string,
): Promise<DeleteInviteResponse> {
  const token = await getRequestJWT();

  const data = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL}/projects/${project_id}/invites`,
    {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      cache: "no-cache",
      body: JSON.stringify({
        user_email,
      }),
    },
  );

  const json = data.status === 204 ? null : await data.json();

  return {
    success: data.ok,
    data: json,
  };
}
