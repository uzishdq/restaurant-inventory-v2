"use client";

import { ColumnDef } from "@tanstack/react-table";
import {
  MoreHorizontal,
  Eye,
  Edit,
  ChevronDown,
  ChevronRight,
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
import type { TProductionOrder } from "@/lib/type/type.production";
import Link from "next/link";
import { ROUTES } from "@/lib/constant";
import { formatDateWIB } from "@/lib/helper";
import { BadgeCustom } from "./badge-custom";

export const productionColumns: ColumnDef<TProductionOrder>[] = [
  {
    id: "expander",
    enableHiding: false,
    header: () => null,
    cell: ({ row }) => {
      // Check if has materials or records to expand
      const hasMaterials = row.original.materials.length > 0;
      const hasRecords = row.original.records.length > 0;

      if (!hasMaterials && !hasRecords) {
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
    accessorKey: "idProductionOrder",
    header: "ID Produksi",
    cell: ({ row }) => (
      <div className="font-mono text-sm">
        {row.getValue("idProductionOrder")}
      </div>
    ),
  },
  {
    accessorKey: "itemName",
    header: "Item",
    cell: ({ row }) => (
      <div className="space-y-1">
        <div className="font-medium">{row.original.itemName}</div>
        <div className="flex items-center gap-2">
          <BadgeCustom value={row.original.itemType} category="typeItem" />
          {row.original.categoryName && (
            <span className="text-xs text-muted-foreground">
              {row.original.categoryName}
            </span>
          )}
        </div>
      </div>
    ),
  },
  {
    accessorKey: "qtyTarget",
    header: "Target",
    cell: ({ row }) => (
      <div className="text-sm">
        {parseFloat(row.getValue("qtyTarget")).toFixed(2)}{" "}
        {row.original.unitName}
      </div>
    ),
  },
  {
    accessorKey: "qtyProduced",
    header: "Diproduksi",
    cell: ({ row }) => (
      <div className="space-y-1">
        <div className="text-sm font-medium">
          {parseFloat(row.getValue("qtyProduced")).toFixed(2)}{" "}
          {row.original.unitName}
        </div>
        <div className="flex items-center gap-2">
          <div className="h-1.5 w-20 bg-muted rounded-full overflow-hidden">
            <div
              className="h-full bg-primary"
              style={{ width: `${row.original.progressPercentage}%` }}
            />
          </div>
          <span className="text-xs text-muted-foreground">
            {row.original.progressPercentage}%
          </span>
        </div>
      </div>
    ),
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => (
      <BadgeCustom value={row.getValue("status")} category="statusProduction" />
    ),
  },
  {
    accessorKey: "scheduledDate",
    header: "Jadwal",
    cell: ({ row }) => {
      const scheduledDate = row.getValue("scheduledDate") as Date | null;
      return scheduledDate ? (
        <div className="text-sm">{formatDateWIB(scheduledDate)}</div>
      ) : (
        <span className="text-xs text-muted-foreground">-</span>
      );
    },
  },
  {
    accessorKey: "createdAt",
    header: "Dibuat",
    cell: ({ row }) => (
      <div className="text-sm">{formatDateWIB(row.getValue("createdAt"))}</div>
    ),
  },
  {
    id: "actions",
    enableHiding: false,
    cell: ({ row }) => {
      const production = row.original;

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
              onClick={() =>
                navigator.clipboard.writeText(production.idProductionOrder)
              }
            >
              Copy ID Produksi
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild>
              <Link
                href={`${ROUTES.AUTH.PRODUCTION.INDEX}/${production.idProductionOrder}`}
              >
                <Eye className="mr-2 h-4 w-4" />
                Lihat Detail
              </Link>
            </DropdownMenuItem>
            {production.status === "SCHEDULED" && (
              <DropdownMenuItem asChild>
                <Link
                  href={`${ROUTES.AUTH.PRODUCTION.INDEX}/${production.idProductionOrder}/execute`}
                >
                  <Edit className="mr-2 h-4 w-4" />
                  Mulai Produksi
                </Link>
              </DropdownMenuItem>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      );
    },
  },
];
