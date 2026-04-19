import {
  type CourseworkModuleKey,
  courseworkModuleRegistry,
} from "@/components/modules/coursework_layout/coursework-module-registry";
import type { GridItem } from "@/components/modules/coursework_layout/coursework-types";

// Staff/Admin layout - includes description, information, repo overview, setup progress
export const defaultStaffCourseworkLayout: GridItem[] = [
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

// Student layout - includes description, information, student repo overview, student repo activity, student panel
export const defaultStudentCourseworkLayout: GridItem[] = [
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
    id: "student_repo_overview",
    moduleKey: "student_repo_overview",
    x: 7,
    y: 1,
    w: 3,
    h: 2,
  },
  {
    id: "student_repo_activity",
    moduleKey: "student_repo_activity",
    x: 0,
    y: 1,
    w: 7,
    h: 2,
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

// For backwards compatibility
export const defaultCourseworkLayout = defaultStaffCourseworkLayout;

export const availableCourseworkModules = Object.keys(
  courseworkModuleRegistry,
) as CourseworkModuleKey[];

// Staff modules - what staff/admins can see
export const staffAvailableModules: CourseworkModuleKey[] = [
  "description",
  "information",
  "repo_overview",
  "setup_progress",
];

// Student modules - what students can see
export const studentAvailableModules: CourseworkModuleKey[] = [
  "description",
  "information",
  "student_repo_overview",
  "student_repo_activity",
  "student_panel",
];

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
