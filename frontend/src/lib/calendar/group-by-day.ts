import { format } from "date-fns";
import type { CalendarEvent } from "@/components/calendar/calendar-timetable-card";

export function groupEventsByDay(events: CalendarEvent[]) {
  const map = new Map<string, CalendarEvent[]>();

  for (const event of events) {
    const key = format(event.start, "yyyy-MM-dd");
    const array = map.get(key) ?? [];
    array.push(event);
    map.set(key, array);
  }

  // sort for each day
  for (const [key, array] of map) {
    array.sort((a, b) => a.start.getTime() - b.start.getTime());
    map.set(key, array);
  }

  return map;
}
