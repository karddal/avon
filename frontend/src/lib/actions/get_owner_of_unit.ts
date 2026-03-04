"use server";
import { getRequestJWT } from "@/lib/auth-utils";

type ownerResponse = {
  id: string;
};

export async function get_owner_of_unit(
  unit_id: string,
): Promise<ownerResponse> {
  const token = await getRequestJWT();
  const response = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL}/units/${unit_id}/owner`,
    {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      cache: "no-cache",
    },
  );

  const data: ownerResponse = await response.json();

  return data;
}
