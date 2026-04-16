import { Info } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

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

export default function CourseworkDescription({
  slug,
  courseworkData,
}: {
  slug: string;
  courseworkData?: CourseworkData | null;
}) {
  const coursework = courseworkData;

  return (
    <div className="flex h-full flex-col gap-4">
      <Card id="coursework-description" className="h-full min-h-0">
        <CardHeader>
          <CardTitle>
            <div className="text-2xl flex flex-row gap-2 items-center">
              <Info />
              Description
            </div>
            <div className="font-light">
              Information about the coursework.
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent className="min-h-0 flex-1">
          <div className="h-full overflow-y-auto whitespace-pre-wrap rounded-md border bg-accent p-3">
            {coursework?.description ? (
              coursework.description
            ) : (
              <span className="text-muted-foreground italic">
                No description available.
              </span>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
