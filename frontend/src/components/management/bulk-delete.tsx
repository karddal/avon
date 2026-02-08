"use client";

import type { UUID } from "node:crypto";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { requireSession } from "@/lib/auth-utils";
import { getInitials } from "@/components/user-card";
import Image from "next/image";
import { Button } from "../ui/button";
import { Checkbox } from "@/components/ui/checkbox"
import { toast } from "sonner";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { useCallback, useEffect, useState } from "react";
import { ArrowRight } from "lucide-react";
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

export default function BulkDelete() {
  const [selectedProgrammeId, setSelectedProgrammeId] = useState<string | null>(null);
  const [selectedUnitIds, setSelectedUnitIds] = useState<string[]>([]);
  const [programmes, setProgrammes] = useState<Programme[]>([]);
  const [units, setUnits] = useState<Unit[]>([]);
  const programmeSelectedTo = selectedProgrammeId !== null;
  const selectedCount = selectedUnitIds.length
  const canDeleteAndOmit = selectedCount > 0;

  useEffect(() => {
        if (selectedProgrammeId === null) {
            setSelectedUnitIds([]);
        }
    }, [selectedProgrammeId]);

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
        if (!selectedProgrammeId) {
            setUnits([]);
            setSelectedUnitIds([]);
            return;
        }

        const programme = programmes.find(
            (p) => p.id === selectedProgrammeId
        );

        setUnits(programme?.units ?? []);
        setSelectedUnitIds([]);
    }, [selectedProgrammeId, programmes]);


  return (
    <div className="w-full">
      <div className="mt-6 px-6 grid grid-cols-1 gap-4 md:grid-cols-1">
        <div className="rounded-md border border-border p-4">
            <h3 className="mb-4 text-sm font-semibold text-muted-foreground uppercase tracking-wide">
                Select Programme
            </h3>
            <Select
                value={selectedProgrammeId ?? "all"}
                onValueChange={(value) =>
                    setSelectedProgrammeId(value === "all" ? null : value)
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
        </div>
        <div className="rounded-md border border-border p-4">
            <h3 className="mb-4 text-sm font-semibold text-muted-foreground uppercase tracking-wide">
                Select Units
            </h3>
            <DropdownMenu>
                <DropdownMenuTrigger asChild disabled={!programmeSelectedTo}>
                    <Button variant="outline" className="w-full justify-between">
                    {selectedCount === 0
                        ? "Select Unit"
                        : `${selectedCount} unit${selectedCount > 1 ? "s" : ""} selected`}
                    </Button>
                </DropdownMenuTrigger>

                <DropdownMenuContent className="w-64">
                    {units.map((u) => (
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
        <div className="rounded-md border border-border p-4">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <Button
                variant="outline"
                className="w-full sm:w-fit"
                disabled={!canDeleteAndOmit}
                >
                  Omit User From Deletion
                </Button>

                <Button
                variant="destructive"
                className="w-full sm:w-fit"
                disabled={!canDeleteAndOmit}
                >
                  Delete Users
                </Button>
            </div>
        </div>

      </div>
    </div>
  );
}
