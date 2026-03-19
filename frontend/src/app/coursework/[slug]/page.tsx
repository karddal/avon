import { Suspense } from "react";
import CourseworkLectDropdown from "@/components/coursework/coursework-lect-dropdown";
import SetupProgress from "@/components/coursework/setup-progress";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { getRequestJWT, requireSession } from "@/lib/auth-utils";
import Loading from "../loading";
import CourseworkDescription from "./description";
import CourseworkInformation from "./information";
import CourseworkName from "./name";

type CourseworkUpdateReqResponse = {
  id: string;
  name: string;
  description?: string;
  unit_id: string;
  due_date: string;
  creation_date: string;
  colour: string;
  unit_name: string;
  unit_code: string;
  gitlabId: string;
  templateId: string;
  max_end_date: string;
};

type CourseworkUpdateData = {
  id: string;
  name: string;
  description?: string;
  unit_id: string;
  due_date: string;
  creation_date: string;
  colour: string;
  unit_name: string;
  unit_code: string;
  gitlabId: string;
  templateId: string;
  max_end_date: Date;
};

async function CourseworkPageContent({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const p = await params;
  const slug = p.slug;
  console.log("CW", slug);
  const s = await requireSession();
  const token = await getRequestJWT();
  const me = s.user.role;
  const response = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL}/coursework/${slug}/update_form_data`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      cache: "no-cache",
    },
  );
  const c: CourseworkUpdateReqResponse = await response.json();
  const end = new Date(c.max_end_date);
  const data: CourseworkUpdateData = {
    id: c.id,
    name: c.name,
    description: c.description,
    unit_id: c.unit_id,
    due_date: c.due_date,
    creation_date: c.creation_date,
    colour: c.colour,
    unit_name: c.unit_name,
    unit_code: c.unit_code,
    gitlabId: c.gitlabId,
    templateId: c.templateId,
    max_end_date: end,
  };
  // Hardcoded the template id here, when merged, I should be able to get the template id from jack's code
  const gitlab_data = {
    name: c.name,
    coursework_id: c.id,
    template_id: String(data.templateId),
  };

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
                "flex flex-row gap-4 justify-between items-center mt-4 flex-wrap"
              }
            >
              <CourseworkName slug={slug} token={token} />
              {(me === "lecturer" || me === "admin") && (
                <CourseworkLectDropdown
                  _me={me}
                  slug={slug}
                  coursework_update_data={data}
                  gitlab_data={gitlab_data}
                ></CourseworkLectDropdown>
              )}
            </div>
          </Suspense>
        </div>
      </div>

      <section className="grid gap-4 grid-cols-1 md:grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 min-h-0 mb-2">
        <div className="flex flex-col gap-4 col-span-3 lg:col-span-2">
          <Card data-cy="coursework-description-section">
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
        {(me === "admin" || me === "lecturer") && (
          <div className="flex flex-col col-span-3 min-h-0">
            <Suspense>
              <SetupProgress cw_id={data.id} />
            </Suspense>
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
