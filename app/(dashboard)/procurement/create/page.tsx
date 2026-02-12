import ProcurementForm from "@/components/form/procurement-form";
import { RenderError } from "@/components/render-error";
import { Card, CardContent } from "@/components/ui/card";
import { LABEL } from "@/lib/constant";
import { getSelectItem } from "@/lib/server/data-server/item";
import { getSupplierList } from "@/lib/server/data-server/supplier";

export default async function ProcurementPage() {
  const [items, suppliers] = await Promise.all([
    getSelectItem("RAW_MATERIAL"),
    getSupplierList(),
  ]);

  if (!items.ok || !items.data || !suppliers.data) {
    return RenderError(LABEL.ERROR.DESCRIPTION);
  }

  return (
    <section>
      <Card className="w-full">
        <CardContent>
          <ProcurementForm items={items.data} />
        </CardContent>
      </Card>
    </section>
  );
}
