"use client";

import { ScanSearch } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { RadarChart, RadialAreaSeries } from "reaviz";
import { AnalyticsLoadingState } from "@/components/analytics-page/analytics-loading-state";
import { useModuleChartSize } from "@/components/modules/use-module-chart-size";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useActivityFilterOptions } from "@/hooks/analytics/use-activity-filter-options";
import { useCourseworkComparison } from "@/hooks/analytics/use-coursework-comparison";

export default function AnalyticsRadarModule() {
  const { courseworks } = useActivityFilterOptions();
  const [courseworkAId, setCourseworkAId] = useState<string>("all");
  const [courseworkBId, setCourseworkBId] = useState<string>("all");
  const { containerRef, width, height } = useModuleChartSize(
    280,
    220,
    420,
    260,
  );
  useEffect(() => {
    if (courseworks.length < 2) {
      return;
    }

    if (courseworkAId === "all") {
      setCourseworkAId(courseworks[0].id);
    }

    if (courseworkBId === "all") {
      setCourseworkBId(courseworks[1]?.id ?? courseworks[0].id);
    }
  }, [courseworkAId, courseworkBId, courseworks]);

  const availableForSecond = useMemo(
    () => courseworks.filter((coursework) => coursework.id !== courseworkAId),
    [courseworkAId, courseworks],
  );

  useEffect(() => {
    if (
      courseworkBId !== "all" &&
      courseworkBId === courseworkAId &&
      availableForSecond.length > 0
    ) {
      setCourseworkBId(availableForSecond[0].id);
    }
  }, [availableForSecond, courseworkAId, courseworkBId]);

  const { comparison, error, isLoading } = useCourseworkComparison({
    courseworkAId: courseworkAId === "all" ? undefined : courseworkAId,
    courseworkBId: courseworkBId === "all" ? undefined : courseworkBId,
  });
  const chartData = comparison?.series ?? [];

  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle>
          <div>
            <div className="flex flex-row items-center gap-2 text-2xl">
              <ScanSearch />
              Coursework Comparison
            </div>
            <div className="font-light">
              Compare two courseworks across live activity and run metrics.
            </div>
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent className="flex min-h-0 flex-1 flex-col space-y-4">
        <div className="grid gap-2 md:grid-cols-2">
          <Select value={courseworkAId} onValueChange={setCourseworkAId}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Select first coursework" />
            </SelectTrigger>
            <SelectContent>
              {courseworks.map((coursework) => (
                <SelectItem key={coursework.id} value={coursework.id}>
                  {coursework.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={courseworkBId} onValueChange={setCourseworkBId}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Select second coursework" />
            </SelectTrigger>
            <SelectContent>
              {availableForSecond.map((coursework) => (
                <SelectItem key={coursework.id} value={coursework.id}>
                  {coursework.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="flex items-center gap-2 text-[10px] font-semibold uppercase tracking-[0.12em] text-muted-foreground">
          {chartData[0] ? (
            <span className="inline-flex items-center gap-1 rounded-full border px-2 py-1 text-[#8e2024] dark:text-[#c86366]">
              <span className="h-2 w-2 rounded-full bg-[#8e2024]" />
              {chartData[0].key}
            </span>
          ) : null}
          {chartData[1] ? (
            <span className="inline-flex items-center gap-1 rounded-full border px-2 py-1 text-[#4a8e58] dark:text-[#78b486]">
              <span className="h-2 w-2 rounded-full bg-[#4a8e58]" />
              {chartData[1].key}
            </span>
          ) : null}
        </div>
        <div
          ref={containerRef}
          className="min-h-0 flex-1 rounded-sm bg-muted/15 p-2 [&_text]:fill-muted-foreground [&_.reaviz-radial-axis-line]:stroke-border/70 [&_.reaviz-radial-grid-line]:stroke-border/60 [&_path]:outline-hidden"
        >
          {isLoading ? (
            <AnalyticsLoadingState
              className="h-full border-0 bg-transparent p-0"
              description="Crunching live coursework metrics for this comparison."
            />
          ) : error ? (
            <div className="flex h-full items-center justify-center text-sm text-muted-foreground">
              Could not load coursework comparison.
            </div>
          ) : chartData.length === 2 ? (
            <RadarChart
              width={width}
              height={height}
              data={chartData}
              series={<RadialAreaSeries colorScheme={["#8e2024", "#4a8e58"]} />}
            />
          ) : (
            <div className="flex h-full items-center justify-center text-sm text-muted-foreground">
              Pick two courseworks to compare.
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
