import { RenderError } from "@/components/render-error";
import SectionCard from "@/components/section/section-card";
import ProcurementTableClient from "@/components/table/procurement-table-client";
import { LABEL } from "@/lib/constant";
import { getSelectItem } from "@/lib/server/data-server/item";
import { getProcerumentList } from "@/lib/server/data-server/procurement";
import { TProcerement } from "@/lib/type/type.procurement";
import { CheckCircle, Package, Truck } from "lucide-react";
import React from "react";

export default async function ProcurementPage() {
  const [procerument, items] = await Promise.all([
    getProcerumentList(),
    getSelectItem("RAW_MATERIAL"),
  ]);

  if (!procerument.ok || !procerument.data || !items.data) {
    return RenderError(LABEL.ERROR.DESCRIPTION);
  }

  const { draftProcerument, progressProcerument, completedProcerument } =
    procerument.data.reduce(
      (acc, item) => {
        if (item.status === "DRAFT") {
          acc.draftProcerument.push(item);
        } else if (item.status === "ON_PROGRESS") {
          acc.progressProcerument.push(item);
        } else if (item.status === "COMPLETED") {
          acc.completedProcerument.push(item);
        }
        return acc;
      },
      {
        draftProcerument: [] as TProcerement[],
        progressProcerument: [] as TProcerement[],
        completedProcerument: [] as TProcerement[],
      },
    );

  return (
    <section className=" space-y-4">
      <div className="grid grid-cols-1 gap-2 md:grid-cols-2">
        <SectionCard
          title="Pengadaan Draft"
          value={draftProcerument.length}
          Icon={Package}
        />
        <SectionCard
          title="Pengadaan Diproses / Dipesan"
          value={progressProcerument.length}
          Icon={Truck}
        />
        <SectionCard
          title="Pengadaan Selesai"
          value={completedProcerument.length}
          Icon={CheckCircle}
        />
      </div>
      <div className="relative">
        <ProcurementTableClient data={procerument.data} rawItems={items.data} />
      </div>
    </section>
  );
}
