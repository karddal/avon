"use server";

import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { cache } from "react";
import { auth } from "@/lib/auth";

/**
 * This method can be used to get the current betterAuth session context.
 */
// export async function requireSession() {
//   const session = await auth.api.getSession({
//     headers: await headers(),
//   });

//   if (!session) {
//     redirect("/login");
//   }

//   return session;
// }

export const requireSession = cache(async () => {
  // Your existing logic here
  const session = await auth.api.getSession({
    headers: await headers(),
  });
  if (!session) redirect("/login");
  return session;
});

export async function requireLecturerSession() {
  const s = await requireSession();
  if (s.user.role === "admin" || s.user.role === "lecturer") {
    return s;
  } else {
    redirect("/units");
  }
}

export async function requireAdminSession() {
  const s = await requireSession();
  if (s.user.role === "admin") {
    return s;
  } else {
    redirect("/units");
  }
}

/**
 * This method returns the JWT token necessary to make API calls.
 */
export async function getRequestJWT() {
  const token = await auth.api.getToken({
    headers: await headers(),
  });

  return token.token;
}
