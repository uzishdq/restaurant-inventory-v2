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
import { TSupplier } from "@/lib/type/type.supplier";
import { UnitDeteleForm, UpdateSupplierForm } from "../form/supplier-form";

export const columnSupplier: ColumnDef<TSupplier>[] = [
  {
    accessorKey: "name",
    header: "Nama",
    enableHiding: false,
    cell: ({ row }) => <div className="capitalize">{row.getValue("name")}</div>,
  },
  {
    accessorKey: "store",
    header: "Toko",
    enableHiding: false,
    cell: ({ row }) => (
      <div className="capitalize">{row.getValue("store")}</div>
    ),
  },
  {
    accessorKey: "address",
    header: "Alamat",
    enableHiding: false,
    cell: ({ row }) => (
      <div className="capitalize">{row.getValue("address")}</div>
    ),
  },
  {
    accessorKey: "phone",
    header: "No.Telp",
    enableHiding: false,
    cell: ({ row }) => (
      <div className="capitalize">{row.getValue("phone")}</div>
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
  value: TSupplier;
};

function DialogEdit({ value }: Readonly<TDialog>) {
  return (
    <DialogForm
      type="edit"
      title="Update Supplier"
      description="Update data, lalu klik Update untuk mengonfirmasi."
    >
      <UpdateSupplierForm data={value} />
    </DialogForm>
  );
}

function DialogDelete({ value }: Readonly<TDialog>) {
  return (
    <DialogForm type="delete" title="Delete Supplier">
      <UnitDeteleForm data={value} />
    </DialogForm>
  );
}
