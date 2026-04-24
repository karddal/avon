import AnalyticsDonutModule from "@/components/modules/analytics-donut-module";
import AnalyticsHeatmapExampleModule from "@/components/modules/analytics-heatmap-example-module";
import AnalyticsLineGraphModule from "@/components/modules/analytics-line-graph-module";
import AnalyticsRadarModule from "@/components/modules/analytics-radar-module";
import AnalyticsActivityModule from "@/components/modules/commits-activity-module";
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
  "activity-trend-line": {
    title: "Activity trend line",
    component: AnalyticsLineGraphModule,
    minW: 3,
    minH: 3,
    maxW: 10,
    maxH: 10,
  },
  "activity-heatmap": {
    title: "Activity heatmap",
    component: AnalyticsHeatmapExampleModule,
    minW: 3,
    minH: 3,
    maxW: 10,
    maxH: 10,
  },
} as const;

export type AnalyticsModuleKey = keyof typeof analyticsModuleRegistry;
