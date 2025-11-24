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

export default function UnitName() {
  const { slug } = useParams<{ slug: string }>();
  const [unit, setUnit] = useState<UnitData | null>(null);

  useEffect(() => {
    const getData = async () => {
      try {
        const unitRes = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/units/${slug}`,
          {
            cache: "force-cache",
            credentials: "include",
          },
        );
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
      <div className="flex flex-row gap-1">
        <Skeleton className="h-16 w-full bg-foreground/10"></Skeleton>
      </div>
    );

  return (
    <>
      <span className="font-light">COMS00000</span> {unit.name}
    </>
  );
}
