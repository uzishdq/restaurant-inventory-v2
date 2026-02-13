"use client";

import { ColumnDef } from "@tanstack/react-table";
import {
  ArrowUpDown,
  ChevronDown,
  ChevronRight,
  MoreHorizontal,
  Package,
  Store,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { formatDateWIB } from "@/lib/helper";
import { TPurchase } from "@/lib/type/type.procurement";
import { BadgeCustom } from "./badge-custom";

export const columnPurchase: ColumnDef<TPurchase>[] = [
  {
    id: "expander",
    enableHiding: false,
    header: () => null,
    cell: ({ row }) => {
      if (row.original.purchaseItems.length === 0) {
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
    accessorKey: "idPurchase",
    header: "No. Purchase Order",
    enableHiding: false,
    cell: ({ row }) => (
      <div className="font-medium">{row.getValue("idPurchase")}</div>
    ),
  },
  {
    accessorKey: "procurementId",
    header: "No. Pengadaan",
    enableHiding: false,
    cell: ({ row }) => (
      <div className="text-sm text-muted-foreground">
        {row.getValue("procurementId")}
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
    enableHiding: false,
    cell: ({ row }) => {
      const store = row.original.supplierStore;
      const name = row.original.supplierName;
      const phone = row.original.supplierPhone;

      return (
        <div className="flex items-start gap-2">
          <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-primary/10">
            <Store className="h-4 w-4 text-primary" />
          </div>
          <div className="min-w-0">
            <p className="font-medium text-sm">{store}</p>
            <p className="text-xs text-muted-foreground truncate">{name}</p>
            {phone && <p className="text-xs text-muted-foreground">{phone}</p>}
          </div>
        </div>
      );
    },
  },
  {
    id: "itemsSummary",
    header: "Total Pesanan",
    cell: ({ row }) => {
      const totalItems = row.original.totalItems;

      return (
        <div className="flex items-center gap-2">
          <Package className="h-4 w-4 text-muted-foreground" />
          <div className="text-sm">
            <p className="font-medium">{totalItems} bahan baku</p>
          </div>
        </div>
      );
    },
  },
  {
    accessorKey: "createdAt",
    enableHiding: false,
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Tanggal Dibuat
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
    accessorKey: "status",
    header: "Status",
    enableHiding: false,
    cell: ({ row }) => (
      <BadgeCustom value={row.getValue("status")} category="purchaseStatus" />
    ),
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
          </DropdownMenuContent>
        </DropdownMenu>
      );
    },
  },
];
