"use client";

import { FlaskConical, RefreshCcw } from "lucide-react";
import CourseworkTestRunFeedItem from "@/components/coursework/coursework-test-run-feed-item";
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
import { useTestRunFeed } from "@/hooks/analytics/use-test-run-feed";
import { formatIsoDateTime } from "@/lib/date-format";

function formatRunDate(date: string) {
  return formatIsoDateTime(date);
}

function formatRepoLabel(repoUrl: string) {
  const trimmed = repoUrl.replace(/\/+$/, "");
  const projectName = trimmed.split("/").pop()?.replace(/\.git$/, "");

  if (!projectName) {
    return repoUrl;
  }

  return `/${projectName}`;
}

function formatTriggerLabel(trigger: "initial" | "retry" | "manual_rerun") {
  switch (trigger) {
    case "manual_rerun":
      return "Manual rerun";
    default:
      return trigger.charAt(0).toUpperCase() + trigger.slice(1);
  }
}

export default function TestRunsActivityModule() {
  const { testRuns, error, isLoading, refresh } = useTestRunFeed(30);

  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle>
          <div className="flex flex-row items-center justify-between gap-3">
            <div>
              <div className="flex flex-row items-center gap-2 text-2xl">
                <FlaskConical />
                Test Runs Activity
              </div>
              <div className="font-light">
                Live database-backed feed of coursework test runs from the last
                24 hours.
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
                  <FlaskConical />
                </EmptyMedia>
                <EmptyTitle>Could not load test runs.</EmptyTitle>
                <EmptyDescription>
                  We could not fetch the latest coursework test run feed right
                  now.
                </EmptyDescription>
              </EmptyHeader>
            </Empty>
          </div>
        ) : null}

        {!isLoading && !error && testRuns.length === 0 ? (
          <div className="h-full rounded-md border border-dashed p-4 text-sm">
            <Empty>
              <EmptyHeader>
                <EmptyMedia variant="icon">
                  <FlaskConical />
                </EmptyMedia>
                <EmptyTitle>No test runs in the last day.</EmptyTitle>
                <EmptyDescription>
                  New coursework test runs will appear here as they are created.
                </EmptyDescription>
              </EmptyHeader>
            </Empty>
          </div>
        ) : null}

        {!isLoading && !error && testRuns.length > 0 ? (
          <div className="flex min-h-0 flex-1 flex-col space-y-2 overflow-auto">
            {testRuns.map((item) => (
              <CourseworkTestRunFeedItem
                key={item.id}
                courseworkId={item.coursework_id}
                testRunId={item.id}
                title={item.coursework_name}
                courseworkName={item.coursework_name}
                repoLabel={formatRepoLabel(item.gitlab_repo_url)}
                startedLabel={formatRunDate(item.created_at)}
                status={item.status}
                triggerLabel={formatTriggerLabel(item.trigger)}
                studentCount={item.student_ids.length}
                studentLabel={
                  item.student_ids.length > 0
                    ? item.student_ids.join(", ")
                    : undefined
                }
              />
            ))}
          </div>
        ) : null}
      </CardContent>
    </Card>
  );
}
