"use server";

import { getRequestJWT } from "../auth-utils";

export type ScopesResponse = {
  scopes: string[];
};

export async function get_coursework_scopes(
  coursework_id: string,
): Promise<Set<string>> {
  const token = await getRequestJWT();
  const response = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL}/coursework/${coursework_id}/scopes`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      cache: "no-cache",
    },
  );

  if (!response.ok) {
    throw new Error("Failed to fetch coursework scopes.");
  }

  const scopes_data: ScopesResponse = await response.json();
  return new Set(scopes_data.scopes);
}
