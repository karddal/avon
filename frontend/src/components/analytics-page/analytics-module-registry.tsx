import AnalyticsActivityModule from "@/components/modules/commits-activity-module";
import TestRunsActivityModule from "@/components/modules/test-runs-activity-module";


export const analyticsModuleRegistry = {
  "commits-live-feed": {
    title: "Commits live feed",
    component: AnalyticsActivityModule,
    minW: 1,
    minH: 1,
    maxW: 3,
    maxH: 3,
  },
  "test-runs-live-feed": {
    title: "Test runs live feed",
    component: TestRunsActivityModule,
    minW: 1,
    minH: 1,
    maxW: 3,
    maxH: 3,
  },
} as const;

export type AnalyticsModuleKey = keyof typeof analyticsModuleRegistry;
