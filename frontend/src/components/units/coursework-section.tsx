import { NotepadTextDashed } from "lucide-react";
import Coursework from "@/components/coursework/coursework";
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";
import { requireSession } from "@/lib/auth-utils";

type courseworkData = {
  id: string;
  name: string;
  code: string;
  year: number;
  description: string;
  finished: boolean;
  colour: string;
  creation_date: string;
  due_date: string;
  testsPassed: number;
  totalTests: number;
};

export default async function CourseworkSection({
  slug,
  token,
}: {
  slug: string;
  token?: string;
}) {
  const response = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL}/units/${slug}/courseworks`,
    {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    },
  );
  const s = await requireSession();
  const role = s.user.role;
  const hasPermissions = role === "lecturer" || role === "admin";

  const data = await response.json();
  const courseworks: courseworkData[] = Array.isArray(data.courseworks)
    ? data.courseworks
    : [];

  if (courseworks.length === 0) {
    return (
      <Empty>
        <EmptyHeader>
          <EmptyMedia variant="icon">
            <NotepadTextDashed />
          </EmptyMedia>
          <EmptyTitle>No courseworks.</EmptyTitle>
          <EmptyDescription>No courseworks found.</EmptyDescription>
        </EmptyHeader>
      </Empty>
    );
  }
  return (
    <>
      {courseworks.map((coursework) => (
        <Coursework
          key={coursework.id}
          props={coursework}
          hasPermissions={hasPermissions}
        />
      ))}
    </>
  );
}
