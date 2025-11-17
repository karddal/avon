"use client";
import axios from "axios";
import { useEffect, useState } from "react";
import Loading from "@/app/coursework/loading";
import Coursework from "./coursework";

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
    <section className="grid gap-4 grid-cols-1 lg:grid-cols-2">
      {data.map((unit) => (
        <Coursework key={unit.id} props={unit} />
      ))}
    </section>
  );
}
