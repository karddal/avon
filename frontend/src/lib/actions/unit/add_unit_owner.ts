"use server";
import { getRequestJWT } from "@/lib/auth-utils";

type ownerPayload = {
  unit_id: string;
  user_id: string;
};

type ownerResponse = {
  response: string;
};

export async function add_unit_owner(
  ownerProps: ownerPayload,
): Promise<ownerResponse> {
  const token = await getRequestJWT();
  const response = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL}/units/${ownerProps.unit_id}/add_owner`,
    {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      cache: "no-cache",
      body: JSON.stringify(ownerProps),
    },
  );

  const data: ownerResponse = await response.json();

  return data;
}
