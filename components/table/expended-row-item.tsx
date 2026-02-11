import { TDetailItem } from "@/lib/type/type.item";

interface ExpendedRowItemProps {
  detailItem: TDetailItem[];
}

export default function ExpendedRowItem({
  detailItem,
}: Readonly<ExpendedRowItemProps>) {
  if (detailItem.length === 0) return null;

  return (
    <div className="space-y-2">
      <h4 className="font-semibold text-sm mb-3">Daftar Bahan Baku</h4>
      <div className="grid gap-2 md:grid-cols-2 lg:grid-cols-3">
        {detailItem.map((detail, index) => (
          <div
            key={`${detail.idBom}-${detail.rawItemId}-${index}`}
            className="flex justify-between items-center p-3 rounded-sm border bg-card"
          >
            <span className="font-medium">{detail.name}</span>
            <span className="text-sm text-muted-foreground">
              {detail.qty} {detail.unitName}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
