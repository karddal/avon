"use client";

import { Check, ChevronsUpDown } from "lucide-react";
import { useEffect, useState, useTransition } from "react";
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
import { useRouter } from "next/navigation";

type YearSelectorProps = {
  value: number;
  currentTab: string;
};

export default function YearSelector({ value, currentTab }: YearSelectorProps) {
  const [open, setOpen] = useState(false);
  const router = useRouter()
  const [isPending, startTransition] = useTransition();

  // compute *numeric* year list around current year
  const current = new Date().getFullYear();
  const years = [
    { value: current, label: `${current}/${current + 1}` },
    { value: current - 1, label: `${current - 1}/${current}` },
    { value: current - 2, label: `${current - 2}/${current - 1}` },
  ];

  // set default if empty on first mount
  // useEffect(() => {
  //   if (value == null) setValue(current);
  // }, [value, current, setValue]);

  const handleYearChange = (newYear: number) => {
    setOpen(false)
    startTransition(() => {
      (newYear == current) ?
        router.push(`?year=${newYear}&tab=${"ongoing"}`) :
        router.push(`?year=${newYear}&tab=${"finished"}`)
    })
  }

  const currentLabel = years.find((y) => y.value === value)?.label ?? "";

  return (
    <div className="flex flex-row items-center h-full">
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
                    onSelect={() => handleYearChange(option.value)}
                  >
                    {option.label}
                    <Check
                      className={cn(
                        "ml-auto",
                        value === option.value ? "opacity-100" : "opacity-0",
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
// function setValue(current: number) {
//   throw new Error("Function not implemented.");
// }

