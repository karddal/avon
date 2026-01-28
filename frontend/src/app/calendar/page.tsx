import Loading from "@/app/coursework/loading";
import {Suspense} from "react";
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