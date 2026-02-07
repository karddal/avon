import type { CalendarEvent } from "@/components/calendar/calendar-timetable-card";

type CourseworkEvent = {
  id: string;
  name: string;
  due_date: string;
  unit_id: string;
  unit_name: string;
  colour: string;
};

export const toEvent = (event: CourseworkEvent): CalendarEvent => {
  const end = new Date(event.due_date);
  const start = new Date(end.getTime() - 60 * 60 * 1000);
  return {
    id: event.id,
    name: event.name,
    start,
    end,
    unit_id: event.unit_id,
    unit_name: event.unit_name,
    href: `/coursework/${event.id}`,
    colour: event.colour,
  };
};
