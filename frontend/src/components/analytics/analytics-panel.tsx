"use client"

import {useMemo, useState} from "react"
import { StudentListCard } from "./student-list-card"
import { StudentDetailCard } from "./student-details-card"
import {GraphCard} from "@/components/analytics/graph-card";
import GradientGraph from "@/components/gradient-graph";

export type ScorePoint = {
    attempt: number;
    score: number;
};

export type Student = {
    id: number;
    name: string;
    studentNumber: string;
    averageScore: number;
    scores: ScorePoint[];
};

export type StudentDataPoint = {
    uuid: number;
    name: string;
    score: number;
};

export function AnalyticsPanel() {
    const [selectedStudentId, setSelectedStudentId] = useState<number | null>(null)

    const students = useMemo<Student[]>(() => {
        return Array.from({ length: 150 }, (_, i) => {
            const id = i + 1;
            const name = `${id} Student`;
            const studentNumber = `S${String(id).padStart(4, "0")}`

            const baseScore = Math.floor(Math.random() * 101); // 0~100

            const scores: ScorePoint[] = Array.from(
                { length: 10 },
                (_, attemptIndex) => {
                    const noise = Math.floor(Math.random() * 21) - 10; // -10~+10
                    const raw = baseScore + noise;
                    const clamped = Math.max(0, Math.min(100, raw));
                    return {
                        attempt: attemptIndex + 1,
                        score: clamped,
                    }
                }
            )

            const averageScore = Math.round(
                scores.reduce((sum, s) => sum + s.score, 0) / scores.length
            )

            return {
                id,
                name,
                studentNumber,
                averageScore,
                scores,
            }
        })
    }, [])

    const studentDataForGraph: StudentDataPoint[] = useMemo(
        () =>
            students.map((s) => ({
                uuid: s.id,
                name: s.name,
                score: s.averageScore,
            })),
        [students]
    )

    const selectedStudent = selectedStudentId == null ? null : students.find((s) => s.id === selectedStudentId) ?? null


    if (selectedStudent) {
        return (
            <StudentDetailCard
                student={selectedStudent}
                onBack={() => setSelectedStudentId(null)}
            />
        )
    }

    return (
        <div className="space-y-6">
            <div className="flex flex-col lg:flex-row gap-4">
                <GraphCard>
                    <GradientGraph
                        className="bg-accent"
                        studentData={studentDataForGraph}
                        onSelectStudent={(point) => {
                            setSelectedStudentId(Number(point.uuid));
                        }}
                    />
                </GraphCard>
            </div>

            <StudentListCard
                students={students}
                onSelectStudent={(student) => setSelectedStudentId(student.id)}
            />
        </div>
    )
}
