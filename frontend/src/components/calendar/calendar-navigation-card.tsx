"use client"

import {Card, CardContent} from "@/components/ui/card";
import {Button} from "@/components/ui/button";
import {addDays, addWeeks, format, startOfWeek} from "date-fns";
import {useEffect, useMemo, useState} from "react";
import {Popover, PopoverContent, PopoverTrigger} from "@/components/ui/popover";
import {CalendarCheck, CalendarIcon, ChevronLeft, ChevronRight} from "lucide-react";
import {Calendar} from "@/components/ui/calendar";
import {TabsList, TabsTrigger} from "@/components/ui/tabs";
import {SearchableSelect, type SearchableSelectOption} from "@/components/searchableSelect";

export function CalendarNavigationCard(
    {
        weekStartDate,
        onWeekStartDateChange,
        unitOptions = [],
        onUnitIdsChange,
    }:{
        weekStartDate: Date;
        onWeekStartDateChange: (date: Date) => void
        unitOptions?: SearchableSelectOption[]
        onUnitIdsChange: (unitIds: string[]) => void
    }
) {
    const weekStart = useMemo(() =>startOfWeek(weekStartDate, {weekStartsOn: 1}), [weekStartDate])
    const weekEnd = addDays(weekStart, 6)

    const weekRange = `${format(weekStart, "MMM d")} – ${format(weekEnd, "MMM d")}`

    const [selectedUnitIds, setSelectedUnitIds] = useState<string[]>([])
    useEffect(() => {
        onUnitIdsChange(selectedUnitIds)
    }, [selectedUnitIds, onUnitIdsChange])

    return (
        <Card className= "w-full">
            <CardContent className="px-3 py-2">
                <div className="relative h-9">
                    <div className="absolute left-0 top-1/2 -translate-y-1/2">
                        <TabsList className="h-9">
                            <TabsTrigger value="timetable" className="text-sm px-3">
                                timetable
                            </TabsTrigger>
                            <TabsTrigger value="events" className="text-sm px-3">
                                events
                            </TabsTrigger>
                        </TabsList>
                    </div>

                    <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 text-base font-semibold leading-none">
                        {weekRange}
                    </div>

                    <div className="absolute right-0 top-1/2 -translate-y-1/2 w-[260px]">
                        <SearchableSelect
                            multiple={true}
                            prefix="Units"
                            placeholder="All units"
                            options={unitOptions}
                            defaultValues={[]}
                            onChangeMultiple={(ids) => setSelectedUnitIds(ids)}
                        />

                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setSelectedUnitIds([])}
                            disabled={selectedUnitIds.length === 0}
                            title="Clear unit filters"
                        >
                            Reset
                        </Button>
                    </div>
                </div>

                <div className="relative mt-2 h-10">
                    <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
                        <div className="flex justify-center items-center gap-3">
                            <Button
                                variant="outline"
                                size="icon-lg"
                                onClick={() => onWeekStartDateChange(addWeeks(weekStart, -1))}
                                title="Last week"
                            >
                                <ChevronLeft />
                            </Button>

                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => onWeekStartDateChange(startOfWeek(new Date(), {weekStartsOn: 1}))}
                                title="Today"
                            >
                                Today
                            </Button>

                            <Button
                                variant="outline"
                                size="icon-lg"
                                onClick={() => onWeekStartDateChange(addWeeks(weekStart, 1))}
                                title="Next week"
                            >
                                <ChevronRight />
                            </Button>

                            <Popover>
                                <PopoverTrigger asChild>
                                    <Button
                                        variant="outline"
                                        size="icon-lg"
                                        title="Jump to date"
                                    >
                                        <CalendarIcon />
                                    </Button>
                                </PopoverTrigger>
                                <PopoverContent className="p-2 w-auto" align="end">
                                    <Calendar
                                        mode="single"
                                        selected={weekStartDate}
                                        onSelect={(date) => {
                                            if (!date) return
                                            onWeekStartDateChange(startOfWeek(date, {weekStartsOn: 1}));
                                        }}
                                    />
                                </PopoverContent>
                            </Popover>
                        </div>
                    </div>
                </div>
            </CardContent>
        </Card>
    )
}