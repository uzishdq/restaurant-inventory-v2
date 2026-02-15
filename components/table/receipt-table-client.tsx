"use client";

import TableDateWrapper from "@/components/table/wrapper-table";
import { columnReceipt } from "../column/receipt";
import { ReceiptDetailRow } from "./expended-row-receipt";
import { TReceipt } from "@/lib/type/type.procurement";

interface RecepitTableClientProps {
  data: TReceipt[];
}

export default function RecepitTableClient({
  data,
}: Readonly<RecepitTableClientProps>) {
  return (
    <TableDateWrapper
      header="Penerimaan Bahan Baku"
      description="Daftar penerimaan bahan baku dari supplier"
      searchBy="supplierStore"
      labelSearch="Supplier"
      isFilterDate={true}
      filterDate="createdAt"
      data={data}
      columns={columnReceipt}
      renderExpandedRow={(item) => (
        <ReceiptDetailRow items={item.receiptItems} />
      )}
    />
  );
}
