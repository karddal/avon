"use client";

import { Suspense, useEffect, useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import UnitList from "@/components/unit-list";
import YearSelector from "@/components/year-selector";

export default function UnitPage() {
  const [year, setYear] = useState<number | null>(null);
  const [activeTab, setActiveTab] = useState<"ongoing" | "finished">("ongoing");

  // defer `new Date()` in useEffect to avoid pre-render errors
  useEffect(() => {
    setYear(new Date().getFullYear());
  }, []);

  if (year === null) return null; // wait until client time is ready

  const currentAcademicYear = `${year}/${year + 1}`;

  return (
    <div className="space-y-6">
      <Tabs value={activeTab} onValueChange={(_v) => setActiveTab(activeTab)}>
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

        <Suspense fallback={<p>Loading Units...</p>}>
          <TabsContent value="ongoing">
            <UnitList currentYear={year} finished={false} />
          </TabsContent>
          <TabsContent value="finished">
            <UnitList currentYear={year} finished={true} />
          </TabsContent>
        </Suspense>
      </Tabs>

      <div className="text-sm text-muted-foreground pl-2">
        Academic Year: {currentAcademicYear}
      </div>
    </div>
  );
}
