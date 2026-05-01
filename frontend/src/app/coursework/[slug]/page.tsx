import { redirect } from "next/navigation";
import { Suspense } from "react";
import { CourseworkDeadlineBannerFromSlug } from "@/components/coursework/coursework-banner";
import CourseworkLectDropdown from "@/components/coursework/coursework-lect-dropdown";
import type { SetupProgressArea } from "@/components/coursework/setup-progress-carousel";
import CourseworkClient from "@/components/modules/coursework_layout/coursework-client";
import { Skeleton } from "@/components/ui/skeleton";
import { fetch_test_runs } from "@/lib/actions/coursework/coursework-fetch-test-runs";
import { get_all_students_with_maybe_repos } from "@/lib/actions/coursework/get_all_students_on_unit_with_repos";
import { get_base_images_cw_specific } from "@/lib/actions/coursework/get_base_images_cw_specific";
import { get_coursework_scopes } from "@/lib/actions/coursework/get_coursework_scopes";
import { get_cw_update_data } from "@/lib/actions/coursework/get_coursework_update_data";
import { get_cw_engine_data } from "@/lib/actions/coursework/get_cw_engine_data";
import { get_my_coursework_repo } from "@/lib/actions/coursework/get_my_coursework_repo";
import { get_student_repos } from "@/lib/actions/coursework/get_student_repos";
import {
  getCourseworkLayoutForCurrentCoursework,
  saveCourseworkLayoutForCurrentCoursework,
} from "@/lib/actions/coursework-layout";
import { getRequestJWT, requireSession } from "@/lib/auth-utils";
import Loading from "../loading";
import CourseworkName from "./name";

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

