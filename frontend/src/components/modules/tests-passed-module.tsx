import MetricChartModule from "@/components/modules/metric-chart-module";

export default function TestsPassedModule() {
  return (
    <MetricChartModule
      title="Tests Passed"
      colour="blue"
      data={[
        { day: "Monday", simplify: 9, sketch: 6 },
        { day: "Tuesday", simplify: 2, sketch: 4 },
        { day: "Wednesday", simplify: 1, sketch: 6 },
        { day: "Thursday", simplify: 5, sketch: 6 },
        { day: "Friday", simplify: 8, sketch: 10 },
        { day: "Saturday", simplify: 8, sketch: 10 },
        { day: "Sunday", simplify: 8, sketch: 10 },
      ]}
    />
  );
}
