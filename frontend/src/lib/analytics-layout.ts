import {
  type AnalyticsModuleKey,
  analyticsModuleRegistry,
} from "@/components/analytics-page/analytics-module-registry";
import type { GridItem } from "@/components/analytics-page/analytics-types";

export const defaultAnalyticsLayout: GridItem[] = [
  {
    id: "commits_chart",
    moduleKey: "commits_chart",
    x: 0,
    y: 0,
    w: 1,
    h: 1,
  },
  {
    id: "tests_passed",
    moduleKey: "tests_passed",
    x: 1,
    y: 0,
    w: 1,
    h: 1,
  },
  {
    id: "late_submissions",
    moduleKey: "late_submissions",
    x: 2,
    y: 0,
    w: 1,
    h: 1,
  },
  {
    id: "active_units",
    moduleKey: "active_units",
    x: 0,
    y: 1,
    w: 2,
    h: 2,
  },
  {
    id: "active_coursework",
    moduleKey: "active_coursework",
    x: 2,
    y: 1,
    w: 1,
    h: 2,
  },
];

export const availableAnalyticsModules = Object.keys(
  analyticsModuleRegistry,
) as AnalyticsModuleKey[];

export function isValidGridItem(value: unknown): value is GridItem {
  if (!value || typeof value !== "object") return false;

  const item = value as Record<string, unknown>;

  return (
    typeof item.id === "string" &&
    typeof item.moduleKey === "string" &&
    item.moduleKey in analyticsModuleRegistry &&
    typeof item.x === "number" &&
    typeof item.y === "number" &&
    typeof item.w === "number" &&
    typeof item.h === "number"
  );
}

export function parseAnalyticsLayout(
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
