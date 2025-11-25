"use client";
import {
  CartesianGrid,
  Line,
  LineChart,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import type { Student } from "@/components/analytics/analytics-panel";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface StudentDetailCardProps {
  student: Student;
  onBack: () => void;
  className?: string;
}

export function StudentDetailCard({
  student,
  onBack,
  className,
}: StudentDetailCardProps) {
  const data = student.scores;
  const avg =
    data.length === 0
      ? 0
      : Math.round(data.reduce((sum, d) => sum + d.score, 0) / data.length);
  const min = data.length === 0 ? 0 : Math.min(...data.map((d) => d.score));
  const max = data.length === 0 ? 0 : Math.max(...data.map((d) => d.score));

  return (
    <div className="flex flex-col lg:flex-row gap-4">
      <Card className={cn("w-full", className)}>
        <CardHeader>
          <CardTitle>
            <div className="flex items-center gap-2 mb-2">
              <Button variant="ghost" size="icon" onClick={onBack}>
                ←
              </Button>
            </div>
            <div>
              <div className="text-2xl">Student Detail</div>
              <div className="font-light">
                {student.name} · ID: {student.studentNumber}
                Select a student from the chart or top list above, and all the
                scores of the student will be displayed here.
              </div>
            </div>
          </CardTitle>
        </CardHeader>

        <CardContent className="space-y-4">
          <div className={"flex flex-wrap items-center gap-4"}>
            <div className={"text-xl font-semibold"}>
              Student Name: {student.name}
            </div>
            <div className="flex flex-wrap gap-2">
              <span className="px-3 py-1 rounded-full bg-accent text-sm">
                Min — {min}
              </span>
              <span className="px-3 py-1 rounded-full bg-accent text-sm">
                Avg — {avg}
              </span>
              <span className="px-3 py-1 rounded-full bg-accent text-sm">
                Max — {max}
              </span>
              <span className="px-3 py-1 rounded-full bg-accent text-sm">
                N=—{data.length}
              </span>
            </div>
          </div>

          <div className="h-64 w-full rounded-2xl border bg-accent/30">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart
                data={data}
                margin={{ top: 8, right: 12, bottom: 8, left: -8 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="attempt" tickLine={false} />
                <YAxis domain={[0, 100]} tickLine={false} />
                <Tooltip />
                <ReferenceLine
                  y={avg}
                  strokeDasharray="6 6"
                  label={{
                    value: `Average mark ${avg}`,
                    position: "insideRight",
                    offset: 8,
                    fontSize: 16,
                  }}
                />
                <Line
                  type="linear"
                  dataKey="score"
                  dot={{ r: 3 }}
                  activeDot={{ r: 5 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
