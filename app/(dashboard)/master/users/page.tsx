import { columnUsers } from "@/components/column/user";
import DialogForm from "@/components/form/dialog-form";
import { CreateUserForm } from "@/components/form/user-form";
import { RenderError } from "@/components/render-error";
import SectionCard from "@/components/section/section-card";
import TableDateWrapper from "@/components/table/wrapper-table";
import { LABEL } from "@/lib/constant";
import { getUserList } from "@/lib/server/data-server/user";
import { UserCheck } from "lucide-react";
import React from "react";

export default async function UsersPage() {
  const result = await getUserList();

  if (!result.ok || !result.data) {
    return RenderError(LABEL.ERROR.DESCRIPTION);
  }

  return (
    <section className=" space-y-4">
      <SectionCard
        title="Total User"
        value={result.data.length}
        Icon={UserCheck}
      />
      <TableDateWrapper
        header="User"
        description="User dan informasi profil untuk platform manajemen bahan baku"
        searchBy="name"
        labelSearch="Nama"
        isFilterDate={true}
        filterDate="created_at"
        data={result.data}
        columns={columnUsers}
      >
        <DialogForm type="create" title="Create User">
          <CreateUserForm />
        </DialogForm>
      </TableDateWrapper>
    </section>
  );
}
