"use client";

import { Suspense, useEffect, useState } from "react";
import Loading from "@/app/coursework/loading";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import UnitList from "@/components/unit-list";
import YearSelector from "@/components/year-selector";

type Status = "ongoing" | "finished";

export default function UnitPage() {
  const [year, setYear] = useState<number | null>(null);
  const [activeTab, setActiveTab] = useState<Status>("ongoing");

  // defer `new Date()` in useEffect to avoid pre-render errors
  useEffect(() => {
    setYear(new Date().getFullYear());
  }, []);

  if (year === null) return null; // wait until client time is ready

  const currentAcademicYear = `${year}/${year + 1}`;

  return (
    <div className="space-y-6">
      <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as Status)}>
        <TabsList className="flex flex-row gap-4 bg-background my-4">
          <YearSelector value={year} setValue={setYear} />
          <div className="bg-accent p-1 flex gap-2">
            <TabsTrigger value="ongoing" className="bg-accent px-4 py-2">
              Ongoing
            </TabsTrigger>
            <TabsTrigger value="finished" className="bg-accent px-4 py-2">
              Finished
            </TabsTrigger>
          </div>
        </TabsList>

        <TabsContent value="ongoing">
          <Suspense fallback={<Loading></Loading>}>
            <section className="grid gap-4 grid-cols-1 lg:grid-cols-2">
              <UnitList currentYear={year} finished={false} />
            </section>
          </Suspense>
        </TabsContent>
        <TabsContent value="finished">
          <Suspense fallback={<Loading></Loading>}>
            <section className="grid gap-4 grid-cols-1 lg:grid-cols-2">
              <UnitList currentYear={year} finished={true} />
            </section>
          </Suspense>
        </TabsContent>
      </Tabs>

      <div className="text-sm text-muted-foreground pl-2">
        Academic Year: {currentAcademicYear}
      </div>
    </div>
  );
}
