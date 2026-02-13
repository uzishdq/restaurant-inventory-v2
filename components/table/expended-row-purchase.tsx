// components/table/purchase-detail-row.tsx
import { Package } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { TPurchaseItem } from "@/lib/type/type.procurement";

export function PurchaseDetailRow({
  items,
}: Readonly<{ items: TPurchaseItem[] }>) {
  return (
    <div className="bg-muted/30 p-4 border-t">
      <h4 className="font-semibold text-sm mb-3 flex items-center gap-2">
        <Package className="h-4 w-4" />
        Detail Bahan Baku ({items.length})
      </h4>
      <div className="space-y-2">
        {items.map((item) => (
          <div
            key={item.idPurchaseItem}
            className="flex items-center justify-between rounded-lg border bg-card p-3"
          >
            <div className="flex items-start gap-3 flex-1">
              <div className="min-w-0 flex-1">
                <p className="font-medium text-sm">{item.itemName}</p>
                <p className="text-xs text-muted-foreground">
                  {item.categoryName}
                </p>
              </div>
            </div>
            <Badge variant="outline" className="ml-2">
              {item.qtyOrdered} {item.unitName}
            </Badge>
          </div>
        ))}
      </div>
    </div>
  );
}
