"use server";

import { getRequestJWT } from "../auth-utils";

export async function get_user_role(userId: string): Promise<string> {
  const token = await getRequestJWT();
  try {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/unit_enrollment/role/${userId}`,
      {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        cache: "no-cache",
      },
    );
    console.log("Response status:", response);

    const data = await response.json();
    console.log("Response data:", data.role);
    return data.role ?? null;
  } catch (error) {
    console.error("Error fetching user role:", error);
    return "error";
  }
}
