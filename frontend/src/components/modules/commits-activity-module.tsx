"use client";

import { useEffect, useMemo, useState } from "react";
import { FolderGit, GitCommitHorizontal, RefreshCcw } from "lucide-react";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { useActivityFilterOptions } from "@/hooks/analytics/use-activity-filter-options";
import { useCommitFeed } from "@/hooks/analytics/use-commit-feed";
import { formatIsoDateTime } from "@/lib/date-format";

function formatCommitDate(date: string | null) {
  if (!date) {
    return "Recent";
  }

  return formatIsoDateTime(date);
}

export default function AnalyticsActivityModule() {
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

  const { commits, error, isLoading, refresh } = useCommitFeed(5, 40, filters);

  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle>
          <div className="flex flex-row items-center justify-between gap-3">
            <div>
              <div className="flex flex-row items-center gap-2 text-2xl">
                <GitCommitHorizontal />
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
                <EmptyTitle>No commits found.</EmptyTitle>
                <EmptyDescription>
                  Try a broader unit or coursework filter.
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
