"use client";

import { flexRender, useReactTable } from "@tanstack/react-table";
import {
  type ColumnDef,
  ColumnFiltersState,
  getCoreRowModel,
  getFilteredRowModel,
  SortingState
} from "@tanstack/table-core";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {useState} from "react";
import {ToggleGroup, ToggleGroupItem} from "@/components/ui/toggle-group";
import {useRouter} from "next/navigation";
import {AppRouterInstance} from "next/dist/shared/lib/app-router-context.shared-runtime";

interface DataTableProps<TData, TValue> {
  columns: (router: AppRouterInstance) => ColumnDef<TData, TValue>[];
  data: TData[];
}

export function BaseImageTable<TData, TValue>({
  columns,
  data,
}: DataTableProps<TData, TValue>) {
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([])
  const router = useRouter();
  const table = useReactTable({
    data,
    columns: columns(router),
    getCoreRowModel: getCoreRowModel(),
    onColumnFiltersChange: setColumnFilters,
    getFilteredRowModel: getFilteredRowModel(),
    state: {
      columnFilters
    }
  });

  const setFilterState: (value: "all" | "active" | "inactive") => void = (v) => {
    let newFilterValue;
    if (v === "active") {
      newFilterValue = true;
    } else if (v === "inactive") {
      newFilterValue = false
    } else {
      newFilterValue = undefined;
    }

    table.getColumn("is_active")?.setFilterValue(newFilterValue);
  }
  return (
    <div className="overflow-hidden rounded-md border">
      <div className={"flex flex-col py-4 px-4"}>
        <ToggleGroup onValueChange={(x) => setFilterState(x as "all" | "active" | "inactive")} variant={"outline"} type={"single"} defaultValue={"all"}>
          <ToggleGroupItem value={"all"} aria-label={"Toggle all"}>
            All
          </ToggleGroupItem>
          <ToggleGroupItem value={"active"} aria-label={"Toggle active only"}>
            Active only
          </ToggleGroupItem>
          <ToggleGroupItem value={"inactive"} aria-label={"Toggle inactive only"}>
            Inactive only
          </ToggleGroupItem>
        </ToggleGroup>
      </div>
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
            table.getRowModel().rows.map((row) => (
              <TableRow
                key={row.id}
                data-state={row.getIsSelected() && "selected"}
              >
                {row.getVisibleCells().map((cell) => (
                  <TableCell key={cell.id}>
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </TableCell>
                ))}
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell colSpan={columns.length} className="h-24 text-center">
                No results.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
}
