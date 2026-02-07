"use client"

import {useMemo} from "react";
import {cn} from "@/lib/utils";
import {Button} from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";

type AcademicYearStepperProps = {
    value: number
    onChange: (nextStartYear: number) => void
    className?: string
}

export default function AcademicYearStepper(
    {
        value,
        onChange,
        className,
    }: AcademicYearStepperProps
) {
    const label = useMemo(() => `${value}/${value + 1}`, [value])

    return (
        <div
            className={cn(
                "flex items-center gap-2 h-9 rounded-md border bg-background px-2",
                className
            )}
        >
            <Button
                variant="ghost"
                size="icon"
                onClick={() => {onChange(value -1)}}
                title="Previous academic year"
                aria-label="Previous academic year"
            >
                <ChevronLeft/>
            </Button>

            <div
                className="min-w-[120px] text-center text-sm font-semibold leading-none select-none"
            >
                {label}
            </div>

            <Button
                variant="ghost"
                size="icon"
                onClick={() => {onChange(value + 1)}}
                title="Next academic year"
                aria-label="Next academic year"
            >
                <ChevronRight/>
            </Button>
        </div>
    )
}