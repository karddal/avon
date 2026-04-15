import type { CourseworkModuleKey } from "@/components/modules/coursework_layout/coursework-module-registry";

export type GridItem = {
  id: string;
  moduleKey: CourseworkModuleKey;
  x: number;
  y: number;
  w: number;
  h: number;
};
