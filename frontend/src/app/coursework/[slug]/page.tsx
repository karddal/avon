import { Suspense } from "react";
import CourseworkLectDropdown from "@/components/coursework/coursework-lect-dropdown";
import SetupProgress from "@/components/coursework/setup-progress";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { get_coursework_scopes } from "@/lib/actions/get_coursework_scopes";
import { get_cw_update_data } from "@/lib/actions/get_coursework_update_data";
import { getRequestJWT, requireSession } from "@/lib/auth-utils";
import Loading from "../loading";
import CourseworkDescription from "./description";
import CourseworkInformation from "./information";
import CourseworkName from "./name";
import {get_base_images_cw_specific} from "@/lib/actions/get_base_images_cw_specific";

async function CourseworkPageContent({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const p = await params;
  const slug = p.slug;
  console.log("CW", slug);
  const _s = await requireSession();
  const token = await getRequestJWT();
  // Hardcoded the template id here, when merged, I should be able to get the template id from jack's code

  const scopes: Set<string> = await get_coursework_scopes(slug);
  const canLoadCourseworkTools = scopes.has("unit:coursework_manage");
  const data = canLoadCourseworkTools
    ? await get_cw_update_data(slug)
    : undefined;

  const canGetAvailImages = scopes.has("unit:coursework_engine")
  const images = canGetAvailImages ? await get_base_images_cw_specific({coursework_id: slug}) : undefined;

  return (
    <>
      {/* Header */}
      <div className="flex flex-col col-span-3 min-h-0">
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
              ></CourseworkLectDropdown>
            </div>
          </Suspense>
        </div>
      </div>

      <section className="grid gap-4 grid-cols-1 md:grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 min-h-0 mb-2">
        <div className="flex flex-col gap-4 col-span-3 lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>
                <div className="text-2xl">Description</div>
                <div className="font-light">
                  Information about the coursework.
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Suspense>
                <CourseworkDescription slug={slug} token={token} />
              </Suspense>
            </CardContent>
          </Card>
        </div>
        <div className="col-span-3 lg:col-span-1">
          <Suspense>
            <CourseworkInformation slug={slug} token={token} />
          </Suspense>
        </div>

        {/*
        TODO: In the future, this should check the backend to ensure that they are a lecturer on this specific unit. For now this is okay for the demo, but this
        needs to be fixed because a lect could be a student on a nother unit.
          */}
        {scopes.has("unit:coursework_gitlab") && (
          <div className="flex flex-col col-span-3 min-h-0">
            <Suspense>{data && <SetupProgress cw_id={data.id} />}</Suspense>
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
