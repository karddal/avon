import {
  CircleQuestionMark,
  FolderGit,
  GitCommitHorizontal,
  GitGraph,
} from "lucide-react";
import { Suspense } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@/components/ui/hover-card";
import { Skeleton } from "@/components/ui/skeleton";

function formatCommitDate(date: string | null) {
  if (!date) {
    return "Recent";
  }

  return new Date(date).toLocaleString("en-GB", {
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });
}

type CourseworkCommit = {
  id: string;
  web_url: string | null;
  title: string;
  short_id: string;
  author_name: string | null;
  authored_date: string | null;
  additions: number;
  deletions: number;
};

type StudentRepoDataType = {
  commits: CourseworkCommit[];
  repo_url: string;
  total_commits: number;
};

function StudentRepoActivityContent({
  myRepo,
}: {
  myRepo: StudentRepoDataType | null;
}) {
  const repo = myRepo;

  if (!repo) {
    return (
      <div className="flex min-h-full min-w-80 flex-1 items-center justify-center rounded-md border border-dashed p-4 text-sm">
        <Empty>
          <EmptyHeader>
            <EmptyMedia variant={"icon"}>
              <FolderGit />
            </EmptyMedia>
            <EmptyTitle>No coursework repository provisioned.</EmptyTitle>
            <EmptyDescription>
              No coursework repository has been provisioned for you yet, so no
              data is available. Please check back later, or ask your lecturer.
            </EmptyDescription>
          </EmptyHeader>
        </Empty>
      </div>
    );
  }

  return (
    <>
      <div className="flex min-h-full min-w-80 flex-1 flex-col justify-center space-y-2">
        {repo.commits.length > 0 ? (
          <div className="space-y-2">
            {repo.commits
              .slice(0, 3)
              .map((commit: CourseworkCommit, index: number) => (
                <a
                  key={commit.id}
                  href={commit.web_url ?? repo.repo_url}
                  target="_blank"
                  rel="noreferrer"
                  className={`block rounded-md border px-3 py-2 transition-colors ${
                    index === 0
                      ? "border-emerald-300 bg-emerald-50 hover:bg-emerald-100/80 dark:border-emerald-800 dark:bg-emerald-950/40 dark:hover:bg-emerald-950/60"
                      : "hover:bg-accent/40"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <GitCommitHorizontal
                      className={`mt-0.5 h-4 w-4 shrink-0 text-muted-foreground ${index === 0 ? "text-emerald-700 dark:text-emerald-300" : ""}`}
                    />
                    <div className="min-w-0 flex-1">
                      {index === 0 && (
                        <div className="mb-1 text-[11px] font-medium flex flex-row gap-2 items-center uppercase tracking-wide text-emerald-700 dark:text-emerald-300">
                          Current submission{" "}
                          <HoverCard openDelay={10} closeDelay={100}>
                            <HoverCardTrigger asChild>
                              <CircleQuestionMark className={""} />
                            </HoverCardTrigger>
                            <HoverCardContent
                              className={"flex w-64 flex-col gap-0.5 text-sm"}
                            >
                              <div className={"font-medium"}>What is this?</div>
                              <div>
                                The Avon Engine always marks the most recent
                                commit on the default branch. Ensure that when
                                the coursework deadline passes, the default
                                branch on your GitLab repository contains the
                                code that you wish to submit.
                              </div>
                            </HoverCardContent>
                          </HoverCard>
                        </div>
                      )}
                      <div className="truncate text-sm font-medium leading-5">
                        {commit.title}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {commit.short_id} · {commit.author_name ?? "Unknown"} ·{" "}
                        {formatCommitDate(commit.authored_date)}
                      </div>
                    </div>
                    <div className="flex shrink-0 items-center gap-3 self-center text-xs font-medium">
                      <span className="text-green-600">
                        +{commit.additions}
                      </span>
                      <span className="text-red-600">-{commit.deletions}</span>
                    </div>
                  </div>
                </a>
              ))}
          </div>
        ) : (
          <div className="flex min-h-full flex-1 items-center justify-center rounded-md border border-dashed p-4 text-sm">
            <Empty>
              <EmptyHeader>
                <EmptyMedia variant={"icon"}>
                  <GitCommitHorizontal />
                </EmptyMedia>
                <EmptyTitle>No commits.</EmptyTitle>
                <EmptyDescription>
                  No commits found yet. Your recent GitLab activity will appear
                  here once you start pushing changes. Please note that only
                  commits to the default branch will appear here.
                </EmptyDescription>
              </EmptyHeader>
            </Empty>
          </div>
        )}
      </div>
    </>
  );
}

function StudentRepoActivityFallback() {
  return (
    <div className="space-y-2">
      <Skeleton className="h-14 w-full" />
      <Skeleton className="h-14 w-full" />
      <Skeleton className="h-14 w-full" />
    </div>
  );
}

export default function StudentRepoActivity({
  slug,
  myRepo,
}: {
  slug: string;
  myRepo: StudentRepoDataType | null;
}) {
  void slug;
  return (
    <Card className="h-full min-h-0 overflow-hidden">
      <CardHeader className="shrink-0">
        <CardTitle>
          <div className="text-2xl flex flex-row items-center gap-2">
            <GitGraph />
            Recent Commits
          </div>
          <div className="font-light">
            Your coursework repository activity at a glance. We only show
            commits to the default branch here.
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent className="flex h-auto min-h-0 flex-1 flex-col space-y-4 overflow-auto">
        <Suspense fallback={<StudentRepoActivityFallback />}>
          <StudentRepoActivityContent myRepo={myRepo} />
        </Suspense>
      </CardContent>
    </Card>
  );
}
