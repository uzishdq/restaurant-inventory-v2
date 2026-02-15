import { Package, CheckCircle2, XCircle } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { TReceiptItem } from "@/lib/type/type.procurement";

export function ReceiptDetailRow({
  items,
}: Readonly<{ items: TReceiptItem[] }>) {
  return (
    <div className="bg-muted/30 p-4 border-t">
      <h4 className="font-semibold text-sm mb-3 flex items-center gap-2">
        <Package className="h-4 w-4" />
        Detail Penerimaan ({items.length})
      </h4>
      <div className="space-y-2">
        {items.map((item) => (
          <div
            key={item.idReceiptItem}
            className="flex items-center justify-between rounded-lg border bg-card p-3"
          >
            <div className="flex items-start gap-3 flex-1 min-w-0">
              <div className="min-w-0 flex-1">
                <p className="font-medium text-sm">{item.itemName}</p>
                <p className="text-xs text-muted-foreground">
                  {item.categoryName}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3 shrink-0">
              {Number(item.qtyReceived) > 0 && (
                <div className="flex items-center gap-1">
                  <CheckCircle2 className="h-4 w-4 text-green-600" />
                  <Badge
                    variant="outline"
                    className="bg-green-50 text-green-700 border-green-300"
                  >
                    {Number(item.qtyReceived).toFixed(2)} {item.unitName}
                  </Badge>
                </div>
              )}
              {Number(item.qtyDamaged) > 0 && (
                <div className="flex items-center gap-1">
                  <XCircle className="h-4 w-4 text-red-600" />
                  <Badge
                    variant="outline"
                    className="bg-red-50 text-red-700 border-red-300"
                  >
                    {Number(item.qtyDamaged).toFixed(2)} {item.unitName}
                  </Badge>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
