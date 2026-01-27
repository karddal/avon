import { Card, CardTitle } from "@/components/ui/card";
import { FileBracesCorner, SearchAlert } from "lucide-react";

export default function File({
  fileName,
  fileSize,
  fileDate,
  fileMarked,
}: {
  fileName: string;
  fileSize: string;
  fileDate: string;
  fileMarked: boolean;
}) {
  return (
    <Card className="flex flex-row gap-2 px-4 py-2 bg-card/60">
      <FileBracesCorner></FileBracesCorner>
      <div className="flex flex-row w-full justify-between items-center">
        <div className="flex flex-row gap-4 font-mono">
          <CardTitle>{fileName}</CardTitle>
        </div>
        <div className="flex flex-row gap-2 font-mono">
          {fileMarked ? (
            <></>
          ) : (
            <div className="bg-destructive text-background flex flex-row gap-2 px-2 justify-between">
              <SearchAlert></SearchAlert>Unmarked
            </div>
          )}
          <p>{fileSize}</p> - <p>{fileDate}</p>
        </div>
      </div>
    </Card>
  );
}
