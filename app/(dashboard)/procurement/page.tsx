import { RenderError } from "@/components/render-error";
import SectionCard from "@/components/section/section-card";
import ProcurementTableClient from "@/components/table/procurement-table-client";
import { LABEL } from "@/lib/constant";
import { getSelectItem } from "@/lib/server/data-server/item";
import { getProcerumentList } from "@/lib/server/data-server/procurement";
import { Package } from "lucide-react";
import React from "react";

export default async function ProcurementPage() {
  const [procerument, items] = await Promise.all([
    getProcerumentList(),
    getSelectItem("RAW_MATERIAL"),
  ]);

  if (!procerument.ok || !procerument.data || !items.data) {
    return RenderError(LABEL.ERROR.DESCRIPTION);
  }
  return (
    <section className=" space-y-4">
      <SectionCard
        title="Total"
        value={procerument.data.length}
        Icon={Package}
      />
      <div className="relative">
        <ProcurementTableClient data={procerument.data} rawItems={items.data} />
      </div>
    </section>
  );
}
