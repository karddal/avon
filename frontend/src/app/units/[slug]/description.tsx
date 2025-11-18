"use client";

import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { Skeleton } from "@/components/ui/skeleton";

type UnitData = {
  id: string;
  name: string;
  description?: string;
  creation_date: string;
};

export default function UnitDescription() {
  const { slug } = useParams<{ slug: string }>();
  const [unit, setUnit] = useState<UnitData | null>(null);

  useEffect(() => {
    const getData = async () => {
      try {
        const unitRes = await fetch(`http://localhost:8000/units/${slug}`, {
          cache: "force-cache",
          credentials: "include",
        });
        if (!unitRes.ok) throw new Error("Failed to fetch unit");
        const unitData: UnitData = await unitRes.json();
        setUnit(unitData);
      } catch (err) {
        console.error(err);
      }
    };

    if (slug) getData();
  }, [slug]);

  if (!unit)
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
      {unit.description ? (
        unit.description
      ) : (
        <span className="text-muted-foreground italic">
          No description available.
        </span>
      )}
    </div>
  );
}
