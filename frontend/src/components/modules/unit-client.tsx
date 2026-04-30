"use client";

import { useEffect, useRef, useState } from "react";
import UnitLayoutEditor from "@/components/modules/unit-layout-editor";
import type { UnitModuleKey } from "@/components/modules/unit-module-registry";
import UnitRenderer from "@/components/modules/unit-renderer";
import type { GridItem } from "@/components/modules/unit-types";
import { defaultUnitLayout } from "@/lib/unit-layout";

type Lecturer = {
  id: string;
  name: string;
  image: string;
  role: boolean;
};

type UnitClientProps = {
  initialLayout?: GridItem[] | null;
  availableModules?: UnitModuleKey[];
  saveLayout: (layout: GridItem[], unitId: string) => Promise<void>;
  unit: UnitData;
  role: string;
  canEditLayouts: boolean;
  canCreateCoursework: boolean;
  canDeleteCoursework: boolean;
  lecturers: Lecturer[];
  courseworks: courseworkResponse;
};

type UnitData = {
  id: string;
  name: string;
  description?: string;
  colour: string;
  unit_code: string;
  programme_id: string;
};

type courseworkData = {
  id: string;
  name: string;
  description: string;
  colour: string;
  creation_date: string;
  due_date: string;
};

type courseworkResponse = {
  courseworks: courseworkData[];
};

export default function UnitClient({
  initialLayout,
  availableModules,
  saveLayout,
  unit,
  role,
  canEditLayouts,
  canCreateCoursework,
  canDeleteCoursework,
  lecturers,
  courseworks,
}: UnitClientProps) {
  const safeInitialLayout = Array.isArray(initialLayout) ? initialLayout : [];
  const safeAvailableModules = Array.isArray(availableModules)
    ? availableModules
    : [];

  const [layout, setLayout] = useState<GridItem[]>(
    safeInitialLayout.length > 0 ? safeInitialLayout : defaultUnitLayout,
  );
  const hasMounted = useRef(false);

  useEffect(() => {
    if (!canEditLayouts) {
      return;
    }

    if (!hasMounted.current) {
      hasMounted.current = true;
      return;
    }

    const timeoutId = window.setTimeout(() => {
      void saveLayout(layout, unit.id).catch((error) => {
        console.error("Failed to save dashboard layout", error);
      });
    }, 400);

    return () => {
      window.clearTimeout(timeoutId);
    };
  }, [layout, saveLayout, canEditLayouts, unit.id]);

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      {canEditLayouts ? (
        <UnitLayoutEditor
          availableModules={safeAvailableModules}
          layout={layout}
          onChange={setLayout}
        />
      ) : null}

      <UnitRenderer
        layout={layout}
        unit={unit}
        role={role}
        canCreateCoursework={canCreateCoursework}
        canDeleteCoursework={canDeleteCoursework}
        lecturers={lecturers}
        courseworks={courseworks}
      />
    </div>
  );
}
