"use client";

import { useEffect, useRef, useState } from "react";
import type { GridItem } from "@/components/modules/coursework_layout/coursework-types";
import {
  type CourseworkLayoutTarget,
  defaultCourseworkLayoutStaff,
  defaultCourseworkLayoutStudent,
} from "@/lib/coursework-layout";
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
  initialStudentLayout: GridItem[];
  initialStaffLayout: GridItem[];
  availableStudentModules: CourseworkModuleKey[];
  availableStaffModules: CourseworkModuleKey[];
  saveLayout: (
    layout: GridItem[],
    slug: string,
    target: CourseworkLayoutTarget,
  ) => Promise<void>;
  coursework: CourseworkSummary;
  canViewSetupProgress: boolean;
  canViewStudentRepos: boolean;
  repos: StudentNameAndRepo[];
  setupProgress: SetupProgressItem[];
  studentRepo: CourseworkStudentRepo | null;
  canEditLayout: boolean;
};


export default function CourseworkClient({
  initialStudentLayout,
  initialStaffLayout,
  availableStudentModules,
  availableStaffModules,
  saveLayout,
  coursework,
  canViewSetupProgress,
  canViewStudentRepos,
  repos,
  setupProgress,
  studentRepo,
  canEditLayout,
}: CourseworkClientProps) {
  const [studentLayout, setStudentLayout] = useState<GridItem[]>(
    initialStudentLayout.length > 0
      ? initialStudentLayout
      : defaultCourseworkLayoutStudent,
  );
  const [staffLayout, setStaffLayout] = useState<GridItem[]>(
    initialStaffLayout.length > 0
      ? initialStaffLayout
      : defaultCourseworkLayoutStaff,
  );
  const [activeTarget, setActiveTarget] = useState<CourseworkLayoutTarget>(
    canEditLayout ? "staff" : "student",
  );
  const hasMounted = useRef(false);

  const activeLayout =
    activeTarget === "staff" ? staffLayout : studentLayout;
  const activeAvailableModules =
    activeTarget === "staff" ? availableStaffModules : availableStudentModules;

  useEffect(() => {
    if (!canEditLayout) {
      return;
    }

    if (!hasMounted.current) {
      hasMounted.current = true;
      return;
    }

    const layoutToSave =
      activeTarget === "staff" ? staffLayout : studentLayout;

    const timeoutId = window.setTimeout(() => {
      void saveLayout(layoutToSave, coursework.id, activeTarget).catch((error) => {
        console.error("Failed to save dashboard layout", error);
      });
    }, 400);

    return () => {
      window.clearTimeout(timeoutId);
    };
  }, [
    activeTarget,
    canEditLayout,
    coursework.id,
    saveLayout,
    staffLayout,
    studentLayout,
  ]);

  function setActiveLayout(nextLayout: GridItem[] | ((prev: GridItem[]) => GridItem[])) {
    if (activeTarget === "staff") {
      setStaffLayout(nextLayout);
      return;
    }

    setStudentLayout(nextLayout);
  }

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      {canEditLayout && (
        <CourseworkLayoutEditor
          availableModules={activeAvailableModules}
          layout={activeLayout}
          onChange={setActiveLayout}
          activeTarget={activeTarget}
          onTargetChange={setActiveTarget}
          canEditStaffView={canEditLayout}
        />
      )}

      <CourseworkRenderer
        layout={canEditLayout ? staffLayout : studentLayout}
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
