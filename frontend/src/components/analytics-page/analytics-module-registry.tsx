import ActiveCourseworkModule from "@/components/modules/active-coursework-module";
import ActiveUnitsModule from "@/components/modules/active-units-module";
import AiCommitsModule from "@/components/modules/ai-commits-module";
import AnnouncementsModule from "@/components/modules/announcements-module";
import CommitsModule from "@/components/modules/commits-module";
import LateSubmissionsModule from "@/components/modules/late-submissions-module";
import TestsPassedModule from "@/components/modules/tests-passed-module";

export const analyticsModuleRegistry = {
  announcements: {
    title: "Announcements",
    component: AnnouncementsModule,
    minW: 1,
    minH: 1,
    maxW: 3,
    maxH: 2,
  },
  commits_chart: {
    title: "Commits Chart",
    component: CommitsModule,
    minW: 1,
    minH: 1,
    maxW: 3,
    maxH: 3,
  },
  tests_passed: {
    title: "Tests Passed",
    component: TestsPassedModule,
    minW: 1,
    minH: 1,
    maxW: 3,
    maxH: 3,
  },
  late_submissions: {
    title: "Late Submissions",
    component: LateSubmissionsModule,
    minW: 1,
    minH: 1,
    maxW: 3,
    maxH: 3,
  },
  ai_commits: {
    title: "AI Commits",
    component: AiCommitsModule,
    minW: 1,
    minH: 1,
    maxW: 3,
    maxH: 3,
  },
  active_units: {
    title: "Active Units",
    component: ActiveUnitsModule,
    minW: 1,
    minH: 1,
    maxW: 3,
    maxH: 3,
  },
  active_coursework: {
    title: "Active Coursework",
    component: ActiveCourseworkModule,
    minW: 1,
    minH: 1,
    maxW: 3,
    maxH: 3,
  },
} as const;

export type AnalyticsModuleKey = keyof typeof analyticsModuleRegistry;
