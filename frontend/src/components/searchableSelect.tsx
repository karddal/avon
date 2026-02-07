import type React from "react";
import { useMemo, useState } from "react";
import { buttonVariants } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";

export type SearchableSelectOption = {
  value: string;
  label?: string;
};

export interface SearchableSelectProps {
  //single choose
  value?: string;
  defaultValue?: string;
  onChange?: (value: string | undefined) => void;

  //multiple choose
  multiple?: boolean;
  values?: string[];
  defaultValues?: string[];
  onChangeMultiple?: (values: string[]) => void;

  options?: SearchableSelectOption[];
  placeholder?: string;
  searchPlaceholder?: string;
  emptyMessage?: string;
  clearable?: boolean;
  prefix?: string;
}

export function SearchableSelect(props: SearchableSelectProps) {
  const {
    value,
    defaultValue,
    options,
    placeholder,
    searchPlaceholder,
    emptyMessage,
    clearable,
    prefix,
    multiple,
    values,
    defaultValues,
  } = {
    options: [],
    placeholder: "Select an option",
    searchPlaceholder: "Enter keyword to search",
    emptyMessage: "No matching results",
    clearable: true,
    multiple: false,
    ...props,
  };

  const [open, setOpen] = useState(false);

  //single choice
  const [uncontrolledValue, setUncontrolledValue] = useState<
    string | undefined
  >(defaultValue);
  const selectedValue = value !== undefined ? value : uncontrolledValue;

  //multiple
  const [uncontrolledValues, setUncontrolledValues] = useState<string[]>(
    defaultValues ?? [],
  );
  const selectedValues = values !== undefined ? values : uncontrolledValues;

  const [query, setQuery] = useState("");

  const filtered =
    useMemo(() => {
      if (!query) return options;
      const lowerCasedQuery = query.toLowerCase();
      return options?.filter((option) => {
        const content = `${option.label ?? ""} ${option.value}`.toLowerCase();
        return content.includes(lowerCasedQuery);
      });
    }, [options, query]) || [];

  const applySingleChange = (nextValue: string | undefined) => {
    if (value === undefined) setUncontrolledValue(nextValue);
    props.onChange?.(nextValue);
  };

  const clearSingleSelection = (event?: React.MouseEvent) => {
    event?.stopPropagation();
    applySingleChange(undefined);
  };

  const selectedSingleLabel = useMemo(() => {
    if (!selectedValue) return undefined;
    return (
      options.find((option) => option.value === selectedValue)?.label ||
      selectedValue
    );
  }, [options, selectedValue]);

  const applyMultipleChange = (nextValue: string[]) => {
    if (values === undefined) setUncontrolledValues(nextValue);
    props.onChangeMultiple?.(nextValue);
  };

  const toggleMultiple = (value: string) => {
    const nextValue = selectedValues.includes(value)
      ? selectedValues.filter((val) => val !== value)
      : [...selectedValues, value];
    applyMultipleChange(nextValue);
  };

  const clearMultiple = (event?: React.MouseEvent) => {
    event?.stopPropagation();
    applyMultipleChange([]);
  };

  const hasSelection = multiple ? selectedValues.length > 0 : !!selectedValue;

  const displayText = multiple
    ? selectedValues.length > 0
      ? `${selectedValues.length} selected`
      : placeholder
    : (selectedSingleLabel ?? placeholder);

  return (
    <div className="flex-1">
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <div
            role={"combobox"}
            aria-expanded={open}
            tabIndex={0}
            className={cn(
              buttonVariants({ variant: "outline" }),
              "flex w-full items-center justify-center text-center",
              "cursor-pointer select-none",
            )}
          >
            <div className={"flex min-w-0 gap-1 truncate text-center"}>
              {prefix && (
                <span className="text-muted-foreground">{prefix}：</span>
              )}
              <span
                className={`${
                  hasSelection ? "" : "text-muted-foreground"
                } truncate`}
              >
                {displayText}
              </span>
            </div>
            <div className={"flex gap-4"}>
              {clearable && hasSelection && (
                <button
                  type="button"
                  className={"cursor-pointer text-base"}
                  onClick={(event) => {
                    event.preventDefault();
                    event.stopPropagation();
                    multiple
                      ? clearMultiple(event)
                      : clearSingleSelection(event);
                  }}
                  aria-label="Clear selection"
                >
                  ×
                </button>
              )}
            </div>
          </div>
        </PopoverTrigger>
        <PopoverContent
          className={"w-[--radix-popover-trigger-width] p-0"}
          align={"start"}
        >
          <Command shouldFilter={false}>
            <div className={"p-2"}>
              <CommandInput
                value={query}
                onValueChange={setQuery}
                placeholder={searchPlaceholder}
                autoFocus
              />
            </div>
            <CommandList className={"max-h-64"}>
              <CommandEmpty>{emptyMessage}</CommandEmpty>
              <CommandGroup>
                {filtered.map((option) => {
                  const checked =
                    multiple && selectedValues.includes(option.value);

                  return (
                    <CommandItem
                      key={option.value}
                      value={option.value}
                      onSelect={(val) => {
                        if (multiple) {
                          toggleMultiple(val);
                          return;
                        }
                        const nextValue =
                          val === selectedValue ? undefined : val;
                        applySingleChange(nextValue);
                        setOpen(false);
                      }}
                    >
                      {multiple && (
                        <span className="mr-2 inline-flex h-4 w-4 items-center justify-center rounded border text-xs">
                          {checked ? "✓" : ""}
                        </span>
                      )}
                      <span>{option.label || option.value}</span>
                    </CommandItem>
                  );
                })}
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
    </div>
  );
}
