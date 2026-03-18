import {Checkbox} from "@/components/ui/checkbox";
import {
  ColumnDef,
  ColumnFiltersState, getCoreRowModel, getFilteredRowModel, getPaginationRowModel, getSortedRowModel, SortingState,
  VisibilityState
} from "@tanstack/table-core";
import { Button } from "../ui/button";
import {ArrowUpDown, ChevronDown, ClipboardCopy, MoreHorizontal} from "lucide-react";
import {
  DropdownMenu, DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import React from "react";
import {flexRender, useReactTable} from "@tanstack/react-table";
import { Input } from "../ui/input";
import {Table, TableBody, TableCell, TableHead, TableHeader, TableRow} from "@/components/ui/table";
import {StudentNameAndRepo} from "@/lib/actions/get_student_repos";
import {toast} from "sonner";

export const columns: ColumnDef<StudentNameAndRepo>[] = [
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
    accessorKey: "student",
    header: ({ column }) => {
      return (
          <Button
              variant="ghost"
              onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            Students
            <ArrowUpDown />
          </Button>
      )
    },
    cell: ({ row }) => <div className="">{row.getValue("student")}</div>,
  },
  {
    id: "actions",
    enableHiding: false,
    cell: ({ row }) => {
      const s = row.original

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
                      navigator.clipboard.writeText(s.repo_url.substring(0, s.repo_url.indexOf(".git")));
                      toast.success("Repo URL copied to clipboard.")
                    }}
                >
                  <ClipboardCopy/>
                  Copy student repo URL
                </DropdownMenuItem>
              </DropdownMenuGroup>
            </DropdownMenuContent>
          </DropdownMenu>
      )
    },
  },
]