import { columnCategories } from "@/components/column/categories";
import { CategoriesForm } from "@/components/form/categories-form";
import DialogForm from "@/components/form/dialog-form";
import { RenderError } from "@/components/render-error";
import SectionCard from "@/components/section/section-card";
import TableDateWrapper from "@/components/table/wrapper-table";
import { LABEL } from "@/lib/constant";
import { getCategoriesList } from "@/lib/server/data-server/categories";
import { Blocks } from "lucide-react";
import React from "react";

export default async function CategoriesPage() {
  const result = await getCategoriesList();

  if (!result.ok || !result.data) {
    return RenderError(LABEL.ERROR.DESCRIPTION);
  }
  return (
    <section className=" space-y-4">
      <SectionCard
        title="Total Kategori"
        value={result.data.length}
        Icon={Blocks}
      />
      <TableDateWrapper
        header="Kategori"
        description="Koleksi kategori barang yang digunakan untuk mengatur produk berdasarkan jenis, seperti sayuran, daging, atau rempah"
        searchBy="name"
        labelSearch="Nama"
        isFilterDate={false}
        filterDate=""
        data={result.data}
        columns={columnCategories}
      >
        <DialogForm type="create" title="Tambah Kategori">
          <CategoriesForm />
        </DialogForm>
      </TableDateWrapper>
    </section>
  );
}
