"use client";

import { useEffect, useRef, useState } from "react";
import type { GridItem } from "@/components/modules/coursework_layout/coursework-types";
import { defaultCourseworkLayout } from "@/lib/coursework-layout";
import type { CourseworkModuleKey } from "@/components/modules/coursework_layout/coursework-module-registry";
import CourseworkLayoutEditor from "@/components/modules/coursework_layout/coursework-layout-editor";
import CourseworkRenderer from "@/components/modules/coursework_layout/coursework-renderer";
import type { StudentNameAndRepo } from "@/lib/actions/coursework/get_student_repos";


type CourseworkClientProps = {
  initialLayout: GridItem[];
  availableModules: CourseworkModuleKey[];
  saveLayout: (layout: GridItem[]) => Promise<void>;
  slug: string;
  token: string;
  repos: StudentNameAndRepo[];
};


export default function CourseworkClient({
  initialLayout,
  availableModules,
  saveLayout,
  slug,
  token,
  repos,
}: CourseworkClientProps) {
  const [layout, setLayout] = useState<GridItem[]>(
    initialLayout.length > 0 ? initialLayout : defaultCourseworkLayout,
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
    <div className="flex min-h-0 flex-1 flex-col">
      <CourseworkLayoutEditor
        availableModules={availableModules}
        layout={layout}
        onChange={setLayout}
      />

      <CourseworkRenderer layout={layout} slug={slug} token={token} repos={repos} />
    </div>
  );
}
