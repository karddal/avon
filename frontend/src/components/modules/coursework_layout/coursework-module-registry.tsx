export const courseworkModuleRegistry = {
  description: {
    title: "Description",
    minW: 1,
    minH: 1,
    maxW: 10,
    maxH: 4,
  },
  information: {
    title: "Information",
    minW: 1,
    minH: 1,
    maxW: 10,
    maxH: 4,
  },
  deadline_banner: {
    title: "Deadline Banner",
    minW: 1,
    minH: 1,
    maxW: 10,
    maxH: 4,
  },
  repo_overview: {
    title: "Repository Overview",
    minW: 1,
    minH: 1,
    maxW: 10,
    maxH: 2,
  },
  student_repo_overview: {
    title: "Student Repository Overview",
    minW: 1,
    minH: 1,
    maxW: 10,
    maxH: 4,
  },
  setup_progress: {
    title: "Setup Progress",
    minW: 1,
    minH: 1,
    maxW: 10,
    maxH: 4,
  },
  student_repo_activity: {
    title: "Student Repository Activity",
    minW: 1,
    minH: 1,
    maxW: 10,
    maxH: 4,
  },
  student_panel: {
    title: "Student Panel",
    minW: 1,
    minH: 1,
    maxW: 10,
    maxH: 4,
  },
} as const;

export type CourseworkModuleKey = keyof typeof courseworkModuleRegistry;
