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
  MoreHorizontal,
} from "lucide-react";
import DialogForm from "../form/dialog-form";
import { TItemSelect } from "@/lib/type/type.item";
import { BadgeCustom } from "./badge-custom";
import { formatDateWIB } from "@/lib/helper";
import { TProcerement } from "@/lib/type/type.procurement";
import { ROUTES } from "@/lib/constant";
import Link from "next/link";

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
            <DropdownMenuItem asChild>
              <Button asChild size="icon" variant="ghost" className="w-full">
                <Link
                  href={ROUTES.AUTH.PROCUREMENT.UPDATE(dataRows.idProcurement)}
                >
                  <BadgeCheck className="h-4 w-4" />
                  Verifikasi
                </Link>
              </Button>
            </DropdownMenuItem>
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
      <h1>haii</h1>
    </DialogForm>
  );
}
