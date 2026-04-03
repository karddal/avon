"use client"
import { ColumnDef } from "@tanstack/table-core";
import {TestRun} from "@/lib/actions/coursework/coursework-fetch-test-runs";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel, DropdownMenuSeparator,
    DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import {Button} from "@/components/ui/button";
import {ArrowUpDown, ExternalLink, Gitlab, IdCard, MoreHorizontal} from "lucide-react";
import {formatDistanceToNow} from "date-fns";
import {Tooltip, TooltipContent, TooltipTrigger} from "@/components/ui/tooltip";

export const columns: ColumnDef<TestRun>[] = [
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
        cell: ({row}) => {
            if (row.getIsGrouped()) {
                return (<div>{row.original.batch_id.substring(0, 6)}...</div>)
            }
        }
    },
    {
        accessorKey: "students",
        header: "Student",
        filterFn: (row, columnId, filterValue) => {
            return (row.original.students.map((s) => s.name.toLowerCase()).some((s) => s.includes(filterValue)));
        },
        cell: ({row}) => {
            if (row.getIsGrouped()) {
                return <></>
            }
            let names = [];
            for (const s of row.original.students) {
                names.push(s.name);
            }
            const name = names.join(", ");
            return(<div className="font-medium">{name}</div>)
        }
    },
    {
        accessorKey: "started",
        header: ({column}) => {
          return (
              <Button variant={"ghost"}
                      onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}>
                  Started
                  <ArrowUpDown className={"ml-2 h-4 w-4"}/>
              </Button>
          )
        },
        aggregationFn: "min",
        cell: ({row}) => {
            return <></>
        },
        sortingFn: "datetime",
        aggregatedCell: ({getValue}) => {
            const date = getValue<Date>();
            return <Tooltip>
                <TooltipTrigger className={"font-mono"}>{formatDistanceToNow(new Date(date), {
                    addSuffix: true,
                    includeSeconds: true})}</TooltipTrigger>
                <TooltipContent>{date.toLocaleString()}</TooltipContent>
            </Tooltip>
        }
    },
    {
        id: "actions",
        cell: ({row}) => {
            const testRun = row.original
            if (row.getIsGrouped()) {
                return <></>
            }
            return (
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
                            <IdCard/>Copy test run ID
                        </DropdownMenuItem>
                        <DropdownMenuItem
                            onClick={() => navigator.clipboard.writeText(testRun.gitlab_repo_url)}
                        >
                            <Gitlab/>Copy repo URL
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem><ExternalLink/>View test run</DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            )
        }
    },
]