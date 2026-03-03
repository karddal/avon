"use client";

import { addDays, addWeeks, format, startOfWeek } from "date-fns";
import { CalendarIcon, ChevronLeft, ChevronRight } from "lucide-react";
import { useMemo, useState } from "react";
import AcademicYearStepper from "@/components/academic-year-stepper";
import {
  SearchableSelect,
  type SearchableSelectOption,
} from "@/components/searchableSelect";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Card, CardContent } from "@/components/ui/card";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useIsMobile } from "@/hooks/use-mobile";

export function CalendarNavigationCard({
  weekStartDate,
  onWeekStartDateChange,
  unitOptions = [],
  onUnitIdsChange,
  tab,
  academicYearStart,
  onAcademicYearStartChange,
}: {
  weekStartDate: Date;
  onWeekStartDateChange: (date: Date) => void;
  unitOptions?: SearchableSelectOption[];
  onUnitIdsChange: (unitIds: string[]) => void;
  tab: "timetable" | "events";
  academicYearStart: number;
  onAcademicYearStartChange: (yearStart: number) => void;
}) {
  const isMobile = useIsMobile();

  const weekStart = useMemo(
    () => startOfWeek(weekStartDate, { weekStartsOn: 1 }),
    [weekStartDate],
  );
  const weekEnd = addDays(weekStart, 6);

  const weekRange = `${format(weekStart, "MMM d")} – ${format(weekEnd, "MMM d")}`;

  const _dayLabel = format(weekStartDate, "MMM d");

  const [selectedUnitIds, setSelectedUnitIds] = useState<string[]>([]);

  return (
    <Card className="w-full">
      <CardContent className="px-3 flex flex-col gap-4">
        <div className="flex flex-col lg:flex-row w-full justify-between gap-4">
          <div className="w-full lg:w-auto">
            <TabsList className="h-9 w-full lg:w-auto">
              <TabsTrigger value="timetable" className="text-sm px-3">
                Timetable
              </TabsTrigger>
              <TabsTrigger value="events" className="text-sm px-3">
                Events
              </TabsTrigger>
            </TabsList>
          </div>

          <div className="flex flex-row gap-2 items-center justify-center">
            {tab === "timetable" ? (
              <div className="text-center font-semibold leading-none flex flex-row gap-4 items-center">
                {weekRange}
                {tab === "timetable" && (
                  <div className="flex flex-row h-9 justify-center items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      className="h-full"
                      onClick={() => {
                        onWeekStartDateChange(
                          isMobile
                            ? addDays(weekStartDate, -1)
                            : addWeeks(weekStart, -1),
                        );
                      }}
                      title={isMobile ? "Previous day" : "Last week"}
                    >
                      <ChevronLeft />
                    </Button>

                    <Button
                      variant="outline"
                      size="sm"
                      data-cy="nav-today"
                      className="h-full"
                      onClick={() =>
                        onWeekStartDateChange(
                          isMobile
                            ? new Date()
                            : startOfWeek(new Date(), { weekStartsOn: 1 }),
                        )
                      }
                      title="Today"
                    >
                      Today
                    </Button>

                    <Button
                      variant="outline"
                      size="sm"
                      className="h-full"
                      onClick={() => {
                        onWeekStartDateChange(
                          isMobile
                            ? addDays(weekStartDate, 1)
                            : addWeeks(weekStart, 1),
                        );
                      }}
                      title={isMobile ? "Next day" : "Next week"}
                    >
                      <ChevronRight />
                    </Button>

                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          size="sm"
                          className="h-full"
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
                            if (!date) return;
                            onWeekStartDateChange(
                              isMobile
                                ? date
                                : startOfWeek(date, { weekStartsOn: 1 }),
                            );
                          }}
                        />
                      </PopoverContent>
                    </Popover>
                  </div>
                )}
              </div>
            ) : (
              <AcademicYearStepper
                value={academicYearStart}
                onChange={onAcademicYearStartChange}
              />
            )}
          </div>

          <div className="flex flex-row gap-2">
            <SearchableSelect
              data-cy="units-select"
              multiple={true}
              prefix="Units"
              placeholder="All units"
              options={unitOptions}
              values={selectedUnitIds}
              onChangeMultiple={(ids) => {
                setSelectedUnitIds(ids);
                onUnitIdsChange(ids);
              }}
            />

            <Button
              variant="outline"
              onClick={() => setSelectedUnitIds([])}
              disabled={selectedUnitIds.length === 0}
              title="Clear unit filters"
              data-cy="units-reset"
              className="h-full"
            >
              Reset
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
