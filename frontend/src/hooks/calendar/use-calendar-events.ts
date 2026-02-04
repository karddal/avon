"use client"
import useSWR from "swr"
import {toEvent} from "@/lib/calendar/to-event";
import {groupEventsByDay} from "@/lib/calendar/group-by-day";

const fetcher = (url: string) => fetch(url).then(r => r.json())

export function useCalendarEvents(from?: string, to?: string, unit_ids?: string[]) {
    const parameters = new URLSearchParams()

    if (from) parameters.set("from_", from)
    if (to) parameters.set("to", to)
    if (unit_ids?.length) {
        for (const id of unit_ids) {
            parameters.append("unit_id", id)
        }
    }

    const query = parameters.toString()
    const key = query ? `/api/calendar/events?${query}` : "/api/calendar/events"

    const {data, error, isLoading, mutate} = useSWR(key, fetcher, {
        keepPreviousData: true,
        revalidateOnFocus: false,
        dedupingInterval: 30 * 1000 // 30 seconds
    })

    const events = Array.isArray(data) ? data : []
    const eventsList = (events ?? []).map(toEvent)
    const eventsMap = groupEventsByDay(eventsList)

    return {
        events,
        eventsMap,
        isLoading,
        error,
        refresh: mutate
    }
}