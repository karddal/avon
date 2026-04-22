"use client";

import { PieArcSeries, PieChart } from "reaviz";
import ReavizModuleFrame from "@/components/modules/reaviz-module-frame";

const chartData = [
  { key: "Passed", data: 62 },
  { key: "Running", data: 18 },
  { key: "Failed", data: 12 },
  { key: "Errored", data: 8 },
];

export default function AnalyticsDonutModule() {
  return (
    <ReavizModuleFrame
      eyebrow="Donut"
      stat="4 states"
      title="Run Status Split"
      description="Outcome breakdown across current runs."
    >
      {({ width, height }) => (
        <div className="h-full w-full">
          <div className="mb-3 flex flex-wrap items-center gap-2 px-1 text-[10px] font-semibold uppercase tracking-[0.12em]">
            <span className="border border-foreground px-2 py-1">Passed</span>
            <span className="border border-foreground px-2 py-1">Running</span>
            <span className="border border-foreground px-2 py-1">Failed</span>
            <span className="border border-foreground bg-foreground px-2 py-1 text-background">
              Errored
            </span>
          </div>
          <div className="border-2 border-foreground bg-muted/10 p-2">
        <PieChart
          width={width}
          height={Math.max(height - 44, 240)}
          data={chartData}
          series={
            <PieArcSeries
              doughnut
              colorScheme={["#e5e5e5", "#a3a3a3", "#525252", "#111111"]}
            />
          }
        />
          </div>
        </div>
      )}
    </ReavizModuleFrame>
  );
}
