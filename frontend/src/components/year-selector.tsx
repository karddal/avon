"use client";

import { Check, ChevronsUpDown } from "lucide-react";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandGroup,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";

type YearSelectorProps = {
  value: number | null;
  setValue: (value: number) => void;
};

export default function YearSelector({ value, setValue }: YearSelectorProps) {
  const [open, setOpen] = useState(false);

  // compute *numeric* year list around current year
  const current = new Date().getFullYear();
  const years = [
    { value: current, label: `${current}/${current + 1}` },
    { value: current - 1, label: `${current - 1}/${current}` },
    { value: current - 2, label: `${current - 2}/${current - 1}` },
  ];

  // set default if empty on first mount
  useEffect(() => {
    if (value == null) setValue(current);
  }, [value, current, setValue]);

  const currentLabel = years.find((y) => y.value === value)?.label ?? "";

  return (
    <div className="flex flex-row items-center">
      <p className="mt-1 mr-1">Year:</p>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            aria-expanded={open}
            className="w-[200px] justify-between"
          >
            {currentLabel || "Select Year"}
            <ChevronsUpDown className="opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-[200px] p-0">
          <Command>
            <CommandList>
              <CommandGroup>
                {years.map((option) => (
                  <CommandItem
                    key={option.value}
                    value={String(option.value)}
                    onSelect={() => {
                      setValue(option.value);
                      setOpen(false);
                    }}
                  >
                    {option.label}
                    <Check
                      className={cn(
                        "ml-auto",
                        value === option.value ? "opacity-100" : "opacity-0"
                      )}
                    />
                  </CommandItem>
                ))}
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
    </div>
  );
}
