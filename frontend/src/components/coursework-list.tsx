"use client";
import axios from "axios";
import { useEffect, useState } from "react";
import Loading from "@/app/coursework/loading";
import Coursework from "./coursework";
import Link from "next/link";
import { Card, CardDescription, CardTitle } from "@/components/ui/card";
import { PlusIcon } from "lucide-react";

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

export default function CourseworkList() {
  const [data, setData] = useState<courseworkData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    axios
      .get<courseworkData[]>("http://localhost:8000/me/courseworks", {
        withCredentials: true,
      })
      .then((response) => {
        setData(response.data);
        setLoading(false);
      })
      .catch((error) => {
        console.error("Failed to fetch coursework:", error);
        setLoading(false);
      });
  }, []);

  if (loading) return <Loading />;

  return (
    <>
      <Link href="/units/coursework">
        <Card className="bg-muted/50 flex flex-row p-5 h-full items-center hover:bg-foreground/10">
          <PlusIcon size={50}></PlusIcon>
          <div className="flex flex-col">
            <CardTitle className="text-xl font-medium">
              Add new Coursework
            </CardTitle>
            <CardDescription>Create a new coursework here.</CardDescription>
          </div>
        </Card>
      </Link>
      {data.map((unit) => (
        <Coursework key={unit.id} props={unit} />
      ))}
    </>
  );
}
