"use client";

import { useMemo, useState } from "react";
import type { Student } from "@/components/analytics/analytics-panel";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { cn } from "@/lib/utils";

interface StudentListCardProps {
  students: Student[];
  onSelectStudent: (student: Student) => void;
  className?: string;
}

export function StudentListCard({
  students,
  onSelectStudent,
  className,
}: StudentListCardProps) {
  const [search, setSearch] = useState("");
  const filteredStudents = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return students;
    return students.filter((student) => {
      return (
        student.name.toLowerCase().includes(q) ||
        student.studentNumber.toLowerCase().includes(q)
      );
    });
  }, [students, search]);

  return (
    <Card className={cn("flex-1", className)}>
      <CardHeader className="flex flex-row items-center justify-between gap-2 sticky">
        <div>
          <CardTitle className="text-2xl">Students</CardTitle>
          <CardDescription>
            List of students and basic performance information.
          </CardDescription>
        </div>
        <div className="w-full max-w-xs">
          <Input
            placeholder="Search by name or id"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="h-8 text-sm"
          />
        </div>
      </CardHeader>

      <CardContent className="px-4 overflow-y-scroll h-72">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Student ID</TableHead>
              <TableHead className="text-right">Average Score</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredStudents.length === 0 && (
              <TableRow>
                <TableCell
                  colSpan={3}
                  className="py-6 text-center text-sm text-muted-foreground"
                >
                  No students found.
                </TableCell>
              </TableRow>
            )}

            {filteredStudents.map((student) => (
              <TableRow
                key={student.id}
                className={"cursor-pointer hover:bg-muted/60"}
                onClick={() => onSelectStudent(student)}
              >
                <TableCell className="font-medium">{student.name}</TableCell>
                <TableCell>{student.studentNumber}</TableCell>
                <TableCell className="text-right">
                  {student.averageScore}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
