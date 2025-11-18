"use client";
import axios from "axios";
import { useEffect, useState } from "react";
import Unit from "@/components/unit";

type UnitData = {
  id: string;
  name: string;
  description?: string;
  creation_date: string;
};

type UnitListProps = {
  currentYear: number;
  finished: boolean;
};

export default function UnitList({ currentYear, finished }: UnitListProps) {
  const [data, setData] = useState<UnitData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    axios
      .get("http://localhost:8000/me/units", { withCredentials: true })
      .then((response) => {
        console.log(response.data);
        const result = Array.isArray(response.data)
          ? response.data
          : response.data.units;
        setData(result || []);
      })
      .catch((err) => {
        console.error("Failed to fetch units:", err);
        setData([]);
      })
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div></div>;

  //  academic year window: Sept 1 -> Aug 31
  const start = new Date(currentYear, 8, 1); // Sept = month 8
  const end = new Date(currentYear + 1, 7, 31, 23, 59, 59, 999);

  const filtered = data.filter((unit) => {
    const created = new Date(unit.creation_date);
    const inRange = created >= start && created <= end;
    if (finished) {
      return created < start; // anything before this year
    }
    return inRange; // ongoing = within this year
  });

  return (
    <section className="grid gap-4 grid-cols-1 lg:grid-cols-2">
      {filtered.length > 0 ? (
        filtered.map((unit) => <Unit key={unit.id} props={unit} />)
      ) : (
        <p className="text-muted-foreground col-span-full text-center py-4">
          No {finished ? "finished" : "ongoing"} units for {currentYear}/
          {currentYear + 1}
        </p>
      )}
    </section>
  );
}
