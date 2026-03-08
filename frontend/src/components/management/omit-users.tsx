"use client";

import { useCallback, useEffect, useMemo, useState, type Dispatch, type SetStateAction } from "react";
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
import { requireSession } from "@/lib/auth-utils";
import { get_unit_users } from "@/lib/actions/get_unit_users";
import { get_username_from_id } from "@/lib/actions/get_username";
import { get_user_image_from_id } from "@/lib/actions/get_image";
import { Input } from "@/components/ui/input";
import { Spinner } from "@/components/ui/spinner";
import UserSelectionOmittion from "./user-selection-omittion";

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
  setOmittedUserIds: (ids: string[]) => void
  units: Unit[];
  openState: boolean;
  setOpenState: Dispatch<SetStateAction<boolean>>;
}

type userInfo = {
  id: string;
  displayName: string;
  src?: string;
}


export default function OmitMembers({ omittedMembersIds, setOmittedUserIds, units, openState, setOpenState}: OmittedMembersProps) {

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
          {units.length > 0 && (
            <UserSelectionOmittion unit_id={units[0].id} omittedMembersIds={omittedMembersIds} setOmittedUserIds={setOmittedUserIds}/>
          )}
        </div>
        <Separator/>
        <div className="space-y-4">
          {units.length > 0 && (
            <AddMember unit_id={units[0].id} />
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
