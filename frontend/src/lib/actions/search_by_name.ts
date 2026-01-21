"use server";

import { auth } from "@/lib/auth";
import { User } from "better-auth";
import { headers } from "next/headers";

export type SearchResponse = {
  users: User[];
  total: number;
  limit: number | undefined;
  offset: number | undefined;
};

export async function search_by_name(
  search: string,
  offset: number,
  limit: number,
): Promise<SearchResponse> {
  const response = (await auth.api.listUsers({
    query: {
      searchField: "name",
      searchValue: search,
      limit: limit,
      offset: offset,
      sortBy: "name",
      searchOperator: "contains",
    },
    headers: await headers(),
  })) as unknown;

  return response as SearchResponse;
}