type SetupProgressData = {
  areas: SetupProgressArea[];
  defaultIndex: number;
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

function getDefaultSetupProgressIndex(areas: SetupProgressArea[]) {
  const actionableIndex = areas.findIndex((area) => area.status === "action");
  if (actionableIndex !== -1) {
    return actionableIndex;
  }

  const readyIndex = areas.findIndex((area) => area.status === "ready");
  if (readyIndex !== -1) {
    return readyIndex;
  }

  return Math.max(areas.length - 1, 0);
}

function buildSetupProgressData({
  templateConfigured,
  reposProvisioned,
  engineConfigured,
  hasTestRuns,
}: {
  templateConfigured: boolean;
  reposProvisioned: boolean;
  engineConfigured: boolean;
  hasTestRuns: boolean;
}): SetupProgressData {
  const areas: SetupProgressArea[] = [
    {
      title: "Template Repository",
      status: templateConfigured ? "complete" : "action",
      description: templateConfigured
        ? "The coursework has a repo template configured and can provision student repositories."
        : "Choose or create the template repository before provisioning student repos.",
      detail: "Needed for provisioning student repositories.",
    },
    {
      title: "Student Repositories",
      status: reposProvisioned
        ? "complete"
        : templateConfigured
          ? "action"
          : "blocked",
      description: reposProvisioned
        ? "Student repositories have been provisioned for this coursework."
        : templateConfigured
          ? "The coursework is ready to provision student repositories."
          : "Provisioning stays blocked until a template repository is configured.",
      detail: templateConfigured
        ? "Depends on: template repository."
        : "Blocked by: missing template repository.",
    },
    {
      title: "Testing Engine",
      status: engineConfigured ? "complete" : "action",
      description: engineConfigured
        ? "A base image and tester command are configured for automated testing."
        : "Configure the Avon engine if you want to run automated test batches.",
      detail: "Independent from GitLab setup, but required for test batches.",
    },
    {
      title: "Test Batches",
      status: hasTestRuns
        ? "complete"
        : reposProvisioned && engineConfigured
          ? "ready"
          : "blocked",
      description: hasTestRuns
        ? "At least one test batch has been started for this coursework."
        : reposProvisioned && engineConfigured
          ? "The coursework is ready to run its first test batch."
          : "Test batches need both provisioned repos and a configured engine.",
      detail:
        "Depends on: student repositories plus testing engine. Not required to manage repos.",
    },
    {
      title: "Manage Student Repositories",
      status: reposProvisioned ? "ready" : "blocked",
      description: reposProvisioned
        ? "You can manage teams, invitations, and repository membership now."
        : "Repo management becomes available after repositories have been provisioned.",
      detail: reposProvisioned
        ? "Useful for team changes and invite management."
        : "Blocked by: no student repositories yet.",
    },
  ];

  return {
    areas,
    defaultIndex: getDefaultSetupProgressIndex(areas),
  };
}

async function CourseworkPageContent({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const p = await params;
  const slug = p.slug;
  await requireSession();
  const token = await getRequestJWT();
  const scopes: Set<string> = await get_coursework_scopes(slug);
  if (!scopes.has("unit:read")) {
    redirect("/coursework");
  }
  const canEditLayouts =
    scopes.has("unit:coursework_manage") ||
    scopes.has("unit:coursework_gitlab") ||
    scopes.has("unit:coursework_delete");
  const canViewSetupProgress =
    canEditLayouts || scopes.has("unit:coursework_engine");
  const canViewStudentRepos = scopes.has("unit:coursework_engine");
  const canLoadCourseworkTools = scopes.has("unit:coursework_manage");
  const data = canLoadCourseworkTools
    ? await get_cw_update_data(slug)
    : undefined;

  const canGetAvailImages = scopes.has("unit:coursework_engine");

  const student_repos_data = canViewStudentRepos
    ? await get_student_repos({ coursework_id: slug })
    : undefined;
  const studentsWithMaybeRepos = canViewStudentRepos
    ? await get_all_students_with_maybe_repos({ coursework_id: slug })
    : [];

  const images = canGetAvailImages
    ? await get_base_images_cw_specific({ coursework_id: slug })
    : undefined;
  const cw_engine_data = canGetAvailImages
    ? await get_cw_engine_data({ coursework_id: slug })
    : undefined;
  const staffLayout = await getCourseworkLayoutForCurrentCoursework(
    slug,
    "staff",
  );
  const studentLayout = await getCourseworkLayoutForCurrentCoursework(
    slug,
    "student",
  );

  // Fetch module-specific data
  const myRepo: StudentRepoData | null = await get_my_coursework_repo(
    slug,
  ).catch(() => null);
  const setupProgressInputs = canViewSetupProgress
    ? await Promise.all([
        get_cw_update_data(slug),
        get_cw_engine_data({ coursework_id: slug }),
        get_all_students_with_maybe_repos({ coursework_id: slug }),
        fetch_test_runs(slug).catch(() => []),
      ])
    : null;
  const setupProgressData: SetupProgressData | null = setupProgressInputs
    ? buildSetupProgressData({
        templateConfigured: Boolean(setupProgressInputs[0].templateId),
        reposProvisioned: setupProgressInputs[2].some(
          (student) => student.repo_id,
        ),
        engineConfigured: Boolean(
          setupProgressInputs[1].base_image_id &&
            setupProgressInputs[1].tester_command,
        ),
        hasTestRuns: setupProgressInputs[3].length > 0,
      })
    : null;
  const courseworkData: CourseworkData | null = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL}/coursework/${slug}`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    },
  )
    .then((res) => (res.ok ? res.json() : null))
    .catch(() => null);

  return (
    <>
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
              />
            </div>
          </Suspense>
        </div>
      </div>
      {!canEditLayouts && (
        <CourseworkDeadlineBannerFromSlug
          slug={slug}
          courseworkData={courseworkData}
          warningThreshold={7}
        />
      )}
      <section className="mb-8 mt-4 flex min-h-0 flex-1 flex-col space-y-4 md:mt-0 md:space-y-6">
        <CourseworkClient
          staffLayout={staffLayout}
          studentLayout={studentLayout}
          saveLayout={saveCourseworkLayoutForCurrentCoursework}
          slug={slug}
          repos={student_repos_data?.repos || []}
          totalStudentGroups={studentsWithMaybeRepos.length}
          myRepo={myRepo}
          setupProgressData={setupProgressData}
          courseworkData={courseworkData}
          canEditLayouts={canEditLayouts}
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
