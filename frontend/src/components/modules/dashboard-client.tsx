"use client";

import { useEffect, useState } from "react";
import DashboardLayoutEditor from "@/components/modules/dashboard-layout-editor";
import {
  type DashboardModuleKey,
  dashboardModuleRegistry,
} from "@/components/modules/dashboard-module-registry";
import DashboardRenderer from "@/components/modules/dashboard-renderer";
import type { GridItem } from "@/components/modules/dashboard-types";

type DashboardClientProps = {
  initialLayout: GridItem[];
  availableModules: DashboardModuleKey[];
};

const STORAGE_KEY = "dashboard-layout";

function isValidGridItem(value: unknown): value is GridItem {
  if (!value || typeof value !== "object") return false;

  const item = value as Record<string, unknown>;

  return (
    typeof item.id === "string" &&
    typeof item.moduleKey === "string" &&
    item.moduleKey in dashboardModuleRegistry &&
    typeof item.x === "number" &&
    typeof item.y === "number" &&
    typeof item.w === "number" &&
    typeof item.h === "number"
  );
}

export default function DashboardClient({
  initialLayout,
  availableModules,
}: DashboardClientProps) {
  const [layout, setLayout] = useState<GridItem[]>(initialLayout);
  const [hasLoadedStorage, setHasLoadedStorage] = useState(false);

  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (!saved) return;

      const parsed = JSON.parse(saved) as unknown;

      if (!Array.isArray(parsed)) {
        localStorage.removeItem(STORAGE_KEY);
        return;
      }

      const validItems = parsed.filter(isValidGridItem);

      if (validItems.length === parsed.length) {
        setLayout(validItems);
      } else {
        localStorage.removeItem(STORAGE_KEY);
      }
    } catch (error) {
      console.error("Failed to load dashboard layout from localStorage", error);
    } finally {
      setHasLoadedStorage(true);
    }
  }, []);

  useEffect(() => {
    if (!hasLoadedStorage) return;

    localStorage.setItem(STORAGE_KEY, JSON.stringify(layout));
  }, [hasLoadedStorage, layout]);

  return (
    <div className="flex min-h-0 flex-1 flex-col gap-4 md:gap-6">
      <DashboardLayoutEditor
        availableModules={availableModules}
        layout={layout}
        onChange={setLayout}
      />

      <DashboardRenderer layout={layout} />
    </div>
  );
}
