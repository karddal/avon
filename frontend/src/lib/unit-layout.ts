import {
  type UnitModuleKey,
  unitModuleRegistry,
} from "@/components/modules/unit-module-registry";
import type { GridItem } from "@/components/modules/unit-types";

export const defaultUnitLayout: GridItem[] = [
  {
    id: "description",
    moduleKey: "description",
    x: 0,
    y: 0,
    w: 7,
    h: 1,
  },
  {
    id: "unit_members",
    moduleKey: "unit_members",
    x: 7,
    y: 0,
    w: 3,
    h: 1,
  },
  {
    id: "active_units",
    moduleKey: "courseworks",
    x: 0,
    y: 1,
    w: 7,
    h: 2,
  },
  {
    id: "announcements",
    moduleKey: "announcements",
    x: 7,
    y: 1,
    w: 3,
    h: 2,
  },
];

export const availableUnitModules = Object.keys(
  unitModuleRegistry,
) as UnitModuleKey[];

export function isValidGridItem(value: unknown): value is GridItem {
  if (!value || typeof value !== "object") return false;

  const item = value as Record<string, unknown>;

  return (
    typeof item.id === "string" &&
    typeof item.moduleKey === "string" &&
    item.moduleKey in unitModuleRegistry &&
    typeof item.x === "number" &&
    typeof item.y === "number" &&
    typeof item.w === "number" &&
    typeof item.h === "number"
  );
}

export function parseUnitLayout(
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
