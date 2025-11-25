import { PlusIcon } from "lucide-react";
import Link from "next/link";
import Coursework from "@/components/coursework";
import { Card, CardDescription, CardTitle } from "@/components/ui/card";

type courseworkData = {
  id: string;
  name: string;
  code: string;
  year: number;
  finished: boolean;
  colour: string;
  creation_date: string;
  due_date: string;
  testsPassed: number;
  totalTests: number;
};

export default async function CourseworkList({
  finished,
  token,
}: {
  finished: boolean;
  token?: string;
}) {
  const response = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL}/me/courseworks`,
    {
      method: "GET",
      headers: {
        Cookie: `access_token=${token}`,
        "Content-Type": "application/json",
      },
    },
  );

  if (!response.ok) {
    throw new Error("Failed to fetch coursework list");
  }

  const courseworkListData: courseworkData[] = await response.json();

  const now = new Date();

  const filtered = courseworkListData.filter((coursework) => {
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
      {
        filtered.length === 0 &&
        <div className="ml-2 border h-26 p-5">
          Nothing to see here!
        </div>
      }

      {filtered.length > 0 &&
        filtered.map((coursework) => (
          <Coursework key={coursework.id} props={coursework} />
        ))}
    </>
  );
}
