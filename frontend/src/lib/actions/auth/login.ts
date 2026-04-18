"use server";

import { headers } from "next/headers";
import { auth } from "@/lib/auth";

export interface SignInData {
  email: string;
  password: string;
}

export interface SignInResponse {
  redirect: string;
}

export async function signIn(formData: SignInData): Promise<SignInResponse> {
  const data = await auth.api.signInEmail({
    body: {
      email: formData.email,
      password: formData.password,
    },
    headers: await headers(),
  });

  if (!data) {
    throw new Error("No session");
  }

  console.log("DEBUG: ---------Login successful");
  console.log(formData.email);
  if (data.user.role === "user") {
    return { redirect: "/units" };
  } else {
    return { redirect: "/dashboard" };
  }
}

export async function logout() {
  await auth.api.signOut({
    headers: await headers(),
  });
}
