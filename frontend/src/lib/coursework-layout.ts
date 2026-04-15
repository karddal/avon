import {
  type CourseworkModuleKey,
  courseworkModuleRegistry,
} from "@/components/modules/coursework_layout/coursework-module-registry";
import type { GridItem } from "@/components/modules/coursework_layout/coursework-types";

export const defaultCourseworkLayout: GridItem[] = [
  {
    id: "description",
    moduleKey: "description",
    x: 0,
    y: 0,
    w: 2,
    h: 1,
  },
  {
    id: "information",
    moduleKey: "information",
    x: 2,
    y: 0,
    w: 1,
    h: 1,
  },
  {
    id: "repo_overview",
    moduleKey: "repo_overview",
    x: 0,
    y: 1,
    w: 2,
    h: 2,
  },
  {
    id: "setup_progress",
    moduleKey: "setup_progress",
    x: 2,
    y: 1,
    w: 1,
    h: 2,
  },
];

export const availableCourseworkModules = Object.keys(
  courseworkModuleRegistry,
) as CourseworkModuleKey[];

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
