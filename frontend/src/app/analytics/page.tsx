import { AnalyticsPanel } from "@/components/analytics/analytics-panel";
import { AnalyticsToolbar } from "@/components/analytics/analytics-toolbar";

export default async function UnitPage() {
  return (
    <div className="space-y-6">
      <div className="sticky top-0 z-30 bg-background border-b">
        <AnalyticsToolbar />
      </div>

      <AnalyticsPanel />
    </div>
  );
}
