"use server";

import { getRequestJWT } from "@/lib/auth-utils";

export type CourseworkRepoCommit = {
  id: string;
  short_id: string;
  title: string;
  author_name: string | null;
  authored_date: string | null;
  web_url: string | null;
  additions: number;
  deletions: number;
};

export type CourseworkStudentRepo = {
  repo_url: string;
  commits: CourseworkRepoCommit[];
};

export async function get_my_coursework_repo(
  courseworkId: string,
): Promise<CourseworkStudentRepo | null> {
  const token = await getRequestJWT();
  const response = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL}/coursework/${courseworkId}/my_repo`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      cache: "no-cache",
    },
  );

  if (response.status === 404) {
    return null;
  }

  if (!response.ok) {
    throw new Error("Failed to fetch student coursework repo");
  }

  return response.json();
}
