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

export default function CourseworkDescription() {
  const { slug } = useParams<{ slug: string }>();
  const [coursework, setCoursework] = useState<courseworkData | null>(null);

  useEffect(() => {
    const getData = async () => {
      try {
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/coursework/${slug}`,
          {
            cache: "force-cache",
            credentials: "include",
          }
        );
        if (!res.ok) throw new Error("Failed to fetch unit");
        const courseworkData: courseworkData = await res.json();
        setCoursework(courseworkData);
      } catch (err) {
        console.error(err);
      }
    };

    if (slug) getData();
  }, [slug]);

  if (!coursework)
    return (
      <div className="flex flex-col overflow-y-auto break-words h-32 border bg-accent p-2 gap-2">
        <Skeleton className="flex-1 w-full bg-foreground/10"></Skeleton>
        <Skeleton className="flex-1 w-full bg-foreground/10"></Skeleton>
        <Skeleton className="flex-1 w-full bg-foreground/10"></Skeleton>
        <Skeleton className="flex-1 w-full bg-foreground/10"></Skeleton>
        <Skeleton className="flex-1 w-full bg-foreground/10"></Skeleton>
      </div>
    );

  return (
    <div className="flex flex-col overflow-y-auto break-words h-32 border bg-accent p-2">
      {coursework.description ? (
        coursework.description
      ) : (
        <span className="text-muted-foreground italic">
          No description available.
        </span>
      )}
    </div>
  );
}
