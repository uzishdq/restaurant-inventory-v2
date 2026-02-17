import VerifyProductionForm from "@/components/form/production/verify-production";
import { RenderError } from "@/components/render-error";
import { Card, CardContent } from "@/components/ui/card";
import { LABEL } from "@/lib/constant";
import { isProcurementId } from "@/lib/helper";
import { getSelectItem } from "@/lib/server/data-server/item";
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

  const [procurement, item] = await Promise.all([
    getProcerumentById({
      id: id,
      status: "DRAFT",
      itemType: "WORK_IN_PROGRESS",
    }),
    getSelectItem("ALL"),
  ]);

  if (!procurement.ok) {
    return RenderError(LABEL.ERROR.DESCRIPTION);
  }

  if (!procurement.data || !item.data) {
    return RenderError(LABEL.ERROR.DATA_NOT_FOUND);
  }

  return (
    <section>
      <Card className="w-full">
        <CardContent>
          <VerifyProductionForm data={procurement.data} items={item.data} />
        </CardContent>
      </Card>
    </section>
  );
}
