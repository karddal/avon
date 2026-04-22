"use client";

import { ScanSearch } from "lucide-react";
import { RadarChart, RadialAreaSeries } from "reaviz";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useModuleChartSize } from "@/components/modules/use-module-chart-size";

const chartData = [
  {
    key: "Cohort A",
    data: [
      { key: "Commit Volume", data: 84 },
      { key: "Test Coverage", data: 71 },
      { key: "Build Stability", data: 89 },
      { key: "Submission Pace", data: 63 },
      { key: "Review Health", data: 76 },
      { key: "Fix Rate", data: 68 },
    ],
  },
  {
    key: "Cohort B",
    data: [
      { key: "Commit Volume", data: 74 },
      { key: "Test Coverage", data: 79 },
      { key: "Build Stability", data: 73 },
      { key: "Submission Pace", data: 70 },
      { key: "Review Health", data: 65 },
      { key: "Fix Rate", data: 72 },
    ],
  },
];

export default function AnalyticsRadarModule() {
  const { containerRef, width, height } = useModuleChartSize(280, 220, 420, 260);

  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle>
          <div>
            <div className="flex flex-row items-center gap-2 text-2xl">
              <ScanSearch />
              Cohort Signal
            </div>
            <div className="font-light">
              Benchmark spread across six tracked dimensions.
            </div>
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent className="flex min-h-0 flex-1 flex-col space-y-4">
        <div className="flex items-center gap-2 text-[10px] font-semibold uppercase tracking-[0.12em] text-muted-foreground">
          <span className="inline-flex items-center gap-1 rounded-full border px-2 py-1 text-[#8e2024] dark:text-[#c86366]">
            <span className="h-2 w-2 rounded-full bg-[#8e2024]" />
            Cohort A
          </span>
          <span className="inline-flex items-center gap-1 rounded-full border px-2 py-1 text-[#4a8e58] dark:text-[#78b486]">
            <span className="h-2 w-2 rounded-full bg-[#4a8e58]" />
            Cohort B
          </span>
        </div>
        <div
          ref={containerRef}
          className="min-h-0 flex-1 rounded-sm bg-muted/15 p-2 [&_text]:fill-muted-foreground [&_.reaviz-radial-axis-line]:stroke-border/70 [&_.reaviz-radial-grid-line]:stroke-border/60 [&_path]:outline-hidden"
        >
          <RadarChart
            width={width}
            height={height}
            data={chartData}
            series={
              <RadialAreaSeries
                colorScheme={["#8e2024", "#4a8e58"]}
              />
            }
          />
        </div>
      </CardContent>
    </Card>
  );
}
