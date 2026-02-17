import { TProcerementItem } from "@/lib/type/type.procurement";
import { Badge } from "../ui/badge";
import { BadgeCustom } from "../column/badge-custom";

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
            className="rounded-md border bg-card p-4 space-y-2"
          >
            {/* Header with item name and type badge */}
            <div className="flex items-start justify-between gap-2">
              <div className="flex-1">
                <span className="font-medium block">{item.itemName}</span>
                {item.categoryName && (
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {item.categoryName}
                  </p>
                )}
              </div>
              <BadgeCustom
                value={item.itemType}
                category="typeItem"
                className="shrink-0"
              />
            </div>

            {/* Quantity badge */}
            <Badge variant="outline" className="font-mono">
              {item.qtyRequested} {item.unitName}
            </Badge>

            {/* Notes */}
            {item.notes && item.notes !== "-" && (
              <p className="text-xs italic text-muted-foreground border-t pt-2">
                {item.notes}
              </p>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
