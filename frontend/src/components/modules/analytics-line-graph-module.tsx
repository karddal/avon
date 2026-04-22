"use client";

import { Activity } from "lucide-react";
import {
  CartesianGrid,
  Line,
  LineChart,
  ReferenceLine,
  XAxis,
  YAxis,
} from "recharts";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const chartData = [
  { slot: "00:00", commits: 8, runs: 5 },
  { slot: "02:00", commits: 10, runs: 7 },
  { slot: "04:00", commits: 7, runs: 6 },
  { slot: "06:00", commits: 12, runs: 9 },
  { slot: "08:00", commits: 18, runs: 13 },
  { slot: "10:00", commits: 24, runs: 19 },
  { slot: "12:00", commits: 31, runs: 22 },
  { slot: "14:00", commits: 29, runs: 24 },
  { slot: "16:00", commits: 36, runs: 27 },
  { slot: "18:00", commits: 33, runs: 25 },
  { slot: "20:00", commits: 21, runs: 17 },
  { slot: "22:00", commits: 15, runs: 11 },
];

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

const totalCommits = chartData.reduce((sum, entry) => sum + entry.commits, 0);
const totalRuns = chartData.reduce((sum, entry) => sum + entry.runs, 0);
const peakCommits = Math.max(...chartData.map((entry) => entry.commits));
const peakRuns = Math.max(...chartData.map((entry) => entry.runs));

export default function AnalyticsLineGraphModule() {
  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle>
          <div>
            <div className="flex flex-row items-center gap-2 text-2xl">
              <Activity />
              Activity Trend
            </div>
            <div className="font-light">
              24-hour Activity trace across commits and test execution.
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
            />
            <YAxis axisLine={false} tickLine={false} tickMargin={10} />
            <ReferenceLine
              y={24}
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

        <div className="flex items-center justify-between border border-border bg-muted/10 px-3 py-2 text-[10px] font-semibold uppercase tracking-[0.12em] text-muted-foreground">
          <span>Window: Last 24 hours</span>
          <span>Sampling: 2-hour blocks</span>
        </div>
      </CardContent>
    </Card>
  );
}
