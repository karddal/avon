"use client";

import { ChartPie } from "lucide-react";
import { useState } from "react";
import { Cell, Pie, PieChart } from "recharts";
import { AnalyticsLoadingState } from "@/components/analytics-page/analytics-loading-state";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  type ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import { useTestRunStatusSummary } from "@/hooks/analytics/use-test-run-status-summary";

function getDateDaysAgo(days: number) {
  const date = new Date();
  date.setDate(date.getDate() - days);
  return date.toISOString().slice(0, 10);
}

const PRESET_OPTIONS = [
  { key: "1d", label: "24h", days: 1 },
  { key: "7d", label: "7d", days: 7 },
  { key: "30d", label: "30d", days: 30 },
  { key: "90d", label: "90d", days: 90 },
] as const;

const STATUS_ITEMS = [
  { key: "passed", label: "Passed", color: "#4a8e58" },
  { key: "running", label: "Running", color: "#356d97" },
  { key: "failed", label: "Failed", color: "#7a6831" },
  { key: "errored", label: "Errored", color: "#8e2024" },
] as const;

const DONUT_COLORS = STATUS_ITEMS.map((item) => item.color) as [
  string,
  string,
  string,
  string,
];
const chartConfig = {
  passed: { label: "Passed", color: DONUT_COLORS[0] },
  running: { label: "Running", color: DONUT_COLORS[1] },
  failed: { label: "Failed", color: DONUT_COLORS[2] },
  errored: { label: "Errored", color: DONUT_COLORS[3] },
} satisfies ChartConfig;

export default function AnalyticsDonutModule() {
  const [selectedPreset, setSelectedPreset] = useState<string>("7d");
  const selectedDays =
    PRESET_OPTIONS.find((option) => option.key === selectedPreset)?.days ?? 7;
  const { error, isLoading, summary } = useTestRunStatusSummary({
    fromDate: getDateDaysAgo(selectedDays),
  });
  const totalRuns = summary?.total_runs ?? 0;
  const chartData = STATUS_ITEMS.map((item) => ({
    ...item,
    value: summary?.[item.key] ?? 0,
  }));
  const hasRunData = totalRuns > 0;

  return (
    <Card className="flex h-full min-h-0 flex-col overflow-hidden">
      <CardHeader>
        <CardTitle>
          <div>
            <div className="flex flex-row items-center gap-2 text-2xl">
              <ChartPie />
              Run Status Split
            </div>
            <div className="font-light">
              Outcome breakdown across current runs.
            </div>
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent className="flex min-h-0 flex-1 flex-col space-y-4 overflow-y-auto">
        <div className="flex flex-wrap items-center gap-3 text-[10px] font-semibold uppercase tracking-[0.12em] text-muted-foreground lg:flex-nowrap lg:justify-between">
          <div className="flex flex-wrap items-center gap-3">
            {STATUS_ITEMS.map((item) => (
              <span key={item.key} className="inline-flex items-center gap-1">
                <span
                  className="h-2.5 w-2.5"
                  style={{ backgroundColor: item.color }}
                />
                {item.label}
              </span>
            ))}
          </div>
          <div className="flex flex-wrap items-center gap-2 lg:justify-end">
            {PRESET_OPTIONS.map((preset) => (
              <Button
                key={preset.key}
                type="button"
                variant={selectedPreset === preset.key ? "default" : "outline"}
                size="sm"
                className="rounded-full"
                onClick={() => setSelectedPreset(preset.key)}
              >
                {preset.label}
              </Button>
            ))}
          </div>
        </div>
        {isLoading ? (
          <AnalyticsLoadingState description="Crunching recent run outcomes for the selected window." />
        ) : error ? (
          <div className="flex min-h-0 flex-1 items-center justify-center rounded-sm border border-dashed border-border/70 bg-muted/15 p-5 text-sm text-muted-foreground">
            Could not load run status data.
          </div>
        ) : (
          <div className="flex min-h-[18rem] flex-1 items-center justify-center rounded-sm bg-muted/15 p-2">
            {hasRunData ? (
              <ChartContainer
                config={chartConfig}
                className="mx-auto h-full min-h-0 w-full max-w-[22rem] flex-1"
              >
                <div className="relative flex h-full min-h-0 items-center justify-center">
                  <PieChart width={220} height={220}>
                    <ChartTooltip
                      content={
                        <ChartTooltipContent hideLabel nameKey="label" />
                      }
                    />
                    <Pie
                      data={chartData}
                      dataKey="value"
                      nameKey="label"
                      cx="50%"
                      cy="50%"
                      innerRadius={58}
                      outerRadius={86}
                      strokeWidth={0}
                    >
                      {chartData.map((entry, index) => (
                        <Cell
                          key={entry.key}
                          fill={DONUT_COLORS[index]}
                          className="stroke-transparent"
                        />
                      ))}
                    </Pie>
                  </PieChart>
                  <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center text-center">
                    <div className="text-2xl font-semibold text-foreground">
                      {totalRuns}
                    </div>
                    <div className="text-[10px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">
                      Runs
                    </div>
                  </div>
                </div>
              </ChartContainer>
            ) : (
              <div className="flex flex-col items-center justify-center text-center">
                <div className="flex h-44 w-44 items-center justify-center rounded-full border-[22px] border-muted-foreground/20">
                  <div>
                    <div className="text-3xl font-semibold text-foreground">
                      0
                    </div>
                    <div className="text-[10px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">
                      Test runs
                    </div>
                  </div>
                </div>
                <div className="mt-4 text-sm text-muted-foreground">
                  No test runs in this window yet.
                </div>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
