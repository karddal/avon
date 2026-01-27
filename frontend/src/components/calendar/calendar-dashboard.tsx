"use client"

import {useCallback, useState} from "react";
import {CalendarNavigationCard} from "@/components/calendar/calendar-navigation-card";
import {Tabs, TabsContent} from "@/components/ui/tabs";
import {WeeklyTimeTableCard} from "@/components/calendar/calendar-timetable-card";

export default function CalendarDashboard() {
    const [weekStartDate, setWeekStartDate] = useState<Date>(new Date())
    const [unitIds, setUnitIds] = useState<string[]>([])

    const onUnitIdsChange = useCallback((ids: string[]) =>{
        setUnitIds(ids)
    }, [])

    return (
        <Tabs defaultValue="timetable">
            <CalendarNavigationCard
                weekStartDate={weekStartDate}
                onWeekStartDateChange={setWeekStartDate}
                onUnitIdsChange={onUnitIdsChange}
            />
            
            <TabsContent value="timetable">
                <WeeklyTimeTableCard
                    weekStartDate={weekStartDate}
                    unitIds={unitIds}
                />
            </TabsContent>

            <TabsContent value="events">

            </TabsContent>
        </Tabs>

    )
}