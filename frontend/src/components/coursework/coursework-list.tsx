import { BookDashed } from "lucide-react";
import Coursework from "@/components/coursework/coursework";
import { getRequestJWT } from "@/lib/auth-utils";
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "../ui/empty";

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
}: {
  finished: boolean;
}) {
  const token = await getRequestJWT();
  const response = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL}/me/courseworks`,
    {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      cache: "no-cache",
    },
  );

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
            <EmptyTitle>No courseworks.</EmptyTitle>
            <EmptyDescription>
              No courseworks were found that you are connected to.
            </EmptyDescription>
          </EmptyHeader>
        </Empty>
      )}
      {filtered.length > 0 &&
        filtered.map((coursework) => (
          <Coursework key={coursework.id} props={coursework} />
        ))}
    </>
  );
}
