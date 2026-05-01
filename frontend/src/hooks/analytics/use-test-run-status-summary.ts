"use client";

import useSWR from "swr";

export type TestRunStatusSummary = {
  from_date: string;
  total_runs: number;
  passed: number;
  running: number;
  failed: number;
  errored: number;
};

const fetcher = async (url: string) => {
  const res = await fetch(url);
  if (!res.ok) {
    throw new Error("Failed to fetch analytics test run status summary");
  }

  return (await res.json()) as TestRunStatusSummary;
};

export function useTestRunStatusSummary(filters?: {
  unitId?: string;
  courseworkId?: string;
  fromDate?: string;
}) {
  const params = new URLSearchParams();

  if (filters?.unitId) {
    params.set("unit_id", filters.unitId);
  }

  if (filters?.courseworkId) {
    params.set("coursework_id", filters.courseworkId);
  }

  if (filters?.fromDate) {
    params.set("from_date", filters.fromDate);
  }

  const key = `/api/analytics/test-run-status?${params.toString()}`;

  const { data, error, isLoading } = useSWR<TestRunStatusSummary>(
    key,
    fetcher,
    {
      refreshInterval: 30 * 1000,
      dedupingInterval: 5 * 1000,
      keepPreviousData: true,
      revalidateOnFocus: false,
    },
  );

  return {
    summary: data,
    error,
    isLoading,
  };
}
