import { RenderError } from "@/components/render-error";
import SectionCard from "@/components/section/section-card";
import PurchaseTableClient from "@/components/table/purchase-table-client";
import { LABEL } from "@/lib/constant";
import { getPurchaseList } from "@/lib/server/data-server/purchase";
import { TPurchase } from "@/lib/type/type.procurement";
import { CheckCircle, ShoppingCart } from "lucide-react";
import React from "react";

export default async function PurchasePage() {
  const purchase = await getPurchaseList();

  if (!purchase.ok || !purchase.data) {
    return RenderError(LABEL.ERROR.DESCRIPTION);
  }

  const { sentPurchase, completedPurchase } = purchase.data.reduce(
    (acc, item) => {
      if (item.status === "SENT") {
        acc.sentPurchase.push(item);
      } else if (item.status === "COMPLETED") {
        acc.completedPurchase.push(item);
      }
      return acc;
    },
    {
      sentPurchase: [] as TPurchase[],
      completedPurchase: [] as TPurchase[],
    },
  );

  return (
    <section className=" space-y-4">
      <div className="grid grid-cols-1 gap-2 md:grid-cols-2">
        <SectionCard
          title="Pembelian Diproses / Dipesan"
          value={sentPurchase.length}
          Icon={ShoppingCart}
        />
        <SectionCard
          title="Pembelian Selesai"
          value={completedPurchase.length}
          Icon={CheckCircle}
        />
      </div>
      <PurchaseTableClient
        header="Pembelian Bahan Baku Diproses / Dipesan"
        description="Pembelian bahan baku yang sudah dipesan ke supplier dan menunggu pengiriman"
        data={sentPurchase}
      />

      <PurchaseTableClient
        header="Pembelian Bahan Baku Selesai"
        description="Riwayat pembelian bahan baku yang telah selesai dan stok sudah diperbarui"
        data={completedPurchase}
      />
    </section>
  );
}
