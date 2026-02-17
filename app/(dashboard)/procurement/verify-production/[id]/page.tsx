import { RenderError } from "@/components/render-error";
import { LABEL } from "@/lib/constant";
import { isProcurementId } from "@/lib/helper";
import { getProcerumentById } from "@/lib/server/data-server/procurement";
import React from "react";

export default async function VerifyProductionProcurementPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  if (!isProcurementId(id)) {
    return RenderError(LABEL.ERROR[404]);
  }

  const procurement = await getProcerumentById({
    id: id,
    status: "DRAFT",
    itemType: "RAW_MATERIAL",
  });

  if (!procurement.ok) {
    return RenderError(LABEL.ERROR.DESCRIPTION);
  }

  if (!procurement.data) {
    return RenderError(LABEL.ERROR.DATA_NOT_FOUND);
  }
  return <div>VerifyProductionProcurementPage</div>;
}
