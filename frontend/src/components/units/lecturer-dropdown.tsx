import { Menu, SquarePen, SquareX, Users } from "lucide-react";
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
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

export default function LecturerDropdown({ slug }: { slug: string }) {
  return (
    <AlertDialog>
      <DropdownMenu>
        <DropdownMenuTrigger className="border hover:bg-accent hover:transition aspect-square p-2">
          <Menu size={32}></Menu>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="flex flex-col">
          <DropdownMenuLabel>Unit Options</DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem>
            <Users></Users>Members
          </DropdownMenuItem>
          <DropdownMenuItem>
            <SquarePen></SquarePen>Edit Unit
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <AlertDialogTrigger>
            <DropdownMenuItem className="text-destructive">
              <SquareX className="text-destructive"></SquareX>Delete Unit
            </DropdownMenuItem>
          </AlertDialogTrigger>
        </DropdownMenuContent>
      </DropdownMenu>

      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
          <AlertDialogDescription>
            This action cannot be undone. This will permanently delete the unit
            and all of its data.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <DeleteUnitButton unitId={slug}></DeleteUnitButton>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
