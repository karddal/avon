"use client";

import { useEffect, useRef, useState } from "react";
import type { GridItem } from "@/components/modules/coursework_layout/coursework-types";
import { defaultCourseworkLayout } from "@/lib/coursework-layout";
import type { CourseworkModuleKey } from "@/components/modules/coursework_layout/coursework-module-registry";
import CourseworkLayoutEditor from "@/components/modules/coursework_layout/coursework-layout-editor";
import CourseworkRenderer from "@/components/modules/coursework_layout/coursework-renderer";
import type { StudentNameAndRepo } from "@/lib/actions/coursework/get_student_repos";
import type { CourseworkStudentRepo } from "@/lib/actions/coursework/get_my_coursework_repo";

type CourseworkSummary = {
  id: string;
  name: string;
  description: string;
  creation_date: string;
  due_date: string;
};

type SetupProgressItem = {
  title: string;
  completed: boolean;
};


type CourseworkClientProps = {
  initialLayout: GridItem[];
  availableModules: CourseworkModuleKey[];
  saveLayout: (layout: GridItem[], slug: string) => Promise<void>;
  coursework: CourseworkSummary;
  canViewSetupProgress: boolean;
  canViewStudentRepos: boolean;
  repos: StudentNameAndRepo[];
  setupProgress: SetupProgressItem[];
  studentRepo: CourseworkStudentRepo | null;
  canEditLayout: boolean;
};


export default function CourseworkClient({
  initialLayout,
  availableModules,
  saveLayout,
  coursework,
  canViewSetupProgress,
  canViewStudentRepos,
  repos,
  setupProgress,
  studentRepo,
  canEditLayout,
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
      void saveLayout(layout, coursework.id).catch((error) => {
        console.error("Failed to save dashboard layout", error);
      });
    }, 400);

    return () => {
      window.clearTimeout(timeoutId);
    };
  }, [layout, saveLayout]);

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      {canEditLayout && (
        <CourseworkLayoutEditor
          availableModules={availableModules}
          layout={layout}
          onChange={setLayout}
        />
      )}

      <CourseworkRenderer
        layout={layout}
        coursework={coursework}
        canViewSetupProgress={canViewSetupProgress}
        canViewStudentRepos={canViewStudentRepos}
        repos={repos}
        setupProgress={setupProgress}
        studentRepo={studentRepo}
      />
    </div>
  );
}
