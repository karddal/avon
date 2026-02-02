"use client"

import {useCallback, useMemo, useState} from "react";
import {CalendarNavigationCard} from "@/components/calendar/calendar-navigation-card";
import {Tabs, TabsContent} from "@/components/ui/tabs";
import {CalendarTimeTableCard} from "@/components/calendar/calendar-timetable-card";
import {useUnits} from "@/hooks/calendar/use-units";
import {useCalendarEvents} from "@/hooks/calendar/use-calendar-events";
import {addDays, startOfWeek} from "date-fns";
import {EventsListingCard} from "@/components/calendar/events-listing-card";

export type CalendarEvent = {
    id: string;
    name: string;
    start: Date;
    end: Date;
    unit_id: string
    unit_name: string
    href?: string;
    colour?: string
};

export default function CalendarDashboard() {
    const [weekStartDate, setWeekStartDate] = useState<Date>(new Date())
    const [unitIds, setUnitIds] = useState<string[]>([])

    const onUnitIdsChange = useCallback((ids: string[]) =>{
        setUnitIds(ids)
    }, [])

    const weekStart = useMemo(
        () => startOfWeek(weekStartDate, { weekStartsOn: 1 }),
        [weekStartDate]
    )
    const from = useMemo(() => weekStart.toISOString(), [weekStart])
    const to = useMemo(() => addDays(weekStart, 7).toISOString(), [weekStart])

    const {eventsMap, isLoading, error} = useCalendarEvents(from, to, unitIds)
    const {unitOptions} = useUnits()

    return (
        <Tabs defaultValue="timetable">
            <CalendarNavigationCard
                weekStartDate={weekStartDate}
                onWeekStartDateChange={setWeekStartDate}
                onUnitIdsChange={onUnitIdsChange}
                unitOptions={unitOptions}
            />

            <TabsContent value="timetable">
                <CalendarTimeTableCard
                    weekStartDate={weekStartDate}
                    eventsMap={eventsMap}
                />
            </TabsContent>

            <TabsContent value="events">
                <EventsListingCard eventsMap={eventsMap} />
            </TabsContent>
        </Tabs>

    )
}