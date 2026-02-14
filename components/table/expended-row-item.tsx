import { TDetailItem } from "@/lib/type/type.item";
import { Badge } from "../ui/badge";

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
            className="rounded-md border bg-card p-3"
          >
            <div className="flex items-center justify-between">
              <span className="font-medium">{detail.name}</span>
              <Badge variant="outline" className="ml-2">
                {detail.qty} {detail.unitName}
              </Badge>
            </div>

            {detail.categoryName && (
              <p className="mt-1 text-xs text-muted-foreground">
                {detail.categoryName}
              </p>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
