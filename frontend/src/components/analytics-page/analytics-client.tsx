"use client";

import { useEffect, useRef, useState } from "react";
import AnalyticsLayoutEditor from "@/components/analytics-page/analytics-layout-editor";
import type { AnalyticsModuleKey } from "@/components/analytics-page/analytics-module-registry";
import AnalyticsRenderer from "@/components/analytics-page/analytics-renderer";
import type { GridItem } from "@/components/analytics-page/analytics-types";
import { defaultAnalyticsLayout } from "@/lib/analytics-layout";

type AnalyticsClientProps = {
  initialLayout: GridItem[];
  availableModules: AnalyticsModuleKey[];
  saveLayout: (layout: GridItem[]) => Promise<void>;
};

export default function AnalyticsClient({
  initialLayout,
  availableModules,
  saveLayout,
}: AnalyticsClientProps) {
  const [layout, setLayout] = useState<GridItem[]>(
    initialLayout.length > 0 ? initialLayout : defaultAnalyticsLayout,
  );
  const hasMounted = useRef(false);

  useEffect(() => {
    if (!hasMounted.current) {
      hasMounted.current = true;
      return;
    }

    const timeoutId = window.setTimeout(() => {
      void saveLayout(layout).catch((error) => {
        console.error("Failed to save analytics layout", error);
      });
    }, 400);

    return () => {
      window.clearTimeout(timeoutId);
    };
  }, [layout, saveLayout]);

  return (
    <div className="flex min-h-0 flex-1 flex-col gap-4 md:gap-6">
      <AnalyticsLayoutEditor
        availableModules={availableModules}
        layout={layout}
        onChange={setLayout}
      />

      <AnalyticsRenderer layout={layout} />
    </div>
  );
}
