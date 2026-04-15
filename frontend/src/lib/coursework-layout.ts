import {
  type CourseworkModuleKey,
  courseworkModuleRegistry,
} from "@/components/modules/coursework_layout/coursework-module-registry";
import type { GridItem } from "@/components/modules/coursework_layout/coursework-types";

export type CourseworkLayoutTarget = "student" | "staff";

export const defaultCourseworkLayoutStudent: GridItem[] = [
  {
    id: "description",
    moduleKey: "description",
    x: 0,
    y: 0,
    w: 7,
    h: 1,
  },
  {
    id: "information",
    moduleKey: "information",
    x: 7,
    y: 0,
    w: 3,
    h: 1,
  },
  {
    id: "deadline_banner",
    moduleKey: "deadline_banner",
    x: 0,
    y: 1,
    w: 10,
    h: 1,
  },
  {
    id: "student_repo_overview",
    moduleKey: "student_repo_overview",
    x: 0,
    y: 2,
    w: 7,
    h: 1,
  },
  {
    id: "student_repo_activity",
    moduleKey: "student_repo_activity",
    x: 7,
    y: 2,
    w: 3,
    h: 1,
  },
  {
    id: "student_panel",
    moduleKey: "student_panel",
    x: 0,
    y: 3,
    w: 10,
    h: 1,
  },
];

export const defaultCourseworkLayoutStaff: GridItem[] = [
  {
    id: "description",
    moduleKey: "description",
    x: 0,
    y: 0,
    w: 7,
    h: 1,
  },
  {
    id: "information",
    moduleKey: "information",
    x: 7,
    y: 0,
    w: 3,
    h: 1,
  },
  {
    id: "repo_overview",
    moduleKey: "repo_overview",
    x: 0,
    y: 1,
    w: 7,
    h: 2,
  },
  {
    id: "setup_progress",
    moduleKey: "setup_progress",
    x: 7,
    y: 1,
    w: 3,
    h: 2,
  },
];

export const availableCourseworkModulesStudent: CourseworkModuleKey[] = [
  "description",
  "information",
  "deadline_banner",
  "student_repo_overview",
  "student_repo_activity",
  "student_panel",
];

export const availableCourseworkModulesStaff: CourseworkModuleKey[] = [
  "description",
  "information",
  "repo_overview",
  "setup_progress",
];

export const defaultCourseworkLayout = defaultCourseworkLayoutStaff;

export const availableCourseworkModules = Object.keys(
  courseworkModuleRegistry,
) as CourseworkModuleKey[];

export function getDefaultCourseworkLayoutForTarget(
  target: CourseworkLayoutTarget,
): GridItem[] {
  return target === "staff"
    ? defaultCourseworkLayoutStaff
    : defaultCourseworkLayoutStudent;
}

export function isValidGridItem(value: unknown): value is GridItem {
  if (!value || typeof value !== "object") return false;

  const item = value as Record<string, unknown>;

  return (
    typeof item.id === "string" &&
    typeof item.moduleKey === "string" &&
    item.moduleKey in courseworkModuleRegistry &&
    typeof item.x === "number" &&
    typeof item.y === "number" &&
    typeof item.w === "number" &&
    typeof item.h === "number"
  );
}

export function parseCourseworkLayout(
  value: string | null | undefined,
): GridItem[] | null {
  if (!value) return null;

  try {
    const parsed = JSON.parse(value) as unknown;

    if (!Array.isArray(parsed)) return null;

    const validItems = parsed.filter(isValidGridItem);

    return validItems.length === parsed.length ? validItems : null;
  } catch {
    return null;
  }
}
