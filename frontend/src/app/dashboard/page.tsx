"use client";

import { Edit, Flag, Plus } from "lucide-react";
import Link from "next/link";
import { Suspense, useEffect, useState } from "react";
import CourseworkList from "@/components/coursework-list";
import { StatsChart } from "@/components/stats-chart";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import UnitList from "@/components/unit-list";

type Status = "ongoing" | "finished";

export default function DashboardPage() {
  const [year, setYear] = useState<number | null>(null);
  const [_activeTab, _setActiveTab] = useState<Status>("ongoing");

  // defer `new Date()` in useEffect to avoid pre-render errors
  useEffect(() => {
    setYear(new Date().getFullYear());
  }, []);

  if (year === null) return null; // wait until client time is ready

  const _currentAcademicYear = `${year}/${year + 1}`;

  return (
    <div className="space-y-6 mb-2">
      <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <Card className="col-span-3 gap-0 shadow-none border-none bg-background">
          <CardContent className="grid xl:grid-cols-4 grid-cols-2 gap-4">
            <Card className="p-2 gap-0 bg-accent flex flex-col justify-between">
              <CardHeader className="p-0">
                <CardTitle className="text-center lg:text-xl font-light p-2">
                  Commits
                </CardTitle>
              </CardHeader>
              <CardContent>
                <StatsChart
                  className="hidden md:flex"
                  colour="green"
                  data={[
                    { day: "Monday", simplify: 4, sketch: 6 },
                    { day: "Tuesday", simplify: 2, sketch: 4 },
                    { day: "Wednesday", simplify: 1, sketch: 6 },
                    { day: "Thursday", simplify: 5, sketch: 6 },
                    { day: "Friday", simplify: 8, sketch: 6 },
                    { day: "Saturday", simplify: 8, sketch: 7 },
                    { day: "Sunday", simplify: 8, sketch: 5 },
                  ]}
                  xAxisKey="day"
                  dataKeys={[
                    { key: "simplify", label: "Simplify" },
                    { key: "sketch", label: "Sketch" },
                  ]}
                />
              </CardContent>
            </Card>
            <Card className="p-2 gap-0 bg-accent flex flex-col justify-between">
              <CardHeader className="p-0">
                <CardTitle className="text-center text-normal lg:text-xl font-light py-2">
                  Tests passed
                </CardTitle>
              </CardHeader>
              <CardContent>
                <StatsChart
                  className="hidden md:flex"
                  colour="blue"
                  data={[
                    { day: "Monday", simplify: 9, sketch: 6 },
                    { day: "Tuesday", simplify: 2, sketch: 4 },
                    { day: "Wednesday", simplify: 1, sketch: 6 },
                    { day: "Thursday", simplify: 5, sketch: 6 },
                    { day: "Friday", simplify: 8, sketch: 10 },
                    { day: "Saturday", simplify: 8, sketch: 10 },
                    { day: "Sunday", simplify: 8, sketch: 10 },
                  ]}
                  xAxisKey="day"
                  dataKeys={[
                    { key: "simplify", label: "Simplify" },
                    { key: "sketch", label: "Sketch" },
                  ]}
                />
              </CardContent>
            </Card>
            <Card className="align-center p-2 gap-0 bg-accent flex flex-col justify-between">
              <CardHeader className="p-0">
                <CardTitle className="text-center text-normal lg:text-xl font-light py-2">
                  Late submissions
                </CardTitle>
              </CardHeader>
              <CardContent>
                <StatsChart
                  className="hidden md:flex"
                  colour="red"
                  data={[
                    { day: "Monday", simplify: 1, sketch: 0 },
                    { day: "Tuesday", simplify: 2, sketch: 1 },
                    { day: "Wednesday", simplify: 1, sketch: 2 },
                    { day: "Thursday", simplify: 2, sketch: 1 },
                    { day: "Friday", simplify: 2, sketch: 0 },
                    { day: "Saturday", simplify: 1, sketch: 1 },
                    { day: "Sunday", simplify: 0, sketch: 2 },
                  ]}
                  xAxisKey="day"
                  dataKeys={[
                    { key: "simplify", label: "Simplify" },
                    { key: "sketch", label: "Sketch" },
                  ]}
                />
              </CardContent>
            </Card>
            <Card className="p-2 gap-0 bg-accent flex flex-col justify-between">
              <CardHeader className="p-0">
                <CardTitle className="text-center text-normal lg:text-xl font-light py-2">
                  AI Commits
                </CardTitle>
              </CardHeader>
              <CardContent>
                <StatsChart
                  className="hidden md:flex"
                  colour="blue"
                  data={[
                    { day: "Monday", simplify: 1, sketch: 0 },
                    { day: "Tuesday", simplify: 2, sketch: 1 },
                    { day: "Wednesday", simplify: 1, sketch: 2 },
                    { day: "Thursday", simplify: 2, sketch: 1 },
                    { day: "Friday", simplify: 2, sketch: 0 },
                    { day: "Saturday", simplify: 1, sketch: 1 },
                    { day: "Sunday", simplify: 0, sketch: 2 },
                  ]}
                  xAxisKey="day"
                  dataKeys={[
                    { key: "simplify", label: "Simplify" },
                    { key: "sketch", label: "Sketch" },
                  ]}
                />
              </CardContent>
            </Card>
          </CardContent>
        </Card>
        <Card className="flex flex-col col-span-3 xl:col-span-2">
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
                <Suspense fallback={<Skeleton />}>
                  <TabsContent
                    className="flex flex-col gap-2"
                    value="coursework"
                  >
                    {/* <CourseworkList finished={false} /> */}
                  </TabsContent>
                  <TabsContent className="flex flex-col gap-2" value="units">
                    <UnitList currentYear={year} finished={false} />
                  </TabsContent>
                </Suspense>
              </div>
            </Tabs>
          </CardContent>
        </Card>
        <Card className="flex flex-row xl:flex-col xl:w-full col-span-3 lg:col-span-3 xl:col-span-1">
          <CardContent className="flex flex-wrap flex-row xl:flex-col gap-4 m-0 h-full justify-evenly w-full">
            <Link
              href="/create/coursework"
              className="hover:bg-green-400/10 w-full"
            >
              <Card className="bg-green-400/10 p-2">
                <CardContent className="flex flex-row p-0 items-center gap-4">
                  <Plus className="xl:size-12 p-0"></Plus>
                  <p className="font-medium xl:text-lg">Create coursework</p>
                </CardContent>
              </Card>
            </Link>
            <Link href="/create/unit" className="hover:bg-green-400/10 w-full">
              <Card className="bg-green-400/10 p-2">
                <CardContent className="flex flex-row p-0 items-center gap-4">
                  <Plus className="xl:size-12 p-0"></Plus>
                  <p className="font-medium xl:text-lg">Create unit</p>
                </CardContent>
              </Card>
            </Link>
            <Link href="/edit" className="hover:bg-amber-400/10 w-full">
              <Card className="bg-amber-400/10 p-2">
                <CardContent className="flex flex-row p-0 items-center gap-4">
                  <Edit className="xl:size-12 p-0"></Edit>
                  <p className="font-medium xl:text-lg">Edit Deadline</p>
                </CardContent>
              </Card>
            </Link>
            <Link href="/end" className="hover:bg-red-400/10 w-full">
              <Card className="bg-red-400/10 p-2">
                <CardContent className="flex flex-row p-0 items-center gap-4">
                  <Flag className="xl:size-12 p-0"></Flag>
                  <p className="font-medium xl:text-lg">End submissions</p>
                </CardContent>
              </Card>
            </Link>
          </CardContent>
        </Card>
      </section>
    </div>
  );
}
