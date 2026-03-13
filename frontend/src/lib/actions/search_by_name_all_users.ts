"use server";

import type { User } from "better-auth";
import { headers } from "next/headers";
import { auth } from "@/lib/auth";

export type SearchResponse = {
  users: User[];
  total: number;
  limit: number | undefined;
  offset: number | undefined;
};

// ONLY GETS STUDENTS
export async function search_by_name_all_users(
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
      filterField: "role",
      filterValue: "admin",
      filterOperator: "ne",
    },
    headers: await headers(),
  })) as unknown;

  return response as SearchResponse;
}
