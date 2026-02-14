import { TProcerementItem } from "@/lib/type/type.procurement";
import { Badge } from "../ui/badge";

interface ExpandedRowProcurementProps {
  detailItem: TProcerementItem[];
}

export default function ExpandedRowProcurement({
  detailItem,
}: Readonly<ExpandedRowProcurementProps>) {
  if (!detailItem?.length) return null;

  return (
    <div className="space-y-3">
      <h4 className="text-sm font-semibold">Daftar Pengajuan</h4>

      <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
        {detailItem.map((item) => (
          <div
            key={item.idProcurementItem}
            className="rounded-md border bg-card p-4"
          >
            <div className="flex items-center justify-between">
              <span className="font-medium">{item.itemName}</span>
              <Badge variant="outline" className="ml-2">
                {item.qtyRequested} {item.unitName}
              </Badge>
            </div>

            {item.categoryName && (
              <p className="mt-1 text-xs text-muted-foreground">
                {item.categoryName}
              </p>
            )}

            {item.notes && (
              <p className="mt-2 text-xs italic text-muted-foreground">
                {item.notes}
              </p>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
