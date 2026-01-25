"use server";
import { getRequestJWT } from "@/lib/auth-utils";

export async function delete_unit(unit_id: string): Promise<number> {
  const token = await getRequestJWT();
  const response = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL}/units/${unit_id}/`,
    {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      cache: "no-cache",
    },
  );
  return response.status;
}
