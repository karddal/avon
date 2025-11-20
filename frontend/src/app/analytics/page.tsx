import {AnalyticsToolbar} from "@/components/analytics/analytics-toolbar";
import {AnalyticsPanel, Student} from "@/components/analytics/analytics-panel";

export default async function UnitPage() {
    return (
        <div className="space-y-6">
            <div className="sticky top-0 z-30 bg-background border-b">
                <AnalyticsToolbar />
            </div>

            <AnalyticsPanel/>
        </div>
    );
}
