// components/procurement-detail.tsx
"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  Package,
  User,
  Calendar,
  FileText,
  ShoppingCart,
  CheckCircle2,
  Clock,
  XCircle,
  ArrowLeft,
} from "lucide-react";
import { formatDateWIB } from "@/lib/helper";
import type {
  TProcerement,
  TProcerementItem,
} from "@/lib/type/type.procurement";
import { cn } from "@/lib/utils";
import { BadgeCustom } from "../column/badge-custom";
import { Button } from "../ui/button";
import { useRouter } from "next/navigation";

interface ProcurementDetailProps {
  data: TProcerement;
}

export default function ProcurementDetail({
  data,
}: Readonly<ProcurementDetailProps>) {
  const router = useRouter();

  const totalItems = data.procurementItem.length;
  const totalQty = data.procurementItem.reduce(
    (sum, item) => sum + Number(item.qtyRequested),
    0,
  );

  // Get status icon
  const getStatusIcon = () => {
    switch (data.status) {
      case "DRAFT":
        return <Clock className="h-5 w-5" />;
      case "CANCELLED":
        return <XCircle className="h-5 w-5" />;
      case "ON_PROGRESS":
        return <ShoppingCart className="h-5 w-5" />;
      case "COMPLETED":
        return <CheckCircle2 className="h-5 w-5" />;
      default:
        return <FileText className="h-5 w-5" />;
    }
  };

  return (
    <div className="space-y-6">
      <Button
        variant="ghost"
        size="sm"
        onClick={() => router.back()}
        className="gap-2"
      >
        <ArrowLeft className="h-4 w-4" />
        Kembali
      </Button>
      {/* Header Card */}
      <Card className="border-2">
        <CardHeader>
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-start gap-4">
              <div className="mt-1 flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
                <FileText className="h-8 w-8" />
              </div>
              <div>
                <CardTitle className="text-2xl font-bold">
                  {data.idProcurement}
                </CardTitle>
                <p className="text-sm text-muted-foreground mt-1">
                  Detail Pengadaan Bahan Baku
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div
                className={cn(
                  "rounded-lg p-2",
                  data.status === "DRAFT" && "bg-yellow-50 text-yellow-600",
                  data.status === "CANCELLED" && "bg-red-50 text-red-600",
                  data.status === "ON_PROGRESS" && "bg-blue-50 text-blue-600",
                  data.status === "COMPLETED" &&
                    "bg-emerald-50 text-emerald-600",
                )}
              >
                {getStatusIcon()}
              </div>
              <BadgeCustom value={data.status} category="statusProcurement" />
            </div>
          </div>
        </CardHeader>

        <Separator />

        <CardContent>
          <div className="grid gap-6 md:grid-cols-3">
            {/* Requester */}
            <div className="flex items-start gap-3">
              <div className="rounded-lg bg-blue-50 p-2.5">
                <User className="h-5 w-5 text-blue-600" />
              </div>
              <div className="min-w-0">
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                  Pemohon
                </p>
                <p className="text-sm font-semibold mt-1 truncate">
                  {data.requestedBy || "-"}
                </p>
              </div>
            </div>

            {/* Date */}
            <div className="flex items-start gap-3">
              <div className="rounded-lg bg-purple-50 p-2.5">
                <Calendar className="h-5 w-5 text-purple-600" />
              </div>
              <div className="min-w-0">
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                  Tanggal Pengajuan
                </p>
                <p className="text-sm font-semibold mt-1">
                  {formatDateWIB(data.createdAt)}
                </p>
              </div>
            </div>

            {/* Total Items */}
            <div className="flex items-start gap-3">
              <div className="rounded-lg bg-orange-50 p-2.5">
                <Package className="h-5 w-5 text-orange-600" />
              </div>
              <div className="min-w-0">
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                  Total Item
                </p>
                <p className="text-sm font-semibold mt-1">
                  {totalItems} item • {totalQty.toFixed(2)} unit
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Items List */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Package className="h-5 w-5" />
            Daftar Bahan Baku ({totalItems})
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {data.procurementItem.map((item, index) => (
              <ProcurementItemCard
                key={item.idProcurementItem}
                item={item}
                index={index}
              />
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// Item Card Component
interface ProcurementItemCardProps {
  item: TProcerementItem;
  index: number;
}

function ProcurementItemCard({
  item,
  index,
}: Readonly<ProcurementItemCardProps>) {
  return (
    <div className="group relative rounded-lg border bg-card p-4 transition-all hover:border-primary/50 hover:shadow-sm">
      {/* Index Badge */}
      <div className="absolute -left-2 -top-2 flex h-6 w-6 items-center justify-center rounded-full bg-primary text-xs font-bold text-primary-foreground shadow-sm">
        {index + 1}
      </div>

      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 pl-4">
        {/* Item Info */}
        <div className="flex items-start gap-3 flex-1 min-w-0">
          <div className="mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10">
            <Package className="h-5 w-5 text-primary" />
          </div>

          <div className="flex-1 min-w-0 space-y-2">
            <div>
              <h4 className="font-semibold text-sm leading-tight">
                {item.itemName}
              </h4>
              <div className="mt-1.5 flex flex-wrap items-center gap-2">
                <Badge variant="secondary" className="text-xs">
                  {item.categoryName}
                </Badge>
                <span className="text-xs text-muted-foreground">
                  ID: {item.itemId}
                </span>
              </div>
            </div>

            {item.notes && (
              <div className="rounded-md bg-muted/50 px-3 py-2">
                <p className="text-xs text-muted-foreground">
                  <span className="mr-1">💬</span>
                  {item.notes}
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Quantity */}
        <div className="flex items-center gap-2 shrink-0 pl-4 sm:pl-0">
          <div className="text-right">
            <p className="text-xs text-muted-foreground">Jumlah Diminta</p>
            <p className="text-lg font-bold text-primary mt-1">
              {Number(item.qtyRequested).toFixed(2)}
            </p>
          </div>
          <Badge variant="outline" className="h-fit text-xs font-medium">
            {item.unitName}
          </Badge>
        </div>
      </div>
    </div>
  );
}
