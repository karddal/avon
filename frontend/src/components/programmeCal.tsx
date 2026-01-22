"use client";

import { parseDate } from "chrono-node";
import { ChevronDownIcon } from "lucide-react";
import * as React from "react";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { FieldGroup } from "./ui/field";
import { Separator } from "./ui/separator";

function toDateOnly(date: Date) {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  return d;
}

type calendarProps = {
  date: Date;
  setDate: (date: Date) => void;
  version: "start" | "end";
};

export function Calendar29({ props }: { props: calendarProps }) {
  const [openOne, setOpenOne] = React.useState(false);
  const [value, setValue] = React.useState("");
  return (
    <div className="flex flex-col gap-3">
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
                  {props.date
                    ? props.date.toLocaleDateString("en-GB", {
                        day: "2-digit",
                        month: "long",
                        year: "numeric",
                      })
                    : "Select date"}
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
                  fromYear={props.date.getFullYear() - 2}
                  toYear={props.date.getFullYear() + 10}
                  onSelect={(d) => {
                    if (!d) return;

                    const nextDate = new Date(d);
                    props.setDate(toDateOnly(nextDate));

                    setOpenOne(false);
                  }}
                />
              </PopoverContent>
            </Popover>
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
            placeholder="Tomorrow, next week, next Thursday..."
            className="pr-10 placeholder:text-sm"
            onChange={(e) => {
              setValue(e.target.value);
              const date = parseDate(e.target.value);
              if (date) {
                props.setDate(toDateOnly(date));
              }
            }}
          />
        </div>
      </FieldGroup>
      <div className="text-muted-foreground px-1 text-sm">
        The Programme will {props.version} on{" "}
        <span className="font-medium">{props.date.toDateString()}</span>.
      </div>
    </div>
  );
}
