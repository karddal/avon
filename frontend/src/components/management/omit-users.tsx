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
          <DialogContent className="max-w-full! lg:max-w-[80%]! xl:max-w-[70%]! w-full max-h-full! lg:max-h-[80vh]! overflow-y-auto p-0 border-none bg-transparent shadow-none">
            <div className="flex flex-col lg:flex-row gap-6 w-full justify-center items-stretch">
              <div className="lg:max-h-[80vh]! flex-2 lg:overflow-y-auto bg-background border shadow-lg justify-start flex flex-col">
                <div className="p-8 pb-0">
                  <DialogTitle className="text-xl">Omit user from deletion</DialogTitle>
                  <p className="text-sm text-muted-foreground mb-6">
                    Select users to be omitted from deletion
                  </p>
                </div>
    
                <div className="flex-1 space-y-2 min-w-0 overflow-y-auto p-8 pt-0 flex flex-col gap-2">
                        <UserSelectionOmittion 
                            users={users} 
                            loading={loading}
                            omittedMembersIds={omittedMembersIds} 
                            setOmittedUserIds={setOmittedUserIds}
                        />
                </div>
              </div>
              <div className="lg:max-h-[80vh]! flex-2 lg:overflow-y-auto bg-background border shadow-lg justify-start flex flex-col">
                <div className="p-8 pb-0">
                  <DialogTitle className="text-xl">View selected users</DialogTitle>
                  <p className="text-sm text-muted-foreground mb-6">
                    The list of selected users appears below
                  </p>
                </div>
    
                <div className="flex-1 space-y-2 min-w-0 overflow-y-auto p-8 pt-0 flex flex-col gap-2">
                  <ListOmittedusers 
                            users={users}
                            loading={loading}
                            omittedMembersIds={omittedMembersIds}
                  />
                </div>
              </div>
            </div>
          </DialogContent>
        </Dialog>
  );
}
