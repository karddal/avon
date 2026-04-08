"use client";

import { useEffect, useRef, useState } from "react";
import type { GridItem } from "@/components/modules/unit-types";
import { defaultUnitLayout } from "@/lib/unit-layout";
import type { UnitModuleKey } from "@/components/modules/unit-module-registry";
import UnitLayoutEditor from "@/components/modules/unit-layout-editor";
import UnitRenderer from "@/components/modules/unit-renderer";



type UnitClientProps = {
  initialLayout: GridItem[];
  availableModules: UnitModuleKey[];
  saveLayout: (layout: GridItem[]) => Promise<void>;
  slug: string;
  token: string;
  role: string;
};

export default function UnitClient({
  initialLayout,
  availableModules,
  saveLayout,
  slug,
  token,
  role,
}: UnitClientProps) {
  const [layout, setLayout] = useState<GridItem[]>(
    initialLayout.length > 0 ? initialLayout : defaultUnitLayout,
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

      <UnitRenderer layout={layout} slug={slug} token={token} role={role} />
    </div>
  );
}
