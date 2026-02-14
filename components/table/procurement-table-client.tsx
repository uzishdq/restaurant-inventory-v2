"use client";

import { useMemo } from "react";

import TableDateWrapper from "@/components/table/wrapper-table";
import ExpandedRowProcurement from "./expended-row-procurement";
import { columnProcurement } from "../column/procurement";

import { TItemSelect } from "@/lib/type/type.item";
import { TProcerement } from "@/lib/type/type.procurement";

interface ProcurementTableClientProps {
  data: TProcerement[];
  rawItems: TItemSelect[];
}

export default function ProcurementTableClient({
  data,
  rawItems,
}: Readonly<ProcurementTableClientProps>) {
  const columns = useMemo(() => columnProcurement({ rawItems }), [rawItems]);

  return (
    <TableDateWrapper
      header="Pengadaan Bahan Baku"
      description="Pengajuan pengadaan bahan baku yang belum diproses atau menunggu persetujuan"
      searchBy="requestedBy"
      labelSearch="Nama"
      isFilterDate={true}
      filterDate="createdAt"
      data={data}
      columns={columns}
      renderExpandedRow={(item) => (
        <ExpandedRowProcurement detailItem={item.procurementItem} />
      )}
    />
  );
}
