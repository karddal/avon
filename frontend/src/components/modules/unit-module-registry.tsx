import AnnouncementsModule from "@/components/modules/announcements-module";
import UnitDescriptionModule from "@/components/modules/unit-desc-module";
import UnitCourseworksModule from "@/components/modules/unit-courseworks-module";
import UnitMembersModule from "@/components/modules/unit-members-module";

export const unitModuleRegistry = {
  description: {
    title: "Description",
    component: UnitDescriptionModule,
    minW: 3,
    minH: 1,
    maxW: 10,
    maxH: 3,
  },
  courseworks: {
    title: "Coursework",
    component: UnitCourseworksModule,
    minW: 3,
    minH: 1,
    maxW: 10,
    maxH: 3,
  },
  announcements: {
    title: "Announcements",
    component: AnnouncementsModule,
    minW: 2,
    minH: 1,
    maxW: 10,
    maxH: 2,
  },
  unit_members: {
    title: "Unit Members",
    component: UnitMembersModule,
    minW: 2,
    minH: 1,
    maxW: 10,
    maxH: 3,
  },
} as const;

export type UnitModuleKey = keyof typeof unitModuleRegistry;
