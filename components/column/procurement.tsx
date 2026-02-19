"use client";

import { ColumnDef } from "@tanstack/react-table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";
import { Button } from "../ui/button";
import {
  ArrowUpDown,
  BadgeCheck,
  ChevronDown,
  ChevronRight,
  CookingPot,
  MoreHorizontal,
  Package,
  ShoppingCart,
} from "lucide-react";
import DialogForm from "../form/dialog-form";
import { TItemSelect } from "@/lib/type/type.item";
import { BadgeCustom } from "./badge-custom";
import { formatDateWIB } from "@/lib/helper";
import { TProcerement } from "@/lib/type/type.procurement";
import { ROUTES } from "@/lib/constant";
import Link from "next/link";
import { Badge } from "../ui/badge";
import { ProcurementDeteleForm } from "../form/procurement/delete-procurement";

export const columnProcurement = ({
  rawItems,
}: {
  rawItems: TItemSelect[];
}): ColumnDef<TProcerement>[] => [
  {
    id: "expander",
    enableHiding: false,
    header: () => null,
    cell: ({ row }) => {
      if (row.original.procurementItem.length === 0) {
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
    accessorKey: "idProcurement",
    header: "No Pengadaan",
    enableHiding: false,
    cell: ({ row }) => (
      <div className="capitalize">{row.getValue("idProcurement")}</div>
    ),
  },
  {
    accessorKey: "requestedBy",
    header: "Diajukan Oleh",
    enableHiding: false,
    cell: ({ row }) => (
      <div className="capitalize">{row.getValue("requestedBy")}</div>
    ),
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
          Tanggal
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      );
    },
    cell: ({ row }) => {
      const date: Date | null = row.getValue("createdAt");
      return (
        <div className="text-sm text-muted-foreground">
          {date ? formatDateWIB(date) : "Belum ada movement"}
        </div>
      );
    },
  },
  {
    accessorKey: "totalItems",
    header: "Total Pengadaan",
    enableHiding: true,
    cell: ({ row }) => {
      const totalRaw = row.original.totalRawMaterial;
      const totalWip = row.original.totalWorkInProgress;

      return (
        <div className="space-y-1.5">
          {/* Total */}
          <div className="flex items-center gap-1.5">
            <Package className="h-3.5 w-3.5 text-muted-foreground" />
            <span className="font-semibold">{row.getValue("totalItems")}</span>
            <span className="text-xs text-muted-foreground">bahan</span>
          </div>

          {/* Breakdown */}
          <div className="flex items-center gap-1.5 flex-wrap">
            {totalRaw > 0 && (
              <Badge
                variant="secondary"
                className="text-xs gap-1 bg-orange-100 text-orange-700 dark:bg-orange-900/20 dark:text-orange-400"
              >
                <ShoppingCart className="h-3 w-3" />
                {totalRaw}
              </Badge>
            )}

            {totalWip > 0 && (
              <Badge
                variant="secondary"
                className="text-xs gap-1 bg-purple-100 text-purple-700 dark:bg-purple-900/20 dark:text-purple-400"
              >
                <CookingPot className="h-3 w-3" />
                {totalWip}
              </Badge>
            )}
          </div>
        </div>
      );
    },
  },
  {
    accessorKey: "status",
    header: "Status",
    enableHiding: true,
    cell: ({ row }) => (
      <BadgeCustom
        value={row.getValue("status")}
        category="statusProcurement"
      />
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
            {dataRows.status === "DRAFT" && dataRows.totalRawMaterial > 0 && (
              <DropdownMenuItem asChild>
                <Button asChild size="icon" variant="ghost" className="w-full">
                  <Link
                    href={ROUTES.AUTH.PROCUREMENT.VERIFY_PURCHASE(
                      dataRows.idProcurement,
                    )}
                  >
                    <BadgeCheck className="h-4 w-4" />
                    Verifikasi Pembelian
                  </Link>
                </Button>
              </DropdownMenuItem>
            )}
            {dataRows.status === "DRAFT" &&
              dataRows.totalWorkInProgress > 0 && (
                <DropdownMenuItem asChild>
                  <Button
                    asChild
                    size="icon"
                    variant="ghost"
                    className="w-full"
                  >
                    <Link
                      href={ROUTES.AUTH.PROCUREMENT.VERIFY_PRODUCTION(
                        dataRows.idProcurement,
                      )}
                    >
                      <CookingPot className="h-4 w-4" />
                      Verifikasi Produksi
                    </Link>
                  </Button>
                </DropdownMenuItem>
              )}
            <DropdownMenuItem asChild onSelect={(e) => e.preventDefault()}>
              <DialogDelete value={dataRows} rawItems={rawItems} />
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      );
    },
  },
];

type TDialog = {
  value: TProcerement;
  rawItems: TItemSelect[];
};

function DialogDelete({ value }: Readonly<TDialog>) {
  return (
    <DialogForm type="delete" title="Delete Bahan Baku">
      <ProcurementDeteleForm data={value} />
    </DialogForm>
  );
}
