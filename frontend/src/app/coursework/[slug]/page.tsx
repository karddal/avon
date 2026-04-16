import { Info } from "lucide-react";
import { Suspense } from "react";
import { CourseworkDeadlineBannerFromSlug } from "@/components/coursework/coursework-banner";
import CourseworkLectDropdown from "@/components/coursework/coursework-lect-dropdown";
import CourseworkRepoOverview from "@/components/coursework/coursework-repo-overview";
import CourseworkStudentPanel from "@/components/coursework/coursework-student-panel";
import SetupProgress from "@/components/coursework/setup-progress";
import StudentRepoActivity from "@/components/coursework/student-repo-activity";
import StudentRepoOverview from "@/components/coursework/student-repo-overview";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { get_base_images_cw_specific } from "@/lib/actions/coursework/get_base_images_cw_specific";
import { get_coursework_scopes } from "@/lib/actions/coursework/get_coursework_scopes";
import { get_cw_update_data } from "@/lib/actions/coursework/get_coursework_update_data";
import { get_cw_engine_data } from "@/lib/actions/coursework/get_cw_engine_data";
import { get_student_repos } from "@/lib/actions/coursework/get_student_repos";
import { getRequestJWT } from "@/lib/auth-utils";
import Loading from "../loading";
import CourseworkDescription from "./description";
import CourseworkInformation from "./information";
import CourseworkName from "./name";
import CourseworkClient from "@/components/modules/coursework_layout/coursework-client";
import { availableCourseworkModules, defaultCourseworkLayout, staffAvailableModules, studentAvailableModules } from "@/lib/coursework-layout";
import {
  getCourseworkLayoutForCurrentCoursework,
  saveCourseworkLayoutForCurrentCoursework,
} from "@/lib/actions/coursework-layout";
import { get_my_coursework_repo } from "@/lib/actions/coursework/get_my_coursework_repo";
import { cw_setup_progress } from "@/lib/actions/coursework/coursework-setup-progress";

type CourseworkCommit = {
  id: string;
  web_url: string | null;
  title: string;
  short_id: string;
  author_name: string | null;
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

async function CourseworkPageContent({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const p = await params;
  const slug = p.slug;
  const token = await getRequestJWT();
  // Hardcoded the template id here, when merged, I should be able to get the template id from jack's code

  const scopes: Set<string> = await get_coursework_scopes(slug);
  const canViewSetupProgress =
    scopes.has("unit:coursework_manage") ||
    scopes.has("unit:coursework_gitlab") ||
    scopes.has("unit:coursework_engine") ||
    scopes.has("unit:coursework_delete");
  const canViewStudentRepos = scopes.has("unit:coursework_engine");
  const canLoadCourseworkTools = scopes.has("unit:coursework_manage");
  const data = canLoadCourseworkTools
    ? await get_cw_update_data(slug)
    : undefined;

  const canGetAvailImages = scopes.has("unit:coursework_engine");

  const student_repos_data = canViewStudentRepos
    ? await get_student_repos({ coursework_id: slug })
    : undefined;

  const images = canGetAvailImages
    ? await get_base_images_cw_specific({ coursework_id: slug })
    : undefined;
  const cw_engine_data = canGetAvailImages
    ? await get_cw_engine_data({ coursework_id: slug })
    : undefined;
  const savedLayout = await getCourseworkLayoutForCurrentCoursework(slug, canViewSetupProgress ? "staff" : "student");
  const staffLayout = await getCourseworkLayoutForCurrentCoursework(slug, "staff");
  const studentLayout = await getCourseworkLayoutForCurrentCoursework(slug, "student");
  const availableModulesForUser = canViewSetupProgress ? staffAvailableModules : studentAvailableModules;

  // Fetch module-specific data
  const myRepo: StudentRepoData | null = await get_my_coursework_repo(slug).catch(() => null);
  const setupProgressData: SetupProgressItem[] = canViewSetupProgress ? await cw_setup_progress(slug) : [];
  const courseworkData: CourseworkData | null = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL}/coursework/${slug}`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    },
  ).then((res) => (res.ok ? res.json() : null)).catch(() => null);

  return (
    <>
      {/* Header */}
      <div className="flex flex-col col-span-3">
        <div className="font-semibold text-5xl text-shadow-2xs mt-2">
          <Suspense
            fallback={
              <div className={"h-16"}>
                <Skeleton className={"bg-foreground/10"} />
              </div>
            }
          >
            <div
              className={
                "flex flex-row gap-4 justify-between items-center my-2"
              }
            >
              <CourseworkName slug={slug} token={token} />
              <CourseworkLectDropdown
                slug={slug}
                scopes={scopes}
                coursework_update_data={data}
                avail_images_data={images?.images}
                cw_engine_data={cw_engine_data}
              ></CourseworkLectDropdown>
            </div>
          </Suspense>
        </div>
      </div>
      {!canViewSetupProgress && (
        <CourseworkDeadlineBannerFromSlug
          slug={slug}
          courseworkData={courseworkData}
          warningThreshold={7}
        />
      )}
      <section className="mb-8 min-h-0 flex-1">
        <CourseworkClient
          initialLayout={savedLayout}
          staffLayout={staffLayout}
          studentLayout={studentLayout}
          availableModules={availableCourseworkModules}
          editableModules={availableModulesForUser}
          saveLayout={saveCourseworkLayoutForCurrentCoursework}
          slug={slug}
          repos={student_repos_data?.repos || []}
          myRepo={myRepo}
          setupProgressData={setupProgressData}
          courseworkData={courseworkData}
          layoutType={canViewSetupProgress ? "staff" : "student"}
          canEditLayouts={canViewSetupProgress}
        />
      </section>
    </>
  );
}

export default function CourseworkPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  return (
    <Suspense fallback={<Loading />}>
      <CourseworkPageContent params={params} />
    </Suspense>
  );
}
