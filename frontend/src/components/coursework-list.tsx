"use client";
import axios from "axios";
import { useEffect, useState } from "react";
import Coursework from "./coursework";

type courseworkData = {
  id: string;
  name: string;
  code: string;
  year: number;
  finished: boolean;
  color: string;
  dueDate: string;
  testsPassed: number;
  totalTests: number;
};

export default function CourseworkList() {
  const [data, setData] = useState<courseworkData[]>([]);

  useEffect(() => {
    axios
      .get<courseworkData[]>("http://localhost:8000/me/courseworks", {
        withCredentials: true,
      })
      .then((response) => {
        setData(response.data);
        console.log(response.data);
      })
      .catch((error) => {
        console.error("Failed to fetch coursework:", error);
      });
  }, []);

  return (
    <section className="grid gap-4 grid-cols-1 lg:grid-cols-2">
      {data.map((unit, _id) => (
        <Coursework key={unit.id} props={unit} />
      ))}
    </section>
  );
}
