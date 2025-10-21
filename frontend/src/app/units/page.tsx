"use client";

import { useEffect, useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import Unit from "@/components/unit";
import YearSelector from "@/components/year-selector";

export default function UnitPage() {
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

  // We get this through our API call and to toggle between ongoing and finished
  const latestYear = "2025";
  const [year, setYear] = useState(latestYear);
  const nextYear = (parseInt(year, 10) + 1).toString();
  const nextLatestYear = (parseInt(year, 10) + 1).toString();
  const currentAcademicYear: string = `${parseInt(year, 10)}/${parseInt(nextYear, 10)}`;
  const latestAcademicYear: string = `${parseInt(latestYear, 10)}/${parseInt(nextLatestYear, 10)}`;
  console.log("Academic Year", currentAcademicYear);

  const byYear = apiCall.filter((unit) => unit.year === currentAcademicYear);
  const ongoing = byYear.filter((unit) => unit.finished === false);
  const ongoingSorted = ongoing.sort(
    (a, b) => Number(b.courseworkLive) - Number(a.courseworkLive),
  );
  const ongoingUnits = ongoingSorted.map((unit) => (
    <Unit key={unit.id} props={unit} />
  ));

  const finished = byYear.filter((unit) => unit.finished === true);
  const finishedUnits = finished.map((unit) => (
    <Unit key={unit.id} props={unit} />
  ));

  // Changing ongoing to completed based on the year
  const [activeTab, setActiveTab] = useState(
    currentAcademicYear === latestAcademicYear ? "ongoing" : "finished",
  );

  useEffect(() => {
    currentAcademicYear === latestAcademicYear
      ? setActiveTab("ongoing")
      : setActiveTab("finished");
  }, [currentAcademicYear, latestAcademicYear]);

  // Weird logic so that when you hover the tab trigger that isnt selected then it changes to a cursor
  const ongoingHover = activeTab === "ongoing" ? "" : "hover:cursor-pointer";
  const finishedHover = activeTab === "finished" ? "" : "hover:cursor-pointer";
  const currentYear =
    currentAcademicYear === latestAcademicYear ? "" : "hidden";
  return (
    <div className="space-y-6">
      {/* <YearSelector /> */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="flex flex-row gap-4 bg-background">
          <YearSelector value={year} setValue={setYear} />
          <div className="bg-accent p-1">
            <TabsTrigger
              className={`${currentYear} ${ongoingHover} bg-accent`}
              value="ongoing"
            >
              Ongoing
            </TabsTrigger>
            <TabsTrigger
              className={`bg-accent ${finishedHover}`}
              value="finished"
            >
              Finished
            </TabsTrigger>
          </div>
        </TabsList>
        <TabsContent value="ongoing">
          <section className="grid gap-4 grid-cols-1 lg:grid-cols-2">
            {ongoingUnits}
          </section>
        </TabsContent>
        <TabsContent value="finished">
          <section className="grid gap-4 grid-cols-1 lg:grid-cols-2">
            {finishedUnits}
          </section>
        </TabsContent>
      </Tabs>
    </div>
  );
}
