"use client";
import axios from "axios";
import { PlusIcon } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import Coursework from "@/components/coursework";
import { Card, CardDescription, CardTitle } from "@/components/ui/card";

type courseworkData = {
  id: string;
  name: string;
  code: string;
  year: number;
  finished: boolean;
  color: string;
  creation_date: string;
  due_date: string;
  testsPassed: number;
  totalTests: number;
};

type CourseworkListProps = {
  finished: boolean;
};

export default function CourseworkList({ finished }: CourseworkListProps) {
  const [data, setData] = useState<courseworkData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    axios
      .get("http://localhost:8000/me/courseworks", { withCredentials: true })
      .then((response) => {
        const result = Array.isArray(response.data)
          ? response.data
          : response.data.units;
        setData(result || []);
      })
      .catch((err) => {
        console.error("Failed to fetch courseworks:", err);
        setData([]);
      })
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div></div>;

  const now = new Date();

  const filtered = data.filter((coursework) => {
    const created = new Date(coursework.creation_date);
    const due = new Date(coursework.due_date);

    const isActive = now >= created && now <= due;

    if (finished) {
      return now > due;
    }

    return isActive;
  });

  return (
    <>
      <Link href="/courseworks/create">
        <Card className="bg-muted/50 flex flex-row p-5 h-full items-center hover:bg-foreground/10">
          <PlusIcon size={50} />
          <div className="flex flex-col">
            <CardTitle className="text-xl font-medium">
              Add new Coursework
            </CardTitle>
            <CardDescription>Create a new coursework here.</CardDescription>
          </div>
        </Card>
      </Link>
      {filtered.length > 0 &&
        filtered.map((coursework) => (
          <Coursework key={coursework.id} props={coursework} />
        ))}
    </>
  );
}
