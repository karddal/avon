"use server";
import { getRequestJWT } from "@/lib/auth-utils";

type ownerResponse = {
  message: string;
  previous_owner: string;
  new_owner: string;
};

export async function transfer_ownership(
  unit_id: string,
  user_id: string,
): Promise<ownerResponse> {
  const token = await getRequestJWT();
  const response = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL}/unit_enrollment/${unit_id}/transfer_owner`,
    {
      method: "PUT",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      cache: "no-cache",
      body: JSON.stringify({ user_id: user_id }),
    },
  );

  const data: ownerResponse = await response.json();

  return data;
}
