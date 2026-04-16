import type { DashboardModuleKey } from "@/components/modules/dashboard-module-registry";

export type GridItem = {
  id: string;
  moduleKey: DashboardModuleKey;
  x: number;
  y: number;
  w: number;
  h: number;
};
