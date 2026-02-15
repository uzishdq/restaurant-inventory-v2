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
  ArrowDown,
  ArrowUp,
  ArrowUpDown,
  ChevronDown,
  ChevronRight,
  MoreHorizontal,
  Package,
} from "lucide-react";
import DialogForm from "../form/dialog-form";
import { TItem, TItemMovement, TItemSelect } from "@/lib/type/type.item";
import { BadgeCustom } from "./badge-custom";
import { ItemDeteleForm } from "../form/item/delete-form-item";
import { TUnit } from "@/lib/type/type.unit";
import { TCategory } from "@/lib/type/type.categories";
import IItemForm from "../form/item/item-form";
import { Badge } from "../ui/badge";
import { formatDateWIB } from "@/lib/helper";

export const columnItem = ({
  units,
  categories,
  rawItems,
}: {
  units: TUnit[];
  categories: TCategory[];
  rawItems: TItemSelect[];
}): ColumnDef<TItem>[] => [
  {
    id: "expander",
    enableHiding: false,
    header: () => null,
    cell: ({ row }) => {
      if (row.original.detailItem.length === 0) {
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
    accessorKey: "idItem",
    header: "No Bahan Baku",
    enableHiding: false,
    cell: ({ row }) => (
      <div className="capitalize">{row.getValue("idItem")}</div>
    ),
  },
  {
    accessorKey: "name",
    header: "Nama",
    enableHiding: false,
    cell: ({ row }) => <div className="capitalize">{row.getValue("name")}</div>,
  },
  {
    accessorKey: "categoryName",
    header: "Kategori",
    enableHiding: false,
    cell: ({ row }) => (
      <div className="capitalize">{row.getValue("categoryName")}</div>
    ),
  },
  {
    accessorKey: "type",
    header: "Tipe",
    enableHiding: true,
    cell: ({ row }) => (
      <BadgeCustom value={row.getValue("type")} category="typeItem" />
    ),
  },
  {
    accessorKey: "currentStock",
    header: "Stok",
    cell: ({ row }) => {
      const stock = Number.parseFloat(row.getValue("currentStock"));
      const unit = row.original.unitName;

      return (
        <span className="font-medium">
          {stock} {unit}
        </span>
      );
    },
  },
  {
    accessorKey: "lastMovementDate",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Terakhir Diperbarui
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      );
    },
    cell: ({ row }) => {
      const date: Date | null = row.getValue("lastMovementDate");
      return (
        <div className="text-sm text-muted-foreground">
          {date ? formatDateWIB(date) : "Belum ada movement"}
        </div>
      );
    },
  },
  {
    accessorKey: "minStock",
    header: "Minimal Persediaan",
    cell: ({ row }) => {
      const stock = Number.parseFloat(row.getValue("minStock"));
      const unit = row.original.unitName;

      return (
        <span className="font-medium">
          {stock} {unit}
        </span>
      );
    },
  },
  {
    id: "stockStatus",
    header: "Status Stok",
    cell: ({ row }) => {
      const stock = Number.parseFloat(row.original.currentStock);
      const minStock = Number.parseFloat(row.original.minStock);

      if (stock <= 0) {
        return <Badge variant="destructive">Habis</Badge>;
      }

      if (stock < minStock) {
        return <Badge variant="secondary">Rendah</Badge>;
      }

      return <Badge variant="outline">Aman</Badge>;
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
            <DropdownMenuItem asChild onSelect={(e) => e.preventDefault()}>
              <DialogEdit
                value={dataRows}
                units={units}
                categories={categories}
                rawItems={rawItems}
              />
            </DropdownMenuItem>
            <DropdownMenuItem asChild onSelect={(e) => e.preventDefault()}>
              <DialogDelete
                value={dataRows}
                units={units}
                categories={categories}
                rawItems={rawItems}
              />
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      );
    },
  },
];

type TDialog = {
  value: TItem;
  units: TUnit[];
  categories: TCategory[];
  rawItems: TItemSelect[];
};

function DialogEdit({ value, units, categories, rawItems }: Readonly<TDialog>) {
  return (
    <DialogForm
      type="edit"
      title="Update Bahan Baku"
      description="Update nama unit, lalu klik Update untuk mengonfirmasi."
    >
      <IItemForm
        mode="edit"
        data={value}
        units={units}
        categories={categories}
        rawItems={rawItems}
      />
    </DialogForm>
  );
}

