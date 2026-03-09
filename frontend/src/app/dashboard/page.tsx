import { Suspense } from "react";
import Loading from "@/app/coursework/loading";
import DashboardClient from "@/components/modules/dashboard-client";
import {
  type DashboardModuleKey,
  dashboardModuleRegistry,
} from "@/components/modules/dashboard-module-registry";
import type { GridItem } from "@/components/modules/dashboard-types";
import { requireLecturerSession } from "@/lib/auth-utils";

async function DashboardPageContent() {
  await requireLecturerSession();

  const savedLayout: GridItem[] = [
    {
      id: "commits_chart-1",
      moduleKey: "commits_chart",
      x: 0,
      y: 0,
      w: 1,
      h: 1,
    },
    {
      id: "tests_passed-2",
      moduleKey: "tests_passed",
      x: 1,
      y: 0,
      w: 1,
      h: 1,
    },
    {
      id: "late_submissions-3",
      moduleKey: "late_submissions",
      x: 2,
      y: 0,
      w: 1,
      h: 1,
    },
  ];

  const availableModules = Object.keys(
    dashboardModuleRegistry,
  ) as DashboardModuleKey[];

  return (
    <div className="flex min-h-0 mt-4 md:mt-0 mb-0 flex-1 flex-col space-y-4 md:space-y-6">
      <DashboardClient
        initialLayout={savedLayout}
        availableModules={availableModules}
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
