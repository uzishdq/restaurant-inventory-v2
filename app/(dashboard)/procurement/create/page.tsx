import ProcurementForm from "@/components/form/procurement-form";
import { RenderError } from "@/components/render-error";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { LABEL } from "@/lib/constant";
import { getSelectItem } from "@/lib/server/data-server/item";
import { getSupplierList } from "@/lib/server/data-server/supplier";
import React from "react";

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
        <CardHeader>
          <CardTitle className="text-xl">Pengadaan Bahan Baku</CardTitle>
          <CardDescription>
            Masukkan detail bahan baku yang ingin diajukan untuk pembelian.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ProcurementForm items={items.data} suppliers={suppliers.data} />
        </CardContent>
      </Card>
    </section>
  );
}
