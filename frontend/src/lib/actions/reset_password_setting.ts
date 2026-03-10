"use server";

import { headers } from "next/headers";
import { auth } from "@/lib/auth";

export type resetResponse = {
  success: boolean;
  error?: string;
};

export async function reset_password_setting(
  oldPasswordInput: string,
  newPasswordInput: string,
): Promise<resetResponse> {
  if (newPasswordInput.length < 8) {
    return {
      success: false,
      error: "New password must be at least 8 characters",
    };
  }
  if (newPasswordInput.length > 128) {
    return {
      success: false,
      error: "New password must be at most 128 characters",
    };
  }

  try {
    const _response = await auth.api.changePassword({
      body: {
        newPassword: newPasswordInput,
        currentPassword: oldPasswordInput,
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
