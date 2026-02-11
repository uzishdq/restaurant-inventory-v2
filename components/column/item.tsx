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
import { ChevronDown, ChevronRight, MoreHorizontal } from "lucide-react";
import DialogForm from "../form/dialog-form";
import { TItem, TItemSelect } from "@/lib/type/type.item";
import { BadgeCustom } from "./badge-custom";
import { ItemDeteleForm } from "../form/item/delete-form-item";
import { TUnit } from "@/lib/type/type.unit";
import { TCategory } from "@/lib/type/type.categories";
import IItemForm from "../form/item/item-form";

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
    accessorKey: "unitName",
    header: "Satuan",
    enableHiding: false,
    cell: ({ row }) => (
      <div className="capitalize">{row.getValue("unitName")}</div>
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
    accessorKey: "minStock",
    header: "Minimal Persediaan",
    enableHiding: false,
    cell: ({ row }) => (
      <div className="capitalize">{row.getValue("minStock")}</div>
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
