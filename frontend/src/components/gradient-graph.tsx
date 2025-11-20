"use client";

import { useState } from "react";

import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface gradientDataPoint {
    uuid: number;
    name: string;
    score: number;
    [key: string]: string | number;
}

interface gradientData {
  studentData: gradientDataPoint[];
  className?: string;
  onSelectStudent?: (student: gradientDataPoint) => void;
}

export default function GradientGraph({
    studentData,
    className,
    onSelectStudent,
}: gradientData) {
  const sortedByName = [...studentData].sort((a, b) =>
    String(a.name).localeCompare(String(b.name))
  );
  const [hovered, setHovered] = useState<number | null>();

  return (
    <div
      className={`border flex flex-row flex-wrap justify-center items-center gap-2 p-4 ${className}`}
    >
      {sortedByName.map((student) => {
        const hue = (Number(student.score) * 120) / 100;
        const colour = `hsl(${hue}, 100%, 40%)`;
        const hoverColour = `hsl(${hue}, 100%, 60%)`;
        return (
          <Tooltip key={student.uuid}>
            <TooltipTrigger>
              <div
                className="aspect-square size-8 border cursor-pointer"
                onMouseEnter={() => setHovered(Number(student.uuid))}
                onMouseLeave={() => setHovered(null)}
                onClick={() => {
                    if (onSelectStudent) {
                        onSelectStudent(student);
                    }
                }}
                style={{
                  backgroundColor:
                    hovered === student.uuid ? hoverColour : colour,
                }}
              ></div>
            </TooltipTrigger>
            <TooltipContent>
              ID: {student.uuid}
              <br />
              Name: {student.name}
              <br />
              Score: {student.score}
            </TooltipContent>
          </Tooltip>
        );
      })}
    </div>
  );
}
