import { BellElectric, CalendarDays, Clock } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatIsoShortDate, formatIsoTime } from "@/lib/date-format";

// Helper to separate Time and Date for the "Ticker" look
function parseDateTime(dateStr: string) {
  const time = formatIsoTime(dateStr);
  const day = formatIsoShortDate(dateStr);
  return { time, day };
}

type CourseworkData = {
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

export default async function CourseworkInformation({
  slug,
  courseworkData,
}: {
  slug: string;
  courseworkData?: CourseworkData | null;
}) {
  void slug;
  const coursework = courseworkData;
  const start = coursework
    ? parseDateTime(coursework.creation_date)
    : { time: "", day: "" };
  const end = coursework
    ? parseDateTime(coursework.due_date)
    : { time: "", day: "" };

  return (
    <Card data-cy="coursework-information-section" className="h-full">
      <CardHeader className="flex flex-col">
        <CardTitle>
          <div className="text-2xl flex flex-row items-center gap-2">
            <BellElectric />
            Information
          </div>
          <div className="font-light">
            Information about the coursework is shown below.
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent>
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
      </CardContent>
    </Card>
  );
}
