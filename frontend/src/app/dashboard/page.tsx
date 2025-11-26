import { cookies } from "next/headers";
import { Suspense } from "react";
import Loading from "@/app/coursework/loading";
import CourseworkList from "@/components/coursework-list";
import DashboardAnalysis from "@/components/dashboard/dashboard_analysis_card";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import UnitList from "@/components/unit-list";

async function DashboardPageContent() {
  const cookieStore = await cookies();
  const token = cookieStore.get("access_token")?.value;

  const currentYear = new Date().getFullYear();
  const _yearNow = currentYear;
  const currentAcademicYear = `${currentYear}/${currentYear + 1}`;

  return (
    <div className="space-y-6 mb-2">
      <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <DashboardAnalysis />
        <Card className="flex flex-col col-span-3 xl:col-span-3">
          <CardContent>
            <Tabs defaultValue="coursework" className="">
              <TabsList className="flex flex-row gap-4 bg-background my-2">
                <div className="bg-accent p-1">
                  <TabsTrigger
                    value="coursework"
                    className="bg-accent px-4 py-2"
                  >
                    Coursework
                  </TabsTrigger>
                  <TabsTrigger value="units" className="bg-accent px-4 py-2">
                    Units
                  </TabsTrigger>
                </div>
              </TabsList>
              <div className="gap-2 overflow-y-auto flex flex-col h-96">
                <TabsContent className="flex flex-col gap-2" value="coursework">
                  <Tabs defaultValue="ongoing">
                    <section className="grid gap-4 grid-cols-1 lg:grid-cols-2">
                      <Suspense fallback={<Loading />}>
                        <CourseworkList token={token} finished={false} />
                      </Suspense>
                    </section>
                  </Tabs>
                </TabsContent>
                <TabsContent className="flex flex-col gap-4" value="units">
                  {/*inner layer ongoing/finished Tab*/}
                  <Tabs defaultValue="ongoing">
                    <Suspense fallback={<Loading />}>
                      <section className="grid gap-4 grid-cols-1 lg:grid-cols-2">
                        <UnitList
                          currentYear={currentYear}
                          finished={false}
                          token={token}
                        />
                      </section>
                    </Suspense>
                  </Tabs>

                  <div className="text-sm text-muted-foreground pl-2">
                    Academic Year: {currentAcademicYear}
                  </div>
                </TabsContent>
              </div>
            </Tabs>
          </CardContent>
        </Card>
      </section>
    </div>
  );
}

export default function DashboardPage() {
  return (
    <Suspense fallback={<Loading />}>
      <DashboardPageContent />
    </Suspense>
  );
}
