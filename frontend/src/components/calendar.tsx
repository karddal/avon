"use client"

import * as React from "react"
import {parseDate} from "chrono-node"
import {CalendarIcon} from "lucide-react"

import {Button} from "@/components/ui/button"
import {Calendar} from "@/components/ui/calendar"
import {Input} from "@/components/ui/input"
import {Label} from "@/components/ui/label"
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover"

function formatDate(date: Date | undefined) {
    if (!date) {
        return ""
    }

    return date.toLocaleDateString("en-US", {
        day: "2-digit",
        month: "long",
        year: "numeric",
    })
}

type calendarProps = {
    date: Date,
    setDate: (date: Date) => void
}

export function Calendar29({props}: {props: calendarProps}) {
    const [open, setOpen] = React.useState(false)
    const [value, setValue] = React.useState("")
    return (
        <div className="flex flex-col gap-3">
            <Label htmlFor="date" className="px-1">
                Due date
            </Label>
            <div className="relative flex gap-2">
                <Input
                    id="date"
                    value={value}
                    placeholder="Tomorrow, next week, next Thursday..."
                    className="bg-background pr-10"
                    onChange={(e) => {
                        setValue(e.target.value)
                        const date = parseDate(e.target.value)
                        if (date) {
                            props.setDate(date)
                        }
                    }}
                    onKeyDown={(e) => {
                        if (e.key === "ArrowDown") {
                            e.preventDefault()
                            setOpen(true)
                        }
                    }}
                />
                <Popover open={open} onOpenChange={setOpen}>
                    <PopoverTrigger asChild>
                        <Button
                            id="date-picker"
                            variant="ghost"
                            className="absolute top-1/2 right-2 size-6 -translate-y-1/2"
                        >
                            <CalendarIcon className="size-3.5"/>
                            <span className="sr-only">Select date</span>
                        </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto overflow-hidden p-0" align="end">
                        <Calendar
                            mode="single"
                            selected={props.date}
                            captionLayout="dropdown"
                            onMonthChange={props.setDate}
                            onSelect={(date) => {
                                date ? props.setDate(date) : null
                                setValue(formatDate(date))
                                setOpen(false)
                            }}
                        />
                    </PopoverContent>
                </Popover>
            </div>
            <div className="text-muted-foreground px-1 text-sm">
                The coursework will be due on {" "}
                <span className="font-medium">{formatDate(props.date)}</span>.
            </div>
        </div>
    )
}
