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
    <CommandDialog open={open} onOpenChange={setOpen}>
      <CommandInput placeholder={"Jump to..."} />
      <CommandList>
        <CommandEmpty>No results found :(</CommandEmpty>
        <CommandGroup heading={"Active units"}>
          {units.map((unit) => (
            <CommandItem
              key={unit.id}
              keywords={[unit.name, unit.unit_code]}
              onSelect={() => {
                setOpen(false);
                router.push(`/units/${unit.id}`);
              }}
            >
              <Book />
              <div>
                {unit.name}{" "}
                <span className={"text-muted-foreground"}>
                  {" "}
                  {unit.unit_code}
                </span>
              </div>
            </CommandItem>
          ))}
        </CommandGroup>
        <CommandSeparator />
        <CommandGroup heading={"Active courseworks"}>
          {coursework.map((cw) => (
            <CommandItem
              key={cw.id}
              keywords={[cw.name]}
              onSelect={() => {
                setOpen(false);
                router.push(`/coursework/${cw.id}`);
              }}
            >
              <NotepadText />
              <div>
                {cw.name} <span className={"text-muted-foreground"}></span>
              </div>
            </CommandItem>
          ))}
        </CommandGroup>
      </CommandList>
    </CommandDialog>
  );
}
