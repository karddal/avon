"use client";

import { Activity, FolderGit, RefreshCcw } from "lucide-react";
import CourseworkCommitListItem from "@/components/coursework/coursework-commit-list-item";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";
import { Skeleton } from "@/components/ui/skeleton";
import { useCommitFeed } from "@/hooks/analytics/use-commit-feed";
import { formatIsoDateTime } from "@/lib/date-format";

function formatCommitDate(date: string | null) {
  if (!date) {
    return "Recent";
  }

  return formatIsoDateTime(date);
}

export default function AnalyticsActivityModule() {
  const { commits, error, isLoading, refresh } = useCommitFeed(5, 40);

  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle>
          <div className="flex flex-row items-center justify-between gap-3">
            <div>
              <div className="flex flex-row items-center gap-2 text-2xl">
                <Activity />
                Commits Activity
              </div>
              <div className="font-light">
                Recent default-branch commits across coursework repositories.
                This feed refreshes automatically.
              </div>
            </div>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => void refresh()}
            >
              <RefreshCcw className="mr-2 h-4 w-4" />
              Refresh
            </Button>
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent className="flex min-h-0 flex-1 flex-col space-y-4">
        {isLoading ? (
          <div className="space-y-2">
            <Skeleton className="h-14 w-full" />
            <Skeleton className="h-14 w-full" />
            <Skeleton className="h-14 w-full" />
          </div>
        ) : null}

        {!isLoading && error ? (
          <div className="h-full rounded-md border border-dashed p-4 text-sm">
            <Empty>
              <EmptyHeader>
                <EmptyMedia variant="icon">
                  <FolderGit />
                </EmptyMedia>
                <EmptyTitle>Could not load commits.</EmptyTitle>
                <EmptyDescription>
                  We could not fetch the latest GitLab commit feed right now.
                </EmptyDescription>
              </EmptyHeader>
            </Empty>
          </div>
        ) : null}

        {!isLoading && !error && commits.length === 0 ? (
          <div className="h-full rounded-md border border-dashed p-4 text-sm">
            <Empty>
              <EmptyHeader>
                <EmptyMedia variant="icon">
                  <FolderGit />
                </EmptyMedia>
                <EmptyTitle>No commits yet.</EmptyTitle>
                <EmptyDescription>
                  New commits will appear here as students push to coursework
                  repositories.
                </EmptyDescription>
              </EmptyHeader>
            </Empty>
          </div>
        ) : null}

        {!isLoading && !error && commits.length > 0 ? (
          <div className="flex min-h-0 flex-1 flex-col space-y-2 overflow-auto">
            {commits.map((item, index) => (
              <CourseworkCommitListItem
                key={`${item.repo_id}-${item.commit.id}`}
                href={item.commit.web_url ?? item.repo_url}
                title={item.commit.title}
                shortId={item.commit.short_id}
                authorName={item.commit.author_name ?? "Unknown"}
                authoredLabel={formatCommitDate(item.commit.authored_date)}
                secondaryMeta={
                  <>
                    <span className="font-medium text-foreground">
                      {item.coursework_name}
                    </span>{" "}
                    / {item.repo_name}
                  </>
                }
                additions={item.commit.additions}
                deletions={item.commit.deletions}
                highlighted={index === 0}
              />
            ))}
          </div>
        ) : null}
      </CardContent>
    </Card>
  );
}
