"use server";

import { randomBytes } from "node:crypto";
import { revalidatePath } from "next/cache";
import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import { requireAdminSession } from "@/lib/auth-utils";

export type CreateManagedUserRole = "user" | "lecturer";

export type CreateManagedUserInput = {
  firstName: string;
  lastName: string;
  email: string;
  role: CreateManagedUserRole;
  imageUrl?: string;
};

export type CreateManagedUserResponse = {
  success: boolean;
  error?: string;
  temporaryPassword?: string;
};

function generateTemporaryPassword() {
  return `Temp-${randomBytes(9).toString("base64url")}`;
}

export async function create_user({
  firstName,
  lastName,
  email,
  role,
  imageUrl,
}: CreateManagedUserInput): Promise<CreateManagedUserResponse> {
  await requireAdminSession();

  const trimmedFirstName = firstName.trim();
  const trimmedLastName = lastName.trim();
  const normalizedEmail = email.trim().toLowerCase();

  if (!trimmedFirstName || !trimmedLastName) {
    return {
      success: false,
      error: "First name and last name are required",
    };
  }

  if (!normalizedEmail) {
    return {
      success: false,
      error: "Email is required",
    };
  }

  if (!["user", "lecturer"].includes(role)) {
    return {
      success: false,
      error: "Invalid role",
    };
  }

  const temporaryPassword = generateTemporaryPassword();

  try {
    await auth.api.createUser({
      body: {
        email: normalizedEmail,
        password: temporaryPassword,
        name: `${trimmedFirstName} ${trimmedLastName}`,
        role,
        data: imageUrl
          ? {
              image: imageUrl,
            }
          : undefined,
      },
      headers: await headers(),
    });

    revalidatePath("/management");

    return {
      success: true,
      temporaryPassword,
    };
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to create user";

    return {
      success: false,
      error: message,
    };
  }
}
