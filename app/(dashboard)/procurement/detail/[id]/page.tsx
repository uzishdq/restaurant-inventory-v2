import { RenderError } from "@/components/render-error";
import ProcurementDetail from "@/components/section/section-procurement-detail";
import { LABEL } from "@/lib/constant";
import { isProcurementId } from "@/lib/helper";
import { getProcerumentById } from "@/lib/server/data-server/procurement";
import React from "react";

export default async function DetailProcurementPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  if (!isProcurementId(id)) {
    return RenderError(LABEL.ERROR[404]);
  }

  const procurement = await getProcerumentById({ id: id, status: "ALL" });

  if (!procurement.ok) {
    return RenderError(LABEL.ERROR.DESCRIPTION);
  }

  if (!procurement.data) {
    return RenderError(LABEL.ERROR.DATA_NOT_FOUND);
  }

  return (
    <section className="container py-6">
      <ProcurementDetail data={procurement.data} />
    </section>
  );
}
