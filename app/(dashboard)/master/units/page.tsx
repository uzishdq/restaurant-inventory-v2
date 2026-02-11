import { columnUnit } from "@/components/column/unit";
import DialogForm from "@/components/form/dialog-form";
import { UnitForm } from "@/components/form/unit-form";
import { RenderError } from "@/components/render-error";
import SectionCard from "@/components/section/section-card";
import TableDateWrapper from "@/components/table/wrapper-table";
import { LABEL } from "@/lib/constant";
import { getUnitList } from "@/lib/server/data-server/unit";
import { Boxes } from "lucide-react";

export default async function UnitPage() {
  const result = await getUnitList();

  if (!result.ok || !result.data) {
    return RenderError(LABEL.ERROR.DESCRIPTION);
  }

  return (
    <section className=" space-y-4">
      <SectionCard title="Total Unit" value={result.data.length} Icon={Boxes} />
      <TableDateWrapper
        header="Unit"
        description="Daftar satuan pengukuran yang digunakan untuk menentukan bagaimana barang dihitung atau diukur, seperti pcs, kg, atau liter"
        searchBy="name"
        labelSearch="Nama"
        isFilterDate={false}
        filterDate=""
        data={result.data}
        columns={columnUnit}
      >
        <DialogForm type="create" title="Tambah Unit">
          <UnitForm />
        </DialogForm>
      </TableDateWrapper>
    </section>
  );
}
