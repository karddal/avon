"use client";

import { useEffect, useRef, useState } from "react";
import type { GridItem } from "@/components/modules/unit-types";
import { defaultUnitLayout } from "@/lib/unit-layout";
import type { UnitModuleKey } from "@/components/modules/unit-module-registry";
import UnitLayoutEditor from "@/components/modules/unit-layout-editor";
import UnitRenderer from "@/components/modules/unit-renderer";

type Lecturer = {
  id: string;
  name: string;
  image: string;
};

type UnitClientProps = {
  initialLayout: GridItem[];
  availableModules: UnitModuleKey[];
  saveLayout: (layout: GridItem[], unitId: string) => Promise<void>;
  unit: UnitData;
  role: string;
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
  lecturers,
  courseworks,
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
      void saveLayout(layout, unit.id).catch((error) => {
        console.error("Failed to save dashboard layout", error);
      });
    }, 400);

    return () => {
      window.clearTimeout(timeoutId);
    };
  }, [layout, saveLayout]);

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <UnitLayoutEditor
        availableModules={availableModules}
        layout={layout}
        onChange={setLayout}
      />

      <UnitRenderer layout={layout} unit={unit} role={role} lecturers={lecturers} courseworks={courseworks} />
    </div>
  );
}
