import {
  type AnalyticsModuleKey,
  analyticsModuleRegistry,
} from "@/components/analytics-page/analytics-module-registry";
import type { GridItem } from "@/components/analytics-page/analytics-types";

export const defaultAnalyticsLayout: GridItem[] = [
  {
    id: "commits-live-feed",
    moduleKey: "commits-live-feed",
    x: 0,
    y: 0,
    w: 1,
    h: 1,
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
