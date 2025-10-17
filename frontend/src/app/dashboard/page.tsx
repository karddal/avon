"use client";

import { Edit, Flag, Plus, Settings } from "lucide-react";
import Link from "next/link";
import { Suspense, useState } from "react";
import { StatsChart } from "@/components/stats-chart";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsTrigger, TabsList } from "@/components/ui/tabs";
import Unit from "@/components/unit";

export default function DashboardPage() {
  const apiCall = [
    {
      id: 0,
      name: "Imperative and Functional Programming",
      code: "COMS100016",
      year: "2024/2025",
      finished: true,
      color: "blue",
      mark: 76,
      courseworkLive: false,
    },
    {
      id: 1,
      name: "Computer Architecure",
      code: "COMS100015",
      year: "2024/2025",
      finished: true,
      color: "amber",
      mark: 69,
      courseworkLive: false,
    },
    {
      id: 2,
      name: "Mathematics for Computer Science A",
      code: "COMS100014",
      year: "2024/2025",
      finished: true,
      color: "teal",
      mark: 68,
      courseworkLive: false,
    },
    {
      id: 3,
      name: "Object Oriented Programming and Algorithms",
      code: "COMS100018",
      year: "2024/2025",
      finished: true,
      color: "emerald",
      mark: 77,
      courseworkLive: false,
    },
    {
      id: 4,
      name: "Software Tools",
      code: "COMS100012",
      year: "2024/2025",
      finished: true,
      color: "rose",
      mark: 65,
      courseworkLive: false,
    },
    {
      id: 5,
      name: "Mathematics for Computer Science B",
      code: "COMS100013",
      year: "2024/2025",
      finished: true,
      color: "purple",
      mark: 89,
      courseworkLive: false,
    },
    {
      id: 6,
      name: "Programming Languages and Computation",
      code: "COMS100016",
      year: "2025/2026",
      finished: true,
      color: "blue",
      mark: 70,
      courseworkLive: false,
    },
    {
      id: 7,
      name: "Interaction and Society",
      code: "COMS100015",
      year: "2025/2026",
      finished: false,
      color: "amber",
      mark: 0,
      courseworkLive: false,
    },
    {
      id: 8,
      name: "Computer Systems A",
      code: "COMS100014",
      year: "2025/2026",
      finished: true,
      color: "teal",
      mark: 70,
      courseworkLive: false,
    },
    {
      id: 9,
      name: "Computer Systems B",
      code: "COMS100018",
      year: "2025/2026",
      finished: false,
      color: "emerald",
      mark: 0,
      courseworkLive: false,
    },
    {
      id: 10,
      name: "Algorithms and Data",
      code: "COMS100012",
      year: "2025/2026",
      finished: false,
      color: "rose",
      mark: 0,
      courseworkLive: true,
    },
    {
      id: 11,
      name: "Software Engineering Project",
      code: "COMS100013",
      year: "2025/2026",
      finished: false,
      color: "purple",
      mark: 0,
      courseworkLive: true,
    },
  ];

  const latestYear = "2025";
  const [year, setYear] = useState(latestYear);
  const nextYear = (parseInt(year, 10) + 1).toString();
  const currentAcademicYear: string = `${parseInt(year, 10)}/${parseInt(
    nextYear,
    10
  )}`;

  const byYear = apiCall.filter((unit) => unit.year === currentAcademicYear);
  const ongoing = byYear.filter((unit) => unit.finished === false);
  const ongoingSorted = ongoing.sort(
    (a, b) => Number(b.courseworkLive) - Number(a.courseworkLive)
  );
  const ongoingUnits = ongoingSorted.map((unit) => (
    <Unit key={unit.id} props={unit} />
  ));
  return (
    <div className="space-y-6 mb-2">
      <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <Card className="col-span-3 gap-0">
          <CardContent className="grid xl:grid-cols-4 grid-cols-2 gap-4">
            <Card className="p-2 gap-0 bg-accent flex flex-col justify-between">
              <CardHeader>
                <CardTitle className="text-center text-xl font-light py-2">
                  Commits
                </CardTitle>
              </CardHeader>
              <CardContent>
                <StatsChart
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
              <CardHeader>
                <CardTitle className="text-center text-xl font-light py-2">
                  Tests passed
                </CardTitle>
              </CardHeader>
              <CardContent>
                <StatsChart
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
            <Card className="p-2 gap-0 bg-accent flex flex-col justify-between">
              <CardHeader>
                <CardTitle className="text-center text-xl font-light py-2">
                  Late submissions
                </CardTitle>
              </CardHeader>
              <CardContent>
                <StatsChart
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
              <CardHeader>
                <CardTitle className="text-center text-xl font-light py-2">
                  AI Commits
                </CardTitle>
              </CardHeader>
              <CardContent>
                <StatsChart
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
              <TabsList>
                <TabsTrigger value="coursework">Coursework</TabsTrigger>
                <TabsTrigger value="units">Units</TabsTrigger>
              </TabsList>
              <div className="gap-2 overflow-y-auto flex flex-col h-96">
                <Suspense fallback={<Skeleton />}>
                  <TabsContent
                    className="flex flex-col gap-2"
                    value="coursework"
                  ></TabsContent>
                  <TabsContent className="flex flex-col gap-2" value="units">
                    {ongoingUnits}
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
                  <p className="font-semibold xl:text-lg">Create coursework</p>
                </CardContent>
              </Card>
            </Link>
            <Link href="/create/unit" className="hover:bg-green-400/10 w-full">
              <Card className="bg-green-400/10 p-2">
                <CardContent className="flex flex-row p-0 items-center gap-4">
                  <Plus className="xl:size-12 p-0"></Plus>
                  <p className="font-semibold xl:text-lg">Create unit</p>
                </CardContent>
              </Card>
            </Link>
            <Link href="/edit" className="hover:bg-amber-400/10 w-full">
              <Card className="bg-amber-400/10 p-2">
                <CardContent className="flex flex-row p-0 items-center gap-4">
                  <Edit className="xl:size-12 p-0"></Edit>
                  <p className="font-semibold xl:text-lg">Edit Deadline</p>
                </CardContent>
              </Card>
            </Link>
            <Link href="/end" className="hover:bg-red-400/10 w-full">
              <Card className="bg-red-400/10 p-2">
                <CardContent className="flex flex-row p-0 items-center gap-4">
                  <Flag className="xl:size-12 p-0"></Flag>
                  <p className="font-semibold xl:text-lg">End submissions</p>
                </CardContent>
              </Card>
            </Link>
          </CardContent>
        </Card>
      </section>
    </div>
  );
}
