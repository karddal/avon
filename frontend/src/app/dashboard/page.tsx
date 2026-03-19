import { Suspense } from "react";
import Loading from "@/app/coursework/loading";
import DashboardClient from "@/components/modules/dashboard-client";
import {
  getDashboardLayoutForCurrentUser,
  saveDashboardLayoutForCurrentUser,
} from "@/lib/actions/dashboard-layout";
import { requireLecturerSession } from "@/lib/auth-utils";
import { availableDashboardModules } from "@/lib/dashboard-layout";

async function DashboardPageContent() {
  await requireLecturerSession();
  const savedLayout = await getDashboardLayoutForCurrentUser();

  return (
    <div className="flex min-h-0 mt-4 md:mt-0 mb-0 flex-1 flex-col space-y-4 md:space-y-6">
      <DashboardClient
        initialLayout={savedLayout}
        availableModules={availableDashboardModules}
        saveLayout={saveDashboardLayoutForCurrentUser}
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
