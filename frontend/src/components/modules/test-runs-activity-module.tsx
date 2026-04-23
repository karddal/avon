"use client";

import { useEffect, useMemo, useState } from "react";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { useActivityFilterOptions } from "@/hooks/analytics/use-activity-filter-options";
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
  const [unitId, setUnitId] = useState<string>("all");
  const [courseworkId, setCourseworkId] = useState<string>("all");

  const { units, courseworks } = useActivityFilterOptions();

  const filteredCourseworks = useMemo(() => {
    if (unitId === "all") {
      return courseworks;
    }

    return courseworks.filter((coursework) => coursework.unit_id === unitId);
  }, [courseworks, unitId]);

  useEffect(() => {
    if (
      courseworkId !== "all" &&
      !filteredCourseworks.some((coursework) => coursework.id === courseworkId)
    ) {
      setCourseworkId("all");
    }
  }, [courseworkId, filteredCourseworks]);

  const filters = useMemo(
    () => ({
      unitId: unitId === "all" ? undefined : unitId,
      courseworkId: courseworkId === "all" ? undefined : courseworkId,
    }),
    [courseworkId, unitId],
  );

  const { testRuns, error, isLoading, refresh } = useTestRunFeed(30, filters);

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
                Recent test runs across coursework repositories. <br />
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
        <div className="flex flex-col gap-2 md:flex-row">
          <Select value={unitId} onValueChange={setUnitId}>
            <SelectTrigger className="w-full md:w-56">
              <SelectValue placeholder="All units" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All units</SelectItem>
              {units.map((unit) => (
                <SelectItem key={unit.id} value={unit.id}>
                  {unit.unit_code} | {unit.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={courseworkId} onValueChange={setCourseworkId}>
            <SelectTrigger className="w-full md:w-56">
              <SelectValue placeholder="All courseworks" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All courseworks</SelectItem>
              {filteredCourseworks.map((coursework) => (
                <SelectItem key={coursework.id} value={coursework.id}>
                  {coursework.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

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
                <EmptyTitle>No test runs found.</EmptyTitle>
                <EmptyDescription>
                  Try a broader unit or coursework filter.
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
