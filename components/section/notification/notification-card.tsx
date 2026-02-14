"use client";

import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Bell,
  Package,
  ShoppingCart,
  Truck,
  User,
  Store,
  Calendar,
  FileText,
  CheckCircle2,
  XCircle,
  Clock,
  ExternalLink,
} from "lucide-react";
import { formatDateWIB } from "@/lib/helper";
import type { TNotification } from "@/lib/type/type.notification";
import { cn } from "@/lib/utils";

interface NotificationCardProps {
  notification: TNotification;
  onViewDetail?: (refId: string, refType: string) => void;
}

export default function NotificationCard({
  notification,
  onViewDetail,
}: Readonly<NotificationCardProps>) {
  // Get icon based on refType
  const getRefIcon = () => {
    switch (notification.refType) {
      case "PROCUREMENT":
        return <FileText className="h-5 w-5" />;
      case "PURCHASE":
        return <ShoppingCart className="h-5 w-5" />;
      case "RECEIPT":
        return <Package className="h-5 w-5" />;
      case "RETURN":
        return <Truck className="h-5 w-5" />;
      default:
        return <Bell className="h-5 w-5" />;
    }
  };

  // Get status badge
  const getStatusBadge = () => {
    switch (notification.status) {
      case "PENDING":
        return (
          <Badge
            variant="outline"
            className="bg-yellow-50 text-yellow-700 border-yellow-300"
          >
            <Clock className="mr-1 h-3 w-3" />
            Pending
          </Badge>
        );
      case "ONPROGRESS":
        return (
          <Badge
            variant="outline"
            className="bg-blue-50 text-blue-700 border-blue-300"
          >
            <Clock className="mr-1 h-3 w-3" />
            On Progress
          </Badge>
        );
      case "SENT":
        return (
          <Badge
            variant="outline"
            className="bg-green-50 text-green-700 border-green-300"
          >
            <CheckCircle2 className="mr-1 h-3 w-3" />
            Terkirim
          </Badge>
        );
      case "FAILED":
        return (
          <Badge
            variant="outline"
            className="bg-red-50 text-red-700 border-red-300"
          >
            <XCircle className="mr-1 h-3 w-3" />
            Gagal
          </Badge>
        );
    }
  };

  // Get recipient info
  const getRecipientInfo = () => {
    if (notification.recipientType === "USER") {
      return {
        icon: <User className="h-4 w-4" />,
        label: "User",
        name: notification.userName || "-",
        color: "text-blue-600 bg-blue-50",
      };
    } else {
      return {
        icon: <Store className="h-4 w-4" />,
        label: "Supplier",
        name: notification.supplierStore || notification.supplierName || "-",
        color: "text-purple-600 bg-purple-50",
      };
    }
  };

  const recipient = getRecipientInfo();

  return (
    <Card className="group relative overflow-hidden rounded-xl border transition-all hover:shadow-md">
      {/* Accent border based on status */}
      <div
        className={cn(
          "absolute left-0 top-0 h-full w-1",
          notification.status === "SENT" && "bg-green-500",
          notification.status === "PENDING" && "bg-yellow-500",
          notification.status === "ONPROGRESS" && "bg-blue-500",
          notification.status === "FAILED" && "bg-red-500",
        )}
      />

      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-3">
          {/* Left: Icon + Ref Info */}
          <div className="flex items-start gap-3 flex-1 min-w-0">
            <div className="mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
              {getRefIcon()}
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <Badge variant="secondary" className="text-xs font-medium">
                  {notification.refType}
                </Badge>
                <span className="text-xs text-muted-foreground">
                  {notification.refId}
                </span>
              </div>

              {/* Recipient */}
              <div className="mt-2 flex items-center gap-2">
                <div className={cn("rounded-md p-1.5", recipient.color)}>
                  {recipient.icon}
                </div>
                <div className="min-w-0">
                  <p className="text-xs text-muted-foreground">
                    {recipient.label}
                  </p>
                  <p className="text-sm font-medium truncate">
                    {recipient.name}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Right: Status Badge */}
          <div className="shrink-0">{getStatusBadge()}</div>
        </div>
      </CardHeader>

      <CardContent className="space-y-3">
        {/* Message */}
        <div className="rounded-lg bg-muted/30 p-3 h-80 overflow-y-auto">
          <pre className="whitespace-pre-wrap text-sm text-muted-foreground leading-relaxed font-sans">
            {notification.message}
          </pre>
        </div>

        {/* Footer: Date + Actions */}
        <div className="flex items-center justify-between gap-3 pt-2 border-t">
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <Calendar className="h-3.5 w-3.5" />
            {formatDateWIB(notification.createdAt)}
          </div>

          {onViewDetail && (
            <Button
              variant="ghost"
              size="sm"
              className="text-xs"
              onClick={() =>
                onViewDetail(notification.refId, notification.refType)
              }
            >
              Lihat Detail
              <ExternalLink className="ml-1.5 h-3 w-3" />
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
