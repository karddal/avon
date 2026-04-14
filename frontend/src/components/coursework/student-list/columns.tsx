"use client";

import type { ColumnDef, Row } from "@tanstack/table-core";
import {
  AlertCircle,
  ArrowUpDown,
  CheckCircle2,
  ClipboardCopy,
  Clock3,
  DeleteIcon,
  Loader2,
  MailPlus,
  MoreHorizontal,
  Trash2Icon,
  UserPlus,
} from "lucide-react";
import { useState } from "react";
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
import { Badge } from "@/components/ui/badge";
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
import { cn } from "@/lib/utils";
import StudList from "./stud-list";

export type StudentInviteStatus = "accepted" | "invited" | "not_invited";

export type StudentNameAndPotentiallyRepo = {
  id: string;
  name: string;
  repo_url: string | null;
  repo_id: string | null;
  email?: string;
  src?: string;
  invite_status?: StudentInviteStatus;
};

type ColumnsOptions = {
  cw_id: string;
  refresh: () => void;
  reloadData: () => Promise<void>;
  onInviteStudents: (
    students: StudentNameAndPotentiallyRepo[],
  ) => Promise<void>;
  onDeleteInvites: (students: StudentNameAndPotentiallyRepo[]) => Promise<void>;
  submitLoading: boolean;
  invitingStudentIds: string[];
  deletingStudentIds: string[];
};

function statusBadge(status: StudentInviteStatus) {
  if (status === "accepted") {
    return {
      label: "Accepted",
      icon: CheckCircle2,
      className:
        "border-green-600/30 bg-green-500/10 text-green-700 dark:text-green-400",
    };
  }

  if (status === "invited") {
    return {
      label: "Invited",
      icon: Clock3,
      className:
        "border-orange-600/30 bg-orange-500/10 text-orange-700 dark:text-orange-400",
    };
  }

  return {
    label: "Not Invited",
    icon: AlertCircle,
    className: "border-red-600/30 bg-red-500/10 text-red-700 dark:text-red-400",
  };
}

function InviteStatusCell({
  row,
}: {
  row: Row<StudentNameAndPotentiallyRepo>;
}) {
  if (row.getIsGrouped()) {
    const counts = row.getLeafRows().reduce(
      (summary, leafRow) => {
        const status = leafRow.original.invite_status ?? "not_invited";
        summary[status] += 1;
        return summary;
      },
      {
        accepted: 0,
        invited: 0,
        not_invited: 0,
      } as Record<StudentInviteStatus, number>,
    );

    const summary = [
      counts.accepted > 0 ? `${counts.accepted} accepted` : null,
      counts.invited > 0 ? `${counts.invited} invited` : null,
      counts.not_invited > 0 ? `${counts.not_invited} not invited` : null,
    ]
      .filter(Boolean)
      .join(", ");

    return <div className="text-sm text-muted-foreground">{summary}</div>;
  }

  if (!row.original.repo_id) {
    return <Badge variant="outline">No repo provisioned</Badge>;
  }

  if (!row.original.email) {
    return <Badge variant="outline">No email</Badge>;
  }

  const badge = statusBadge(row.original.invite_status ?? "not_invited");
  const Icon = badge.icon;

  return (
    <Badge className={cn("gap-1", badge.className)}>
      <Icon className="h-3.5 w-3.5" />
      {badge.label}
    </Badge>
  );
}

function RepoInviteActions({
  row,
  onInviteStudents,
  onDeleteInvites,
  submitLoading,
  invitingStudentIds,
  deletingStudentIds,
}: {
  row: Row<StudentNameAndPotentiallyRepo>;
  onInviteStudents: (
    students: StudentNameAndPotentiallyRepo[],
  ) => Promise<void>;
  onDeleteInvites: (students: StudentNameAndPotentiallyRepo[]) => Promise<void>;
  submitLoading: boolean;
  invitingStudentIds: string[];
  deletingStudentIds: string[];
}) {
  const leafStudents = row.getLeafRows().map((leafRow) => leafRow.original);
  const inviteableStudents = leafStudents.filter(
    (student) =>
      Boolean(student.repo_id) &&
      Boolean(student.email) &&
      student.invite_status === "not_invited",
  );
  const invitedStudents = leafStudents.filter(
    (student) =>
      Boolean(student.repo_id) &&
      Boolean(student.email) &&
      student.invite_status === "invited",
  );
  const isInviting = inviteableStudents.some((student) =>
    invitingStudentIds.includes(student.id),
  );
  const isDeleting = invitedStudents.some((student) =>
    deletingStudentIds.includes(student.id),
  );

  if (inviteableStudents.length === 0 && invitedStudents.length === 0) {
    return null;
  }

  return (
    <>
      <DropdownMenuSeparator />
      <DropdownMenuGroup>
        <DropdownMenuLabel>Invites</DropdownMenuLabel>
        {inviteableStudents.length > 0 ? (
          <DropdownMenuItem
            onClick={() => void onInviteStudents(inviteableStudents)}
            disabled={submitLoading || isInviting}
          >
            <MailPlus />
            Invite team
            <span className="ml-auto text-xs text-muted-foreground">
              {inviteableStudents.length}
            </span>
          </DropdownMenuItem>
        ) : null}
        {invitedStudents.length > 0 ? (
          <DropdownMenuItem
            onClick={() => void onDeleteInvites(invitedStudents)}
            disabled={submitLoading || isDeleting}
          >
            <DeleteIcon />
            Delete team invites
            <span className="ml-auto text-xs text-muted-foreground">
              {invitedStudents.length}
            </span>
          </DropdownMenuItem>
        ) : null}
      </DropdownMenuGroup>
    </>
  );
}

