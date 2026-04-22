"use client";

import useSWR from "swr";

export type TestRunFeedItem = {
  id: string;
  coursework_id: string;
  coursework_name: string;
  gitlab_repo_id: string;
  gitlab_repo_url: string;
  student_ids: string[];
  status: "pending" | "running" | "succeeded" | "failed" | "error";
  trigger: "initial" | "retry" | "manual_rerun";
  started_by: string;
  created_at: string;
  completed_at: string | null;
  batch_id: string;
};

const fetcher = async (url: string) => {
  const res = await fetch(url);
  if (!res.ok) {
    throw new Error("Failed to fetch analytics test run feed");
  }

  return (await res.json()) as TestRunFeedItem[];
};

export function useTestRunFeed(limit = 30) {
  const key = `/api/analytics/test-runs?limit=${limit}`;
  const { data, error, isLoading, mutate } = useSWR<TestRunFeedItem[]>(
    key,
    fetcher,
    {
      refreshInterval: 5 * 1000,
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
    testRuns: data ?? [],
    error,
    isLoading,
    refresh,
  };
}
