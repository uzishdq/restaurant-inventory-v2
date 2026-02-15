import { columnItemMovement } from "@/components/column/item";
import { RenderError } from "@/components/render-error";
import SectionCard from "@/components/section/section-card";
import TableDateWrapper from "@/components/table/wrapper-table";
import { LABEL } from "@/lib/constant";
import { getItemMovList } from "@/lib/server/data-server/item";
import { ArrowDown, ArrowDownUp, ArrowUp } from "lucide-react";
import React from "react";

export default async function MovementsPage() {
  const result = await getItemMovList();

  if (!result.ok || !result.data) {
    return RenderError(LABEL.ERROR.DESCRIPTION);
  }

  // Calculate stats
  const totalMovements = result.data.length;
  const totalIn = result.data.filter((m) => m.movementType === "IN").length;
  const totalOut = result.data.filter((m) => m.movementType === "OUT").length;

  return (
    <section className="space-y-4">
      <div className="grid gap-4 md:grid-cols-3">
        <SectionCard
          title="Total Movement"
          value={totalMovements}
          Icon={ArrowDownUp}
        />
        <SectionCard title="Stock Masuk" value={totalIn} Icon={ArrowDown} />
        <SectionCard title="Stock Keluar" value={totalOut} Icon={ArrowUp} />
      </div>

      <TableDateWrapper
        header="Pergerakan Bahan Baku"
        description="Riwayat pergerakan stok bahan baku masuk dan keluar"
        searchBy="itemName"
        labelSearch="Nama Bahan Baku"
        isFilterDate={true}
        filterDate="createdAt"
        data={result.data}
        columns={columnItemMovement}
      />
    </section>
  );
}
