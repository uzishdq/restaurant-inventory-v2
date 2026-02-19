import { Badge } from "@/components/ui/badge";
import { formatDateWIB } from "@/lib/helper";
import type {
  TProductionMaterial,
  TProductionRecord,
} from "@/lib/type/type.production";
import { Package, User, Clock, CheckCircle2 } from "lucide-react";

interface ExpandedRowProductionProps {
  materials: TProductionMaterial[];
  records: TProductionRecord[];
  unitName: string | null;
}

export function ExpandedRowProduction({
  materials,
  records,
  unitName,
}: Readonly<ExpandedRowProductionProps>) {
  return (
    <div className="space-y-4">
      {/* Materials Section */}
      <div>
        <h4 className="text-sm font-semibold flex items-center gap-2 mb-3">
          <Package className="h-4 w-4" />
          Bahan Baku ({materials.length})
        </h4>

        {materials.length === 0 ? (
          <p className="text-xs text-muted-foreground">
            Tidak ada bahan baku tercatat
          </p>
        ) : (
          <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
            {materials.map((material) => (
              <div
                key={material.idProductionMaterial}
                className="rounded-md border bg-card p-3"
              >
                <div className="font-medium text-sm">{material.itemName}</div>
                <div className="mt-2 space-y-1 text-xs">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Dibutuhkan:</span>
                    <span className="font-medium">
                      {Number.parseFloat(material.qtyRequired).toFixed(2)}{" "}
                      {material.unitName}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Digunakan:</span>
                    <span className="font-medium">
                      {Number.parseFloat(material.qtyUsed).toFixed(2)}{" "}
                      {material.unitName}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Records Section */}
      <div>
        <h4 className="text-sm font-semibold flex items-center gap-2 mb-3">
          <CheckCircle2 className="h-4 w-4" />
          Riwayat Produksi ({records.length})
        </h4>

        {records.length === 0 ? (
          <p className="text-xs text-muted-foreground">
            Belum ada produksi tercatat
          </p>
        ) : (
          <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
            {records.map((record) => (
              <div
                key={record.idProductionRecord}
                className="rounded-md border bg-card p-3 space-y-2"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-xs">
                    <User className="h-3 w-3 text-muted-foreground" />
                    <span className="font-medium">{record.producerName}</span>
                  </div>
                  <Badge variant="secondary" className="text-xs">
                    {Number.parseFloat(record.qtyProduced).toFixed(2)}{" "}
                    {unitName}
                  </Badge>
                </div>
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <Clock className="h-3 w-3" />
                  <span>{formatDateWIB(record.createdAt)}</span>
                </div>
                {record.notes && (
                  <p className="text-xs italic text-muted-foreground border-t pt-2">
                    {record.notes}
                  </p>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
