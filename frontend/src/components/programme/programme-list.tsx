import { BookDashed } from "lucide-react";
import Coursework from "@/components/coursework/coursework";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { getRequestJWT, requireAdminSession, requireSession } from "@/lib/auth-utils";
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "../ui/empty";
import Programme from "./programme";

type ProgrammeData = {
  id: string;
  name: string;
  start_date: string;
  end_date: string;
};

export default async function ProgrammeList({
  finished,
  upcoming,
}: {
  finished: boolean;
  upcoming: boolean;
}) {
  const token = await getRequestJWT();
  const s = await requireAdminSession();
  const role = s.user.role;
  const hasPermissions = role === "admin";
  const response = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL}/programmes/all`,
    {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      cache: "no-cache",
    },
  );
  const programmeListData: ProgrammeData[] = await response.json();

  const now = new Date();


  const filteredCourseworks = programmeListData.filter((programme) => {
    const created = new Date(programme.start_date);
    const due = new Date(programme.end_date);

    const isActive = now >= created && now <= due;

    if (upcoming) {
        return now < created;
    }
    if (finished) {
      return now > due;
    }

    return isActive;
  });

  return (
    <>
      {filteredCourseworks.length === 0 && (
        <Empty className="border-dashed border-2 bg-muted/20 py-12">
          <EmptyHeader>
            <EmptyMedia variant="icon">
              <BookDashed className="text-muted-foreground/50" />
            </EmptyMedia>
            <EmptyTitle>No Programmes found</EmptyTitle>
            <EmptyDescription>
              We couldn't find any programmes that you are connected to.
            </EmptyDescription>
          </EmptyHeader>
        </Empty>
      )}
      {filteredCourseworks.length > 0 && (
        <>
            {filteredCourseworks.map((programme) => (
            <Programme
                key={programme.id}
                hasPermissions={hasPermissions}
                props={{
                id: programme.id,
                name: programme.name,
                start_date: programme.start_date,
                end_date: programme.end_date,
                }}
            />
            ))}
        </>
      )}
    </>
  );
}
