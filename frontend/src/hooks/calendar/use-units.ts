"use client";

import useSWR from "swr";

const fetcher = async (url: string) => {
  const json = await fetch(url).then((r) => r.json());
  if (Array.isArray(json)) return json;
  if (json && Array.isArray(json.data)) return json.data;
  return [];
};

export type UnitEvent = { id: string; name: string };

export function useUnits() {
  const { data, error, isLoading, mutate} = useSWR<UnitEvent[]>(
    "/api/calendar/units",
    fetcher,
    {
      dedupingInterval: 5 * 60 * 1000,
      revalidateOnFocus: false,
    },
  );

  const unitOptions = (data ?? []).map((unit) => ({
    value: unit.id,
    label: unit.name,
  }));

  return { unitOptions, isLoading, error, refresh: mutate};
}
