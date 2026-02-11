"use client";

import { columnItem } from "@/components/column/item";
import ExpendedRowItem from "@/components/table/expended-row-item";
import TableDateWrapper from "@/components/table/wrapper-table";
import { TCategory } from "@/lib/type/type.categories";
import { TItem, TItemSelect } from "@/lib/type/type.item";
import { TUnit } from "@/lib/type/type.unit";
import { useMemo } from "react";

interface ItemTableClientProps {
  data: TItem[];
  units: TUnit[];
  categories: TCategory[];
  rawItems: TItemSelect[];
}

export default function ItemTableClient({
  data,
  units,
  categories,
  rawItems,
}: Readonly<ItemTableClientProps>) {
  const columns = useMemo(
    () => columnItem({ units, categories, rawItems }),
    [units, categories, rawItems],
  );

  return (
    <TableDateWrapper
      header="Bahan Baku"
      description="Mewakili bahan baku atau bahan yang digunakan dalam operasi restoran dan pelacakan inventaris"
      searchBy="name"
      labelSearch="Nama"
      isFilterDate={false}
      filterDate=""
      data={data}
      columns={columns}
      renderExpandedRow={(item) => (
        <ExpendedRowItem detailItem={item.detailItem} />
      )}
    />
  );
}
