// components/purchase-detail.tsx
"use client";

import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
  Package,
  Store,
  Calendar,
  ShoppingCart,
  FileText,
  CheckCircle2,
  XCircle,
  Truck,
  ArrowLeft,
  ExternalLink,
} from "lucide-react";
import { formatDateWIB } from "@/lib/helper";
import { cn } from "@/lib/utils";
import { TPurchase, TPurchaseItem } from "@/lib/type/type.procurement";
import { BadgeCustom } from "../column/badge-custom";
import { ROUTES } from "@/lib/constant";

interface PurchaseDetailProps {
  data: TPurchase;
}

export default function PurchaseDetail({
  data,
}: Readonly<PurchaseDetailProps>) {
  const router = useRouter();

  // Get status icon
  const getStatusIcon = () => {
    switch (data.status) {
      case "DRAFT":
        return <FileText className="h-5 w-5" />;
      case "SENT":
        return <Truck className="h-5 w-5" />;
      case "RECEIVED":
        return <CheckCircle2 className="h-5 w-5" />;
      case "CANCELLED":
        return <XCircle className="h-5 w-5" />;
      case "COMPLETED":
        return <CheckCircle2 className="h-5 w-5" />;
      default:
        return <ShoppingCart className="h-5 w-5" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Back Button */}
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
                <ShoppingCart className="h-8 w-8" />
              </div>
              <div className="space-y-1">
                <CardTitle className="text-2xl font-bold">
                  {data.idPurchase}
                </CardTitle>
                <p className="text-sm text-muted-foreground">
                  Detail Pembelian
                </p>
                <Button
                  variant="outline"
                  size="sm"
                  className="gap-2 text-xs"
                  onClick={() =>
                    router.push(
                      ROUTES.AUTH.PROCUREMENT.DETAIL(data.procurementId),
                    )
                  }
                >
                  <FileText className="h-3 w-3" />
                  {data.procurementId}
                  <ExternalLink className="h-3 w-3" />
                </Button>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div
                className={cn(
                  "rounded-lg p-2",
                  data.status === "DRAFT" && "bg-gray-50 text-gray-600",
                  data.status === "SENT" && "bg-blue-50 text-blue-600",
                  data.status === "RECEIVED" && "bg-green-50 text-green-600",
                  data.status === "CANCELLED" && "bg-red-50 text-red-600",
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
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            {/* Supplier Info */}
            <div className="md:col-span-2 flex items-start gap-3">
              <div className="rounded-lg bg-purple-50 p-2.5">
                <Store className="h-5 w-5 text-purple-600" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                  Supplier
                </p>
                <p className="text-sm font-semibold mt-1 truncate">
                  {data.supplierStore}
                </p>
              </div>
            </div>

            {/* Date */}
            <div className="flex items-start gap-3">
              <div className="rounded-lg bg-blue-50 p-2.5">
                <Calendar className="h-5 w-5 text-blue-600" />
              </div>
              <div className="min-w-0">
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                  Tanggal PO
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
                  Total Pesanan
                </p>
                <p className="text-sm font-semibold mt-1">
                  {data.totalItems} item • {data.totalQty.toFixed(2)} unit
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
            Detail Pesanan ({data.totalItems})
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {data.purchaseItems.map((item, index) => (
              <PurchaseItemCard
                key={item.idPurchaseItem}
                item={item}
                index={index}
              />
            ))}
          </div>

          {/* Summary */}
          <Separator className="my-4" />
          <div className="flex items-center justify-between rounded-lg bg-muted/50 p-4">
            <div className="flex items-center gap-2">
              <Package className="h-5 w-5 text-muted-foreground" />
              <span className="font-semibold">Total Keseluruhan</span>
            </div>
            <div className="text-right">
              <p className="text-sm text-muted-foreground">
                {data.totalItems} jenis item
              </p>
              <p className="text-xl font-bold text-primary">
                {data.totalQty.toFixed(2)} unit
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// Item Card Component
interface PurchaseItemCardProps {
  item: TPurchaseItem;
  index: number;
}

function PurchaseItemCard({ item, index }: Readonly<PurchaseItemCardProps>) {
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
          </div>
        </div>

        {/* Quantity Ordered */}
        <div className="flex items-center gap-2 shrink-0 pl-4 sm:pl-0">
          <div className="text-right">
            <p className="text-xs text-muted-foreground">Jumlah Dipesan</p>
            <p className="text-lg font-bold text-primary mt-1">
              {Number(item.qtyOrdered).toFixed(2)}
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
