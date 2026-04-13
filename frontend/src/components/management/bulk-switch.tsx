"use client";

import type { UUID } from "node:crypto";
import { ArrowRight, ArrowRightLeft } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Checkbox } from "@/components/ui/checkbox";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { getProgrammes } from "@/lib/actions/get_all_programmes";
import { Button } from "../ui/button";
import BulkTransferButton from "./bulk-transfer-button";
import OmitMembers from "./omit-users";

interface Programme {
  id: UUID;
  name: string;
  start_date: string;
  end_date: string;
  units: Unit[];
}

interface Unit {
  id: UUID;
  name: string;
  description: string;
  creation_date: string;
  unit_code: string;
  colour: string;
}

export default function BulkSwitch() {
  const [mounted, setMounted] = useState(false);
  // To send out to
  const [selectedUnitId, setSelectedUnitId] = useState<string | null>(null);
  const [selectedProgrammeIdFrom, setSelectedProgrammeIdFrom] = useState<
    string | null
  >(null);
  const [selectedProgrammeIdTo, setSelectedProgrammeIdTo] = useState<
    string | null
  >(null);
  const [selectedUnitIds, setSelectedUnitIds] = useState<string[]>([]);

  // Omitted members storage
  const [omittedMembers, setOmittedMembers] = useState<string[]>([]);

  // To feed as inputs to buttons and dropdowns
  const [programmes, setProgrammes] = useState<Programme[]>([]);
  const [fromUnits, setFromUnits] = useState<Unit[]>([]);
  const [toUnits, setToUnits] = useState<Unit[]>([]);

  // Miscallenous form states and variables
  const [showOmitUsers, setShowOmitUsers] = useState(false);
  const [showDelete, setShowDelete] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);
  const programmeSelectedFrom = selectedProgrammeIdFrom !== null;
  const programmeSelectedTo = selectedProgrammeIdTo !== null;
  const selectedCount = selectedUnitIds.length;
  const canTransfer = selectedUnitId !== null && selectedUnitIds.length > 0;
  const canOmit = selectedUnitId !== null;

  // Helper for alert dialog
  const fromProgramme = programmes.find(
    (p) => p.id === selectedProgrammeIdFrom,
  );
  const fromUnitTemp = fromUnits.find((unit) => unit.id === selectedUnitId);
  const toProgramme = programmes.find((p) => p.id === selectedProgrammeIdTo);
  const fromUnitsTemp = toUnits.filter((unit) =>
    selectedUnitIds.includes(unit.id),
  );
  const fromLabel =
    fromUnitTemp && fromProgramme ? (
      <>
        {fromUnitTemp.name}
        <span className="mx-1 text-muted-foreground">|</span>
        <span className="text-muted-foreground">{fromProgramme.name}</span>
      </>
    ) : null;

  const toLabel =
    fromUnitsTemp.length > 0 && toProgramme ? (
      <>
        {fromUnitsTemp.map((u) => u.name).join(", ")}
        <span className="mx-1 text-muted-foreground">|</span>
        <span className="text-muted-foreground">{toProgramme.name}</span>
      </>
    ) : null;

  // Mounting stuff I don't understand but fixes errors
  useEffect(() => {
    setMounted(true);
  }, []);

  // Whenever the programme becomes null, clear the selectd unit button / dropdown
  useEffect(() => {
    if (selectedProgrammeIdFrom === null) {
      setSelectedUnitId(null);
    }
  }, [selectedProgrammeIdFrom]);

  // Get the data we need to poulate buttons and give info to user, it's programmes list with units as children
  const loadProgrammes = useCallback(async () => {
    const programmesReq = await getProgrammes();
    if (programmesReq.success) {
      console.log("Programmes array:", programmesReq.data.programmes);
      setProgrammes(programmesReq.data.programmes);
    } else {
      toast.error("Failed to load programmes");
    }
  }, []);

  // Gets the data and puts it into the states we need
  useEffect(() => {
    loadProgrammes();
  }, [loadProgrammes]);

  // Keeps fromUnit and selectedUnitId in sync with the selected programme and the newly loaded programmes data.
  useEffect(() => {
    if (!selectedProgrammeIdFrom) {
      setFromUnits([]);
      setSelectedUnitId(null);
      setOmittedMembers([]);
      return;
    }

    const programme = programmes.find((p) => p.id === selectedProgrammeIdFrom);

    setFromUnits(programme?.units ?? []);
    setSelectedUnitId(null);
    setOmittedMembers([]);
  }, [selectedProgrammeIdFrom, programmes]);

  // Keeps toUnits and selectedUnitIds in sync with the selected programme and the newly loaded programmes data.
  useEffect(() => {
    if (!selectedProgrammeIdTo) {
      setToUnits([]);
      setSelectedUnitIds([]);
      return;
    }

    const programme = programmes.find((p) => p.id === selectedProgrammeIdTo);

    setToUnits(programme?.units ?? []);
    setSelectedUnitIds([]);
  }, [selectedProgrammeIdTo, programmes]);

  // More mounted stuffff
  if (!mounted) return null;
  return (
    <div className="w-full">
      <div className="grid grid-cols-1 mt-6 gap-4">
        <div className="flex flex-col gap-4">
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
              onValueChange={(value) => {
                setSelectedUnitId(value === "all" ? null : value);
                setOmittedMembers([]);
              }}
              disabled={!programmeSelectedFrom}
            >
              <SelectTrigger className="mt-3 w-full">
                <SelectValue placeholder="Select unit" />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  <SelectItem value="all">Select Unit</SelectItem>
                  {fromUnits.map((unit) => (
                    <SelectItem key={unit.id} value={unit.id}>
                      {unit.name}
                    </SelectItem>
                  ))}
                </SelectGroup>
              </SelectContent>
            </Select>
          </div>

          <div className="flex shrink-0 justify-center">
            <ArrowRight className="h-6 w-6 text-muted-foreground rotate-90" />
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

                <DropdownMenuContent className="w-64" side="top">
                  {toUnits.map((u) => (
                    <div key={u.id} className="flex items-center space-x-2 p-2">
                      <Checkbox
                        checked={selectedUnitIds.includes(u.id)}
                        onCheckedChange={(checked) => {
                          setSelectedUnitIds((prev) =>
                            checked
                              ? [...prev, u.id]
                              : prev.filter((id) => id !== u.id),
                          );
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
            <Button
              variant="outline"
              className="w-full sm:w-fit"
              disabled={!canOmit}
              onClick={() => setShowOmitUsers(true)}
            >
              Omit Student From Transfer
            </Button>

            <Button
              variant="outline"
              className="flex items-center gap-2"
              disabled={!canTransfer}
              onClick={() => setShowDelete(true)}
            >
              <ArrowRightLeft className="h-4 w-4" />
              Transfer
            </Button>
          </div>
        </div>
        <AlertDialog open={showDelete} onOpenChange={setShowDelete}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
              <AlertDialogDescription asChild>
                <div className="space-y-3">
                  <div>
                    <span>This will transfer all students from:</span>
                    <div className="mt-1 font-bold text-foreground">
                      {fromLabel ?? (
                        <span className="text-muted-foreground">
                          select unit first
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="flex justify-center">
                    <ArrowRight className="h-6 w-6 rotate-90 text-muted-foreground" />
                  </div>

                  <div>
                    <div className="font-semibold text-foreground">
                      {toLabel ?? (
                        <span className="text-muted-foreground">
                          selected units
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel className="h-full">Cancel</AlertDialogCancel>
              {selectedUnitId && (
                <BulkTransferButton
                  unitIdFrom={selectedUnitId}
                  unitIdsTo={selectedUnitIds.filter(
                    (unitId) => unitId !== selectedUnitId,
                  )}
                  omittedMembers={omittedMembers}
                  closeDialog={() => setShowDelete(false)}
                  onSuccess={() => {
                    setRefreshKey((k) => k + 1);
                    setOmittedMembers([]);
                  }}
                />
              )}
              {/*Filtering out transferring to same unit e.g. programme x unit y -> programme x unit y/*}
                      {/*selecetd Unit Id can never be null here anyway, as form doesn't allow it*/}
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
        <OmitMembers
          omittedMembersIds={omittedMembers}
          setOmittedUserIds={setOmittedMembers}
          unitId={selectedUnitId}
          openState={showOmitUsers}
          setOpenState={setShowOmitUsers}
          refreshKey={refreshKey}
          deleteUsers={false}
        />
      </div>
    </div>
  );
}