function GroupRowActionsCell({
  row,
  cw_id,
  refresh,
  reloadData,
  onInviteStudents,
  onDeleteInvites,
  submitLoading,
  invitingStudentIds,
  deletingStudentIds,
}: {
  row: Row<StudentNameAndPotentiallyRepo>;
  cw_id: string;
  refresh: () => void;
  reloadData: () => Promise<void>;
  onInviteStudents: (
    students: StudentNameAndPotentiallyRepo[],
  ) => Promise<void>;
  onDeleteInvites: (students: StudentNameAndPotentiallyRepo[]) => Promise<void>;
  submitLoading: boolean;
  invitingStudentIds: string[];
  deletingStudentIds: string[];
}) {
  const [alertOpen, setAlertOpen] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [showSpinner, setShowSpinner] = useState(false);
  const [dialog, setDialog] = useState<"none" | "delete" | "add">("none");
  const repoUrl = row.original.repo_url;
  const repoId = row.original.repo_id;

  if (!repoId) {
    return null;
  }

  const deleteAction = async () => {
    setShowSpinner(true);
    const result = await coursework_delete_repo({
      repo_id: repoId,
      coursework_id: cw_id,
    });

    if (result.status === "ok") {
      toast.success("Successfully deleted repo");
    } else {
      toast.error(`Error deleting repo: ${result.details}`);
    }

    setAlertOpen(false);
    setShowSpinner(false);
    await reloadData();
    refresh();
  };

  return (
    <div className="flex justify-end">
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="h-8 w-8">
              <span className="sr-only">Open repo actions</span>
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuGroup>
              <DropdownMenuLabel>Repo actions</DropdownMenuLabel>
              <DropdownMenuItem
                onClick={() => {
                  if (repoUrl) {
                    navigator.clipboard.writeText(
                      repoUrl.substring(0, repoUrl.indexOf(".git")),
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
                    setDialogOpen(true);
                  }}
                >
                  <UserPlus />
                  Add student to repo
                </DropdownMenuItem>
              </DialogTrigger>
            </DropdownMenuGroup>

            <RepoInviteActions
              row={row}
              onInviteStudents={onInviteStudents}
              onDeleteInvites={onDeleteInvites}
              submitLoading={submitLoading}
              invitingStudentIds={invitingStudentIds}
              deletingStudentIds={deletingStudentIds}
            />

            <DropdownMenuSeparator />
            <DropdownMenuGroup>
              <DropdownMenuItem
                onClick={(event) => {
                  setDialog("delete");
                  setAlertOpen(true);
                  event.preventDefault();
                }}
                variant="destructive"
              >
                <DeleteIcon />
                Delete repo
              </DropdownMenuItem>
            </DropdownMenuGroup>
          </DropdownMenuContent>
        </DropdownMenu>

        {dialog === "add" && (
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add student</DialogTitle>
              <DialogDescription>Add a student to this repo.</DialogDescription>
              <div className="-mx-4 max-h-[50vh] overflow-y-auto px-4">
                <StudList cw_id={cw_id} />
              </div>
            </DialogHeader>
          </DialogContent>
        )}

        <AlertDialog open={alertOpen} onOpenChange={setAlertOpen}>
          <AlertDialogContent size="default">
            <AlertDialogHeader>
              <AlertDialogMedia className="bg-destructive/10 text-destructive dark:bg-destructive/20 dark:text-destructive">
                <Trash2Icon />
              </AlertDialogMedia>
              <AlertDialogTitle>Delete user repo?</AlertDialogTitle>
              <AlertDialogDescription>
                This will permanently delete this repository. This action cannot
                be undone.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel variant="outline">Cancel</AlertDialogCancel>
              <AlertDialogAction
                variant="destructive"
                disabled={showSpinner}
                onClick={(event) => {
                  void deleteAction();
                  event.preventDefault();
                }}
              >
                {showSpinner && <Spinner />}
                Delete
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </Dialog>
    </div>
  );
}

function StudentRowActionsCell({
  row,
  onInviteStudents,
  onDeleteInvites,
  submitLoading,
  invitingStudentIds,
  deletingStudentIds,
}: {
  row: Row<StudentNameAndPotentiallyRepo>;
  onInviteStudents: (
    students: StudentNameAndPotentiallyRepo[],
  ) => Promise<void>;
  onDeleteInvites: (students: StudentNameAndPotentiallyRepo[]) => Promise<void>;
  submitLoading: boolean;
  invitingStudentIds: string[];
  deletingStudentIds: string[];
}) {
  const student = row.original;
  const isInviting = invitingStudentIds.includes(student.id);
  const isDeleting = deletingStudentIds.includes(student.id);
  const inviteStatus = student.invite_status ?? "not_invited";

  if (!student.repo_id || !student.email) {
    return null;
  }

  return (
    <div className="flex justify-end">
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon" className="h-8 w-8">
            <span className="sr-only">Open student actions</span>
            {isInviting || isDeleting ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <MoreHorizontal className="h-4 w-4" />
            )}
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-52">
          <DropdownMenuGroup>
            <DropdownMenuLabel>Student actions</DropdownMenuLabel>
            {inviteStatus === "not_invited" ? (
              <DropdownMenuItem
                onClick={() => void onInviteStudents([student])}
                disabled={submitLoading || isInviting}
              >
                <MailPlus />
                Invite student
              </DropdownMenuItem>
            ) : null}
            {inviteStatus === "invited" ? (
              <DropdownMenuItem
                onClick={() => void onDeleteInvites([student])}
                disabled={submitLoading || isDeleting}
              >
                <DeleteIcon />
                Delete invite
              </DropdownMenuItem>
            ) : null}
          </DropdownMenuGroup>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}

export const columns = ({
  cw_id,
  refresh,
  reloadData,
  onInviteStudents,
  onDeleteInvites,
  submitLoading,
  invitingStudentIds,
  deletingStudentIds,
}: ColumnsOptions): ColumnDef<StudentNameAndPotentiallyRepo>[] => [
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
    cell: ({ row }) =>
      row.getIsGrouped() ? null : (
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
    header: ({ column }) => (
      <Button
        variant="ghost"
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
      >
        Student Name
        <ArrowUpDown />
      </Button>
    ),
    enableHiding: false,
    cell: ({ row }) => (
      <div className="min-w-0">
        <div className="truncate">{row.getValue("name")}</div>
        {!row.getIsGrouped() && row.original.email ? (
          <div className="truncate text-xs text-muted-foreground">
            {row.original.email}
          </div>
        ) : null}
      </div>
    ),
  },
  {
    id: "repo_url",
    accessorKey: "repo_url",
    enableHiding: true,
    header: () => <div>Repo name</div>,
    cell: ({ row }) => {
      const repoName = row.original.repo_url?.substring(
        row.original.repo_url.lastIndexOf("/") + 1,
        row.original.repo_url.indexOf(".git"),
      );

      return (
        <div className="truncate">{repoName || "No repo provisioned"}</div>
      );
    },
  },
  {
    id: "repo_id",
    accessorKey: "repo_id",
    enableHiding: true,
    header: () => <div>Repo ID</div>,
    cell: ({ row }) => (
      <div className="truncate">
        {row.original.repo_id || "No repo provisioned"}
      </div>
    ),
  },
  {
    id: "invite_status",
    header: () => <div>Invite status</div>,
    cell: ({ row }) => <InviteStatusCell row={row} />,
  },
  {
    id: "actions",
    enableHiding: false,
    header: () => <div className="w-12 text-right">Actions</div>,
    cell: ({ row }) =>
      row.getIsGrouped() ? (
        <GroupRowActionsCell
          row={row}
          cw_id={cw_id}
          refresh={refresh}
          reloadData={reloadData}
          onInviteStudents={onInviteStudents}
          onDeleteInvites={onDeleteInvites}
          submitLoading={submitLoading}
          invitingStudentIds={invitingStudentIds}
          deletingStudentIds={deletingStudentIds}
        />
      ) : (
        <StudentRowActionsCell
          row={row}
          onInviteStudents={onInviteStudents}
          onDeleteInvites={onDeleteInvites}
          submitLoading={submitLoading}
          invitingStudentIds={invitingStudentIds}
          deletingStudentIds={deletingStudentIds}
        />
      ),
  },
];
