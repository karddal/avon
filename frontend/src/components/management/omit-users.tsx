"use client";

import { type Dispatch, type SetStateAction, useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { get_user_image_from_id } from "@/lib/actions/get_image";
import { get_students } from "@/lib/actions/get_students";
import { get_username_from_id } from "@/lib/actions/get_username";
import ListOmittedusers from "./list-omitted-users";
import UserSelectionOmittion from "./user-selection-omittion";

interface OmittedMembersProps {
  omittedMembersIds: string[];
  setOmittedUserIds: (ids: string[]) => void;
  unitId: string | null;
  openState: boolean;
  setOpenState: Dispatch<SetStateAction<boolean>>;
  refreshKey: number;
}

type UserInfo = {
  id: string;
  displayName: string;
  src?: string;
};

export default function OmitMembers({
  omittedMembersIds,
  setOmittedUserIds,
  unitId,
  openState,
  setOpenState,
  refreshKey,
}: OmittedMembersProps) {
  const [users, setUsers] = useState<UserInfo[]>([]);
  const [loading, setLoading] = useState(true);
  

  useEffect(() => {
    async function loadUsers() {
      if (!unitId) {
        setUsers([]);
        setLoading(false);
        return;
      }

      setLoading(true);

      try {
        const data = await get_students(unitId);
        const userIds = data?.students ?? [];

        const enriched = await Promise.all(
          userIds.map(async (id: string) => ({
            id,
            displayName: (await get_username_from_id(id)) || "Unknown",
            src: await get_user_image_from_id(id),
          })),
        );

        setUsers(enriched);
      } finally {
        setLoading(false);
      }
    }

    void refreshKey;
    loadUsers();
  }, [unitId, refreshKey]);

  return (
    <Dialog open={openState} onOpenChange={setOpenState}>
      <DialogContent className="max-w-full! lg:max-w-[80%]! xl:max-w-[70%]! w-full p-0 border-none bg-transparent shadow-none overflow-visible">
        <div className="flex flex-col lg:flex-row gap-4 w-full items-stretch">
          <div className="flex-1 flex flex-col bg-background border rounded-lg shadow-sm overflow-hidden">
            <div className="p-6 border-b">
              <DialogTitle className="text-base font-semibold">
                Omit users from deletion
              </DialogTitle>
              <p className="text-sm text-muted-foreground mt-1">
                Select users to be omitted from deletion
              </p>
            </div>
            <div className="flex-1 overflow-y-auto p-4">
              <UserSelectionOmittion
                users={users}
                loading={loading}
                omittedMembersIds={omittedMembersIds}
                setOmittedUserIds={setOmittedUserIds}
              />
            </div>
          </div>

          <div className="flex-1 flex flex-col bg-background border rounded-lg shadow-sm overflow-hidden self-stretch">
            <div className="p-6 border-b">
              <DialogTitle className="text-base font-semibold">
                Selected users
              </DialogTitle>
            </div>
            <div className="flex-1 p-4">
              <ListOmittedusers
                users={users}
                loading={loading}
                omittedMembersIds={omittedMembersIds}
                setOmittedUserIds={setOmittedUserIds}
              />
            </div>
            <div className="p-4 border-t bg-muted/30">
              <Button
                className="w-full"
                disabled={omittedMembersIds.length === 0}
                onClick={() => setOpenState(false)}
              >
                Omit{" "}
                {omittedMembersIds.length > 0
                  ? `${omittedMembersIds.length} `
                  : ""}
                {omittedMembersIds.length === 1 ? "user" : "users"}
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
