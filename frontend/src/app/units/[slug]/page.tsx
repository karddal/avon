import { cookies } from "next/headers";
import { Suspense } from "react";
import CourseworkSection from "@/app/units/[slug]/coursework-section";
import UnitDescription from "@/app/units/[slug]/description";
import UnitName from "@/app/units/[slug]/name";
import { DropdownCard } from "@/components/dropdown-card";
import { Avatar } from "@/components/ui/avatar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";

async function PageContent({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const cookieStore = await cookies();
  const token = cookieStore.get("access_token")?.value;

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
            <UnitName slug={slug} token={token} />
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
              <Suspense>
                <UnitDescription slug={slug} token={token} />
              </Suspense>
            </CardContent>
          </Card>

          {/* Coursework */}
          <Card className="flex flex-col gap-4 min-h-0">
            <CardHeader>
              <CardTitle>
                <div className="text-2xl">Coursework</div>
                <div className="font-light">
                  See your assigned courseworks here.
                </div>
              </CardTitle>
              <Tabs defaultValue="ongoing">
                <TabsList>
                  <TabsTrigger value="ongoing">Ongoing</TabsTrigger>
                  <TabsTrigger value="finished">Finished</TabsTrigger>
                </TabsList>
              </Tabs>
            </CardHeader>

            <CardContent className="overflow-y-scroll h-96 flex flex-col gap-4">
              <Suspense>
                <CourseworkSection slug={slug} token={token} />
              </Suspense>
            </CardContent>
          </Card>
        </div>

        {/* Right column */}
        <div className="flex flex-col xl:col-span-1 lg:col-span-2 gap-4 min-h-0">
          {/* Unit Staff */}
          <DropdownCard
            title="Unit Staff"
            desc="Lecturers and Teachers appear here."
          >
            {[1, 2, 3].map((i) => (
              <Card
                key={i}
                className="p-0 bg-accent flex flex-row items-center gap-4"
              >
                <Avatar className="bg-slate-300 size-16 rounded-none" />
                <div className="flex flex-col">
                  <div className="text-xl font-semibold">Sion Hannuna</div>
                  <div className="font-light">
                    Senior Lecturer, School of Computer Science
                  </div>
                </div>
              </Card>
            ))}
          </DropdownCard>

          {/* Announcements */}
          <DropdownCard
            title="Announcements"
            desc="Recent announcements appear here."
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

export default function UnitPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  return (
    <Suspense>
      <PageContent params={params} />
    </Suspense>
  );
}
