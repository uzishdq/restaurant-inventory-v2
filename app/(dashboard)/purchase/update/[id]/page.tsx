import PurchaseQCForm from "@/components/form/purchase/qc-purchase-form";
import { RenderError } from "@/components/render-error";
import { Card, CardContent } from "@/components/ui/card";
import { LABEL } from "@/lib/constant";
import { isProcurementId } from "@/lib/helper";
import { getPurchaseById } from "@/lib/server/data-server/purchase";

export default async function UpdatePurchasePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  if (!isProcurementId(id)) {
    return RenderError(LABEL.ERROR[404]);
  }

  const purchase = await getPurchaseById({ id: id, status: "SENT" });

  if (!purchase.ok) {
    return RenderError(LABEL.ERROR.DESCRIPTION);
  }

  if (!purchase.data) {
    return RenderError(LABEL.ERROR.DATA_NOT_FOUND);
  }

  return (
    <section>
      <Card className="w-full">
        <CardContent>
          <PurchaseQCForm purchase={purchase.data} />
        </CardContent>
      </Card>
    </section>
  );
}
