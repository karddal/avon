"use client";

import { CalendarRange } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";

const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
const slots = ["08:00", "10:00", "12:00", "14:00", "16:00", "18:00"];

const sampleData = [
  [18, 32, 44, 56, 39, 12, 8],
  [24, 40, 61, 72, 48, 21, 11],
  [29, 47, 68, 83, 58, 26, 14],
  [21, 37, 53, 66, 43, 18, 10],
  [16, 28, 41, 52, 35, 15, 7],
  [11, 19, 27, 34, 22, 9, 5],
];

function getHeatTone(value: number) {
  if (value >= 75) {
    return "bg-red-500 text-red-950";
  }

  if (value >= 50) {
    return "bg-orange-400 text-orange-950";
  }

  if (value >= 25) {
    return "bg-yellow-300 text-yellow-950";
  }

  return "bg-green-500 text-green-950";
}

export default function AnalyticsHeatmapExampleModule() {
  return (
    <Card className="flex h-full min-h-0 flex-col overflow-hidden">
      <CardHeader>
        <CardTitle>
          <div>
            <div className="flex flex-row items-center gap-2 text-2xl">
              <CalendarRange />
              Activity Heatmap
            </div>
            <div className="font-light">
              Example heatmap using green, yellow, orange, and red intensity
              bands.
            </div>
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent className="flex min-h-0 flex-1 flex-col gap-4">
        <div className="flex flex-wrap items-center gap-3 text-[10px] font-semibold uppercase tracking-[0.12em] text-muted-foreground">
          <span className="inline-flex items-center gap-2">
            <span className="h-3 w-3 rounded-sm bg-green-500" />
            Low
          </span>
          <span className="inline-flex items-center gap-2">
            <span className="h-3 w-3 rounded-sm bg-yellow-300" />
            Moderate
          </span>
          <span className="inline-flex items-center gap-2">
            <span className="h-3 w-3 rounded-sm bg-orange-400" />
            High
          </span>
          <span className="inline-flex items-center gap-2">
            <span className="h-3 w-3 rounded-sm bg-red-500" />
            Peak
          </span>
        </div>

        <div className="min-h-0 overflow-auto rounded-sm border bg-muted/15 p-3">
          <div
            className="grid min-w-[34rem] gap-2"
            style={{ gridTemplateColumns: "4.5rem repeat(7, minmax(0, 1fr))" }}
          >
            <div />
            {days.map((day) => (
              <div
                key={day}
                className="text-center text-[10px] font-semibold uppercase tracking-[0.12em] text-muted-foreground"
              >
                {day}
              </div>
            ))}

            {slots.map((slot, rowIndex) => (
              <div key={slot} className="contents">
                <div className="flex items-center text-[10px] font-semibold uppercase tracking-[0.12em] text-muted-foreground">
                  {slot}
                </div>

                {sampleData[rowIndex].map((value, columnIndex) => (
                  <div
                    key={`${slot}-${days[columnIndex]}`}
                    className={cn(
                      "flex aspect-square min-h-12 items-center justify-center rounded-sm border border-black/5 text-sm font-semibold shadow-sm transition-transform hover:scale-[1.02]",
                      getHeatTone(value),
                    )}
                    title={`${days[columnIndex]} ${slot}: ${value}`}
                  >
                    {value}
                  </div>
                ))}
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
