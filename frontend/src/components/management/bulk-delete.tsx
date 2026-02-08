"use client";

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
import { useCallback, useEffect, useState } from "react";
import { ArrowRight } from "lucide-react";

export default function BulkDelete() {
  const programmes = [
        { id: "u1", name: "Year 1 Computer Science 2025/2026" },
        { id: "u2", name: "Year 2 Computer Science 2025/2026" },
    ];
  const units = [
        { id: "u1", name: "Year 1 Computer Science 2025/2026" },
        { id: "u2", name: "Year 2 Computer Science 2025/2026" },
    ];
  const [selectedUnitId, setSelectedUnitId] = useState<string | null>(null);
  const [selectedProgrammeId, setSelectedProgrammeId] = useState<string | null>(null);

  return (
    <div className="w-full">
      <div className="mt-6 px-6 grid grid-cols-1 gap-4 md:grid-cols-1">
        <div className="rounded-md border border-border p-4">
            <h3 className="mb-4 text-sm font-semibold text-muted-foreground uppercase tracking-wide">
                Select Programme
            </h3>
            <Select
                value={selectedUnitId ?? "all"}
                onValueChange={(value) => {
                    setSelectedUnitId(value === "all" ? null : value);
                }}
                >
                <SelectTrigger className="w-full max-w-64">
                    <SelectValue placeholder="Filter by unit" />
                </SelectTrigger>

                <SelectContent>
                    <SelectGroup>
                    <SelectItem value="all">All units</SelectItem>

                    {units.map((unit) => (
                        <SelectItem key={unit.id} value={unit.id}>
                        {unit.name}
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
            <Select
                value={selectedProgrammeId ?? "all"}
                onValueChange={(value) => {
                    setSelectedProgrammeId(value === "all" ? null : value);
                }}
                >
                <SelectTrigger className="w-full max-w-64">
                    <SelectValue placeholder="Filter by unit" />
                </SelectTrigger>

                <SelectContent>
                    <SelectGroup>
                    <SelectItem value="all">All Programmes</SelectItem>

                    {programmes.map((programme) => (
                        <SelectItem key={programme.id} value={programme.id}>
                        {programme.name}
                        </SelectItem>
                    ))}
                    </SelectGroup>
                </SelectContent>
            </Select>
        </div>
        <div className="rounded-md border border-border p-4">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <Button
                variant="outline"
                className="w-full sm:w-fit"
                >
                  Omit User From Deletion
                </Button>

                <Button
                variant="destructive"
                className="w-full sm:w-fit"
                >
                  Delete Users
                </Button>
            </div>
        </div>

      </div>
    </div>
  );
}
