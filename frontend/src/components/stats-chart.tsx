"use client";

import { Bar, BarChart, XAxis } from "recharts";
import {
  type ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";

interface ChartDataPoint {
  [key: string]: string | number;
}

type ColourKey = Record<string, string>;

const colourMap: ColourKey = {
  red: "fill-red-400",
  green: "fill-green-400",
  blue: "fill-blue-400",
};

interface StatsChartProps {
  data: ChartDataPoint[];
  xAxisKey: string;
  dataKeys: Array<{ key: string; label: string }>;
  colour: string;
  className?: string;
}

export function StatsChart({
  data,
  xAxisKey,
  dataKeys,
  colour,
  className,
}: StatsChartProps) {
  let total = 0;
  for (const item of data) {
    for (const value of Object.values(item)) {
      if (typeof value === "number") {
        total += value;
      }
    }
  }
  console.log(total);
  const chartConfig = dataKeys.reduce((acc, { key, label }) => {
    acc[key] = {
      label,
    };
    return acc;
  }, {} as ChartConfig);

  return (
    <div>
      <div className="text-4xl text-center font-medium pb-4">{total}</div>
      <ChartContainer config={chartConfig} className={className}>
        <BarChart data={data}>
          <ChartTooltip content={<ChartTooltipContent />} />
          <XAxis
            dataKey={xAxisKey}
            tickLine={false}
            tickMargin={10}
            axisLine={false}
            tickFormatter={(value) =>
              typeof value === "string" ? value.slice(0, 3) : value
            }
          />
          {dataKeys.map(({ key }, _index) => (
            <Bar key={key} dataKey={key} className={`${colourMap[colour]}`} />
          ))}
        </BarChart>
      </ChartContainer>
    </div>
  );
}
