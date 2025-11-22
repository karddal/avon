"use client";

import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { Skeleton } from "@/components/ui/skeleton";

type courseworkData = {
  id: string;
  name: string;
  description: string;
  code: string;
  year: number;
  finished: boolean;
  color: string;
  creation_date: string;
  due_date: string;
  testsPassed: number;
  totalTests: number;
};

export default function CourseworkName() {
  const { slug } = useParams<{ slug: string }>();
  const [coursework, setCoursework] = useState<courseworkData | null>(null);

  useEffect(() => {
    const getData = async () => {
      try {
        const res = await fetch(`http://localhost:8000/coursework/${slug}`, {
          cache: "force-cache",
          credentials: "include",
        });
        if (!res.ok) throw new Error("Failed to fetch coursework");
        const courseWorkData: courseworkData = await res.json();
        setCoursework(courseWorkData);
      } catch (err) {
        console.error(err);
      }
    };

    if (slug) getData();
  }, [slug]);

  if (!coursework)
    return (
      <div className="flex flex-row gap-1">
        <Skeleton className="h-16 w-full bg-foreground/10"></Skeleton>
      </div>
    );

  return (
    <>
      <span className="font-light">{coursework.code}</span> {coursework.name}
    </>
  );
}
