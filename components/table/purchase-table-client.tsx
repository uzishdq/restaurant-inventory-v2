"use client";

import { TPurchase } from "@/lib/type/type.procurement";
import TableDateWrapper from "./wrapper-table";
import { columnPurchase } from "../column/purhase";
import { PurchaseDetailRow } from "./expended-row-purchase";

interface PurchaseTableClientProps {
  data: TPurchase[];
  header: string;
  description: string;
}

export default function PurchaseTableClient({
  data,
  header,
  description,
}: Readonly<PurchaseTableClientProps>) {
  return (
    <TableDateWrapper
      header={header}
      description={description}
      searchBy="supplierStore"
      labelSearch="Nama Toko"
      isFilterDate={false}
      filterDate=""
      data={data}
      columns={columnPurchase}
      renderExpandedRow={(item) => (
        <PurchaseDetailRow items={item.purchaseItems} />
      )}
    />
  );
}
