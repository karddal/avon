import {
  flexRender,
  getExpandedRowModel,
  getGroupedRowModel,
  useReactTable,
} from "@tanstack/react-table";
import {
  type ColumnFiltersState,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  type SortingState,
  type VisibilityState,
} from "@tanstack/table-core";
import { ChevronDown, ChevronRight } from "lucide-react";
import React, { useEffect, useState } from "react";
import {
  columns,
  type StudentNameAndPotentiallyRepo,
} from "@/components/coursework/student-list/columns";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Spinner } from "@/components/ui/spinner";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { get_all_students_with_maybe_repos } from "@/lib/actions/get_all_students_on_unit_with_repos";
import { cn } from "@/lib/utils";

export function StudentsTableWithMaybeRepos({
  coursework_id,
}: {
  coursework_id: string;
}) {
  const [data, setData] = useState<StudentNameAndPotentiallyRepo[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [sorting, setSorting] = React.useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>(
    [],
  );
  const [columnVisibility, setColumnVisibility] =
    React.useState<VisibilityState>({});
  const [rowSelection, setRowSelection] = React.useState({});

  const table = useReactTable({
    data: data,
    columns,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getGroupedRowModel: getGroupedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getExpandedRowModel: getExpandedRowModel(),
    onColumnVisibilityChange: setColumnVisibility,
    onRowSelectionChange: setRowSelection,
    state: {
      sorting,
      columnFilters,
      columnVisibility,
      rowSelection,
    },
  });

  useEffect(() => {
    setLoading(true);
    const updateData = async () => {
      // TODO: GET DATA HERE
      const updatedData = await get_all_students_with_maybe_repos({
        coursework_id: coursework_id,
      });
      setData(updatedData);
      console.log(updatedData);
    };
    updateData().then(() => {
      setLoading(false);
      table.setGrouping(["repo_url"]);
    });
  }, [coursework_id, table.setGrouping]);

  if (loading) {
    return (
      <div className={"w-full flex items-center justify-center"}>
        <Spinner className={"w-10 h-10"} />
      </div>
    );
  }
  return (
    <div className="w-full">
      <div className="flex items-center py-4">
        <Input
          placeholder="Filter students by name..."
          value={(table.getColumn("name")?.getFilterValue() as string) ?? ""}
          onChange={(event) =>
            table.getColumn("name")?.setFilterValue(event.target.value)
          }
          className=""
        />
      </div>
      <div className="overflow-y-scroll rounded-md border">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => {
                  return (
                    <TableHead key={header.id}>
                      {header.isPlaceholder
                        ? null
                        : flexRender(
                            header.column.columnDef.header,
                            header.getContext(),
                          )}
                    </TableHead>
                  );
                })}
              </TableRow>
            ))}
          </TableHeader>

          <TableBody>
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => {
                const isGroupedRow = row.getIsGrouped();
                const isExpandedGroup = isGroupedRow && row.getIsExpanded();
                const isSubRow = row.depth > 0;

                return (
                  <TableRow
                    key={row.id}
                    data-state={row.getIsSelected() && "selected"}
                    className={cn(
                      isExpandedGroup &&
                        "bg-zinc-200 text-zinc-950 hover:bg-zinc-300 dark:bg-zinc-700 dark:text-zinc-50 dark:hover:bg-zinc-600",
                      isSubRow &&
                        "bg-zinc-100/90 text-zinc-800 hover:bg-zinc-200 dark:bg-zinc-800 dark:text-zinc-100 dark:hover:bg-zinc-700",
                    )}
                  >
                    {row.getVisibleCells().map((cell) => (
                      <TableCell
                        key={cell.id}
                        className={cn(
                          isExpandedGroup && "font-medium",
                          cell.column.id === "select" && "w-10",
                          isSubRow && "border-zinc-300/70 dark:border-zinc-600",
                          isSubRow && cell.column.id !== "select" && "pl-6",
                        )}
                      >
                        {cell.getIsGrouped() ? (
                          <>
                            <button
                              className="flex flex-row items-center gap-2"
                              {...{
                                onClick: row.getToggleExpandedHandler(),
                                style: {
                                  cursor: row.getCanExpand()
                                    ? "pointer"
                                    : "normal",
                                },
                              }}
                            >
                              {row.getIsExpanded() ? (
                                <ChevronDown className="h-4 w-4" />
                              ) : (
                                <ChevronRight className="h-4 w-4" />
                              )}{" "}
                              {flexRender(
                                cell.column.columnDef.cell,
                                cell.getContext(),
                              )}{" "}
                              ({row.subRows.length})
                            </button>
                          </>
                        ) : (
                          flexRender(
                            cell.column.columnDef.cell,
                            cell.getContext(),
                          )
                        )}
                      </TableCell>

                      // <TableCell key={cell.id}>
                      //   {flexRender(
                      //       cell.column.columnDef.cell,
                      //       cell.getContext(),
                      //   )}
                      // </TableCell>
                    ))}
                  </TableRow>
                );
              })
            ) : (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="h-24 text-center"
                >
                  No results.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      <div className="flex items-center justify-end space-x-2 py-4">
        <div className="flex-1 text-sm text-muted-foreground">
          {table.getFilteredSelectedRowModel().rows.length} of{" "}
          {table.getFilteredRowModel().rows.length} student(s) or group(s)
          selected.
        </div>
        <div className="space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
          >
            Previous
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage()}
          >
            Next
          </Button>
        </div>
      </div>
    </div>
  );
}
