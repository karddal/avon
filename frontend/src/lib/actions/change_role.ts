"use server";

import { getRequestJWT } from "../auth-utils";

export async function change_role(
  userId: string,
  newRole: string
): Promise<string> {
  const token = await getRequestJWT();
  try {
    const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/unit_enrollment/change_role/${userId}?newRole=${newRole}`,
        {
        method: "GET",
        headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
        }, 
        cache: "no-cache",
        },
    );

    const data = await response.json();
    return data.role ?? null;
  } catch (error) {
    console.error("Error changing role:", error);
    return "error";
  }
}