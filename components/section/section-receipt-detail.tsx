"use client";

import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
  Package,
  User,
  Calendar,
  Store,
  ShoppingCart,
  FileText,
  ArrowLeft,
  ExternalLink,
  CheckCircle2,
  XCircle,
} from "lucide-react";
import { formatDateWIB } from "@/lib/helper";
import { TReceipt } from "@/lib/type/type.procurement";
import { ROUTES } from "@/lib/constant";

interface ReceiptDetailProps {
  data: TReceipt;
}

export default function ReceiptDetail({ data }: Readonly<ReceiptDetailProps>) {
  const router = useRouter();

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
          <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
            <div className="flex items-start gap-4 flex-1 min-w-0">
              <div className="mt-1 flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-green-50 text-green-600">
                <Package className="h-6 w-6" />
              </div>
              <div className="min-w-0 flex-1 space-y-2">
                <div>
                  <CardTitle className="text-2xl font-bold truncate">
                    {data.idReceipt}
                  </CardTitle>
                  <p className="text-sm text-muted-foreground mt-1">
                    Penerimaan Bahan Baku
                  </p>
                </div>

                <div className="flex flex-wrap gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="gap-2 text-xs"
                    onClick={() =>
                      router.push(ROUTES.AUTH.PURCHASE.DETAIL(data.purchaseId))
                    }
                  >
                    <ShoppingCart className="h-3 w-3" />
                    {data.purchaseId}
                    <ExternalLink className="h-3 w-3" />
                  </Button>
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
            </div>

            <Badge className="bg-green-100 text-green-800 border-green-300 shrink-0">
              <CheckCircle2 className="mr-1 h-3 w-3" />
              Diterima
            </Badge>
          </div>
        </CardHeader>

        <Separator />

        <CardContent>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            {/* Supplier */}
            <div className="flex items-start gap-3">
              <div className="rounded-lg bg-purple-50 p-2.5">
                <Store className="h-5 w-5 text-purple-600" />
              </div>
              <div className="min-w-0">
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                  Supplier
                </p>
                <p className="text-sm font-semibold mt-1 truncate">
                  {data.supplierStore}
                </p>
                <p className="text-xs text-muted-foreground truncate">
                  {data.supplierName}
                </p>
              </div>
            </div>

            {/* Received By */}
            <div className="flex items-start gap-3">
              <div className="rounded-lg bg-blue-50 p-2.5">
                <User className="h-5 w-5 text-blue-600" />
              </div>
              <div className="min-w-0">
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                  Diterima Oleh
                </p>
                <p className="text-sm font-semibold mt-1 truncate">
                  {data.receivedByName}
                </p>
              </div>
            </div>

            {/* Date */}
            <div className="flex items-start gap-3">
              <div className="rounded-lg bg-orange-50 p-2.5">
                <Calendar className="h-5 w-5 text-orange-600" />
              </div>
              <div className="min-w-0">
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                  Tanggal
                </p>
                <p className="text-sm font-semibold mt-1">
                  {formatDateWIB(data.createdAt)}
                </p>
              </div>
            </div>

            {/* Summary */}
            <div className="flex items-start gap-3">
              <div className="rounded-lg bg-green-50 p-2.5">
                <Package className="h-5 w-5 text-green-600" />
              </div>
              <div className="min-w-0">
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                  Total Item
                </p>
                <p className="text-sm font-semibold mt-1">
                  {data.totalItems} item
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
            Detail Item ({data.totalItems})
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {data.receiptItems.map((item, index) => (
              <div
                key={item.idReceiptItem}
                className="group relative rounded-lg border bg-card p-4"
              >
                <div className="absolute -left-2 -top-2 flex h-6 w-6 items-center justify-center rounded-full bg-primary text-xs font-bold text-primary-foreground shadow-sm">
                  {index + 1}
                </div>

                <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 pl-4">
                  <div className="flex items-start gap-3 flex-1 min-w-0">
                    <div className="mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10">
                      <Package className="h-5 w-5 text-primary" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="font-semibold text-sm leading-tight">
                        {item.itemName}
                      </h4>
                      <div className="mt-1.5 flex flex-wrap items-center gap-2">
                        <Badge variant="secondary" className="text-xs">
                          {item.categoryName}
                        </Badge>
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-2 shrink-0">
                    {Number(item.qtyReceived) > 0 && (
                      <div className="flex items-center gap-2 rounded-lg bg-green-50 px-3 py-2 border border-green-200">
                        <CheckCircle2 className="h-4 w-4 text-green-600" />
                        <div className="text-right">
                          <p className="text-xs text-green-600">Diterima</p>
                          <p className="text-sm font-bold text-green-700">
                            {Number(item.qtyReceived).toFixed(2)}{" "}
                            {item.unitName}
                          </p>
                        </div>
                      </div>
                    )}
                    {Number(item.qtyDamaged) > 0 && (
                      <div className="flex items-center gap-2 rounded-lg bg-red-50 px-3 py-2 border border-red-200">
                        <XCircle className="h-4 w-4 text-red-600" />
                        <div className="text-right">
                          <p className="text-xs text-red-600">Rusak</p>
                          <p className="text-sm font-bold text-red-700">
                            {Number(item.qtyDamaged).toFixed(2)} {item.unitName}
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Summary */}
          <Separator className="my-4" />
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="flex items-center gap-3 rounded-lg bg-green-50 p-4 border border-green-200">
              <CheckCircle2 className="h-8 w-8 text-green-600" />
              <div>
                <p className="text-xs text-green-600 font-medium">
                  Total Diterima Baik
                </p>
                <p className="text-xl font-bold text-green-700">
                  {data.totalReceived.toFixed(2)} unit
                </p>
              </div>
            </div>
            {data.totalDamaged > 0 && (
              <div className="flex items-center gap-3 rounded-lg bg-red-50 p-4 border border-red-200">
                <XCircle className="h-8 w-8 text-red-600" />
                <div>
                  <p className="text-xs text-red-600 font-medium">
                    Total Rusak
                  </p>
                  <p className="text-xl font-bold text-red-700">
                    {data.totalDamaged.toFixed(2)} unit
                  </p>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
