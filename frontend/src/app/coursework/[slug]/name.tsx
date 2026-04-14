import { Undo2 } from "lucide-react";
import Link from "next/link";

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

type courseworkUnitData = {
  unit_id: string;
};

export default async function CourseworkName({
  slug,
  token,
}: {
  slug: string;
  token?: string;
}) {
  const res = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL}/coursework/${slug}`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    },
  );

  if (!res.ok) {
    throw new Error("Failed to fetch coursework");
  }

  const unitRes = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL}/coursework/${slug}/unit`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      cache: "no-cache",
    },
  );

  if (!unitRes.ok) {
    throw new Error("Failed to fetch coursework unit");
  }

  const coursework: courseworkData = await res.json();
  const courseworkUnit: courseworkUnitData = await unitRes.json();

  return (
    <div className="flex items-center gap-3">
      <Link href={`/units/${courseworkUnit.unit_id}`} className="shrink-0">
        <Undo2 className="h-7 w-7" />
      </Link>
      <div className="text-3xl lg:text-5xl">{coursework.name}</div>
    </div>
  );
}
