"use client";

import TableDateWrapper from "@/components/table/wrapper-table";
import { ExpandedRowProduction } from "./expended-row-production";
import { productionColumns } from "../column/production";
import { TProductionOrder } from "@/lib/type/type.production";

interface ProductionTableClientProps {
  data: TProductionOrder[];
}

export default function ProductionTableClient({
  data,
}: Readonly<ProductionTableClientProps>) {
  return (
    <TableDateWrapper
      header="Production Orders"
      description="Kelola production order dan tracking progress produksi"
      searchBy="itemName"
      labelSearch="Nama Item"
      isFilterDate={true}
      filterDate="createdAt"
      data={data}
      columns={productionColumns}
      renderExpandedRow={(item) => (
        <ExpandedRowProduction
          materials={item.materials}
          records={item.records}
          unitName={item.unitName}
        />
      )}
    />
  );
}
