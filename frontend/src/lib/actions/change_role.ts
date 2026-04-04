"use server";

import { headers } from "next/headers";
import { auth } from "../auth";
import { getRequestJWT } from "../auth-utils";

export type RoleChangeResponse = {
  success: boolean;
  error?: string;
};

export type AppRole = "user" | "admin" | "lecturer";

export async function change_role(
  userId: string,
  newRole: string,
): Promise<RoleChangeResponse> {
  await getRequestJWT();
  try {
    const role = newRole as AppRole;
    if (role === "admin") {
      throw new Error("Cannot change role to admin");
    }
    await auth.api.setRole({
      body: {
        userId: userId,
        role: role,
      },
      headers: await headers(),
    });

    return { success: true } as RoleChangeResponse;
  } catch (_error) {
    return {
      success: false,
      error: "Role change Failed",
    };
  }
}
