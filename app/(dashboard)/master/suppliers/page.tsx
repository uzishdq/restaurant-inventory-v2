import { columnSupplier } from "@/components/column/supplier";
import DialogForm from "@/components/form/dialog-form";
import { SupplierForm } from "@/components/form/supplier-form";
import { RenderError } from "@/components/render-error";
import SectionCard from "@/components/section/section-card";
import TableDateWrapper from "@/components/table/wrapper-table";
import { LABEL } from "@/lib/constant";
import { getSupplierList } from "@/lib/server/data-server/supplier";
import { Store } from "lucide-react";

export default async function SuppliersPage() {
  const result = await getSupplierList();

  if (!result.ok || !result.data) {
    return RenderError(LABEL.ERROR.DESCRIPTION);
  }

  return (
    <section className=" space-y-4">
      <SectionCard
        title="Total Supplier"
        value={result.data.length}
        Icon={Store}
      />
      <TableDateWrapper
        header="Supplier"
        description="Berisi informasi tentang vendor atau supplier yang menyediakan bahan dan material untuk restoran"
        searchBy="name"
        labelSearch="Nama"
        isFilterDate={false}
        filterDate=""
        data={result.data}
        columns={columnSupplier}
      >
        <DialogForm type="create" title="Tambah Supplier">
          <SupplierForm />
        </DialogForm>
      </TableDateWrapper>
    </section>
  );
}
