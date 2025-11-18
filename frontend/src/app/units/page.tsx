"use client";

import { Suspense, useEffect, useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import UnitList from "@/components/unit-list";
import YearSelector from "@/components/year-selector";
import Loading from "@/app/coursework/loading";

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
          <div className="bg-accent p-1 rounded-md flex gap-2">
            <TabsTrigger
              value="ongoing"
              className="bg-accent px-4 py-2 rounded"
            >
              Ongoing
            </TabsTrigger>
            <TabsTrigger
              value="finished"
              className="bg-accent px-4 py-2 rounded"
            >
              Finished
            </TabsTrigger>
          </div>
        </TabsList>

        <TabsContent value="ongoing">
          <Suspense fallback={<Loading></Loading>}>
            <UnitList currentYear={year} finished={false} />
          </Suspense>
        </TabsContent>
        <TabsContent value="finished">
          <Suspense fallback={<Loading></Loading>}>
            <UnitList currentYear={year} finished={true} />
          </Suspense>
        </TabsContent>
      </Tabs>

      <div className="text-sm text-muted-foreground pl-2">
        Academic Year: {currentAcademicYear}
      </div>
    </div>
  );
}
