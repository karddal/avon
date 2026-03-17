"use server";

import { getRequestJWT } from "../auth-utils";

export type ScopesResponse = {
  scopes: string[];
};

export async function get_unit_scopes(unit_id: string): Promise<Set<string>> {
  const token = await getRequestJWT();
  const response = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL}/units/${unit_id}/scopes`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      cache: "no-cache",
    },
  );

  if (!response.ok) {
    throw new Error("Failed to fetch unit scopes.");
  }

  const scopes_data: ScopesResponse = await response.json();
  return new Set(scopes_data.scopes);
}
