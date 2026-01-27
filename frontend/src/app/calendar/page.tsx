import Loading from "@/app/coursework/loading";
import {Suspense} from "react";
import {WeeklyTimeTableCard} from "@/components/calendar/week-timetable-card";
import {CalendarNavigationCard} from "@/components/calendar/calendar-navigation-card";
import CalendarDashboard from "@/components/calendar/calendar-dashboard";

async function CalendarPageContent() {
    return (
        <div className="space-y-6">
            <CalendarDashboard />
        </div>
    )
}

export default function CalendarPage() {
    return (
        <Suspense fallback={<Loading />}>
            <CalendarPageContent/>
        </Suspense>
    )
}