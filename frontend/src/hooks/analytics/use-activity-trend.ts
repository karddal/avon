"use client";

import useSWR from "swr";

export type ActivityTrendPoint = {
  slot: string;
  commits: number;
  runs: number;
};

export type ActivityTrendSummary = {
  from_date: string;
  to_date: string;
  bucket_hours: number;
  points: ActivityTrendPoint[];
};

const fetcher = async (url: string) => {
  const res = await fetch(url);
  if (!res.ok) {
    throw new Error("Failed to fetch analytics activity trend");
  }

  return (await res.json()) as ActivityTrendSummary;
};

export function useActivityTrend(filters: {
  fromDate: string;
  toDate: string;
}) {
  const params = new URLSearchParams({
    from_date: filters.fromDate,
    to_date: filters.toDate,
  });

  const key = `/api/analytics/activity-trend?${params.toString()}`;
  const { data, error, isLoading } = useSWR<ActivityTrendSummary>(
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
    trend: data,
    error,
    isLoading,
  };
}
