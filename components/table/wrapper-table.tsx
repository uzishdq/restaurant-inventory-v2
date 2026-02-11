"use client";
"use no memo";

import React from "react";
import {
  ColumnDef,
  ColumnFiltersState,
  SortingState,
  VisibilityState,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
  getExpandedRowModel, // TAMBAHKAN INI
  ExpandedState, // TAMBAHKAN INI
} from "@tanstack/react-table";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../ui/card";
import { Input } from "../ui/input";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";
import { Button } from "../ui/button";
import { Settings2 } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import DateTableFilter from "./date-table-filter";

interface TableDateWrapperProps<T> {
  header: string;
  description: string;
  searchBy: string;
  labelSearch: string;
  isFilterDate: boolean;
  filterDate: string;
  children?: React.ReactNode;
  data: T[];
  columns: ColumnDef<T>[];
  renderExpandedRow?: (row: T) => React.ReactNode; // TAMBAHKAN INI
}

export default function TableDateWrapper<T>({
  header,
  description,
  searchBy,
  labelSearch,
  isFilterDate,
  filterDate,
  children,
  data,
  columns,
  renderExpandedRow, // TAMBAHKAN INI
}: Readonly<TableDateWrapperProps<T>>) {
  const memoData = React.useMemo(() => data, [data]);
  const memoColumns = React.useMemo(() => columns, [columns]);

  const [sorting, setSorting] = React.useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>(
    [],
  );
  const [columnVisibility, setColumnVisibility] =
    React.useState<VisibilityState>({});
  const [rowSelection, setRowSelection] = React.useState({});
  const [expanded, setExpanded] = React.useState<ExpandedState>({}); // TAMBAHKAN INI
  const [pagination, setPagination] = React.useState({
    pageIndex: 0,
    pageSize: 10,
  });

  // eslint-disable-next-line react-hooks/incompatible-library
  const table = useReactTable({
    data: memoData,
    columns: memoColumns,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    onPaginationChange: setPagination,
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    onColumnVisibilityChange: setColumnVisibility,
    onRowSelectionChange: setRowSelection,
    getExpandedRowModel: getExpandedRowModel(), // TAMBAHKAN INI
    onExpandedChange: setExpanded, // TAMBAHKAN INI
    state: {
      sorting,
      columnFilters,
      columnVisibility,
      rowSelection,
      pagination,
      expanded, // TAMBAHKAN INI
    },
  });

  return (
    <Card className="xl:col-span-2">
      <CardHeader className="flex flex-row items-center">
        <div className="grid gap-2">
          <CardTitle className="text-xl">{header}</CardTitle>
          <CardDescription className="text-base text-justify">
            {description}.
          </CardDescription>
        </div>
        {children}
      </CardHeader>
      <CardContent>
        <div className="w-full">
          <div className="flex flex-col items-center gap-2 py-4 md:flex-row">
            <Input
              placeholder={`Cari Berdasarkan ${labelSearch}`}
              value={
                (table.getColumn(searchBy)?.getFilterValue() as string) ?? ""
              }
              onChange={(event) =>
                table.getColumn(searchBy)?.setFilterValue(event.target.value)
              }
              className="w-full"
            />
            <div className="flex w-full items-center gap-2">
              {isFilterDate && (
                <DateTableFilter table={table} filterDate={filterDate} />
              )}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" className="ml-auto">
                    <Settings2 className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  {table
                    .getAllColumns()
                    .filter((column) => column.getCanHide())
                    .map((column) => {
                      return (
                        <DropdownMenuCheckboxItem
                          key={column.id}
                          className="capitalize"
                          checked={column.getIsVisible()}
                          onCheckedChange={(value) =>
                            column.toggleVisibility(!!value)
                          }
                        >
                          {column.columnDef.header?.toString()}
                        </DropdownMenuCheckboxItem>
                      );
                    })}
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
          <div className="rounded-md border">
            <Table>
              <TableHeader className="bg-muted">
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
                    <React.Fragment key={row.id}>
                      <TableRow data-state={row.getIsSelected() && "selected"}>
                        {row.getVisibleCells().map((cell) => (
                          <TableCell key={cell.id}>
                            {flexRender(
                              cell.column.columnDef.cell,
                              cell.getContext(),
                            )}
                          </TableCell>
                        ))}
                      </TableRow>

                      {/* TAMBAHKAN BAGIAN INI */}
                      {row.getIsExpanded() && renderExpandedRow && (
                        <TableRow>
                          <TableCell
                            colSpan={columns.length}
                            className="bg-muted/50 p-4"
                          >
                            {renderExpandedRow(row.original)}
                          </TableCell>
                        </TableRow>
                      )}
                    </React.Fragment>
                  ))
                ) : (
                  <TableRow>
                    <TableCell
                      colSpan={columns.length}
                      className="h-24 text-center"
                    >
                      Tidak Ada Hasil
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
          <div className="flex flex-col gap-4 py-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center justify-between w-full">
              <div className="flex-1 text-sm text-muted-foreground">
                Halaman {pagination.pageIndex + 1} dari{" "}
                {table.getPageCount().toLocaleString()}
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground">
                  Data / Halaman:
                </span>
                <Select
                  value={`${table.getState().pagination.pageSize}`}
                  onValueChange={(value) => {
                    table.setPageSize(Number(value));
                  }}
                >
                  <SelectTrigger className="h-8 w-fit">
                    <SelectValue
                      placeholder={table.getState().pagination.pageSize}
                    />
                  </SelectTrigger>
                  <SelectContent side="top">
                    {[5, 10, 20, 30, 50, 100].map((pageSize) => (
                      <SelectItem key={pageSize} value={`${pageSize}`}>
                        {pageSize}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="flex items-center justify-center gap-1 sm:gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => table.setPageIndex(0)}
                disabled={!table.getCanPreviousPage()}
              >
                {"<<"}
              </Button>
              <div className="flex items-center gap-1">
                {Array.from({ length: table.getPageCount() }, (_, i) => i).map(
                  (pageIndex) => {
                    const pageNumber = pageIndex + 1;
                    const currentPage = pagination.pageIndex + 1;

                    const showPage =
                      pageNumber === 1 ||
                      pageNumber === table.getPageCount() ||
                      (pageNumber >= currentPage - 1 &&
                        pageNumber <= currentPage + 1);

                    if (!showPage) {
                      if (
                        pageNumber === currentPage - 2 ||
                        pageNumber === currentPage + 2
                      ) {
                        return (
                          <Button
                            key={pageIndex}
                            variant="outline"
                            size="sm"
                            disabled
                            className="w-9"
                          >
                            ...
                          </Button>
                        );
                      }
                      return null;
                    }

                    return (
                      <Button
                        key={pageIndex}
                        variant={
                          pageIndex === pagination.pageIndex
                            ? "default"
                            : "outline"
                        }
                        size="sm"
                        onClick={() => table.setPageIndex(pageIndex)}
                        className="w-9"
                      >
                        {pageNumber}
                      </Button>
                    );
                  },
                )}
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => table.setPageIndex(table.getPageCount() - 1)}
                disabled={!table.getCanNextPage()}
              >
                {">>"}
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
