"use client";
import { StatsChart } from "@/components/stats-chart";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function DashboardAnalysis() {
  return (
    <Card className="col-span-3 gap-0 shadow-none border-none bg-background">
      <CardContent className="grid xl:grid-cols-4 md:grid-cols-2 grid-cols-1 gap-4">
        <Card className="p-2 gap-0 bg-accent flex flex-col justify-between">
          <CardHeader className="p-0">
            <CardTitle className="text-center lg:text-xl font-light p-2">
              Commits
            </CardTitle>
          </CardHeader>
          <CardContent>
            <StatsChart
              className="hidden md:flex"
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
              xAxisKey="day"
              dataKeys={[
                { key: "simplify", label: "Simplify" },
                { key: "sketch", label: "Sketch" },
              ]}
            />
          </CardContent>
        </Card>
        <Card className="p-2 gap-0 bg-accent flex flex-col justify-between">
          <CardHeader className="p-0">
            <CardTitle className="text-center text-normal lg:text-xl font-light py-2">
              Tests passed
            </CardTitle>
          </CardHeader>
          <CardContent>
            <StatsChart
              className="hidden md:flex"
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
              xAxisKey="day"
              dataKeys={[
                { key: "simplify", label: "Simplify" },
                { key: "sketch", label: "Sketch" },
              ]}
            />
          </CardContent>
        </Card>
        <Card className="align-center p-2 gap-0 bg-accent flex flex-col justify-between">
          <CardHeader className="p-0">
            <CardTitle className="text-center text-normal lg:text-xl font-light py-2">
              Late submissions
            </CardTitle>
          </CardHeader>
          <CardContent>
            <StatsChart
              className="hidden md:flex"
              colour="red"
              data={[
                { day: "Monday", simplify: 1, sketch: 0 },
                { day: "Tuesday", simplify: 2, sketch: 1 },
                { day: "Wednesday", simplify: 1, sketch: 2 },
                { day: "Thursday", simplify: 2, sketch: 1 },
                { day: "Friday", simplify: 2, sketch: 0 },
                { day: "Saturday", simplify: 1, sketch: 1 },
                { day: "Sunday", simplify: 0, sketch: 2 },
              ]}
              xAxisKey="day"
              dataKeys={[
                { key: "simplify", label: "Simplify" },
                { key: "sketch", label: "Sketch" },
              ]}
            />
          </CardContent>
        </Card>
        <Card className="p-2 gap-0 bg-accent flex flex-col justify-between">
          <CardHeader className="p-0">
            <CardTitle className="text-center text-normal lg:text-xl font-light py-2">
              AI Commits
            </CardTitle>
          </CardHeader>
          <CardContent>
            <StatsChart
              className="hidden md:flex"
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
              xAxisKey="day"
              dataKeys={[
                { key: "simplify", label: "Simplify" },
                { key: "sketch", label: "Sketch" },
              ]}
            />
          </CardContent>
        </Card>
      </CardContent>
    </Card>
  );
}
