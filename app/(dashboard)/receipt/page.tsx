import { RenderError } from "@/components/render-error";
import SectionCard from "@/components/section/section-card";
import RecepitTableClient from "@/components/table/receipt-table-client";
import { LABEL } from "@/lib/constant";
import { getReceiptList } from "@/lib/server/data-server/receipt";
import { Package } from "lucide-react";

export default async function ReceiptPage() {
  const receipt = await getReceiptList();

  if (!receipt.ok || !receipt.data) {
    return RenderError(LABEL.ERROR.DESCRIPTION);
  }

  return (
    <section className="space-y-4">
      <SectionCard
        title="Total Penerimaan"
        value={receipt.data.length}
        Icon={Package}
      />
      <div className="relative">
        <RecepitTableClient data={receipt.data} />
      </div>
    </section>
  );
}
