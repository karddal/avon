import { Suspense } from "react";
import { CourseworkDeadlineBanner } from "@/components/coursework/coursework-banner";
import CourseworkLectDropdown from "@/components/coursework/coursework-lect-dropdown";
import SetupProgress from "@/components/coursework/setup-progress";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { get_base_images_cw_specific } from "@/lib/actions/get_base_images_cw_specific";
import { get_coursework_scopes } from "@/lib/actions/get_coursework_scopes";
import { get_cw_update_data } from "@/lib/actions/get_coursework_update_data";
import { get_cw_engine_data } from "@/lib/actions/get_cw_engine_data";
import { getRequestJWT } from "@/lib/auth-utils";
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
  console.log("CW", slug);
  const token = await getRequestJWT();
  // Hardcoded the template id here, when merged, I should be able to get the template id from jack's code

  const scopes: Set<string> = await get_coursework_scopes(slug);
  const canViewSetupProgress =
    scopes.has("unit:coursework_manage") ||
    scopes.has("unit:coursework_gitlab") ||
    scopes.has("unit:coursework_engine") ||
    scopes.has("unit:coursework_delete");
  // const data = canLoadCourseworkTools
  //   ? await get_cw_update_data(slug)
  //   : undefined;
  const data = await get_cw_update_data(slug);

  const canGetAvailImages = scopes.has("unit:coursework_engine");
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
        <div className="font-semibold text-5xl text-shadow-2xs">
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
      <CourseworkDeadlineBanner
        deadline={data.due_date}
        warningThreshold={7}
      ></CourseworkDeadlineBanner>
      <section className="mb-2 grid min-h-0 grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
        <div className="flex h-full flex-col gap-4 md:col-span-2 xl:col-span-2 xl:h-[16rem]">
          <Card className="h-full min-h-0">
            <CardHeader>
              <CardTitle>
                <div className="text-2xl">Description</div>
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
        <div className="h-full md:col-span-1 xl:col-span-1 xl:h-[16rem]">
          <Suspense>
            <CourseworkInformation slug={slug} token={token} />
          </Suspense>
        </div>
        <div className="h-full md:col-span-1 xl:col-span-1 xl:col-start-3">
          {canViewSetupProgress && (
            <Suspense>
              <SetupProgress cw_id={slug}></SetupProgress>
            </Suspense>
          )}
        </div>
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
