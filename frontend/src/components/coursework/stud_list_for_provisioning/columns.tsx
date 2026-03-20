import type { ColumnDef } from "@tanstack/table-core";
import { ArrowUpDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";

export type StudentNameAndPotentiallyRepo = {
  id: string;
  name: string;
  repo_url: string | null;
};

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
    header: ({ column }) => {
      return <div>Repo</div>;
    },
    cell: ({ row }) => {
      const s = row.original;
      const repo_name = s.repo_url?.substring(
        s.repo_url.lastIndexOf("/") + 1,
        s.repo_url.indexOf(".git"),
      );
      return (
        <div className="">{repo_name ? repo_name : "No repo provisioned"}</div>
      );
    },
  },
];
