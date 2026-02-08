"use client"

import type { UUID } from "node:crypto";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { requireSession } from "@/lib/auth-utils";
import { getInitials } from "@/components/user-card";
import Image from "next/image";
import { Button } from "../ui/button";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { ArrowRight, ArrowRightLeft } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { useCallback, useEffect, useState } from "react";
import { getProgrammes } from "@/lib/actions/get_all_programmes";

interface Programme {
  id: UUID;
  name: string;
  start_date: string;
  end_date: string;
  units: Unit[];
}

interface Unit {
    id: UUID
    name : string;
    description: string;
    creation_date: string;
    unit_code: string;
    colour: string;
}

export default function BulkSwitch() {
    const [mounted, setMounted] = useState(false);
    const [selectedUnitId, setSelectedUnitId] = useState<string | null>(null);
    const [selectedProgrammeIdFrom, setSelectedProgrammeIdFrom] = useState<string | null>(null);
    const [selectedProgrammeIdTo, setSelectedProgrammeIdTo] = useState<string | null>(null);
    const [selectedUnitIds, setSelectedUnitIds] = useState<string[]>([]);
    const [programmes, setProgrammes] = useState<Programme[]>([]);
    const [fromUnits, setFromUnits] = useState<Unit[]>([]);
    const [toUnits, setToUnits] = useState<Unit[]>([]);
    const programmeSelectedFrom = selectedProgrammeIdFrom !== null;
    const programmeSelectedTo = selectedProgrammeIdTo !== null;
    const selectedCount = selectedUnitIds.length
    const canTransfer = selectedUnitId !== null && selectedUnitIds.length > 0;
    const canOmit = selectedUnitId !== null;

    useEffect(() => {
        setMounted(true);
    }, []);

    useEffect(() => {
        if (selectedProgrammeIdFrom === null) {
            setSelectedUnitId(null);
        }
    }, [selectedProgrammeIdFrom]);

    const loadProgrammes = useCallback(async () => {
        const programmesReq = await getProgrammes();
        if (programmesReq.success) {
            console.log("Programmes array:", programmesReq.data.programmes);
            setProgrammes(programmesReq.data.programmes);
        } else {
        toast.error("Failed to load programmes");
        }
    }, []);

    useEffect(() => {
        loadProgrammes();
    }, [loadProgrammes]);

    useEffect(() => {
        if (!selectedProgrammeIdFrom) {
            setFromUnits([]);
            setSelectedUnitId(null);
            return;
        }

        const programme = programmes.find(
            (p) => p.id === selectedProgrammeIdFrom
        );

        setFromUnits(programme?.units ?? []);
        setSelectedUnitId(null);
    }, [selectedProgrammeIdFrom, programmes]);

    useEffect(() => {
        if (!selectedProgrammeIdTo) {
            setToUnits([]);
            setSelectedUnitIds([]);
            return;
        }

        const programme = programmes.find(
            (p) => p.id === selectedProgrammeIdTo
        );

        setToUnits(programme?.units ?? []);
        setSelectedUnitIds([]);
    }, [selectedProgrammeIdTo, programmes]);


    if (!mounted) return null;
    return (
    <div className="w-full">
      <div className="grid grid-cols-1 mt-6 gap-4">
       <div
            className="
                flex flex-col gap-4
                md:flex-row md:items-center md:gap-6
            "
            >
            <div className="flex-1 rounded-md border border-border p-4">
                <h3 className="mb-4 text-sm font-semibold text-muted-foreground uppercase tracking-wide">
                From
                </h3>

                <Select
                value={selectedProgrammeIdFrom ?? "all"}
                onValueChange={(value) =>
                    setSelectedProgrammeIdFrom(value === "all" ? null : value)
                }
                >
                <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select programme" />
                </SelectTrigger>
                <SelectContent>
                    <SelectGroup>
                    <SelectItem value="all">Select Programme</SelectItem>
                    {programmes.map((p) => (
                        <SelectItem key={p.id} value={p.id}>
                        {p.name}
                        </SelectItem>
                    ))}
                    </SelectGroup>
                </SelectContent>
                </Select>

                <Select
                value={selectedUnitId ?? "all"}
                onValueChange={(value) =>
                    setSelectedUnitId(value === "all" ? null : value)
                }
                disabled={!programmeSelectedFrom}
                >
                <SelectTrigger className="mt-3 w-full">
                    <SelectValue placeholder="Select unit" />
                </SelectTrigger>
                <SelectContent>
                    <SelectGroup>
                    <SelectItem value="all">Select Unit</SelectItem>
                    {fromUnits.map((u) => (
                        <SelectItem key={u.id} value={u.id}>
                        {u.name}
                        </SelectItem>
                    ))}
                    </SelectGroup>
                </SelectContent>
                </Select>
            </div>

            <div className="flex shrink-0 justify-center md:flex-col">
                <ArrowRight
                className="
                    h-6 w-6 text-muted-foreground
                    rotate-90 md:rotate-0
                "
                />
            </div>

            <div className="flex-1 rounded-md border border-border p-4">
                <h3 className="mb-4 text-sm font-semibold text-muted-foreground uppercase tracking-wide">
                To
                </h3>

                <Select
                    value={selectedProgrammeIdTo ?? "all"}
                    onValueChange={(value) =>
                        setSelectedProgrammeIdTo(value === "all" ? null : value)
                    }   
                    >
                    <SelectTrigger className="w-full">
                        <SelectValue placeholder="Select programme" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectGroup>
                        <SelectItem value="all">Select Programme</SelectItem>
                        {programmes.map((p) => (
                            <SelectItem key={p.id} value={p.id}>
                            {p.name}
                            </SelectItem>
                        ))}
                        </SelectGroup>
                    </SelectContent>
                </Select>

                <div className="mt-3">
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild disabled={!programmeSelectedTo}>
                            <Button variant="outline" className="w-full justify-between">
                            {selectedCount === 0
                                ? "Select Units"
                                : `${selectedCount} unit${selectedCount > 1 ? "s" : ""} selected`}
                            </Button>
                        </DropdownMenuTrigger>

                        <DropdownMenuContent className="w-64">
                            {toUnits.map((u) => (
                            <div key={u.id} className="flex items-center space-x-2 p-2">
                                <Checkbox
                                checked={selectedUnitIds.includes(u.id)}
                                onCheckedChange={(checked) => {
                                    setSelectedUnitIds((prev) =>
                                    checked
                                        ? [...prev, u.id]
                                        : prev.filter((id) => id !== u.id)
                                    )
                                }}
                                />
                                <span>{u.name}</span>
                            </div>
                            ))}
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>
            </div>
        </div>
        <div className="mt-auto rounded-md border border-border p-4">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <Button variant="outline" className="w-full sm:w-fit"disabled={!canOmit}>
                Omit User From Transfer
                </Button>

                <Button variant="outline" className="flex items-center gap-2" disabled={!canTransfer}>
                    <ArrowRightLeft className="h-4 w-4" />
                    Transfer
                </Button>
            </div>
        </div>
      </div>
    </div>
  );
}
