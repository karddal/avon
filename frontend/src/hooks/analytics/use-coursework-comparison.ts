"use client";

import useSWR from "swr";

export type CourseworkComparisonMetric = {
  key: string;
  data: number;
};

export type CourseworkComparisonSeries = {
  key: string;
  data: CourseworkComparisonMetric[];
};

export type CourseworkComparisonSummary = {
  from_date: string;
  series: CourseworkComparisonSeries[];
};

const fetcher = async (url: string) => {
  const res = await fetch(url);
  if (!res.ok) {
    throw new Error("Failed to fetch analytics coursework comparison");
  }

  return (await res.json()) as CourseworkComparisonSummary;
};

export function useCourseworkComparison(filters?: {
  courseworkAId?: string;
  courseworkBId?: string;
}) {
  const params = new URLSearchParams();

  if (filters?.courseworkAId) {
    params.set("coursework_a_id", filters.courseworkAId);
  }
  if (filters?.courseworkBId) {
    params.set("coursework_b_id", filters.courseworkBId);
  }

  const key =
    filters?.courseworkAId && filters?.courseworkBId
      ? `/api/analytics/coursework-comparison?${params.toString()}`
      : null;

  const { data, error, isLoading } = useSWR<CourseworkComparisonSummary>(
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
    comparison: data,
    error,
    isLoading,
  };
}
