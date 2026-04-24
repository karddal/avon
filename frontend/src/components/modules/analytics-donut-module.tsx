"use client";

import { ChartPie } from "lucide-react";
import { useMemo, useState } from "react";
import { Cell, Label, Pie, PieChart } from "recharts";
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

const DONUT_COLORS = ["#4a8e58", "#356d97", "#7a6831", "#8e2024"] as const;
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

  const chartData = useMemo(
    () => [
      { key: "passed", label: "Passed", value: summary?.passed ?? 0 },
      { key: "running", label: "Running", value: summary?.running ?? 0 },
      { key: "failed", label: "Failed", value: summary?.failed ?? 0 },
      { key: "errored", label: "Errored", value: summary?.errored ?? 0 },
    ],
    [summary],
  );
  const hasRunData = (summary?.total_runs ?? 0) > 0;

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
            <span className="inline-flex items-center gap-1">
              <span className="h-2.5 w-2.5 bg-[#4a8e58]" />
              Passed
            </span>
            <span className="inline-flex items-center gap-1">
              <span className="h-2.5 w-2.5 bg-[#356d97]" />
              Running
            </span>
            <span className="inline-flex items-center gap-1">
              <span className="h-2.5 w-2.5 bg-[#7a6831]" />
              Failed
            </span>
            <span className="inline-flex items-center gap-1">
              <span className="h-2.5 w-2.5 bg-[#8e2024]" />
              Errored
            </span>
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
                <PieChart>
                  <ChartTooltip
                    content={<ChartTooltipContent hideLabel nameKey="label" />}
                  />
                  <Pie
                    data={chartData}
                    dataKey="value"
                    nameKey="label"
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
                    <Label
                      content={({ viewBox }) => {
                        if (
                          !viewBox ||
                          typeof viewBox.cx !== "number" ||
                          typeof viewBox.cy !== "number"
                        ) {
                          return null;
                        }

                        const centerX = viewBox.cx;
                        const centerY = viewBox.cy;

                        return (
                          <text
                            x={centerX}
                            y={centerY}
                            textAnchor="middle"
                            dominantBaseline="middle"
                          >
                            <tspan
                              x={centerX}
                              y={centerY}
                              className="fill-foreground text-2xl font-semibold"
                            >
                              {summary?.total_runs ?? 0}
                            </tspan>
                            <tspan
                              x={centerX}
                              y={centerY + 20}
                              className="fill-muted-foreground text-[10px] font-semibold uppercase tracking-[0.16em]"
                            >
                              Runs
                            </tspan>
                          </text>
                        );
                      }}
                    />
                  </Pie>
                </PieChart>
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
