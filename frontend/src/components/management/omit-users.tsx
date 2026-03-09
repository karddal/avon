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
import ListOmittedusers from "./list-omitted-users";


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

type UserInfo = {
  id: string;
  displayName: string;
  src?: string;
}


export default function OmitMembers({ omittedMembersIds, setOmittedUserIds, units, openState, setOpenState}: OmittedMembersProps) {
  const [users, setUsers] = useState<UserInfo[]>([]);
  const [loading, setLoading] = useState(true);

  const loadUsers = useCallback(async () => {
    if (!units[0]) return;
    try {
      const data = await get_unit_users(`${units[0].id}`);
      const userIds = data?.users ?? [];
      const enriched = await Promise.all(
        userIds.map(async (id: string) => ({
          id,
          displayName: await get_username_from_id(id) || "Unknown",
          src: await get_user_image_from_id(id),
        }))
      );
      setUsers(enriched);
    } finally {
      setLoading(false);
    }
  }, [units]);

  useEffect(() => {
    loadUsers();
  }, [loadUsers]);

  return (
    <Dialog open={openState} onOpenChange={setOpenState}>
      <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl">Omit user from deletion</DialogTitle>
          <DialogDescription>Find and omit users using the search bar below.</DialogDescription>
        </DialogHeader>
        <div className="flex flex-row gap-4">
            <div className="flex-1 space-y-2 min-w-0">
                <p className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">All Users</p>
                <UserSelectionOmittion 
                users={users} 
                loading={loading}
                omittedMembersIds={omittedMembersIds} 
                setOmittedUserIds={setOmittedUserIds}
                />
            </div>

            <Separator orientation="vertical" className="self-stretch"/>

            <div className="flex-1 space-y-2 min-w-0">
                <p className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">Omitted</p>
                <ListOmittedusers 
                users={users}
                loading={loading}
                omittedMembersIds={omittedMembersIds}
                />
            </div>
        </div>
        
      </DialogContent>
    </Dialog>
  );
}
