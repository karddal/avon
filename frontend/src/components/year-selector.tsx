import { Check, ChevronsUpDown } from "lucide-react"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
    Command,
    CommandEmpty,
    CommandGroup,
    CommandInput,
    CommandItem,
    CommandList,
} from "@/components/ui/command"
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover"
import { useState } from "react";

export default function YearSelector({ value, setValue }) {
    const [open, setOpen] = useState(false)
    // const [value, setValue] = useState("2025")

    const years = [
        { value: "2025", label: "2025/2026", },
        { value: "2024", label: "2024/2025", },
    ]

    return (
        <>

            <div className="flex flex-row">
                <p className="mt-1 mr-1">Year:</p>
                <div className="">
                    <Popover open={open} onOpenChange={setOpen}>
                        <PopoverTrigger asChild>
                            <Button
                                variant="outline"
                                role="combobox"
                                aria-expanded={open}
                                className="w-[200px] justify-between"
                            >
                                {value
                                    ? years.find((year) => year.value === value)?.label
                                    : ""}
                                <ChevronsUpDown className="opacity-50" />
                            </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-[200px] p-0">
                            <Command>
                                <CommandList>
                                    <CommandGroup>
                                        {years.map((years) => (
                                            <CommandItem
                                                key={years.value}
                                                value={years.value}
                                                onSelect={(currentValue) => {
                                                    setValue(currentValue === value ? "" : currentValue)
                                                    setOpen(false)
                                                }}
                                            >
                                                {years.label}
                                                <Check
                                                    className={cn(
                                                        "ml-auto",
                                                        value === years.value ? "opacity-100" : "opacity-0"
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
            </div>
        </>
    )
}