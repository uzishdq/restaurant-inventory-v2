import { RenderError } from "@/components/render-error";
import ReceiptDetail from "@/components/section/section-receipt-detail";
import { LABEL } from "@/lib/constant";
import { isProcurementId } from "@/lib/helper";
import { getReceiptById } from "@/lib/server/data-server/receipt";
import React from "react";

export default async function DetailReceiptPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  if (!isProcurementId(id)) {
    return RenderError(LABEL.ERROR[404]);
  }

  const receipt = await getReceiptById(id);

  if (!receipt.ok) {
    return RenderError(LABEL.ERROR.DESCRIPTION);
  }

  if (!receipt.data) {
    return RenderError(LABEL.ERROR.DATA_NOT_FOUND);
  }

  return (
    <section className="container py-6">
      <ReceiptDetail data={receipt.data} />
    </section>
  );
}
