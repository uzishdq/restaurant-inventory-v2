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
import { ArrowUpDown, MoreHorizontal } from "lucide-react";
import { TUser } from "@/lib/type/type.user";
import { formatDateWIB } from "@/lib/helper";
import DialogForm from "../form/dialog-form";
import { BadgeCustom } from "./badge-custom";
import { UpdateRoleForm } from "../form/user-form";

export const columnUsers: ColumnDef<TUser>[] = [
  {
    accessorKey: "username",
    header: "Username",
    enableHiding: true,
    cell: ({ row }) => <div>{row.getValue("username")}</div>,
  },
  {
    accessorKey: "name",
    header: "Nama",
    enableHiding: false,
    cell: ({ row }) => <div className="capitalize">{row.getValue("name")}</div>,
  },
  {
    accessorKey: "phone",
    header: "No.Telp",
    enableHiding: true,
    cell: ({ row }) => (
      <div className="capitalize">{row.getValue("phone")}</div>
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
          Ditambahkan Pada
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      );
    },
    cell: ({ row }) => {
      const formattedDate = formatDateWIB(row.getValue("createdAt"));
      return <div className="capitalize">{formattedDate}</div>;
    },
  },
  {
    accessorKey: "role",
    header: "Role",
    enableHiding: true,
    cell: ({ row }) => (
      <BadgeCustom value={row.getValue("role")} category="role" />
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
          <DropdownMenuContent align="end">
            <DropdownMenuLabel className="text-center">Opsi</DropdownMenuLabel>
            <DropdownMenuSeparator />
            {dataRows.role !== "SUPER_ADMIN" && (
              <DropdownMenuItem asChild onSelect={(e) => e.preventDefault()}>
                <DialogEdit value={dataRows} />
              </DropdownMenuItem>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      );
    },
  },
];

type TDialog = {
  value: TUser;
};

function DialogEdit({ value }: Readonly<TDialog>) {
  return (
    <DialogForm
      type="edit"
      title="Update Role User"
      description="Update role user, lalu klik Update untuk mengonfirmasi."
    >
      <UpdateRoleForm data={value} />
    </DialogForm>
  );
}
