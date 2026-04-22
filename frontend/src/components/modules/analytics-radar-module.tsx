"use client";

import { ScanSearch } from "lucide-react";
import { RadarChart, RadialAreaSeries } from "reaviz";
import ReavizModuleFrame from "@/components/modules/reaviz-module-frame";

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
  return (
    <ReavizModuleFrame
      eyebrow="Radar"
      stat="2 cohorts"
      title="Cohort Signal"
      description="Benchmark spread across six tracked dimensions."
    >
      {({ width, height }) => (
        <div className="h-full w-full">
          <div className="mb-3 flex items-center gap-2 border-b px-1 pb-2 text-[11px] font-medium uppercase tracking-[0.12em] text-muted-foreground">
            <ScanSearch className="h-4 w-4" />
            Comparison
          </div>
          <div className="mb-3 flex items-center gap-2 px-1 text-[10px] font-semibold uppercase tracking-[0.12em]">
            <span className="border border-foreground px-2 py-1">Cohort A</span>
            <span className="border border-foreground bg-foreground px-2 py-1 text-background">
              Cohort B
            </span>
          </div>
          <div className="border-2 border-foreground bg-muted/10 p-2 [&_text]:fill-muted-foreground">
          <RadarChart
            width={width}
            height={Math.max(height - 72, 240)}
            data={chartData}
            series={
              <RadialAreaSeries
                colorScheme={["#d4d4d4", "#111111"]}
                area={null}
              />
            }
          />
          </div>
        </div>
      )}
    </ReavizModuleFrame>
  );
}
