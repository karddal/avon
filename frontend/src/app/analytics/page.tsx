import { Suspense } from "react";
import Loading from "@/app/coursework/loading";
import {
  getAnalyticsLayoutForCurrentUser,
  saveAnalyticsLayoutForCurrentUser,
} from "@/lib/actions/anlytics-layout";
import { requireLecturerSession } from "@/lib/auth-utils";
import { availableAnalyticsModules } from "@/lib/analytics-layout";
import AnalyticsClient from "@/components/analytics-page/analytics-client";

async function DashboardPageContent() {
  await requireLecturerSession();
  const savedLayout = await getAnalyticsLayoutForCurrentUser();

  return (
    <div className="flex min-h-0 mt-4 md:mt-0 mb-0 flex-1 flex-col space-y-4 md:space-y-6">
      <AnalyticsClient
        initialLayout={savedLayout}
        availableModules={availableAnalyticsModules}
        saveLayout={saveAnalyticsLayoutForCurrentUser}
      />
    </div>
  );
}

export default function DashboardPage() {
  return (
    <Suspense fallback={<Loading />}>
      <DashboardPageContent />
    </Suspense>
  );
}
