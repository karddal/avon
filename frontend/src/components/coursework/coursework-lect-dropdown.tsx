"use client";

import { BookCheck, Menu, ServerCog, SquarePen, SquareX } from "lucide-react";
import { useState } from "react";
import EditCoursework from "@/components/coursework/edit-coursework";
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

type CourseworkUpdateData = {
  id: string;
  name: string;
  description?: string;
  unit_id: string;
  due_date: string;
  creation_date: string;
  colour: string;
  unit_name: string;
  unit_code: string;
  max_end_date: Date;
};

export default function CourseworkLectDropdown({
  slug,
  _me,
  coursework_update_data,
}: {
  slug: string;
  _me: string;
  coursework_update_data: CourseworkUpdateData;
}) {
  const [showDelete, setShowDelete] = useState(false);
  const [showEdit, setShowEdit] = useState(false);

  return (
    <div className="aspect-square">
      <DropdownMenu>
        <DropdownMenuTrigger className="border hover:bg-accent hover:transition p-2">
          <Menu size={32} />
        </DropdownMenuTrigger>
        <DropdownMenuContent className="flex flex-col">
          <DropdownMenuLabel>Courswork Options</DropdownMenuLabel>
          <DropdownMenuSeparator />

          <DropdownMenuItem disabled={true}>
            <ServerCog className="mr-2 h-4 w-4" />
            Engine
          </DropdownMenuItem>

          <DropdownMenuItem disabled={true}>
            <BookCheck className="mr-2 h-4 w-4" />
            Results
          </DropdownMenuItem>

          <DropdownMenuItem onSelect={() => setShowEdit(true)}>
            <SquarePen className="mr-2 h-4 w-4" />
            Edit coursework
          </DropdownMenuItem>

          <DropdownMenuSeparator />

          <DropdownMenuItem
            onSelect={() => setShowDelete(true)}
            className="text-destructive focus:text-destructive"
          >
            <SquareX className="text-destructive mr-2 h-4 w-4" /> Delete
            coursework
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <EditCoursework
        coursework_update_data={coursework_update_data}
        open_state={showEdit}
        set_open_state={setShowEdit}
      />

      <AlertDialog open={showDelete} onOpenChange={setShowDelete}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the
              coursework and all of its data.
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
