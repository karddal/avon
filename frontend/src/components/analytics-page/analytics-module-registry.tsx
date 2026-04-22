import AnalyticsActivityModule from "@/components/modules/commits-activity-module";
import AnalyticsDonutModule from "@/components/modules/analytics-donut-module";
import AnalyticsRadarModule from "@/components/modules/analytics-radar-module";
import TestRunsActivityModule from "@/components/modules/test-runs-activity-module";


export const analyticsModuleRegistry = {
  "commits-live-feed": {
    title: "Commits live feed",
    component: AnalyticsActivityModule,
    minW: 3,
    minH: 3,
    maxW: 10,
    maxH: 10,
  },
  "test-runs-live-feed": {
    title: "Test runs live feed",
    component: TestRunsActivityModule,
    minW: 3,
    minH: 3,
    maxW: 10,
    maxH: 10,
  },
  "cohort-signal-radar": {
    title: "Cohort signal radar",
    component: AnalyticsRadarModule,
    minW: 3,
    minH: 3,
    maxW: 10,
    maxH: 10,
  },
  "run-status-donut": {
    title: "Run status donut",
    component: AnalyticsDonutModule,
    minW: 3,
    minH: 3,
    maxW: 10,
    maxH: 10,
  },
} as const;

export type AnalyticsModuleKey = keyof typeof analyticsModuleRegistry;
