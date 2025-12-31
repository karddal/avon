import Coursework from "@/components/coursework";
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "./ui/empty";
import { BookDashed } from "lucide-react";

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
      {filtered.length === 0 && (
        <Empty>
          <EmptyHeader>
            <EmptyMedia variant="icon">
              <BookDashed />
            </EmptyMedia>
            <EmptyTitle>No Units.</EmptyTitle>
            <EmptyDescription>
              No units were found that you are connected to.
            </EmptyDescription>
          </EmptyHeader>
        </Empty>
      )}
      <section className="grid gap-4 grid-cols-1 lg:grid-cols-2">
        {filtered.length > 0 &&
          filtered.map((coursework) => (
            <Coursework key={coursework.id} props={coursework} />
          ))}
      </section>
    </>
  );
}
