import { BookDashed } from "lucide-react";
import Coursework from "@/components/coursework/coursework";
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
  description: string;
  colour: string;
  creation_date: string;
  due_date: string;
};

type courseworkResponse = {
  courseworks: courseworkData[];
};

export default function UnitsCourseworkList({
  finished,
  courseworks,
  role,
}: {
  finished: boolean;
  courseworks: courseworkResponse;
  role: string;
}) {
  const hasPermissions = role === "lecturer" || role === "admin";
  const now = new Date();
  const courseworkListData = courseworks.courseworks;
  var filtered: courseworkData[] = [];
  if (courseworkListData) {
    filtered = courseworkListData.filter((coursework) => {
      const created = new Date(coursework.creation_date);
      const due = new Date(coursework.due_date);

      const isActive = now >= created && now <= due;

      if (finished) {
        return now > due;
      }

      return isActive;
    });
  }

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
      {filtered.length > 0 && (
        <div className={"flex flex-col gap-2"}>
          {filtered.map((coursework) => (
            <Coursework
              key={coursework.id}
              props={coursework}
              hasPermissions={hasPermissions}
            />
          ))}
        </div>
      )}
    </>
  );
}
