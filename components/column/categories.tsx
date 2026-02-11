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
import { MoreHorizontal } from "lucide-react";
import DialogForm from "../form/dialog-form";
import { TCategory } from "@/lib/type/type.categories";
import {
  CategoriesDeteleForm,
  CategoriesUpdateForm,
} from "../form/categories-form";

export const columnCategories: ColumnDef<TCategory>[] = [
  {
    accessorKey: "name",
    header: "Nama",
    enableHiding: false,
    cell: ({ row }) => <div className="capitalize">{row.getValue("name")}</div>,
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
              <DialogEdit value={dataRows} />
            </DropdownMenuItem>
            <DropdownMenuItem asChild onSelect={(e) => e.preventDefault()}>
              <DialogDelete value={dataRows} />
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      );
    },
  },
];

type TDialog = {
  value: TCategory;
};

function DialogEdit({ value }: Readonly<TDialog>) {
  return (
    <DialogForm
      type="edit"
      title="Update Kategori"
      description="Update nama kategori, lalu klik Update untuk mengonfirmasi."
    >
      <CategoriesUpdateForm data={value} />
    </DialogForm>
  );
}

function DialogDelete({ value }: Readonly<TDialog>) {
  return (
    <DialogForm type="delete" title="Delete Kategori">
      <CategoriesDeteleForm data={value} />
    </DialogForm>
  );
}
