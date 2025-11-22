"use client";

import { parseDate } from "chrono-node";
import { setDate } from "date-fns";
import { CalendarIcon, ChevronDownIcon } from "lucide-react";
import * as React from "react";
import { date } from "zod";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { FieldGroup, FieldSeparator } from "./ui/field";
import { Separator } from "./ui/separator";

function formatDate(date: Date | undefined) {
  if (!date) {
    return "";
  }

  return date.toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

type calendarProps = {
  date: Date;
  setDate: (date: Date) => void;
};

export function Calendar29({ props }: { props: calendarProps }) {
  const [open, setOpen] = React.useState(false);
  const [openOne, setOpenOne] = React.useState(false);
  const [value, setValue] = React.useState("");
  return (
    <div className="flex flex-col gap-3">
      <Label htmlFor="date" className="px-1">
        Due date and time
      </Label>

      <FieldGroup>
        <div className="flex gap-4">
          <div className="flex flex-col gap-3">
            <Popover open={openOne} onOpenChange={setOpenOne}>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  id="date-picker"
                  className="w-50 justify-between font-normal"
                >
                  {props.date ? props.date.toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  }) : "Select date"}
                  <ChevronDownIcon />
                </Button>
              </PopoverTrigger>
              <PopoverContent
                className="w-auto overflow-hidden p-0"
                align="start"
              >
                <Calendar
                  mode="single"
                  selected={props.date}
                  captionLayout="dropdown"
                  onSelect={(d) => {
                    if (d) {
                      props.setDate(d);
                    }
                    setOpen(false);
                  }}
                />
              </PopoverContent>
            </Popover>
          </div>
          <div className="flex flex-col gap-3">
            <Input
              type="time"
              id="time-picker"
              step="60"
              defaultValue="13:00"
              onChange={(t) => {
                const [hours, mins] = t.target.value.split(":").map(Number);
                const oldDate = props.date;
                oldDate.setHours(hours);
                oldDate.setMinutes(mins);
                oldDate.setSeconds(0);
                props.setDate(oldDate);
              }}
              className="bg-background appearance-none [&::-webkit-calendar-picker-indicator]:hidden [&::-webkit-calendar-picker-indicator]:appearance-none"
            />
          </div>
        </div>
        <Separator />
        <div className="flex flex-col gap-4">
          <Label htmlFor="date" className="px-1 mb-0">
          Or, use natural language
        </Label>
          <Input
            id="date"
            value={value}
            placeholder="Tomorrow at 12:00, next week, next Thursday..."
            className="pr-10"
            onChange={(e) => {
              setValue(e.target.value);
              const date = parseDate(e.target.value);
              if (date) {
                props.setDate(date);
              }
            }}
            onKeyDown={(e) => {
              if (e.key === "ArrowDown") {
                e.preventDefault();
                setOpen(true);
              }
            }}
          />
        </div>
      </FieldGroup>
      <div className="text-muted-foreground px-1 text-sm">
        The coursework will be due on{" "}
        <span className="font-medium">{formatDate(props.date)}</span>.
      </div>
    </div>
  );
}
