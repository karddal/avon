"use client";

import type { ColumnDef } from "@tanstack/table-core";
import {
  ArrowUpDown,
  ClipboardCopy,
  DeleteIcon,
  MoreHorizontal,
  Trash2Icon,
  UserPlus,
} from "lucide-react";
import { type Dispatch, type SetStateAction, useState } from "react";
import { toast } from "sonner";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogMedia,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Spinner } from "@/components/ui/spinner";
import { coursework_delete_repo } from "@/lib/actions/coursework/coursework_delete_repo";
import StudList from "./stud-list";

export type StudentNameAndPotentiallyRepo = {
  id: string;
  name: string;
  repo_url: string | null;
  repo_id: string | null;
};

export const columns: (
  cw_id: string,
  refresh: () => void,
  refreshKey: number,
  setRefreshKey: Dispatch<SetStateAction<number>>,
) => ColumnDef<StudentNameAndPotentiallyRepo>[] = (
  cw_id: string,
  refresh: () => void,
  refreshKey: number,
  setRefreshKey: Dispatch<SetStateAction<number>>,
) => {
  const [alertOpen, setAlertOpen] = useState<boolean>(false);
  const [open, setOpen] = useState<boolean>(false);
  const [showSpinner, setShowSpinner] = useState<boolean>(false);
  const [dialog, setDialog] = useState("none");
  return [
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
      header: () => {
        return <div>Repo name</div>;
      },
      cell: ({ row }) => {
        const s = row.original;
        const repo_name = s.repo_url?.substring(
          s.repo_url.lastIndexOf("/") + 1,
          s.repo_url.indexOf(".git"),
        );
        return (
          <div className="">
            {repo_name ? repo_name : "No repo provisioned"}
          </div>
        );
      },
    },
    {
      id: "repo_id",
      accessorKey: "repo_id",
      enableHiding: true,
      header: () => {
        return <div>Repo ID</div>;
      },
      cell: ({ row }) => {
        return (
          <div className="">
            {row.original.repo_id
              ? row.original.repo_id
              : "No repo provisioned"}
          </div>
        );
      },
    },
    {
      id: "actions",
      enableHiding: false,
      cell: ({ row }) => {
        if (row.getIsGrouped()) {
          const u = row.original.repo_url;

          const s = row.original.repo_id as string; // MUST EXIST AS WE JUST CHECKED IS GROUPED!! so safe
          const deleteAction = async () => {
            setShowSpinner(true);
            const r = await coursework_delete_repo({
              repo_id: s,
              coursework_id: cw_id,
            });
            if (r.status === "ok") {
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
          };

          if (s) {
            const handlePopup = () => {
              switch (dialog) {
                case "delete":
                  return (
                    <AlertDialog open={alertOpen} onOpenChange={setAlertOpen}>
                      <AlertDialogContent size="default">
                        <AlertDialogHeader>
                          <AlertDialogMedia className="bg-destructive/10 text-destructive dark:bg-destructive/20 dark:text-destructive">
                            <Trash2Icon />
                          </AlertDialogMedia>
                          <AlertDialogTitle>Delete user repo?</AlertDialogTitle>
                          <AlertDialogDescription>
                            This will permanently delete this repository. This
                            action cannot be undone.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel variant="outline">
                            Cancel
                          </AlertDialogCancel>
                          <AlertDialogAction
                            variant="destructive"
                            disabled={showSpinner}
                            onClick={(e) => {
                              deleteAction();
                              e.preventDefault();
                            }}
                          >
                            {showSpinner && <Spinner />}
                            Delete
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  );
                case "add":
                  return (
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Add student</DialogTitle>
                        <DialogDescription>
                          Add a student to this repo.
                        </DialogDescription>
                        <div className="-mx-4 no-scrollbar max-h-[50vh] overflow-y-auto px-4">
                          <StudList cw_id={cw_id} repo_id={s} />
                        </div>
                      </DialogHeader>
                    </DialogContent>
                  );
              }
            };
            return (
              <>
                <Dialog open={open} onOpenChange={setOpen}>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost">
                        <span className="sr-only">Open menu</span>
                        <MoreHorizontal />
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
                          <ClipboardCopy />
                          Copy student repo URL
                        </DropdownMenuItem>
                        <DialogTrigger asChild>
                          <DropdownMenuItem
                            onClick={(event) => {
                              setDialog("add");
                              event.preventDefault();
                              setOpen(true);
                            }}
                          >
                            <UserPlus />
                            Add student to repo
                          </DropdownMenuItem>
                        </DialogTrigger>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          onClick={(e) => {
                            setDialog("delete");
                            setAlertOpen(true);
                            e.preventDefault();
                          }}
                          variant="destructive"
                        >
                          <DeleteIcon /> Delete repo
                        </DropdownMenuItem>
                      </DropdownMenuGroup>
                    </DropdownMenuContent>
                  </DropdownMenu>
                  {handlePopup()}
                </Dialog>
              </>
            );
          } // repo options here!!!
        }
        return (
          // Student options here!!
          <></>
        );
      },
    },
  ];
};
