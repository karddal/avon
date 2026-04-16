import {
  Activity,
  ExternalLink,
  GitCommitHorizontal,
  GitFork,
  PencilLine,
  Sparkles,
  ZapOff,
} from "lucide-react";
import Link from "next/link";
import { Suspense } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";
import { Skeleton } from "@/components/ui/skeleton";
import { get_my_coursework_repo } from "@/lib/actions/coursework/get_my_coursework_repo";
import { formatIsoDateTime } from "@/lib/date-format";

function formatCommitDate(date: string | null) {
  if (!date) {
    return "No activity yet";
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

function StudentRepoOverviewContent({
  myRepo,
}: {
  myRepo: StudentRepoDataType | null;
}) {
  const repo = myRepo;

  if (!repo) {
    return (
      <div className="border border-dashed p-4 text-sm h-full">
        <Empty>
          <EmptyHeader>
            <EmptyMedia variant={"icon"}>
              <ZapOff />
            </EmptyMedia>
            <EmptyTitle>No data.</EmptyTitle>
            <EmptyDescription>
              We can't show any data here because we don't have a repository on
              file for you. Please check back later, or ask your lecturer.
            </EmptyDescription>
          </EmptyHeader>
        </Empty>
      </div>
    );
  }

  const commitCount = repo.total_commits;
  const linesChanged = repo.commits.reduce(
    (total: number, commit: any) => total + commit.additions + commit.deletions,
    0,
  );
  const latestCommit = repo.commits[0];

  return (
    <div className="space-y-3">
      <a
        href={repo.repo_url}
        target="_blank"
        rel="noreferrer"
        className="flex w-full items-center justify-between gap-3 rounded-md border bg-accent/40 px-4 py-3 transition-colors hover:bg-accent"
      >
        <div className="min-w-0">
          <div className="flex items-center gap-2 text-xs font-medium uppercase tracking-wide text-muted-foreground">
            <GitFork className="h-4 w-4" />
            Repository
          </div>
          <div className="truncate text-sm font-medium">{repo.repo_url}</div>
        </div>
        <ExternalLink className="h-4 w-4 shrink-0" />
      </a>

      <div className="grid gap-3 md:grid-cols-3">
        <div className="rounded-md border border-emerald-300 bg-emerald-50 p-4 text-emerald-950 dark:border-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-100">
          <div className="mb-2 flex items-center gap-2 text-xs font-medium uppercase tracking-wide text-emerald-700 dark:text-emerald-300">
            <GitCommitHorizontal className="h-4 w-4" />
            Number of Commits
          </div>
          <div className="text-3xl font-semibold">{commitCount}</div>
          <p className="mt-2 text-sm text-emerald-800 dark:text-emerald-200">
            Total number of commits in your repository.
          </p>
        </div>

        <div className="rounded-md border border-sky-300 bg-sky-50 p-4 text-sky-950 dark:border-sky-800 dark:bg-sky-950/40 dark:text-sky-100">
          <div className="mb-2 flex items-center gap-2 text-xs font-medium uppercase tracking-wide text-sky-700 dark:text-sky-300">
            <PencilLine className="h-4 w-4" />
            Lines Changed
          </div>
          <div className="text-3xl font-semibold">{linesChanged}</div>
          <p className="mt-2 text-sm text-sky-800 dark:text-sky-200">
            Total additions and deletions across recent commits.
          </p>
        </div>

        <div className="rounded-md border border-amber-300 bg-amber-50 p-4 text-amber-950 dark:border-amber-800 dark:bg-amber-950/40 dark:text-amber-100">
          <div className="mb-4 flex items-center gap-2 text-xs font-medium uppercase tracking-wide text-amber-700 dark:text-amber-300">
            <Sparkles className="h-4 w-4" />
            Latest Default Branch Activity
          </div>
          <div className="truncate text-lg font-semibold">
            {latestCommit?.title ?? "No commits yet"}
          </div>
          {latestCommit ? (
            <div className="mt-1 space-y-1 text-sm text-amber-800 dark:text-amber-200">
              <p>{formatCommitDate(latestCommit.authored_date)}</p>
              <p className="line-clamp-2">
                by{" "}
                <Link
                  className="underline"
                  href={`https://gitlab.com/${latestCommit.author_name}`}
                  target="_blank"
                >
                  {latestCommit.author_name}
                </Link>
              </p>
            </div>
          ) : (
            <p className="mt-2 text-sm text-amber-800 dark:text-amber-200">
              Push a commit to start building activity here.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

function StudentRepoOverviewFallback() {
  return (
    <div className="space-y-3">
      <Skeleton className="h-14 w-full" />
      <div className="grid gap-3 md:grid-cols-3">
        <Skeleton className="h-36 w-full" />
        <Skeleton className="h-36 w-full" />
        <Skeleton className="h-36 w-full" />
      </div>
    </div>
  );
}

export default function StudentRepoOverview({
  slug,
  myRepo,
}: {
  slug: string;
  myRepo: StudentRepoDataType | null;
}) {
  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle>
          <div className="text-2xl flex flex-row items-center gap-2">
            <Activity />
            Repository Overview
          </div>
          <div className="font-light">
            A quick read on your recent coursework repository activity.
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent className="min-h-0 flex-1">
        <Suspense fallback={<StudentRepoOverviewFallback />}>
          <StudentRepoOverviewContent myRepo={myRepo} />
        </Suspense>
      </CardContent>
    </Card>
  );
}
