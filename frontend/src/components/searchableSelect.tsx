import React, {useEffect, useMemo, useState} from "react";
import {Popover, PopoverContent, PopoverTrigger} from "@/components/ui/popover";
import {Button} from "@/components/ui/button";
import {Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList} from "@/components/ui/command";
import {Check} from "lucide-react";

export type Option = { value: string;}

export interface SearchableSelectProps{
    value?: string
    defaultValue?: string
    onChange?: (value: string | undefined) => void
    options?: Option[]
    placeholder?: string
    searchPlaceholder?: string
    emptyMessage?: string
    clearable?: boolean
    prefix?: string
}

export function SearchableSelect(props: SearchableSelectProps) {
    const {
        value,
        defaultValue,
        onChange,
        options,
        placeholder,
        searchPlaceholder,
        emptyMessage,
        clearable,
        prefix,
    } = {
        options: [],
        placeholder: "Select an option",
        searchPlaceholder: "Enter keyword to search",
        emptyMessage: "No matching results",
        clearable: true,
        ...props,
    }

    const [open, setOpen] = useState(false)
    const [uncontrolledValue, setUncontrolledValue] = useState<string | undefined>(defaultValue)
    const selectedValue = value !== undefined ? value : uncontrolledValue
    const [query, setQuery] = useState('')

    const filtered = useMemo(() => {
        if (!query) return options
        const lowerCasedQuery = query.toLowerCase();
        return options?.filter(option =>
            option.value.toLowerCase().includes(lowerCasedQuery)
        )
    }, [options, query]) || []

    const applyChange = (nextValue: string | undefined) => {
        if (value === undefined) setUncontrolledValue(nextValue)
        props.onChange?.(nextValue)
    }

    const clearSelection = (event?: React.MouseEvent)=> {
        event?.stopPropagation()
        applyChange(undefined)
    }

    return (
        <div className="flex flex-col lg:flex-row gap-4">
            <Popover open={open} onOpenChange={setOpen}>
                <PopoverTrigger asChild>
                    <Button
                        type={"button"}
                        variant={"outline"}
                        role={"combobox"}
                        aria-expanded={open}
                        className="w-full justify-between"
                    >
                        <div className={"flex min-w-0 gap-1 truncate"}>
                            {prefix && (
                                <span className='text-muted-foreground'>{prefix}：</span>
                            )}
                            <span className={`${selectedValue ? '' : 'text-muted-foreground'} truncate`}>
                                {selectedValue ?? placeholder}
                            </span>
                        </div>
                        <div className={"flex gap-4"}>
                            {clearable && selectedValue && (
                                <span className={"cursor-pointer text-base"} onClick={clearSelection}>
                                    ×
                                </span>
                            )}
                        </div>
                    </Button>
                </PopoverTrigger>
                <PopoverContent className={'w-[--radix-popover-trigger-width] p-0'} align={"start"}>
                    <Command shouldFilter={false}>
                        <div className={'p-2'}>
                            <CommandInput
                                value={query}
                                onValueChange={setQuery}
                                placeholder={searchPlaceholder}
                                autoFocus
                            />
                        </div>
                        <CommandList className={'max-h-64'}>
                            <CommandEmpty>{emptyMessage}</CommandEmpty>
                            <CommandGroup>
                                {filtered.map(option => (
                                    <CommandItem
                                        key={option.value}
                                        value={option.value}
                                        onSelect={val => {
                                            const nextValue = val === selectedValue ? undefined : val
                                            applyChange(nextValue)
                                            setOpen(false)
                                        }}
                                    >
                                        <span>{option.value}</span>
                                    </CommandItem>
                                ))}
                            </CommandGroup>
                        </CommandList>
                    </Command>
                </PopoverContent>
            </Popover>
        </div>
    )
}