"use client";

import { ScanSearch } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { PolarAngleAxis, PolarGrid, Radar, RadarChart } from "recharts";
import { AnalyticsLoadingState } from "@/components/analytics-page/analytics-loading-state";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  type ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
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
  const chartSeries = comparison?.series ?? [];
  const radarData = useMemo(() => {
    const first = chartSeries[0];
    const second = chartSeries[1];
    if (!first || !second) {
      return [];
    }

    return first.data.map((metric, index) => ({
      metric: metric.key,
      first: metric.data,
      second: second.data[index]?.data ?? 0,
    }));
  }, [chartSeries]);
  const chartConfig = useMemo(
    () =>
      ({
        first: {
          label: chartSeries[0]?.key ?? "Coursework A",
          color: "#8e2024",
        },
        second: {
          label: chartSeries[1]?.key ?? "Coursework B",
          color: "#4a8e58",
        },
      }) satisfies ChartConfig,
    [chartSeries],
  );

  return (
    <Card className="flex h-full min-h-0 flex-col overflow-hidden">
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
          {chartSeries[0] ? (
            <span className="inline-flex items-center gap-1 rounded-full border px-2 py-1 text-[#8e2024] dark:text-[#c86366]">
              <span className="h-2 w-2 rounded-full bg-[#8e2024]" />
              {chartSeries[0].key}
            </span>
          ) : null}
          {chartSeries[1] ? (
            <span className="inline-flex items-center gap-1 rounded-full border px-2 py-1 text-[#4a8e58] dark:text-[#78b486]">
              <span className="h-2 w-2 rounded-full bg-[#4a8e58]" />
              {chartSeries[1].key}
            </span>
          ) : null}
        </div>
        <div className="min-h-0 flex-1 rounded-sm bg-muted/15 p-2">
          {isLoading ? (
            <AnalyticsLoadingState
              className="h-full border-0 bg-transparent p-0"
              description="Crunching live coursework metrics for this comparison."
            />
          ) : error ? (
            <div className="flex h-full items-center justify-center text-sm text-muted-foreground">
              Could not load coursework comparison.
            </div>
          ) : radarData.length > 0 ? (
            <ChartContainer
              config={chartConfig}
              className="mx-auto h-full min-h-0 w-full max-w-[26rem] flex-1"
            >
              <RadarChart data={radarData} outerRadius="68%">
                <ChartTooltip
                  cursor={false}
                  content={<ChartTooltipContent indicator="line" />}
                />
                <PolarGrid />
                <PolarAngleAxis
                  dataKey="metric"
                  tick={{
                    fill: "hsl(var(--muted-foreground))",
                    fontSize: 11,
                    fontWeight: 600,
                  }}
                />
                <Radar
                  dataKey="first"
                  fill="var(--color-first)"
                  fillOpacity={0.22}
                  stroke="var(--color-first)"
                  strokeWidth={2}
                />
                <Radar
                  dataKey="second"
                  fill="var(--color-second)"
                  fillOpacity={0.18}
                  stroke="var(--color-second)"
                  strokeWidth={2}
                />
              </RadarChart>
            </ChartContainer>
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
