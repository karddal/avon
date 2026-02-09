"use client";
import useSWR from "swr";
import { groupEventsByDay } from "@/lib/calendar/group-by-day";
import { toEvent } from "@/lib/calendar/to-event";

const fetcher = async (url: string) => {
  const json = await fetch(url).then((r) => r.json());
  if (Array.isArray(json)) return json;
  if (json && Array.isArray(json.data)) return json.data;
  return [];
};

export function useCalendarEvents(
  from?: string,
  to?: string,
  unit_ids?: string[],
) {
  const query = buildEventQuery(from, to, unit_ids);

  const key = query ? `/api/calendar/events?${query}` : null;

  const { data, error, isLoading, mutate } = useSWR(key, fetcher, {
    keepPreviousData: true,
    revalidateOnFocus: false,
    dedupingInterval: 30 * 1000, // 30 seconds
  });

  const events = (data ?? []).map(toEvent);
  const eventsMap = groupEventsByDay(events);

  return {
    events,
    eventsMap,
    isLoading,
    error,
    refresh: mutate,
  };
}

export function buildEventQuery(
  from?: string,
  to?: string,
  unit_ids?: string[],
) {
  const parameters = new URLSearchParams();

  if (from) parameters.set("from_", from);
  if (to) parameters.set("to", to);
  if (unit_ids?.length) {
    for (const id of unit_ids) {
      parameters.append("unit_id", id);
    }
  }

  return parameters.toString();
}
