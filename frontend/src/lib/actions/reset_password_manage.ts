"use server";

import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import { requireSession } from "../auth-utils";

export type resetResponse = {
  success: boolean;
  error?: string;
};

export async function reset_password_manage(
  userId: string,
  newPasswordInput: string,
): Promise<resetResponse> {
  // Make sure user is admin
  const s = await requireSession();
  const role = s.user.role;

  if (role !== "admin") {
    throw new Error("Unauthorized access, should be admin");
  }

  if (newPasswordInput.length < 8) {
    return { success: false, error: "Password must be at least 8 characters" };
  }
  if (newPasswordInput.length > 128) {
    return { success: false, error: "Password must be at most 128 characters" };
  }

  try {
    const _response = await auth.api.setUserPassword({
      body: {
        newPassword: newPasswordInput,
        userId: userId,
      },
      headers: await headers(),
    });

    return { success: true } as resetResponse;
  } catch (_error) {
    return {
      success: false,
      error: "Password Reset Failed",
    };
  }
}
