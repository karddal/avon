import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Menu, Users, SquarePen, SquareX } from "lucide-react";

export default async function LecturerDropdown() {
  return (
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
        <DropdownMenuItem className="text-destructive">
          <SquareX className="text-destructive"></SquareX>Delete Unit
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