function DialogDelete({ value }: Readonly<TDialog>) {
  return (
    <DialogForm type="delete" title="Delete Bahan Baku">
      <ItemDeteleForm data={value} />
    </DialogForm>
  );
}

const movementTypeConfig = {
  IN: {
    label: "Masuk",
    icon: ArrowDown,
    color: "bg-green-500",
  },
  OUT: {
    label: "Keluar",
    icon: ArrowUp,
    color: "bg-red-500",
  },
};

const transactionTypeConfig = {
  PURCHASE: { label: "Pembelian", color: "bg-blue-500" },
  PRODUCTION: { label: "Produksi", color: "bg-purple-500" },
  SALES: { label: "Penjualan", color: "bg-orange-500" },
  ADJUSTMENT: { label: "Penyesuaian", color: "bg-gray-500" },
};

const transactionStatusConfig = {
  PENDING: { label: "Pending", color: "bg-yellow-500" },
  COMPLETED: { label: "Selesai", color: "bg-green-500" },
  CANCELLED: { label: "Batal", color: "bg-red-500" },
};

export const columnItemMovement: ColumnDef<TItemMovement>[] = [
  {
    accessorKey: "createdAt",
    header: "Tanggal",
    enableHiding: false,
    cell: ({ row }) => (
      <div className="font-medium whitespace-nowrap">
        {formatDateWIB(row.getValue("createdAt"))}
      </div>
    ),
  },
  {
    accessorKey: "transactionId",
    header: "ID Transaksi",
    cell: ({ row }) => {
      const id = row.original.transactionId;
      return (
        <div className="font-mono text-sm">
          {id || <span className="text-muted-foreground">-</span>}
        </div>
      );
    },
  },
  {
    id: "transactionType",
    header: "Jenis Transaksi",
    cell: ({ row }) => {
      const type = row.original.transactionType;
      if (!type) return <span className="text-muted-foreground">-</span>;

      const config = transactionTypeConfig[type];
      return <Badge className={config.color}>{config.label}</Badge>;
    },
  },
  {
    accessorKey: "itemName",
    header: "Item",
    enableHiding: false,
    cell: ({ row }) => (
      <div className="flex items-center gap-2">
        <Package className="h-4 w-4 text-muted-foreground" />
        <div>
          <p className="font-medium">{row.original.itemName}</p>
          <p className="text-xs text-muted-foreground">
            {row.original.categoryName || "No Category"}
          </p>
        </div>
      </div>
    ),
  },
  {
    id: "movement",
    header: "Pergerakan",
    enableHiding: false,
    cell: ({ row }) => {
      const movementType = row.original.movementType;
      const config = movementTypeConfig[movementType];
      const Icon = config.icon;

      return (
        <div className="flex items-center gap-2">
          <div className={`p-1.5 rounded ${config.color}`}>
            <Icon className="h-4 w-4 text-white" />
          </div>
          <div>
            <p className="font-semibold">{config.label}</p>
            <p className="text-xs text-muted-foreground">
              {row.original.quantity} {row.original.unitName}
            </p>
          </div>
        </div>
      );
    },
  },
  {
    accessorKey: "quantity",
    header: "Qty",
    cell: ({ row }) => (
      <div className="text-right">
        <p className="font-bold text-lg">
          {row.original.movementType === "OUT" && "-"}
          {row.getValue("quantity")}
        </p>
        <p className="text-xs text-muted-foreground">{row.original.unitName}</p>
      </div>
    ),
  },
  {
    id: "status",
    header: "Status",
    cell: ({ row }) => {
      const status = row.original.transactionStatus;
      if (!status) return <span className="text-muted-foreground">-</span>;

      const config = transactionStatusConfig[status];
      return <Badge className={config.color}>{config.label}</Badge>;
    },
  },
  {
    accessorKey: "userName",
    header: "Oleh",
    cell: ({ row }) => {
      const name = row.original.userName;
      return (
        <div className="capitalize">
          {name || <span className="text-muted-foreground">System</span>}
        </div>
      );
    },
  },
];
