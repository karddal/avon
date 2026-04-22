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
import { getRequestJWT, requireSession } from "@/lib/auth-utils";
import Loading from "../loading";
import CourseworkDescription from "./description";
import CourseworkInformation from "./information";
import CourseworkName from "./name";

async function CourseworkPageContent({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const p = await params;
  const slug = p.slug;
  await requireSession();
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
        <Suspense>
          <CourseworkDeadlineBannerFromSlug
            slug={slug}
            token={token}
            warningThreshold={7}
          />
        </Suspense>
      )}
      <section className="mb-8 grid min-h-0 grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
        <div className="flex h-full flex-col gap-4 md:col-span-2 xl:col-span-2 xl:h-64">
          <Card
            id="coursework-description"
            data-cy="coursework-description-section"
            className="h-full min-h-0"
          >
            <CardHeader>
              <CardTitle>
                <div className="text-2xl flex flex-row gap-2 items-center">
                  <Info />
                  Description
                </div>
                <div className="font-light">
                  Information about the coursework.
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent className="min-h-0 flex-1">
              <Suspense>
                <CourseworkDescription slug={slug} token={token} />
              </Suspense>
            </CardContent>
          </Card>
        </div>
        <div
          id="coursework-information"
          className="h-full md:col-span-2 xl:col-span-1 xl:h-64"
        >
          <Suspense>
            <CourseworkInformation slug={slug} token={token} />
          </Suspense>
        </div>
        <div
          id="coursework-repos"
          className="h-full md:col-span-2 xl:col-span-2"
        >
          {canViewSetupProgress ? (
            canViewStudentRepos && student_repos_data ? (
              <CourseworkRepoOverview repos={student_repos_data?.repos} />
            ) : (
              <></>
            )
          ) : (
            <Suspense>
              <StudentRepoOverview courseworkId={slug} />
            </Suspense>
          )}
        </div>
        <div
          id="coursework-activity"
          className="h-full md:col-span-2 xl:col-span-1"
        >
          {canViewSetupProgress ? (
            <Suspense>
              <SetupProgress cw_id={slug}></SetupProgress>
            </Suspense>
          ) : (
            <Suspense>
              <StudentRepoActivity courseworkId={slug} />
            </Suspense>
          )}
        </div>
        {!canViewSetupProgress && (
          <div
            id="coursework-students"
            className="mb-8 h-full pb-4 md:col-span-2 md:mb-10 xl:col-span-3 xl:mb-16"
          >
            <CourseworkStudentPanel />
          </div>
        )}
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
