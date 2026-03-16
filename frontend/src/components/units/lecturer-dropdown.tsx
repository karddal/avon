"use client";

import { Menu, Siren, SquarePen, SquareX, Users, LockOpen, } from "lucide-react";
import { useCallback, useState } from "react";
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
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import DeleteUnitButton from "@/components/units/delete-unit-button";
import EditUnit from "@/components/units/edit-unit";
import ListMembers from "@/components/units/list-members";
import SendNotification from "@/components/units/send-notification";
import { unlock_unit } from "@/lib/actions/unlock_unit";

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
}: {
  slug: string;
  me: string;
  unit_update_data: UnitUpdateData;
}) {
  const [showMembers, setShowMembers] = useState(false);
  const [showDelete, setShowDelete] = useState(false);
  const [showEdit, setShowEdit] = useState(false);
  const [showSendNotif, setShowSendNotif] = useState(false);
  const router = useRouter();

  const unlockUnit = useCallback(async () => {
    try {
      const result = await unlock_unit({id: unit_update_data.id});
      router.refresh();
    } catch (err) {
      toast.error("Unlocking Unit Failed");     
    }
  },[])

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

          <DropdownMenuItem onSelect={() => setShowMembers(true)}>
            <Users className="mr-2 h-4 w-4" /> Members
          </DropdownMenuItem>

          <DropdownMenuItem onSelect={() => setShowEdit(true)}>
            <SquarePen className="mr-2 h-4 w-4" /> Edit Unit
          </DropdownMenuItem>

          <DropdownMenuItem onSelect={() => setShowSendNotif(true)}>
            <Siren className="mr-2 h-4 w-4" /> Send Notification
          </DropdownMenuItem>

          <DropdownMenuItem className="text-green-700 focus:text-green-700" onSelect={() => unlockUnit()} disabled={unit_update_data.unlocked}>
            <LockOpen className="text-green-700 mr-2 h-4 w-4" />
            Unlock Unit
          </DropdownMenuItem>

          <DropdownMenuSeparator />

          <DropdownMenuItem
            onSelect={() => setShowDelete(true)}
            className="text-destructive focus:text-destructive"
          >
            <SquareX className="text-destructive mr-2 h-4 w-4" /> Delete Unit
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <ListMembers
        openState={showMembers}
        setOpenState={setShowMembers}
        unit_id={slug}
        me={me}
      />

      <EditUnit
        unit_update_data={unit_update_data}
        open_state={showEdit}
        set_open_state={setShowEdit}
      />

      <SendNotification
        unit_id={slug}
        openState={showSendNotif}
        setOpenState={setShowSendNotif}
      ></SendNotification>

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
    </div>
  );
}
