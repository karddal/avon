"use client"
import {Card, CardContent, CardHeader, CardTitle} from "@/components/ui/card";
import {CartesianGrid, Line, LineChart, ReferenceLine, ResponsiveContainer, Tooltip, XAxis, YAxis} from "recharts";

export function StudentDetailCard() {
    const placeholderData = Array.from({ length: 10 }, (_, i) => ({
        attempt: i + 1,
        score: Math.floor(Math.random() * 101),
    }));
    const avg = Math.round(
        placeholderData.reduce((sum, d) => sum + d.score, 0) / Math.max(1, placeholderData.length)
    );

    return (
        <div className="flex flex-col lg:flex-row gap-4">
            <Card className="w-full">
                <CardHeader>
                    <CardTitle>
                        <div className="text-2xl">Student Detail</div>
                        <div className="font-light">
                            Select a student from the chart or top list above,
                            and all the scores of the student will be displayed here.
                        </div>
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="flex gap-4">
                        <div className="text-xl font-semibold">Student Name</div>
                        <div className="flex flex-wrap gap-2">
                            <span className="px-3 py-1 rounded-full bg-accent text-sm">Min —</span>
                            <span className="px-3 py-1 rounded-full bg-accent text-sm">Avg —</span>
                            <span className="px-3 py-1 rounded-full bg-accent text-sm">Max —</span>
                            <span className="px-3 py-1 rounded-full bg-accent text-sm">N=—</span>
                        </div>
                    </div>

                    <div className="h-64 w-full rounded-2xl border bg-accent/30">
                        <ResponsiveContainer width="100%" height="100%">
                            <LineChart data={placeholderData} margin={{ top: 8, right: 12, bottom: 8, left: -8 }}>
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
                                <Line type="linear" dataKey="score" dot={{ r: 3 }} activeDot={{ r: 5 }} />
                            </LineChart>
                        </ResponsiveContainer>
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}