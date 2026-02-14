import { RenderError } from "@/components/render-error";
import PurchaseDetail from "@/components/section/section-purchase-detail";
import { LABEL } from "@/lib/constant";
import { isProcurementId } from "@/lib/helper";
import { getPurchaseById } from "@/lib/server/data-server/purchase";
import React from "react";

export default async function DetailPurchasePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  if (!isProcurementId(id)) {
    return RenderError(LABEL.ERROR[404]);
  }

  const purchase = await getPurchaseById({ id: id, status: "ALL" });

  if (!purchase.ok) {
    return RenderError(LABEL.ERROR.DESCRIPTION);
  }

  if (!purchase.data) {
    return RenderError(LABEL.ERROR.DATA_NOT_FOUND);
  }
  return (
    <section className="container py-6">
      <PurchaseDetail data={purchase.data} />
    </section>
  );
}
