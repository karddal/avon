import { Suspense } from "react";
import Loading from "@/app/coursework/loading";
import CourseworkList from "@/components/coursework/coursework-list";
import DashboardAnalysis from "@/components/dashboard/dashboard_analysis_card";
import UnitListByYear from "@/components/dashboard/unit-list-by-year";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { requireLecturerSession } from "@/lib/auth-utils";

export function getCurrentAcademicYear(): string {
  const now = new Date();
  const currentMonth = now.getMonth();
  const calendarYear = now.getFullYear();

  const startYear = currentMonth < 8 ? calendarYear - 1 : calendarYear;

  return `${startYear}/${startYear + 1}`;
}

async function DashboardPageContent() {
  await requireLecturerSession();
  const currentAcademicYear = getCurrentAcademicYear();
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
              <div className="gap-2 overflow-y-auto flex flex-col h-auto">
                <TabsContent className="flex flex-col gap-2" value="coursework">
                  <Tabs defaultValue="ongoing">
                    <Suspense fallback={<Loading />}>
                      <CourseworkList finished={false} />
                    </Suspense>
                  </Tabs>
                </TabsContent>
                <TabsContent className="flex flex-col gap-4" value="units">
                  {/*inner layer ongoing/finished Tab*/}
                  <Suspense fallback={<Loading />}>
                    <UnitListByYear year={currentAcademicYear}></UnitListByYear>
                    {/*  currentYear={currentYear}*/}
                    {/*  finished={false}*/}
                  </Suspense>
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
