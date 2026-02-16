"use client";

import { ColumnDef } from "@tanstack/react-table";
import {
  ArrowUpDown,
  ChevronDown,
  ChevronRight,
  User,
  Store,
  MoreHorizontal,
  FileText,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { formatDateWIB } from "@/lib/helper";
import { TReceipt } from "@/lib/type/type.procurement";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";
import Link from "next/link";
import { ROUTES } from "@/lib/constant";

export const columnReceipt: ColumnDef<TReceipt>[] = [
  {
    id: "expander",
    enableHiding: false,
    header: () => null,
    cell: ({ row }) => {
      if (row.original.receiptItems.length === 0) {
        return null;
      }

      return (
        <button onClick={() => row.toggleExpanded()} className="cursor-pointer">
          {row.getIsExpanded() ? (
            <ChevronDown className="h-4 w-4" />
          ) : (
            <ChevronRight className="h-4 w-4" />
          )}
        </button>
      );
    },
  },
  {
    accessorKey: "idReceipt",
    header: "No. Penerimaan",
    enableHiding: false,
    cell: ({ row }) => (
      <div className="font-medium">{row.getValue("idReceipt")}</div>
    ),
  },
  {
    accessorKey: "purchaseId",
    header: "No. Pembelian",
    cell: ({ row }) => (
      <div className="text-sm text-muted-foreground">
        {row.getValue("purchaseId")}
      </div>
    ),
  },
  {
    accessorKey: "supplierStore",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Supplier
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      );
    },
    cell: ({ row }) => {
      const store = row.original.supplierStore;
      const name = row.original.supplierName;

      return (
        <div className="flex items-start gap-2">
          <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-purple-50">
            <Store className="h-4 w-4 text-purple-600" />
          </div>
          <div className="min-w-0">
            <p className="font-medium text-sm">{store}</p>
            <p className="text-xs text-muted-foreground truncate">{name}</p>
          </div>
        </div>
      );
    },
  },
  {
    accessorKey: "receivedByName",
    header: "Diterima Oleh",
    cell: ({ row }) => {
      const name = row.original.receivedByName;

      return (
        <div className="flex items-center gap-2">
          <div className="rounded-full bg-blue-50 p-1.5">
            <User className="h-3.5 w-3.5 text-blue-600" />
          </div>
          <span className="text-sm">{name}</span>
        </div>
      );
    },
  },
  {
    id: "summary",
    header: "Ringkasan",
    cell: ({ row }) => {
      const totalItems = row.original.totalItems;
      const totalReceived = row.original.totalReceived;
      const totalDamaged = row.original.totalDamaged;

      return (
        <div className="flex items-center gap-3">
          <div className="text-sm">
            <p className="font-medium">{totalItems} item</p>
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <span className="text-green-600">
                ✓ {totalReceived.toFixed(2)}
              </span>
              {totalDamaged > 0 && (
                <span className="text-red-600">
                  ✗ {totalDamaged.toFixed(2)}
                </span>
              )}
            </div>
          </div>
        </div>
      );
    },
  },
  {
    accessorKey: "createdAt",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Tanggal
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      );
    },
    cell: ({ row }) => {
      const date: Date = row.getValue("createdAt");
      return (
        <div className="text-sm text-muted-foreground">
          {formatDateWIB(date)}
        </div>
      );
    },
  },
  {
    id: "actions",
    header: "Opsi",
    enableHiding: false,
    cell: ({ row }) => {
      const dataRows = row.original;

      return (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-8 w-8 p-0">
              <span className="sr-only">Open Menu</span>
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="space-y-1">
            <DropdownMenuLabel className="text-center">Opsi</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild>
              <Button asChild size="icon" variant="ghost" className="w-full">
                <Link href={ROUTES.AUTH.RECEIPT.DETAIL(dataRows.idReceipt)}>
                  <FileText className="h-4 w-4" />
                  Detail
                </Link>
              </Button>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      );
    },
  },
];
