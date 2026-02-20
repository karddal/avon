"use client";

import useSWR from "swr";

const fetcher = async (url: string) => {
  const json = await fetch(url).then((r) => r.json());
  if (Array.isArray(json)) return json;
  if (json && Array.isArray(json.data)) return json.data;
  return [];
};

export type UnitEvent = {
  id: string;
  name: string;
  unit_code: string;
  programme_start_date: string;
  programme_end_date: string;
};

export function useUnits() {
  const { data, error, isLoading, mutate } = useSWR<UnitEvent[]>(
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
    label2: `${unit.unit_code} •${unit.programme_start_date}-${unit.programme_end_date}`,
  }));

  return { unitOptions, isLoading, error, refresh: mutate };
}
