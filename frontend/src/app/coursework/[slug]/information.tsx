"use client";

import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { DropdownCard } from "@/components/dropdown-card";
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

function formatDateTimeString(dateStr: string): string {
  const date = new Date(dateStr);
  const day = String(date.getDate()).padStart(2, "0");
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const year = String(date.getFullYear()).slice(-2);
  const hours = String(date.getHours()).padStart(2, "0");
  const minutes = String(date.getMinutes()).padStart(2, "0");

  return `${day}/${month}/${year} at ${hours}:${minutes}`;
}

export default function CourseworkInformation() {
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
        <Skeleton className="h-20 w-full bg-foreground/10"></Skeleton>
      </div>
    );

  const start_date = formatDateTimeString(coursework.creation_date);
  const end_date = formatDateTimeString(coursework.due_date);

  return (
    <DropdownCard
      title={"Information"}
      desc={"Important information about the coursework appears here."}
    >
      <p>
        <strong>Set date:</strong> {start_date}
      </p>
      <p>
        <strong>Due date:</strong> {end_date}
      </p>
    </DropdownCard>
  );
}
