"use client";

import {
  Lock,
  LockOpen,
  Menu,
  Siren,
  SquarePen,
  SquareX,
  Users,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
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
import { Button } from "@/components/ui/button";
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
import { lock_unit, unlock_unit } from "@/lib/actions/unlock_lock_unit";

type UnitUpdateData = {
  id: string;
  name: string;
  description?: string;
  colour: string;
  unit_code: string;
  programme_id: string;
  unlocked: boolean;
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
  const [showUnlock, setShowUnlock] = useState(false);
  const [showLock, setShowLock] = useState(false);
  const router = useRouter();

  const unlockUnit = async () => {
    try {
      await unlock_unit({ id: unit_update_data.id });
      toast.success("Unit Unlocked Successfully");
      router.refresh();
    } catch (_err) {
      toast.error("Unlocking Unit Failed");
    }
  };

  const lockUnit = async () => {
    try {
      await lock_unit({ id: unit_update_data.id });
      toast.success("Unit Locked Successfully");
      router.refresh();
    } catch (_err) {
      toast.error("Locking Unit Failed");
    }
  };

  const hasReadScope = scopes.has("unit:read");
  const hasEnrollScope = scopes.has("unit:enroll");
  const hasManageScope = scopes.has("unit:manage");
  const hasLockingScope = scopes.has("unit:locking")
  const hasNotificationScope = scopes.has("unit:send_notification");
  const hasDeleteScope = scopes.has("unit:delete");
  const hasEntries =
    hasReadScope ||
    hasEnrollScope ||
    hasManageScope ||
    hasNotificationScope ||
    hasLockingScope ||
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
          {hasLockingScope && (
            <DropdownMenuItem
              onSelect={() =>
                unit_update_data.unlocked
                  ? setShowLock(true)
                  : setShowUnlock(true)
              }
              className="group flex items-center cursor-pointer"
            >
              {unit_update_data.unlocked ? (
                <>
                  <LockOpen className="mr-2 h-4 w-4 text-green-700 group-data-highlighted:hidden" />
                  <Lock className="mr-2 hidden h-4 w-4 text-red-600 group-data-highlighted:block" />

                  <span className="text-green-700 group-data-highlighted:hidden">
                    Unlocked
                  </span>
                  <span className="hidden text-red-600 group-data-highlighted:inline">
                    Lock Unit
                  </span>
                </>
              ) : (
                <>
                  <Lock className="mr-2 h-4 w-4 text-red-600 group-data-highlighted:hidden" />
                  <LockOpen className="mr-2 hidden h-4 w-4 text-green-700 group-data-highlighted:block" />

                  <span className="text-red-600 group-data-highlighted:hidden">
                    Locked
                  </span>
                  <span className="hidden text-green-700 group-data-highlighted:inline">
                    Unlock Unit
                  </span>
                </>
              )}
            </DropdownMenuItem>
          )}

          <DropdownMenuSeparator />

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

      {hasLockingScope && (
        <AlertDialog open={showUnlock} onOpenChange={setShowUnlock}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
              <AlertDialogDescription>
                This action will unlock the unit, allowing students to access
                it.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <Button
                size="lg"
                className="bg-green-700 text-white hover:bg-green-800 focus:bg-green-700"
                onClick={() => {
                  unlockUnit();
                  setShowUnlock(false);
                }}
              >
                <LockOpen className="mr-2 h-4 w-4" />
                Unlock
              </Button>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      )}
      {hasLockingScope && (
        <AlertDialog open={showLock} onOpenChange={setShowLock}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
              <AlertDialogDescription>
                This action will lock the unit, preventing students from
                accessing it.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <Button
                size="lg"
                className="bg-red-600 text-white hover:bg-red-700 focus:bg-red-600"
                onClick={() => {
                  lockUnit();
                  setShowLock(false);
                }}
              >
                <Lock className="mr-2 h-4 w-4" />
                Lock
              </Button>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      )}
    </div>
  );
}
