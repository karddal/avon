import CourseworkInformation from "@/app/coursework/[slug]/information";
import CourseworkDescription from "@/app/coursework/[slug]/description";
import StudentRepoOverview from "@/components/coursework/student-repo-overview";
import CourseworkRepoOverview from "@/components/coursework/coursework-repo-overview";
import SetupProgress from "@/components/coursework/setup-progress";
import StudentRepoActivity from "@/components/coursework/student-repo-activity";
import CourseworkStudentPanel from "@/components/coursework/coursework-student-panel";

export const courseworkModuleRegistry = {
  description: {
    title: "Description",
    component: CourseworkDescription,
    minW: 1,
    minH: 1,
    maxW: 10,
    maxH: 4,
  },
  information: {
    title: "Information",
    component: CourseworkInformation,
    minW: 1,
    minH: 1,
    maxW: 10,
    maxH: 4,
  },
  repo_overview: {
    title: "Repository Overview",
    component: CourseworkRepoOverview,
    minW: 1,
    minH: 1,
    maxW: 10,
    maxH: 2,
  },
  student_repo_overview: {
    title: "Student Repository Overview",
    component: StudentRepoOverview,
    minW: 1,
    minH: 1,
    maxW: 10,
    maxH: 4,
  },
  setup_progress: {
    title: "Setup Progress",
    component: SetupProgress,
    minW: 1,
    minH: 1,
    maxW: 10,
    maxH: 4,
  },
  student_repo_activity: {
    title: "Student Repository Activity",
    component: StudentRepoActivity,
    minW: 1,
    minH: 1,
    maxW: 10,
    maxH: 4,
  },
  student_panel: {
    title: "Student Panel",
    component: CourseworkStudentPanel,
    minW: 1,
    minH: 1,
    maxW: 10,
    maxH: 4,
  },
} as const;

export type CourseworkModuleKey = keyof typeof courseworkModuleRegistry;
