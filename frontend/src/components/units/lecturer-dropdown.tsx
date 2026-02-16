"use client";

import { Menu, SquarePen, SquareX, Users } from "lucide-react";
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
}: {
  slug: string;
  me: string;
  unit_update_data: UnitUpdateData;
}) {
  const [showMembers, setShowMembers] = useState(false);
  const [showDelete, setShowDelete] = useState(false);
  const [showEdit, setShowEdit] = useState(false);

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
