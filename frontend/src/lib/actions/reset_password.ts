"use server";

import type { User } from "better-auth";
import { headers } from "next/headers";
import { auth } from "@/lib/auth";

export type SearchResponse = {
  success: boolean;
};

// ONLY GETS STUDENTS
export async function search_by_name(
  newPasswordInput: string,
  oldPasswordInput: string,
): Promise<SearchResponse> {
  const response = (await auth.api.changePassword({
    body: {
        newPassword: newPasswordInput,
        currentPassword: oldPasswordInput
    },
  })) as unknown;

  return { success: true } as SearchResponse;
}
