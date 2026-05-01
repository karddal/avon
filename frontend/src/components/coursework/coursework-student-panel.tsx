import {
  GitCommitHorizontal,
  GitFork,
  HeartHandshake,
  Timer,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function CourseworkStudentPanel() {
  return (
    <Card className="h-full min-h-0 overflow-hidden">
      <CardHeader className="shrink-0">
        <CardTitle>
          <div className="text-2xl flex flex-row items-center gap-2">
            <HeartHandshake />
            Getting Started
          </div>
          <div className="font-light">
            A short checklist for working on this coursework.
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent className="grid h-auto min-h-0 flex-1 min-w-80 gap-3 overflow-auto md:grid-cols-3">
        <div className="rounded-md border bg-accent/40 p-4">
          <div className="mb-2 flex items-center gap-2 text-sm text-muted-foreground">
            <GitFork className="h-4 w-4" />
            Repository
          </div>
          <p className="text-sm leading-6">
            Make sure you know where your coursework repo is and start from the
            provided project structure.
          </p>
        </div>
        <div className="rounded-md border bg-accent/40 p-4">
          <div className="mb-2 flex items-center gap-2 text-sm text-muted-foreground">
            <GitCommitHorizontal className="h-4 w-4" />
            Commits
          </div>
          <p className="text-sm leading-6">
            Commit regularly as you build. Small, clear commits make recovery
            and review much easier.
          </p>
        </div>
        <div className="rounded-md border bg-accent/40 p-4">
          <div className="mb-2 flex items-center gap-2 text-sm text-muted-foreground">
            <Timer className="h-4 w-4" />
            Timing
          </div>
          <p className="text-sm leading-6">
            Leave time for testing and a final submission check before the
            deadline.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
