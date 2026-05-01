"use client";

import { authClient } from "@/lib/auth-client";

type ClientImpersonationResult =
  | {
      success: true;
      userId?: string;
      userName?: string;
    }
  | {
      success: false;
      error: string;
      details?: string;
    };

function readErrorMessage(error: unknown, fallback: string) {
  if (typeof error === "object" && error !== null) {
    const record = error as Record<string, unknown>;

    if (typeof record.message === "string" && record.message.length > 0) {
      return record.message;
    }

    if (typeof record.statusText === "string" && record.statusText.length > 0) {
      return record.statusText;
    }
  }

  return fallback;
}

function readErrorDetails(error: unknown) {
  if (typeof error !== "object" || error === null) {
    return undefined;
  }

  const record = error as Record<string, unknown>;
  return typeof record.code === "string"
    ? record.code
    : typeof record.status === "string"
      ? record.status
      : undefined;
}

function getImpersonatedBy(session: unknown) {
  if (typeof session !== "object" || session === null) {
    return null;
  }

  const value = (session as Record<string, unknown>).impersonatedBy;
  return typeof value === "string" && value.length > 0 ? value : null;
}

function logClientImpersonationFailure(
  action: "start" | "stop",
  context: Record<string, unknown>,
) {
  console.error("Impersonation client action failed", {
    action,
    ...context,
  });
}

export async function impersonateManagedUserInBrowser(
  userId: string,
): Promise<ClientImpersonationResult> {
  const result = await authClient.admin.impersonateUser({
    userId,
  });

  if (result.error) {
    logClientImpersonationFailure("start", {
      reason: "better_auth_client_error",
      targetUserId: userId,
      details: readErrorDetails(result.error),
      message: readErrorMessage(result.error, "Failed to start impersonation"),
    });

    return {
      success: false,
      error: readErrorMessage(result.error, "Failed to start impersonation"),
      details: readErrorDetails(result.error),
    };
  }

  const user = result.data?.user;
  const session = result.data?.session;
  const impersonatedBy = getImpersonatedBy(session);

  if (user?.id !== userId || !impersonatedBy) {
    logClientImpersonationFailure("start", {
      reason: "result_session_not_impersonated",
      targetUserId: userId,
      resultUserId: user?.id,
      resultImpersonatedBy: impersonatedBy,
    });

    return {
      success: false,
      error:
        "The impersonation session was not created correctly. Please try again.",
    };
  }

  return {
    success: true,
    userId: user.id,
    userName: user.name,
  };
}

export async function stopImpersonatingInBrowser(): Promise<ClientImpersonationResult> {
  const result = await authClient.admin.stopImpersonating();

  if (result.error) {
    logClientImpersonationFailure("stop", {
      reason: "better_auth_client_error",
      details: readErrorDetails(result.error),
      message: readErrorMessage(
        result.error,
        "Failed to return to admin account",
      ),
    });

    return {
      success: false,
      error: readErrorMessage(
        result.error,
        "Failed to return to admin account",
      ),
      details: readErrorDetails(result.error),
    };
  }

  return { success: true };
}
