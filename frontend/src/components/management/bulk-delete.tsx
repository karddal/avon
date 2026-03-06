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
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { useCallback, useEffect, useState } from "react";
import { ArrowRight } from "lucide-react";
import { getProgrammes } from "@/lib/actions/get_all_programmes";
import BulkDeleteButton from "./bulk-delete-button";

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
  const [selectedUnitId, setSelectedUnitId] = useState<string | null>(null);
  const [programmes, setProgrammes] = useState<Programme[]>([]);
  const [units, setUnits] = useState<Unit[]>([]);
  const [omittedMemberIds, setOmittedMembersIds] = useState<string[]>([]);
  const [showDelete, setShowDelete] = useState(false);
  const programmeSelectedTo = selectedProgrammeId !== null;
  const canDeleteAndOmit = selectedUnitId !== null;

  useEffect(() => {
        if (selectedProgrammeId === null) {
            setSelectedUnitId(null);
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
            setSelectedUnitId(null);
            return;
        }

        const programme = programmes.find(
            (p) => p.id === selectedProgrammeId
        );

        setUnits(programme?.units ?? []);
        setSelectedUnitId(null);
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
            <Select value={selectedUnitId ?? "all"}
                onValueChange={(value) =>
                    setSelectedUnitId(value === "all" ? null : value)
                }
                disabled={!programmeSelectedTo}
                >
                <SelectTrigger className="mt-3 w-full">
                    <SelectValue placeholder="Select unit" />
                </SelectTrigger>
                <SelectContent>
                    <SelectGroup>
                        <SelectItem value="all">Select Unit</SelectItem>
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
                onClick={() => setShowDelete(true)}
                >
                  Delete Users
                </Button>
            </div>
        </div>
      </div>
      <AlertDialog open={showDelete} onOpenChange={setShowDelete}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete all students from a unit
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="h-full">Cancel</AlertDialogCancel>
            <BulkDeleteButton unit_id={selectedUnitId!} omitted_user_ids={omittedMemberIds} closeDialog={()=>setShowDelete(false)}/>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
