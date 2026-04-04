import MetricChartModule from "@/components/modules/metric-chart-module";

export default function AiCommitsModule() {
  return (
    <MetricChartModule
      title="AI Commits"
      colour="blue"
      data={[
        { day: "Monday", simplify: 1, sketch: 0 },
        { day: "Tuesday", simplify: 2, sketch: 1 },
        { day: "Wednesday", simplify: 1, sketch: 2 },
        { day: "Thursday", simplify: 2, sketch: 1 },
        { day: "Friday", simplify: 2, sketch: 0 },
        { day: "Saturday", simplify: 1, sketch: 1 },
        { day: "Sunday", simplify: 0, sketch: 2 },
      ]}
    />
  );
}
