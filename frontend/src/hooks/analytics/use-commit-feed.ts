"use client";

import useSWR from "swr";

export type CommitFeedItem = {
  repo_id: string;
  repo_url: string;
  repo_name: string;
  coursework_id: string;
  coursework_name: string;
  student_ids: string[];
  commit: {
    id: string;
    short_id: string;
    title: string;
    author_name: string | null;
    authored_date: string | null;
    web_url: string | null;
    additions: number;
    deletions: number;
  };
};

const fetcher = async (url: string) => {
  const res = await fetch(url);
  if (!res.ok) {
    throw new Error("Failed to fetch analytics commit feed");
  }

  return (await res.json()) as CommitFeedItem[];
};

export function useCommitFeed(
  perRepo = 5,
  limit = 40,
  filters?: { unitId?: string; courseworkId?: string },
) {
  const params = new URLSearchParams({
    per_repo: String(perRepo),
    limit: String(limit),
  });

  if (filters?.unitId) {
    params.set("unit_id", filters.unitId);
  }

  if (filters?.courseworkId) {
    params.set("coursework_id", filters.courseworkId);
  }

  const key = `/api/analytics/commit-feed?${params.toString()}`;
  const { data, error, isLoading, mutate } = useSWR<CommitFeedItem[]>(
    key,
    fetcher,
    {
      refreshInterval: 3 * 1000,
      dedupingInterval: 1 * 1000,
      keepPreviousData: true,
      revalidateOnFocus: false,
    },
  );

  const refresh = async () => {
    return await mutate(fetcher(`${key}&fresh=1`), {
      populateCache: true,
      revalidate: false,
    });
  };

  return {
    commits: data ?? [],
    error,
    isLoading,
    refresh,
  };
}
