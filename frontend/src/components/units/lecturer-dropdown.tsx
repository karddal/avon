"use client";

import { Menu, Siren, SquarePen, SquareX, Users } from "lucide-react";
import { useState } from "react";
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
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import DeleteUnitButton from "@/components/units/delete-unit-button";
import EditUnit from "@/components/units/edit-unit";
import ListMembers from "@/components/units/list-members";
import SendNotification from "@/components/units/send-notification";

type UnitUpdateData = {
  id: string;
  name: string;
  description?: string;
  colour: string;
  unit_code: string;
  programme_id: string;
};

export default function LecturerDropdown({
  slug,
  me,
  unit_update_data,
  scopes,
}: {
  slug: string;
  me: string;
  unit_update_data: UnitUpdateData;
  scopes: Set<string>;
}) {
  const [showMembers, setShowMembers] = useState(false);
  const [showDelete, setShowDelete] = useState(false);
  const [showEdit, setShowEdit] = useState(false);
  const [showSendNotif, setShowSendNotif] = useState(false);

  const hasReadScope = scopes.has("unit:read");
  const hasEnrollScope = scopes.has("unit:enroll");
  const hasManageScope = scopes.has("unit:manage");
  const hasNotificationScope = scopes.has("unit:send_notification");
  const hasDeleteScope = scopes.has("unit:delete");
  const hasEntries =
    hasReadScope ||
    hasEnrollScope ||
    hasManageScope ||
    hasNotificationScope ||
    hasDeleteScope;

  if (!hasEntries) {
    return null;
  }

  return (
    <div className="aspect-square">
      <DropdownMenu>
        <DropdownMenuTrigger
          id="unit-dropdown"
          className="border hover:bg-accent hover:transition p-2"
        >
          <Menu size={32} />
        </DropdownMenuTrigger>
        <DropdownMenuContent className="flex flex-col">
          <DropdownMenuLabel>Unit Options</DropdownMenuLabel>
          <DropdownMenuSeparator />

          {hasReadScope && (
            <DropdownMenuItem onSelect={() => setShowMembers(true)}>
              <Users className="mr-2 h-4 w-4" /> Members
            </DropdownMenuItem>
          )}

          {hasManageScope && (
            <DropdownMenuItem onSelect={() => setShowEdit(true)}>
              <SquarePen className="mr-2 h-4 w-4" /> Edit Unit
            </DropdownMenuItem>
          )}

          {hasNotificationScope && (
            <DropdownMenuItem onSelect={() => setShowSendNotif(true)}>
              <Siren className="mr-2 h-4 w-4" /> Send Notification
            </DropdownMenuItem>
          )}

          {hasDeleteScope &&
            (hasReadScope ||
              hasEnrollScope ||
              hasManageScope ||
              hasNotificationScope) && <DropdownMenuSeparator />}

          {hasDeleteScope && (
            <DropdownMenuItem
              onSelect={() => setShowDelete(true)}
              className="text-destructive focus:text-destructive"
            >
              <SquareX className="text-destructive mr-2 h-4 w-4" /> Delete Unit
            </DropdownMenuItem>
          )}
        </DropdownMenuContent>
      </DropdownMenu>

      {hasReadScope && (
        <ListMembers
          canManageEnrollment={hasEnrollScope}
          openState={showMembers}
          setOpenState={setShowMembers}
          unit_id={slug}
          me={me}
        />
      )}

      {hasManageScope && (
        <EditUnit
          unit_update_data={unit_update_data}
          open_state={showEdit}
          set_open_state={setShowEdit}
        />
      )}

      {hasNotificationScope && (
        <SendNotification
          unit_id={slug}
          openState={showSendNotif}
          setOpenState={setShowSendNotif}
        />
      )}

      {hasDeleteScope && (
        <AlertDialog open={showDelete} onOpenChange={setShowDelete}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
              <AlertDialogDescription>
                This action cannot be undone. This will permanently delete the
                unit and all of its data.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel className="h-full">Cancel</AlertDialogCancel>
              <DeleteUnitButton unitId={slug} />
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      )}
    </div>
  );
}
