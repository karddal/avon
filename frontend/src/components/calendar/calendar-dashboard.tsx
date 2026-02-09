"use client";

import { addDays, format, startOfWeek } from "date-fns";
import { useCallback, useMemo, useState } from "react";
import { CalendarNavigationCard } from "@/components/calendar/calendar-navigation-card";
import { CalendarTimeTableCard } from "@/components/calendar/calendar-timetable-card";
import { EventsListingCard } from "@/components/calendar/events-listing-card";
import { Tabs, TabsContent } from "@/components/ui/tabs";
import { useCalendarEvents } from "@/hooks/calendar/use-calendar-events";
import { useUnits } from "@/hooks/calendar/use-units";
import { useUnitsRealtime } from "@/hooks/calendar/use-units-realtime";

export type CalendarEvent = {
  id: string;
  name: string;
  start: Date;
  end: Date;
  unit_id: string;
  unit_name: string;
  href?: string;
  colour?: string;
};

export default function CalendarDashboard() {
  const [tab, setTab] = useState<"timetable" | "events">("timetable");
  const [weekStartDate, setWeekStartDate] = useState<Date>(new Date());
  const [unitIds, setUnitIds] = useState<string[]>([]);

  const onUnitIdsChange = useCallback((ids: string[]) => {
    setUnitIds(ids);
  }, []);

  const defaultAcademicYearStart = useMemo(() => {
    const { fromY } = getAcademicYear();
    return fromY.getFullYear();
  }, []);

  const [academicYearStart, setAcademicYearStart] = useState<number>(
    defaultAcademicYearStart,
  );

  const weekStart = useMemo(
    () => startOfWeek(weekStartDate, { weekStartsOn: 1 }),
    [weekStartDate],
  );
  const fromWeek = useMemo(() => format(weekStart, "yyyy-MM-dd"), [weekStart]);
  const toWeek = useMemo(
    () => format(addDays(weekStart, 7), "yyyy-MM-dd"),
    [weekStart],
  );

  const { fromY, toY } = useMemo(() => {
    const year = new Date(academicYearStart, 7, 1);
    return getAcademicYear(year);
  }, [academicYearStart]);

  const fromYear = useMemo(() => format(fromY, "yyyy-MM-dd"), [fromY]);
  const toYear = useMemo(() => format(toY, "yyyy-MM-dd"), [toY]);

  const from = tab === "timetable" ? fromWeek : fromYear;
  const to = tab === "timetable" ? toWeek : toYear;

  const { eventsMap } = useCalendarEvents(from, to);
  useUnitsRealtime();
  const { unitOptions } = useUnits();

  const filteredEventsMap = useMemo(() => {
    if (unitIds.length === 0) return eventsMap;

    const allowed = new Set(unitIds);
    const out = new Map<string, CalendarEvent[]>();

    for (const [day, list] of eventsMap.entries()) {
      const filtered = list.filter((event) => allowed.has(event.unit_id));
      if (filtered.length) out.set(day, filtered);
    }
    return out;
  }, [unitIds, eventsMap]);

  return (
    <div data-cy="calendar-dashboard">
      <Tabs
        value={tab}
        onValueChange={(value) => setTab(value as "timetable" | "events")}
      >
        <CalendarNavigationCard
          weekStartDate={weekStartDate}
          onWeekStartDateChange={setWeekStartDate}
          onUnitIdsChange={onUnitIdsChange}
          unitOptions={unitOptions}
          tab={tab}
          academicYearStart={academicYearStart}
          onAcademicYearStartChange={setAcademicYearStart}
        />

        <TabsContent value="timetable">
          <CalendarTimeTableCard
            weekStartDate={weekStartDate}
            eventsMap={filteredEventsMap}
          />
        </TabsContent>

        <TabsContent value="events">
          <EventsListingCard eventsMap={filteredEventsMap} />
        </TabsContent>
      </Tabs>
    </div>
  );
}

function getAcademicYear(now = new Date()) {
  const year = now.getFullYear();
  const month = now.getMonth() + 1; // 1-12
  const startYear = month < 8 ? year - 1 : year;

  const fromY = new Date(startYear, 7, 1, 0, 0, 0, 0); // Aug 1
  const toY = new Date(startYear + 1, 7, 1, 0, 0, 0, 0); // next Aug 1 (exclusive)
  return { fromY, toY };
}
