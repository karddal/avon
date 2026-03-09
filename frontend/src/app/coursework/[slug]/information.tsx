import { CalendarDays, Clock } from "lucide-react";
import { DropdownCard } from "@/components/dropdown-card";

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

// Helper to separate Time and Date for the "Ticker" look
function parseDateTime(dateStr: string) {
  const date = new Date(dateStr);
  const time = date.toLocaleTimeString("en-GB", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });
  const day = date.toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "2-digit",
  });
  return { time, day };
}

export default async function CourseworkInformation({
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

  if (!res.ok) throw new Error("Failed to fetch coursework");

  const coursework: courseworkData = await res.json();
  const start = parseDateTime(coursework.creation_date);
  const end = parseDateTime(coursework.due_date);

  return (
    <DropdownCard
      title={"Information"}
      desc={"Deadlines and scheduling details."}
      openByDefault={true}
      className="h-full"
    >
      <div className="flex flex-row items-center justify-evenly gap-8 py-4">
        <div className="flex flex-col gap-2">
          <span className="text-sm font-bold uppercase tracking-widest text-muted-foreground flex items-center gap-2">
            <Clock className="w-3 h-3" /> Set Date
          </span>
          <div className="flex flex-col">
            <h2 className="text-4xl font-mono font-black tracking-tighter tabular-nums">
              {start.time}
            </h2>
            <p className="text-sm font-medium text-muted-foreground mt-1">
              {start.day}
            </p>
          </div>
        </div>

        <div className="flex flex-col gap-2">
          <span className="text-sm font-bold uppercase tracking-widest text-destructive flex items-center gap-2">
            <CalendarDays className="w-3 h-3" /> Due Date
          </span>
          <div className="flex flex-col">
            <h2 className="text-4xl font-mono font-black tracking-tighter tabular-nums text-destructive">
              {end.time}
            </h2>
            <p className="text-sm font-medium text-muted-foreground mt-1">
              {end.day}
            </p>
          </div>
        </div>
      </div>
    </DropdownCard>
  );
}
