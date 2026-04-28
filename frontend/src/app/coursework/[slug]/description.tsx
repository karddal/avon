import { Info } from "lucide-react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
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
  void slug;
  const coursework = courseworkData;

  return (
    <div className="flex h-full min-h-0 flex-col gap-4">
      <Card
        data-cy="coursework-description-section"
        id="coursework-description"
        className="h-full min-h-0 overflow-hidden"
      >
        <CardHeader>
          <CardTitle>
            <div className="text-2xl flex flex-row gap-2 items-center">
              <Info />
              Description
            </div>
            <div className="font-light">Information about the coursework.</div>
          </CardTitle>
        </CardHeader>
        <CardContent className="flex min-h-0 flex-1 flex-col">
          <div
            data-cy="coursework-description-content"
            className="flex-1 min-h-0 overflow-y-auto whitespace-pre-wrap wrap-break-word rounded-md border bg-accent p-3"
          >
            {coursework?.description ? (
              <div className="prose prose-sm max-w-none dark:prose-invert">
                <ReactMarkdown remarkPlugins={[remarkGfm]}>
                  {coursework.description}
                </ReactMarkdown>
              </div>
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
