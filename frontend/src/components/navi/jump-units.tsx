"use client";

import { Book, NotepadText } from "lucide-react";
import { useRouter } from "next/navigation";
import React from "react";
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from "@/components/ui/command";

type Unit = {
  id: string;
  name: string;
  description: string;
  creation_date: string;
  unit_code: string;
  colour: string;
  programme_id: string;
};

type Coursework = {
  id: string;
  name: string;
  description: string;
  unit_id: string;
  creation_date: string;
  due_date: string;
  colour: string;
};

export default function JumpUnits({
  units,
  coursework,
}: {
  units: Unit[];
  coursework: Coursework[];
}) {
  const [open, setOpen] = React.useState(false);
  const router = useRouter();
  React.useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen((open) => !open);
      }
    };
    document.addEventListener("keydown", down);
    return () => document.removeEventListener("keydown", down);
  }, []);
  return (
    <CommandDialog
        open={open}
        onOpenChange={setOpen}
        className="sm:max-w-4xl h-[min(80vh,760px)]"
    >
        <CommandInput
            placeholder={"Jump to..."}
            className="text-lg h-14"
        />

        <CommandList className="flex-1 overflow-y-auto max-h-none text-base">
            <CommandEmpty className="py-6 text-lg">
                No results found :(
            </CommandEmpty>

            <CommandGroup
                heading={"Active units"}
                className="[&_[cmdk-group-heading]]:text-lg [&_[cmdk-group-heading]]:py-3"
            >
                {units.map((unit) => (
                    <CommandItem
                        key={unit.id}
                        keywords={[unit.name, unit.unit_code]}
                        onSelect={() => {
                            setOpen(false);
                            router.push(`/units/${unit.id}`);
                        }}
                        className="py-4 text-lg gap-4"
                    >
                        <Book className="h-6 w-6" />
                        <div className="flex items-baseline gap-2">
                            <span>{unit.name}</span>
                            <span className="text-muted-foreground text-base">
                                {unit.unit_code}
                            </span>
                        </div>
                    </CommandItem>
                ))}
            </CommandGroup>

            <CommandSeparator />

            <CommandGroup
                heading={"Active courseworks"}
                className="[&_[cmdk-group-heading]]:text-lg [&_[cmdk-group-heading]]:py-3"
            >
                {coursework.map((cw) => (
                    <CommandItem
                        key={cw.id}
                        keywords={[cw.name]}
                        onSelect={() => {
                            setOpen(false);
                            router.push(`/coursework/${cw.id}`);
                        }}
                        className="py-4 text-lg gap-4"
                    >
                        <NotepadText className="h-6 w-6" />
                        <div className="flex items-baseline gap-2">
                            <span>{cw.name}</span>
                        </div>
                    </CommandItem>
                ))}
            </CommandGroup>
        </CommandList>
    </CommandDialog>
  );
}
