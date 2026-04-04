import { StatsChart } from "@/components/stats-chart";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

type MetricChartModuleProps = {
  title: string;
  colour: "red" | "green" | "blue";
  data: Array<{
    day: string;
    simplify: number;
    sketch: number;
  }>;
};

export default function MetricChartModule({
  title,
  colour,
  data,
}: MetricChartModuleProps) {
  return (
    <Card className="flex h-full min-h-0 flex-col gap-0 bg-accent p-2">
      <CardHeader className="p-0">
        <CardTitle className="p-2 text-center font-light lg:text-xl">
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent className="flex min-h-0 flex-1 flex-col p-2">
        <StatsChart
          className="hidden min-h-0 flex-1 md:flex md:aspect-auto"
          colour={colour}
          data={data}
          xAxisKey="day"
          dataKeys={[
            { key: "simplify", label: "Simplify" },
            { key: "sketch", label: "Sketch" },
          ]}
        />
      </CardContent>
    </Card>
  );
}
