// components/notification-list.tsx
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import NotificationCard from "./notification-card";
import { Input } from "@/components/ui/input";
import { Bell, Search } from "lucide-react";
import type { TNotification } from "@/lib/type/type.notification";

interface NotificationListProps {
  notifications: TNotification[];
  header: string;
  description: string;
  showTypeFilter?: boolean;
}

export default function NotificationList({
  notifications,
  header,
  description,
  showTypeFilter = false, // 🔥 Default false for regular users
}: Readonly<NotificationListProps>) {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");

  const handleViewDetail = (refId: string, refType: string) => {
    switch (refType) {
      case "PROCUREMENT":
        router.push(`/procurement/${refId}`);
        break;
      case "PURCHASE":
        router.push(`/purchase/${refId}`);
        break;
      case "RECEIPT":
        router.push(`/receipt/${refId}`);
        break;
      case "RETURN":
        router.push(`/return/${refId}`);
        break;
    }
  };

  // Filter notifications
  const filteredNotifications = notifications.filter((notif) => {
    const matchesSearch = notif.message
      .toLowerCase()
      .includes(searchQuery.toLowerCase());

    return matchesSearch;
  });

  return (
    <div className="space-y-4">
      {/* Header */}
      <div>
        <h2 className="text-lg font-semibold">{header}</h2>
        <p className="text-sm text-muted-foreground">{description}</p>
      </div>

      {/* Search Only */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Cari notifikasi..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-9"
        />
      </div>

      {/* Notifications Grid */}
      {filteredNotifications.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-lg border border-dashed bg-muted/20 p-12 text-center">
          <Bell className="h-12 w-12 text-muted-foreground/50 mb-4" />
          <p className="text-sm font-medium text-muted-foreground">
            Tidak ada notifikasi
          </p>
          <p className="text-xs text-muted-foreground mt-1">
            {searchQuery
              ? "Coba ubah kata kunci pencarian"
              : "Belum ada notifikasi untuk ditampilkan"}
          </p>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filteredNotifications.map((notification) => (
            <NotificationCard
              key={notification.idNotification}
              notification={notification}
              onViewDetail={handleViewDetail}
            />
          ))}
        </div>
      )}

      {/* Count */}
      <p className="text-xs text-muted-foreground text-center">
        Menampilkan {filteredNotifications.length} dari {notifications.length}{" "}
        notifikasi
      </p>
    </div>
  );
}
