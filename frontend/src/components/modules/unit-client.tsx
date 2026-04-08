"use client";

import { useEffect, useRef, useState } from "react";
import DashboardLayoutEditor from "@/components/modules/dashboard-layout-editor";
import DashboardRenderer from "@/components/modules/dashboard-renderer";
import type { GridItem } from "@/components/modules/dashboard-types";
import { defaultDashboardLayout } from "@/lib/dashboard-layout";
import type { UnitModuleKey } from "@/components/modules/unit-module-registry";

type UnitClientProps = {
  initialLayout: GridItem[];
  availableModules: UnitModuleKey[];
  saveLayout: (layout: GridItem[]) => Promise<void>;
};

export default function UnitClient({
  initialLayout,
  availableModules,
  saveLayout,
}: UnitClientProps) {
  const [layout, setLayout] = useState<GridItem[]>(
    initialLayout.length > 0 ? initialLayout : defaultDashboardLayout,
  );
  const hasMounted = useRef(false);

  useEffect(() => {
    if (!hasMounted.current) {
      hasMounted.current = true;
      return;
    }

    const timeoutId = window.setTimeout(() => {
      void saveLayout(layout).catch((error) => {
        console.error("Failed to save dashboard layout", error);
      });
    }, 400);

    return () => {
      window.clearTimeout(timeoutId);
    };
  }, [layout, saveLayout]);

  return (
    <div className="flex min-h-0 flex-1 flex-col gap-4 md:gap-6">
      <UnitLayoutEditor
        availableModules={availableModules}
        layout={layout}
        onChange={setLayout}
      />

      <UnitRenderer layout={layout} />
    </div>
  );
}
