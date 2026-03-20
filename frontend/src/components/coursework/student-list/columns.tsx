"use client"

import type { ColumnDef } from "@tanstack/table-core";
import {ArrowUpDown, ClipboardCopy, DeleteIcon, MoreHorizontal, Trash2Icon} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel, DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {coursework_delete_repo} from "@/lib/actions/coursework_delete_repo";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel,
  AlertDialogContent, AlertDialogDescription, AlertDialogFooter,
  AlertDialogHeader, AlertDialogMedia,
  AlertDialogTitle,
  AlertDialogTrigger
} from "@/components/ui/alert-dialog";
import {Dispatch, SetStateAction, useRef, useState} from "react";
import {Spinner} from "@/components/ui/spinner";

export type StudentNameAndPotentiallyRepo = {
  id: string;
  name: string;
  repo_url: string | null;
  repo_id: string | null;
};

export const columns: (cw_id: string, refresh: () => void, refreshKey: number, setRefreshKey: Dispatch<SetStateAction<number>>) => ColumnDef<StudentNameAndPotentiallyRepo>[] = (cw_id: string, refresh: () => void, refreshKey: number, setRefreshKey: Dispatch<SetStateAction<number>>) => {
  const [alertOpen, setAlertOpen] = useState<boolean>(false);
  const [showSpinner, setShowSpinner] = useState<boolean>(false);
  return [
    {
      id: "select",
      header: ({table}) => (
          <Checkbox
              checked={
                  table.getIsAllPageRowsSelected() ||
                  (table.getIsSomePageRowsSelected() && "indeterminate")
              }
              onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
              aria-label="Select all"
          />
      ),
      cell: ({row}) => (
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
      header: ({column}) => {
        return (
            <Button
                variant="ghost"
                onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
            >
              Student Name
              <ArrowUpDown/>
            </Button>
        );
      },
      enableHiding: false,
      cell: ({row}) => <div className="">{row.getValue("name")}</div>,
    },
    {
      id: "repo_url",
      accessorKey: "repo_url",
      enableHiding: true,
      header: ({column}) => {
        return (
            <div>Repo name</div>
        );
      },
      cell: ({row}) => {
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
    {
      id: "repo_id",
      accessorKey: "repo_id",
      enableHiding: true,
      header: ({column}) => {
        return (
            <div>Repo ID</div>
        );
      },
      cell: ({row}) => {
        return (<div className="">{row.original.repo_id ? row.original.repo_id : "No repo provisioned"}</div>)
      },
    },
    {
      id: "actions",
      enableHiding: false,
      cell: ({row}) => {
        if (row.getIsGrouped()) {
          const u = row.original.repo_url;

          const s = row.original.repo_id as string; // MUST EXIST AS WE JUST CHECKED IS GROUPED!! so safe
          const deleteAction = async () => {
            setShowSpinner(true);
            const r = await coursework_delete_repo({repo_id: s, coursework_id: cw_id});
            if (r.status == "ok") {
              toast.success("Successfully deleted repo");
              setAlertOpen(false);
              setRefreshKey(refreshKey + 1);
              setShowSpinner(false);
              refresh();
            } else {
              toast.error(`Error deleting repo: ${r.details}`);
              setAlertOpen(false);
              setRefreshKey(refreshKey + 1);
              setShowSpinner(false);
              refresh();
            }
          }
          if (s) return (
              <AlertDialog open={alertOpen} onOpenChange={setAlertOpen}>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost">
                    <span className="sr-only">Open menu</span>
                    <MoreHorizontal/>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-40">
                  <DropdownMenuGroup>
                    <DropdownMenuLabel>Repo actions</DropdownMenuLabel>
                    <DropdownMenuItem
                        onClick={() => {
                          if (u) {
                            navigator.clipboard.writeText(
                                u.substring(0, u.indexOf(".git")),
                            );
                            toast.success("Repo URL copied to clipboard.");
                          } else {
                            toast.error("No repo URL");
                          }
                        }}
                    >

                      <ClipboardCopy/>
                      Copy student repo URL
                    </DropdownMenuItem>
                    <DropdownMenuSeparator/>
                      <AlertDialogTrigger asChild>
                        <DropdownMenuItem onClick={(e) => {setAlertOpen(true); e.preventDefault();}} variant="destructive"><DeleteIcon/> Delete repo</DropdownMenuItem>
                      </AlertDialogTrigger>
                  </DropdownMenuGroup>
                </DropdownMenuContent>
              </DropdownMenu>
                <AlertDialogContent size="default">
                  <AlertDialogHeader>
                    <AlertDialogMedia className="bg-destructive/10 text-destructive dark:bg-destructive/20 dark:text-destructive">
                      <Trash2Icon />
                    </AlertDialogMedia>
                    <AlertDialogTitle>Delete user repo?</AlertDialogTitle>
                    <AlertDialogDescription>
                      This will permanently delete this repository. This action cannot be undone.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel variant="outline">Cancel</AlertDialogCancel>
                    <AlertDialogAction variant="destructive" disabled={showSpinner} onClick={(e) => {deleteAction(); e.preventDefault()}}>
                      {showSpinner && (<Spinner/>)}
                      Delete
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
          ); // repo options here!!!
        }
        return (
            // Student options here!!
            <></>
        );
      },
    },
  ];
}