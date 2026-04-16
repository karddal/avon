"use client";

import { useEffect, useRef, useState } from "react";
import type { GridItem } from "@/components/modules/coursework_layout/coursework-types";
import { defaultCourseworkLayout } from "@/lib/coursework-layout";
import type { CourseworkModuleKey } from "@/components/modules/coursework_layout/coursework-module-registry";
import CourseworkLayoutEditor from "@/components/modules/coursework_layout/coursework-layout-editor";
import CourseworkRenderer from "@/components/modules/coursework_layout/coursework-renderer";
import type { StudentNameAndRepo } from "@/lib/actions/coursework/get_student_repos";
import { staffAvailableModules, studentAvailableModules } from "@/lib/coursework-layout";


type CourseworkClientProps = {
  initialLayout: GridItem[];
  staffLayout: GridItem[];
  studentLayout: GridItem[];
  availableModules: CourseworkModuleKey[];
  editableModules: CourseworkModuleKey[];
  saveLayout: (layout: GridItem[], slug: string, layoutType?: "staff" | "student") => Promise<void>;
  slug: string;
  repos: StudentNameAndRepo[];
  myRepo: StudentRepoData | null;
  setupProgressData: SetupProgressItem[];
  courseworkData: CourseworkData | null;
  layoutType: "staff" | "student";
  canEditLayouts: boolean;
};

type CourseworkCommit = {
  id: string;
  web_url?: string;
  title: string;
  short_id: string;
  author_name?: string;
  authored_date?: string;
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
  initialLayout,
  staffLayout,
  studentLayout,
  availableModules,
  editableModules,
  saveLayout,
  slug,
  repos,
  myRepo,
  setupProgressData,
  courseworkData,
  layoutType,
  canEditLayouts,
}: CourseworkClientProps) {
  const [staffLayoutState, setStaffLayoutState] = useState<GridItem[]>(staffLayout);
  const [studentLayoutState, setStudentLayoutState] = useState<GridItem[]>(studentLayout);
  const [editingLayoutType, setEditingLayoutType] = useState<"staff" | "student">(layoutType);
  const hasMounted = useRef(false);

  useEffect(() => {
    if (!hasMounted.current) {
      hasMounted.current = true;
      return;
    }

    const currentLayout = editingLayoutType === "staff" ? staffLayoutState : studentLayoutState;
    const timeoutId = window.setTimeout(() => {
      void saveLayout(currentLayout, slug, editingLayoutType).catch((error) => {
        console.error("Failed to save dashboard layout", error);
      });
    }, 400);

    return () => {
      window.clearTimeout(timeoutId);
    };
  }, [staffLayoutState, studentLayoutState, saveLayout, editingLayoutType, slug]);

  // Staff always see staff layout, students always see student layout
  // editingLayoutType only affects what's being edited in the admin editor popup
  const currentLayout = canEditLayouts ? staffLayoutState : studentLayoutState;
  const currentEditableModules = canEditLayouts ? staffAvailableModules : studentAvailableModules;

  const handleTabChange = (newLayoutType: "staff" | "student") => {
    setEditingLayoutType(newLayoutType);
  };

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <CourseworkLayoutEditor
        staffLayout={staffLayoutState}
        studentLayout={studentLayoutState}
        onStaffLayoutChange={setStaffLayoutState}
        onStudentLayoutChange={setStudentLayoutState}
        editingLayoutType={editingLayoutType}
        onEditingLayoutTypeChange={handleTabChange}
        canEdit={canEditLayouts}
        slug={slug}
        saveLayout={saveLayout}
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
