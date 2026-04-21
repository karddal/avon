"use server";

import { revalidatePath } from "next/cache";
import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import { requireAdminSession } from "@/lib/auth-utils";

export type UpdateManagedUserInput = {
  userId: string;
  name?: string;
  email?: string;
};

export type UpdateManagedUserResponse = {
  success: boolean;
  error?: string;
};

export async function update_managed_user({
  userId,
  name,
  email,
}: UpdateManagedUserInput): Promise<UpdateManagedUserResponse> {
  await requireAdminSession();

  const trimmedUserId = userId.trim();
  const trimmedName = name?.trim();
  const normalizedEmail = email?.trim().toLowerCase();

  if (!trimmedUserId) {
    return {
      success: false,
      error: "Missing user id",
    };
  }

  if (trimmedName !== undefined && trimmedName.length === 0) {
    return {
      success: false,
      error: "Name is required",
    };
  }

  if (normalizedEmail !== undefined && normalizedEmail.length === 0) {
    return {
      success: false,
      error: "Email is required",
    };
  }

  if (trimmedName === undefined && normalizedEmail === undefined) {
    return {
      success: false,
      error: "No changes supplied",
    };
  }

  try {
    await auth.api.adminUpdateUser({
      body: {
        userId: trimmedUserId,
        ...(trimmedName !== undefined ? { name: trimmedName } : {}),
        ...(normalizedEmail !== undefined ? { email: normalizedEmail } : {}),
      },
      headers: await headers(),
    });

    revalidatePath("/management");

    return { success: true };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to update user",
    };
  }
}
