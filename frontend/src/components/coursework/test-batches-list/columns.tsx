"use client";
import type { ColumnDef } from "@tanstack/table-core";
import { formatDistanceToNow } from "date-fns";
import {
  ArrowUpDown,
  ExternalLink,
  Gitlab,
  IdCard,
  MoreHorizontal,
} from "lucide-react";
import { useState } from "react";
import TestRunComponent from "@/components/coursework/test-run/TestRun";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import type { TestRun } from "@/lib/actions/coursework/coursework-fetch-test-runs";

function TestRunActions({
  testRun,
  coursework_id,
}: {
  testRun: TestRun;
  coursework_id: string;
}) {
  const [show, setShow] = useState(false);

  return (
    <Dialog open={show} onOpenChange={setShow}>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="h-8 w-8 p-0">
            <span className="sr-only">Open menu</span>
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuLabel>Actions</DropdownMenuLabel>
          <DropdownMenuItem
            onClick={() => navigator.clipboard.writeText(testRun.id)}
          >
            <IdCard />
            Copy test run ID
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={() =>
              navigator.clipboard.writeText(testRun.gitlab_repo_url)
            }
          >
            <Gitlab />
            Copy repo URL
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DialogTrigger asChild>
            <DropdownMenuItem
              onClick={(e) => {
                setShow(true);
                e.preventDefault();
              }}
            >
              <ExternalLink />
              View test run
            </DropdownMenuItem>
          </DialogTrigger>
        </DropdownMenuContent>
      </DropdownMenu>
      <DialogContent className="max-w-full! lg:max-w-[75%]! w-full max-h-[90vh] xs:max-h-screen overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle>Test run</DialogTitle>
        </DialogHeader>
        <div className="overflow-y-auto flex-1 -mx-6 px-6">
          <TestRunComponent
            key={testRun.id}
            test_run_id={testRun.id}
            coursework_id={coursework_id}
          />
        </div>
      </DialogContent>
    </Dialog>
  );
}

export const columns: (coursework_id: string) => ColumnDef<TestRun>[] = (
  coursework_id,
) => {
  return [
    {
      accessorKey: "status",
      header: "Status",
    },
    {
      accessorKey: "gitlab_repo_id",
      header: "Repo ID",
    },
    {
      accessorKey: "batch_id",
      header: "Batch ID",
      cell: ({ row }) => {
        if (row.getIsGrouped()) {
          return (
            <Tooltip>
              <TooltipTrigger asChild>
                <div>{row.original.batch_id.substring(0, 6)}...</div>
              </TooltipTrigger>
              <TooltipContent side={"left"} className={"font-mono"}>
                {row.original.batch_id}
              </TooltipContent>
            </Tooltip>
          );
        }
      },
    },
    {
      accessorKey: "students",
      header: "Student",
      filterFn: (row, _columnId, filterValue) => {
        return row.original.students
          .map((s) => s.name.toLowerCase())
          .some((s) => s.includes(filterValue));
      },
      cell: ({ row }) => {
        if (row.getIsGrouped()) {
          return <></>;
        }
        const names = [];
        for (const s of row.original.students) {
          names.push(s.name);
        }
        const name = names.join(", ");
        return <div className="font-medium">{name}</div>;
      },
    },
    {
      accessorKey: "started",
      header: ({ column }) => {
        return (
          <Button
            variant={"ghost"}
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            Started
            <ArrowUpDown className={"ml-2 h-4 w-4"} />
          </Button>
        );
      },
      aggregationFn: "min",
      cell: ({ row }) => {
        return <></>;
      },
      sortingFn: "datetime",
      aggregatedCell: ({ getValue }) => {
        const date = getValue<Date>();
        return (
          <Tooltip>
            <TooltipTrigger className={"font-mono"}>
              {formatDistanceToNow(new Date(date), {
                addSuffix: true,
                includeSeconds: true,
              })}
            </TooltipTrigger>
            <TooltipContent side={"right"}>
              {date.toLocaleString()}
            </TooltipContent>
          </Tooltip>
        );
      },
    },
    {
      id: "actions",
      cell: ({ row }) => {
        if (row.getIsGrouped()) {
          return <></>;
        }
        return (
          <TestRunActions
            testRun={row.original}
            coursework_id={coursework_id}
          />
        );
      },
    },
  ];
};
