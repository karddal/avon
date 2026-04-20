"use client";

import { useEffect, useRef, useState } from "react";
import CourseworkLayoutEditor from "@/components/modules/coursework_layout/coursework-layout-editor";
import CourseworkRenderer from "@/components/modules/coursework_layout/coursework-renderer";
import type { GridItem } from "@/components/modules/coursework_layout/coursework-types";
import type { StudentNameAndRepo } from "@/lib/actions/coursework/get_student_repos";
import {
  defaultStaffCourseworkLayout,
  defaultStudentCourseworkLayout,
  staffAvailableModules,
  studentAvailableModules,
} from "@/lib/coursework-layout";

type CourseworkClientProps = {
  staffLayout: GridItem[];
  studentLayout: GridItem[];
  saveLayout: (
    layout: GridItem[],
    slug: string,
    layoutType?: "staff" | "student",
  ) => Promise<void>;
  slug: string;
  repos: StudentNameAndRepo[];
  myRepo: StudentRepoData | null;
  setupProgressData: SetupProgressItem[];
  courseworkData: CourseworkData | null;
  canEditLayouts: boolean;
};

type CourseworkCommit = {
  id: string;
  web_url: string | null;
  title: string;
  short_id: string;
  author_name: string | null;
  authored_date: string | null;
  additions: number;
  deletions: number;
};

type StudentRepoData = {
  commits: CourseworkCommit[];
  repo_url: string;
  total_commits: number;
};

type SetupProgressItem = {
  title: string;
  completed: boolean;
};

type CourseworkData = {
  id: string;
  name: string;
  description: string;
  code: string;
  year: number;
  finished: boolean;
  color: string;
  creation_date: string;
  due_date: string;
  testsPassed: number;
  totalTests: number;
};

export default function CourseworkClient({
  staffLayout,
  studentLayout,
  saveLayout,
  slug,
  repos,
  myRepo,
  setupProgressData,
  courseworkData,
  canEditLayouts,
}: CourseworkClientProps) {
  const [staffLayoutState, setStaffLayoutState] = useState<GridItem[]>(
    staffLayout.length > 0 ? staffLayout : defaultStaffCourseworkLayout,
  );
  const [studentLayoutState, setStudentLayoutState] = useState<GridItem[]>(
    studentLayout.length > 0 ? studentLayout : defaultStudentCourseworkLayout,
  );
  const hasMountedStaff = useRef(false);
  const hasMountedStudent = useRef(false);

  useEffect(() => {
    if (!canEditLayouts) {
      return;
    }

    if (!hasMountedStaff.current) {
      hasMountedStaff.current = true;
      return;
    }

    const timeoutId = window.setTimeout(() => {
      void saveLayout(staffLayoutState, slug, "staff").catch((error) => {
        console.error("Failed to save dashboard layout", error);
      });
    }, 400);

    return () => {
      window.clearTimeout(timeoutId);
    };
  }, [staffLayoutState, canEditLayouts, saveLayout, slug]);

  useEffect(() => {
    if (!canEditLayouts) {
      return;
    }

    if (!hasMountedStudent.current) {
      hasMountedStudent.current = true;
      return;
    }

    const timeoutId = window.setTimeout(() => {
      void saveLayout(studentLayoutState, slug, "student").catch((error) => {
        console.error("Failed to save dashboard layout", error);
      });
    }, 400);

    return () => {
      window.clearTimeout(timeoutId);
    };
  }, [studentLayoutState, canEditLayouts, saveLayout, slug]);

  // Staff always see staff layout, students always see student layout
  // editingLayoutType only affects what's being edited in the admin editor popup
  const currentLayout = canEditLayouts ? staffLayoutState : studentLayoutState;
  const currentEditableModules = canEditLayouts
    ? staffAvailableModules
    : studentAvailableModules;

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <CourseworkLayoutEditor
        canEditLayouts={canEditLayouts}
        staffLayout={staffLayoutState}
        studentLayout={studentLayoutState}
        onStaffLayoutChange={setStaffLayoutState}
        onStudentLayoutChange={setStudentLayoutState}
      />

      <CourseworkRenderer
        layout={currentLayout}
        slug={slug}
        repos={repos}
        myRepo={myRepo}
        setupProgressData={setupProgressData}
        courseworkData={courseworkData}
        editableModules={currentEditableModules}
      />
    </div>
  );
}
