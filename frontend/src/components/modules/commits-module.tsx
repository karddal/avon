import MetricChartModule from "@/components/modules/metric-chart-module";

export default function CommitsModule() {
  return (
    <MetricChartModule
      title="Commits"
      colour="green"
      data={[
        { day: "Monday", simplify: 4, sketch: 6 },
        { day: "Tuesday", simplify: 2, sketch: 4 },
        { day: "Wednesday", simplify: 1, sketch: 6 },
        { day: "Thursday", simplify: 5, sketch: 6 },
        { day: "Friday", simplify: 8, sketch: 6 },
        { day: "Saturday", simplify: 8, sketch: 7 },
        { day: "Sunday", simplify: 8, sketch: 5 },
      ]}
    />
  );
}
