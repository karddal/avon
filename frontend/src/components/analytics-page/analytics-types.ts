import type { AnalyticsModuleKey } from "@/components/analytics-page/analytics-module-registry";

export type GridItem = {
  id: string;
  moduleKey: AnalyticsModuleKey;
  x: number;
  y: number;
  w: number;
  h: number;
};
