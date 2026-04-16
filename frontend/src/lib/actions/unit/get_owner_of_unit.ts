"use server";
import { getRequestJWT } from "@/lib/auth-utils";

export async function get_owner_of_unit(unit_id: string): Promise<string> {
  const token = await getRequestJWT();
  const response = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL}/unit_enrollment/${unit_id}/owner`,
    {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      cache: "no-cache",
    },
  );

  const data: string = await response.json();

  return data;
}
