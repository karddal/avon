"use client";

import { ChartPie } from "lucide-react";
import { PieArcSeries, PieChart } from "reaviz";
import { useModuleChartSize } from "@/components/modules/use-module-chart-size";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const chartData = [
  { key: "Passed", data: 62 },
  { key: "Running", data: 18 },
  { key: "Failed", data: 12 },
  { key: "Errored", data: 8 },
];

export default function AnalyticsDonutModule() {
  const { containerRef, width, height } = useModuleChartSize(
    280,
    220,
    420,
    260,
  );

  return (
    <Card className="h-full">
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
      <CardContent className="flex min-h-0 flex-1 flex-col space-y-4">
        <div className="flex flex-wrap items-center gap-3 text-[10px] font-semibold uppercase tracking-[0.12em] text-muted-foreground">
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
        <div
          ref={containerRef}
          className="min-h-0 flex-1 rounded-sm bg-muted/15 p-2 [&_path[stroke='#fff']]:stroke-transparent [&_text]:fill-muted-foreground"
        >
          <PieChart
            width={width}
            height={height}
            data={chartData}
            series={
              <PieArcSeries
                doughnut
                colorScheme={["#4a8e58", "#356d97", "#7a6831", "#8e2024"]}
              />
            }
          />
        </div>
      </CardContent>
    </Card>
  );
}
