import type { ColumnDef } from "@tanstack/table-core";
import { ArrowUpDown, ClipboardCopy, MoreHorizontal } from "lucide-react";
import { toast } from "sonner";
import { Checkbox } from "@/components/ui/checkbox";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {Button} from "@/components/ui/button";

export type StudentNameAndPotentiallyRepo = {
  id: string;
  name: string;
  repo_url: string | null;
}

export const columns: ColumnDef<StudentNameAndPotentiallyRepo>[] = [
  {
    id: "select",
    header: ({ table }) => (
        <Checkbox
            checked={
                table.getIsAllPageRowsSelected() ||
                (table.getIsSomePageRowsSelected() && "indeterminate")
            }
            onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
            aria-label="Select all"
        />
    ),
    cell: ({ row }) => (
        <Checkbox
            checked={row.getIsSelected()}
            onCheckedChange={(value) => row.toggleSelected(!!value)}
            aria-label="Select row"
        />
    ),
    enableSorting: false,
    enableHiding: false,
  },
  {
    id: "name",
    accessorKey: "name",
    header: ({ column }) => {
      return (
          <Button
              variant="ghost"
              onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            Student Name
            <ArrowUpDown />
          </Button>
      );
    },
    enableHiding: false,
    cell: ({ row }) => <div className="">{row.getValue("name")}</div>,
  },
  {
    id: "repo_url",
    accessorKey: "repo_url",
    enableHiding: true,
    header: ({ column }) => {
      return (
          <div>Repo</div>
      );
    },
    cell: ({ row }) => {
      const s = row.original;
      const repo_name = s.repo_url?.substring(s.repo_url.lastIndexOf("/") + 1, s.repo_url.indexOf(".git"));
          return(<div className="">{repo_name}</div>)
    },
  },
  {
    id: "actions",
    enableHiding: false,
    cell: ({ row }) => {
      const s = row.original;

      return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost">
                <span className="sr-only">Open menu</span>
                <MoreHorizontal />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-40">
              <DropdownMenuGroup>
                <DropdownMenuLabel>Actions</DropdownMenuLabel>
                <DropdownMenuItem
                    onClick={() => {
                      if (s.repo_url) {
                        navigator.clipboard.writeText(
                            s.repo_url.substring(0, s.repo_url.indexOf(".git")),
                        );
                        toast.success("Repo URL copied to clipboard.");
                    } else {
                        toast.error("No repo URL");
                      }
                    }}
                >
                  <ClipboardCopy />
                  Copy student repo URL
                </DropdownMenuItem>
              </DropdownMenuGroup>
            </DropdownMenuContent>
          </DropdownMenu>
      );
    },
  },
];
