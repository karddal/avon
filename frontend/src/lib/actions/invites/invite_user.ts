"use server";

import { getRequestJWT } from "@/lib/auth-utils";

type InviteUserResponse = {
  success: boolean;
  data: unknown;
};

export async function invite_user(
  project_id: string,
  user_email: string,
  access_level = 30,
  expires_at?: string,
): Promise<InviteUserResponse> {
  return batch_invite_users(project_id, [user_email], access_level, expires_at);
}

export async function batch_invite_users(
  project_id: string,
  user_emails: string[],
  access_level = 30,
  expires_at?: string,
): Promise<InviteUserResponse> {
  const token = await getRequestJWT();

  const data = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL}/projects/${project_id}/invites`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      cache: "no-cache",
      body: JSON.stringify({
        user_emails,
        access_level,
        expires_at,
      }),
    },
  );

  const json = await data.json();

  return {
    success: data.ok,
    data: json,
  };
}
