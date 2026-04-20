import { ClipboardPlus } from "lucide-react";
import Link from "next/link";
import { Suspense } from "react";
import Loading from "@/app/coursework/loading";
import UnitDescription from "@/app/units/[slug]/description";
import UnitName from "@/app/units/[slug]/name";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import LecturerDropdown from "@/components/units/lecturer-dropdown";
import Lecturers from "@/components/units/lecturers";
import UnitsCourseworkList from "@/components/units/units-coursework-list";
import { get_unit_scopes } from "@/lib/actions/unit/get_unit_scopes";
import { getRequestJWT, requireSession } from "@/lib/auth-utils";

type UnitDataResponse = {
  id: string;
  name: string;
  description: string;
  creation_date: string;
  unit_code: string;
  colour: string;
  programme_id: string;
  unlocked: boolean;
};

type UnitUpdateData = {
  id: string;
  name: string;
  description?: string;
  colour: string;
  unit_code: string;
  programme_id: string;
  unlocked: boolean;
};

async function PageContent({ params }: { params: Promise<{ slug: string }> }) {
  const p = await params;
  const slug = String(p.slug);
  console.log("UNIT", slug);
  const s = await requireSession();
  const token = await getRequestJWT();
  const scopes: Set<string> = await get_unit_scopes(slug);

  let userRole = s.user.role;
  const me = s.user.id;
  if (!userRole) {
    userRole = "user";
  }
  const response = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL}/units/${slug}/`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      cache: "no-cache",
    },
  );
  const c: UnitDataResponse = await response.json();
  const data: UnitUpdateData = {
    id: c.id,
    name: c.name,
    description: c.description,
    colour: c.colour,
    unit_code: c.unit_code,
    programme_id: c.programme_id,
    unlocked: c.unlocked,
  };
  return (
    <>
      {/* Header */}
      <div className="flex flex-col col-span-3 min-h-0">
        <div className="font-semibold text-5xl text-shadow-2xs">
          <Suspense
            fallback={
              <div className="h-16">
                <Skeleton className="bg-foreground/10" />
              </div>
            }
          >
            <div className="flex flex-row gap-4 justify-between items-center">
              <UnitName slug={slug} token={token} />
              {(userRole === "lecturer" || userRole === "admin") && (
                <LecturerDropdown
                  unit_update_data={data}
                  me={me}
                  slug={slug}
                  scopes={scopes}
                ></LecturerDropdown>
              )}
            </div>
          </Suspense>
        </div>
        <div className="w-full bg-accent-foreground"></div>
      </div>

      {/* Main sections */}
      <section className="grid gap-4 grid-cols-1 md:grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 min-h-0 mb-2">
        {/* Left column */}
        <div className="flex flex-col lg:col-span-2 gap-4 lg:min-h-0">
          {/* Unit Description */}
          <Card id="unit-description">
            <CardHeader>
              <CardTitle>
                <div className="text-2xl">Description</div>
                <div className="font-light">Information about the unit.</div>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Suspense
                fallback={
                  <div className="space-y-2">
                    <Skeleton className="h-2 w-full" />
                    <Skeleton className="h-20 w-full rounded-lg" />
                  </div>
                }
              >
                <UnitDescription slug={slug} token={token} />
              </Suspense>
            </CardContent>
          </Card>

          {/* Coursework */}
          <Card id="unit-coursework">
            <CardHeader>
              <CardTitle>
                <div className="text-2xl">Coursework</div>
                <div className="font-light">
                  See your assigned courseworks here.
                </div>
              </CardTitle>
            </CardHeader>

            <CardContent className="w-full flex flex-col">
              <Tabs defaultValue="ongoing">
                <div
                  className={
                    "flex flex-row flex-wrap justify-between items-center"
                  }
                >
                  <TabsList>
                    <TabsTrigger value="ongoing">Ongoing</TabsTrigger>
                    <TabsTrigger value="finished">Finished</TabsTrigger>
                  </TabsList>
                  {(userRole === "lecturer" || userRole === "admin") && (
                    <Button asChild variant={"outline"} size={"sm"}>
                      <Link href={`/units/${slug}/create-coursework`}>
                        <ClipboardPlus />
                        Assign coursework
                      </Link>
                    </Button>
                  )}
                </div>
                <TabsContent value={"ongoing"}>
                  <Suspense fallback={<Loading />}>
                    <UnitsCourseworkList
                      unit_id={slug}
                      finished={false}
                    ></UnitsCourseworkList>
                  </Suspense>
                </TabsContent>
                <TabsContent className={"w-full"} value={"finished"}>
                  <Suspense fallback={<Loading />}>
                    <UnitsCourseworkList
                      unit_id={slug}
                      finished={true}
                    ></UnitsCourseworkList>
                  </Suspense>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </div>

        {/* Right column */}
        <div className="flex flex-col xl:col-span-1 lg:col-span-2 gap-4 min-h-0">
          {/* Unit Staff */}
          <Suspense fallback={<Loading />}>
            <Card id="unit-staff">
              <CardHeader>
                <CardTitle>
                  <div className="text-2xl">Unit staff</div>
                  <div className="font-light">
                    Lecturers and teachers appear here
                  </div>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Lecturers unit_id={slug}></Lecturers>
              </CardContent>
            </Card>
          </Suspense>
        </div>
      </section>
    </>
  );
}

export default function UnitPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  return (
    <Suspense fallback={<Loading />}>
      <PageContent params={params} />
    </Suspense>
  );
}
