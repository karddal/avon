"use server";

import { headers } from "next/headers";
import { auth } from "@/lib/auth";

type ImpersonationActionResult =
  | {
      success: false;
      error: string;
    }
  | {
      success: true;
      userId?: string;
      userName?: string;
    };

function getErrorMessage(error: unknown, fallback: string) {
  return error instanceof Error ? error.message : fallback;
}

function getStatusCode(error: unknown) {
  if (typeof error !== "object" || error === null) {
    return null;
  }

  const record = error as Record<string, unknown>;
  return typeof record.statusCode === "number"
    ? record.statusCode
    : typeof record.status === "number"
      ? record.status
      : null;
}

export async function impersonate_managed_user(
  userId: string,
): Promise<ImpersonationActionResult> {
  try {
    const result = await auth.api.impersonateUser({
      body: {
        userId,
      },
      headers: await headers(),
    });

    return {
      success: true,
      userId: result.user.id,
      userName: result.user.name,
    };
  } catch (error) {
    return {
      success: false,
      error: getErrorMessage(error, "Failed to start impersonation"),
    };
  }
}

export async function stop_impersonating(): Promise<ImpersonationActionResult> {
  try {
    await auth.api.stopImpersonating({
      headers: await headers(),
    });

    return { success: true };
  } catch (error) {
    const statusCode = getStatusCode(error);
    const message = getErrorMessage(error, "");

    if (
      statusCode === 400 ||
      statusCode === 401 ||
      message.toLowerCase().includes("not impersonating")
    ) {
      return { success: true };
    }

    return {
      success: false,
      error: getErrorMessage(error, "Failed to return to admin account"),
    };
  }
}
