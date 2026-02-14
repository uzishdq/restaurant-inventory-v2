import ProcurementApprovalForm from "@/components/form/procurement/verif-procurement";
import { RenderError } from "@/components/render-error";
import { Card, CardContent } from "@/components/ui/card";
import { LABEL } from "@/lib/constant";
import { isProcurementId } from "@/lib/helper";
import { getProcerumentById } from "@/lib/server/data-server/procurement";
import { getSupplierList } from "@/lib/server/data-server/supplier";
import React from "react";

export default async function UpdateProcurementPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  if (!isProcurementId(id)) {
    return RenderError(LABEL.ERROR[404]);
  }

  const [procurement, suppliers] = await Promise.all([
    getProcerumentById({ id: id, status: "DRAFT" }),
    getSupplierList(),
  ]);

  if (!procurement.ok) {
    return RenderError(LABEL.ERROR.DESCRIPTION);
  }

  if (!procurement.data || !suppliers.data) {
    return RenderError(LABEL.ERROR.DATA_NOT_FOUND);
  }

  return (
    <section>
      <Card className="w-full">
        <CardContent>
          <ProcurementApprovalForm
            procurement={procurement.data}
            suppliers={suppliers.data}
          />
        </CardContent>
      </Card>
    </section>
  );
}
