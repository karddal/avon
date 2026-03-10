"use server";

import { getRequestJWT } from "../auth-utils";

export type RoleChangeResponse = {
  success: boolean;
  error?: string;
};

export async function change_role(
  userId: string,
  newRole: string,
): Promise<RoleChangeResponse> {
  const token = await getRequestJWT();
  try {
    const _response = await fetch(
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

    return { success: true } as RoleChangeResponse;
  } catch (err: any) {
    return {
      success: false,
      error: err?.message ?? "Role change Failed",
    };
  }
}
