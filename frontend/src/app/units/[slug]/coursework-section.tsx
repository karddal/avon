"use client";

import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import Coursework from "@/components/coursework";
import { Skeleton } from "@/components/ui/skeleton";

type courseworkData = {
  id: string;
  name: string;
  code: string;
  year: number;
  finished: boolean;
  color: string;
  due_date: string;
  testsPassed: number;
  totalTests: number;
};

export default function CourseworkSection() {
  const { slug } = useParams<{ slug: string }>();
  const [courseworks, setCourseworks] = useState<courseworkData[]>();

  useEffect(() => {
    const getData = async () => {
      try {
        const cwRes = await fetch(
          `http://localhost:8000/units/${slug}/courseworks`,
          {
            cache: "force-cache",
            credentials: "include",
          },
        );
        if (!cwRes.ok) throw new Error("Failed to fetch courseworks");
        const cwData = await cwRes.json();
        const courseworkData = cwData.courseworks;
        console.log("courseworkData", courseworkData);
        // Ensure it’s an array before setting
        setCourseworks(Array.isArray(courseworkData) ? courseworkData : []);
      } catch (err) {
        console.error(err);
      }
    };

    if (slug) getData();
  }, [slug]);

  if (!courseworks)
    return (
      <>
        {Array.from({ length: 3 }).map(() => (
          <div
            key={crypto.randomUUID()}
            className="flex-1 flex flex-col gap-2 h-full"
          >
            <Skeleton className="h-2 w-full bg-foreground/10" />
            <Skeleton className="flex-1 w-full bg-foreground/10" />
          </div>
        ))}
      </>
    );

  return (
    <>
      {courseworks.map((coursework) => (
        <Coursework key={coursework.id} props={coursework} />
      ))}
    </>
  );
}
