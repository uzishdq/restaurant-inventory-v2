import { RenderError } from "@/components/render-error";
import SectionCard from "@/components/section/section-card";
import ProductionTableClient from "@/components/table/production-table-client";
import { LABEL } from "@/lib/constant";
import { getProductionList } from "@/lib/server/data-server/production";
import { TProductionOrder } from "@/lib/type/type.production";
import { CheckCircle, Package, Truck } from "lucide-react";

export default async function ProductionPage() {
  const production = await getProductionList();

  if (!production.ok || !production.data) {
    return RenderError(LABEL.ERROR.DESCRIPTION);
  }

  const { draftProduction, progressProduction, completedProduction } =
    production.data.reduce(
      (acc, item) => {
        if (item.status === "DRAFT") {
          acc.draftProduction.push(item);
        } else if (item.status === "ON_PROGRESS") {
          acc.progressProduction.push(item);
        } else if (item.status === "COMPLETED") {
          acc.completedProduction.push(item);
        }
        return acc;
      },
      {
        draftProduction: [] as TProductionOrder[],
        progressProduction: [] as TProductionOrder[],
        completedProduction: [] as TProductionOrder[],
      },
    );
  return (
    <section className=" space-y-4">
      <div className="grid grid-cols-1 gap-2 md:grid-cols-2">
        <SectionCard
          title="Produksi Draft"
          value={draftProduction.length}
          Icon={Package}
        />
        <SectionCard
          title="Produksi Diproses / Dipesan"
          value={progressProduction.length}
          Icon={Truck}
        />
        <SectionCard
          title="Produksi Selesai"
          value={completedProduction.length}
          Icon={CheckCircle}
        />
      </div>
      <div className="relative">
        <ProductionTableClient data={production.data} />
      </div>
    </section>
  );
}
