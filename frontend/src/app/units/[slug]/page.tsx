"use server";

import { Suspense } from "react";
import Loading from "@/app/coursework/loading";
import UnitDescription from "@/app/units/[slug]/description";
import UnitName from "@/app/units/[slug]/name";
import { DropdownCard } from "@/components/dropdown-card";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import LecturerDropdown from "@/components/units/lecturer-dropdown";
import Lecturers from "@/components/units/lecturers";
import UnitsCourseworkList from "@/components/units/units-coursework-list";
import { getRequestJWT, requireSession } from "@/lib/auth-utils";

async function PageContent({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const s = await requireSession();
  let userRole = s.user.role;
  const me = s.user.id;
  if (!userRole) {
    userRole = "user";
  }
  const token = await getRequestJWT();
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
            <div className="flex flex-row gap-4 justify-between">
              <UnitName slug={slug} token={token} />
              {userRole === "lecturer" && (
                <LecturerDropdown me={me} slug={slug}></LecturerDropdown>
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
          <Card>
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
          <Card>
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
                <TabsList className="h-8 flex flex-row justify-between w-full bg-transparent">
                  <div className="bg-accent">
                    <TabsTrigger value="ongoing">Ongoing</TabsTrigger>
                    <TabsTrigger value="finished">Finished</TabsTrigger>
                  </div>
                </TabsList>
                <TabsList className={"w-full"}>
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
                </TabsList>
              </Tabs>
            </CardContent>
          </Card>
        </div>

        {/* Right column */}
        <div className="flex flex-col xl:col-span-1 lg:col-span-2 gap-4 min-h-0">
          {/* Unit Staff */}
          <DropdownCard
            openByDefault={true}
            title="Unit staff"
            desc="Lecturers and teachers appear here"
            className={""}
          >
            <Lecturers unit_id={slug}></Lecturers>
          </DropdownCard>

          {/* Announcements */}
          <DropdownCard
            openByDefault={false}
            title="Announcements"
            desc="Recent announcements appear here."
            className={"mb-16"}
          >
            {[1, 2, 3].map((i) => (
              <Card
                key={i}
                className="py-0 bg-accent flex flex-row items-center gap-4"
              >
                <div className="flex flex-row">
                  <div className="bg-red-500 h-auto w-1" />
                  <div className="flex flex-col px-2">
                    <div className="text-xl font-semibold">New coursework!</div>
                    <div className="font-light">
                      <span className="font-bold">Sketch</span> has been
                      released. Get started now!
                    </div>
                  </div>
                </div>
              </Card>
            ))}
          </DropdownCard>
        </div>
      </section>
    </>
  );
}

export default async function UnitPage({
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
