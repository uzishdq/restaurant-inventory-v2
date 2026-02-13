import { RenderError } from "@/components/render-error";
import SectionCard from "@/components/section/section-card";
import PurchaseTableClient from "@/components/table/purchase-table-client";
import { LABEL } from "@/lib/constant";
import { getPurchaseList } from "@/lib/server/data-server/purchase";
import { TPurchase } from "@/lib/type/type.procurement";
import { CheckCircle, PackageCheck, ShoppingCart } from "lucide-react";
import React from "react";

export default async function PurchasePage() {
  const purchase = await getPurchaseList();

  if (!purchase.ok || !purchase.data) {
    return RenderError(LABEL.ERROR.DESCRIPTION);
  }
  const { sentPurchase, receivedPurchase, completedPurchase } =
    purchase.data.reduce(
      (acc, item) => {
        if (item.status === "SENT") {
          acc.sentPurchase.push(item);
        } else if (item.status === "RECEIVED") {
          acc.receivedPurchase.push(item);
        } else if (item.status === "COMPLETED") {
          acc.completedPurchase.push(item);
        }
        return acc;
      },
      {
        sentPurchase: [] as TPurchase[],
        receivedPurchase: [] as TPurchase[],
        completedPurchase: [] as TPurchase[],
      },
    );

  return (
    <section className=" space-y-4">
      <div className="grid grid-cols-1 gap-2 md:grid-cols-2">
        <SectionCard
          title="Pengadaan Diproses / Dipesan"
          value={sentPurchase.length}
          Icon={ShoppingCart}
        />
        <SectionCard
          title="Pengadaan Diterima"
          value={receivedPurchase.length}
          Icon={PackageCheck}
        />
        <SectionCard
          title="Pengadaan Selesai"
          value={completedPurchase.length}
          Icon={CheckCircle}
        />
      </div>
      <PurchaseTableClient
        header="Pengadaan Bahan Baku (Sent)"
        description="Pengadaan bahan baku yang sudah dipesan ke supplier dan menunggu pengiriman"
        data={sentPurchase}
      />

      <PurchaseTableClient
        header="Pengadaan Bahan Baku (Receive)"
        description="Pengadaan bahan baku yang telah diterima dan sedang dalam proses pengecekan"
        data={receivedPurchase}
      />

      <PurchaseTableClient
        header="Pengadaan Bahan Baku (Completed)"
        description="Riwayat pengadaan bahan baku yang telah selesai dan stok sudah diperbarui"
        data={completedPurchase}
      />
    </section>
  );
}
