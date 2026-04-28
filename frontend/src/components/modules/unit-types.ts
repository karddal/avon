import type { UnitModuleKey } from "@/components/modules/unit-module-registry";

export type GridItem = {
  id: string;
  moduleKey: UnitModuleKey;
  x: number;
  y: number;
  w: number;
  h: number;
};
