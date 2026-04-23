"use client";

import useSWR from "swr";

export type ActivityFilterUnit = {
  id: string;
  name: string;
  unit_code: string;
};

export type ActivityFilterCoursework = {
  id: string;
  name: string;
  unit_id: string;
};

type FilterOptionsResponse = {
  units: ActivityFilterUnit[];
  courseworks: ActivityFilterCoursework[];
};

const fetcher = async (url: string) => {
  const res = await fetch(url);
  if (!res.ok) {
    throw new Error("Failed to fetch analytics filter options");
  }

  return (await res.json()) as FilterOptionsResponse;
};

export function useActivityFilterOptions() {
  const { data, error, isLoading } = useSWR<FilterOptionsResponse>(
    "/api/analytics/filter-options",
    fetcher,
    {
      revalidateOnFocus: false,
      dedupingInterval: 60 * 1000,
    },
  );

  return {
    units: data?.units ?? [],
    courseworks: data?.courseworks ?? [],
    error,
    isLoading,
  };
}
