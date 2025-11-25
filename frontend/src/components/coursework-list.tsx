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
  color: string;
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
