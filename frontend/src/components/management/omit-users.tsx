"use client";

import type { Dispatch, SetStateAction } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import type { UUID } from "node:crypto";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import AddMember from "@/components/units/add-member";
import AddMemberLecturer from "@/components/units/add-member-lec";
import LecturerList from "@/components/units/lecturer-list";
import StudentList from "@/components/units/student-list";

interface Unit {
  id: UUID
  name : string;
  description: string;
  creation_date: string;
  unit_code: string;
  colour: string;
}

interface OmittedMembersProps {
  omittedMembersIds: string[];
  units: Unit[];
  openState: boolean;
  setOpenState: Dispatch<SetStateAction<boolean>>;
}


export default function OmitMembers({ omittedMembersIds, units, openState, setOpenState}: OmittedMembersProps) {
  return (
    <Dialog open={openState} onOpenChange={setOpenState}>
      <DialogContent className="max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl">
            Omit user from deletion
          </DialogTitle>
          <DialogDescription>
            Find and omit users using the search bar below.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <AddMember unit_id={units[0].id} />
        </div>
        <Separator/>
        <div className="space-y-4">
          <AddMember unit_id={units[0].id} />
        </div>
      </DialogContent>
    </Dialog>
  );
}
