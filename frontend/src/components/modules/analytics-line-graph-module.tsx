"use client";

import { Activity } from "lucide-react";
import { useMemo, useState } from "react";
import {
  CartesianGrid,
  Line,
  LineChart,
  ReferenceLine,
  XAxis,
  YAxis,
} from "recharts";
import { AnalyticsLoadingState } from "@/components/analytics-page/analytics-loading-state";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import { Input } from "@/components/ui/input";
import { useActivityTrend } from "@/hooks/analytics/use-activity-trend";

const chartConfig = {
  commits: {
    label: "Commits",
    color: "#356d97",
  },
  runs: {
    label: "Test runs",
    color: "#917306",
  },
} as const;

function getDateDaysAgo(days: number) {
  const date = new Date();
  date.setDate(date.getDate() - days);
  return date.toISOString().slice(0, 10);
}

function formatBucketLabel(bucketHours: number | undefined) {
  if (!bucketHours) {
    return "Sampling: 16 buckets";
  }

  if (bucketHours < 1) {
    const minutes = Math.round(bucketHours * 60);
    return `Sampling: ~${minutes} minute blocks`;
  }

  const roundedHours = Number(bucketHours.toFixed(1));
  return `Sampling: ~${roundedHours} hour blocks`;
}

export default function AnalyticsLineGraphModule() {
  const [fromDate, setFromDate] = useState<string>(getDateDaysAgo(1));
  const [toDate, setToDate] = useState<string>(
    new Date().toISOString().slice(0, 10),
  );
  const { trend, error, isLoading } = useActivityTrend({ fromDate, toDate });

  const chartData = trend?.points ?? [];
  const totalCommits = useMemo(
    () => chartData.reduce((sum, entry) => sum + entry.commits, 0),
    [chartData],
  );
  const totalRuns = useMemo(
    () => chartData.reduce((sum, entry) => sum + entry.runs, 0),
    [chartData],
  );
  const peakCommits = useMemo(
    () => Math.max(0, ...chartData.map((entry) => entry.commits)),
    [chartData],
  );
  const peakRuns = useMemo(
    () => Math.max(0, ...chartData.map((entry) => entry.runs)),
    [chartData],
  );

  return (
    <Card className="flex h-full min-h-0 flex-col overflow-hidden">
      <CardHeader>
        <CardTitle>
          <div>
            <div className="flex flex-row items-center gap-2 text-2xl">
              <Activity />
              Activity Trend
            </div>
            <div className="font-light">
              Commit and test activity across the selected date range.
            </div>
          </div>
        </CardTitle>
      </CardHeader>

      <CardContent className="flex min-h-0 flex-1 flex-col space-y-4">
        <div className="grid grid-cols-2 gap-2 text-[10px] font-semibold uppercase tracking-[0.12em] md:grid-cols-4">
          <div className="border border-border bg-muted/20 px-3 py-2">
            <div className="text-muted-foreground">Commit Volume</div>
            <div className="mt-1 text-lg tracking-normal text-[#356d97]">
              {totalCommits}
            </div>
          </div>
          <div className="border border-border bg-muted/20 px-3 py-2">
            <div className="text-muted-foreground">Run Volume</div>
            <div className="mt-1 text-lg tracking-normal text-[#917306]">
              {totalRuns}
            </div>
          </div>
          <div className="border border-border bg-muted/20 px-3 py-2">
            <div className="text-muted-foreground">Commit Peak</div>
            <div className="mt-1 text-lg tracking-normal text-foreground">
              {peakCommits}
            </div>
          </div>
          <div className="border border-border bg-muted/20 px-3 py-2">
            <div className="text-muted-foreground">Run Peak</div>
            <div className="mt-1 text-lg tracking-normal text-foreground">
              {peakRuns}
            </div>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3 text-[10px] font-semibold uppercase tracking-[0.12em] text-muted-foreground">
          <span className="inline-flex items-center gap-2 border border-border bg-muted/20 px-2 py-1">
            <span className="h-2.5 w-2.5 bg-[#356d97]" />
            Commit stream
          </span>
          <span className="inline-flex items-center gap-2 border border-border bg-muted/20 px-2 py-1">
            <span className="h-2.5 w-2.5 bg-[#917306]" />
            Test stream
          </span>
        </div>

        {isLoading ? (
          <AnalyticsLoadingState description="Crunching commit and test activity across your selected date range." />
        ) : error ? (
          <div className="flex min-h-0 flex-1 items-center justify-center border border-dashed bg-muted/15 p-3 text-sm text-muted-foreground">
            Could not load activity trend data.
          </div>
        ) : (
          <ChartContainer
            config={chartConfig}
            className="min-h-0 flex-1 border border-border bg-muted/15 p-3"
          >
            <LineChart
              data={chartData}
              margin={{ top: 12, right: 12, bottom: 4, left: -18 }}
            >
              <CartesianGrid strokeDasharray="3 3" vertical={true} />
              <XAxis
                dataKey="slot"
                axisLine={false}
                tickLine={false}
                tickMargin={10}
                minTickGap={24}
              />
              <YAxis axisLine={false} tickLine={false} tickMargin={10} />
              <ReferenceLine
                y={peakRuns}
                stroke="rgba(145,115,6,0.45)"
                strokeDasharray="6 4"
              />
              <ChartTooltip
                content={<ChartTooltipContent />}
                cursor={{ stroke: "var(--border)", strokeDasharray: "3 3" }}
              />
              <Line
                type="monotone"
                dataKey="commits"
                stroke="var(--color-commits)"
                strokeWidth={2.75}
                dot={{ r: 2, fill: "var(--color-commits)" }}
                activeDot={{
                  r: 5,
                  fill: "var(--color-commits)",
                  stroke: "var(--background)",
                }}
              />
              <Line
                type="monotone"
                dataKey="runs"
                stroke="var(--color-runs)"
                strokeWidth={2.75}
                dot={{ r: 2, fill: "var(--color-runs)" }}
                activeDot={{
                  r: 5,
                  fill: "var(--color-runs)",
                  stroke: "var(--background)",
                }}
              />
            </LineChart>
          </ChartContainer>
        )}

        <div className="grid gap-3 border border-border bg-muted/10 px-3 py-2 text-[10px] font-semibold uppercase tracking-[0.12em] text-muted-foreground xl:grid-cols-[minmax(0,1fr)_auto] xl:items-center">
          <div className="grid gap-2 md:grid-cols-2">
            <label
              htmlFor="activity-trend-from"
              className="grid gap-1 sm:min-w-0"
            >
              <span>From</span>
              <Input
                id="activity-trend-from"
                type="date"
                value={fromDate}
                max={toDate}
                className="h-8 w-full min-w-0 text-[11px]"
                onChange={(event) => setFromDate(event.target.value)}
              />
            </label>
            <label
              htmlFor="activity-trend-to"
              className="grid gap-1 sm:min-w-0"
            >
              <span>To</span>
              <Input
                id="activity-trend-to"
                type="date"
                value={toDate}
                min={fromDate}
                max={new Date().toISOString().slice(0, 10)}
                className="h-8 w-full min-w-0 text-[11px]"
                onChange={(event) => setToDate(event.target.value)}
              />
            </label>
          </div>
          <div className="min-w-0 text-left leading-relaxed xl:max-w-[10rem] xl:text-right">
            {formatBucketLabel(trend?.bucket_hours)}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
