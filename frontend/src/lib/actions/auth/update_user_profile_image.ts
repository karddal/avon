"use server";

import { revalidatePath } from "next/cache";
import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import { requireAdminSession } from "@/lib/auth-utils";

export type UpdateUserProfileImageResponse = {
  success: boolean;
  error?: string;
};

export async function update_user_profile_image(
  userId: string,
  imageUrl: string,
): Promise<UpdateUserProfileImageResponse> {
  await requireAdminSession();

  if (!userId) {
    return {
      success: false,
      error: "Missing user id",
    };
  }

  if (!imageUrl) {
    return {
      success: false,
      error: "Missing image URL",
    };
  }

  try {
    await auth.api.adminUpdateUser({
      body: {
        userId,
        data: {
          image: imageUrl,
        },
      },
      headers: await headers(),
    });

    revalidatePath("/management");

    return { success: true };
  } catch (error) {
    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : "Failed to update profile image",
    };
  }
}
