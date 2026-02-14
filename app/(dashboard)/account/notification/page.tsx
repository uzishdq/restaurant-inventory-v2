import { Bell, Clock, CheckCircle, XCircle } from "lucide-react";
import { RenderError } from "@/components/render-error";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import type { TNotification } from "@/lib/type/type.notification";
import { requireRole } from "@/lib/server/action-server/req-role";
import { LABEL } from "@/lib/constant";
import { getNotificationList } from "@/lib/server/data-server/notification";
import SectionCard from "@/components/section/section-card";
import NotificationList from "@/components/section/notification/notification-list";

export default async function NotificationPage() {
  const authResult = await requireRole("ALL");

  if (!authResult.ok || !authResult.session) {
    return RenderError(LABEL.ERROR.UNAUTHORIZED);
  }

  const isAdmin =
    authResult.session.user.role === "SUPER_ADMIN" ||
    authResult.session.user.role === "ADMIN";

  const notifications = await getNotificationList();

  if (!notifications.ok || !notifications.data) {
    return RenderError(LABEL.ERROR.DESCRIPTION);
  }

  // Group notifications
  const {
    pendingNotifications,
    sentNotifications,
    failedNotifications,
    allNotifications,
  } = notifications.data.reduce(
    (acc, item) => {
      acc.allNotifications.push(item);

      if (item.status === "PENDING" || item.status === "ONPROGRESS") {
        acc.pendingNotifications.push(item);
      } else if (item.status === "SENT") {
        acc.sentNotifications.push(item);
      } else if (item.status === "FAILED") {
        acc.failedNotifications.push(item);
      }

      return acc;
    },
    {
      pendingNotifications: [] as TNotification[],
      sentNotifications: [] as TNotification[],
      failedNotifications: [] as TNotification[],
      allNotifications: [] as TNotification[],
    },
  );

  if (isAdmin) {
    return (
      <div className="space-y-6 px-4">
        {/* Stats Cards - Admin */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <SectionCard
            title="Total Notifikasi"
            value={allNotifications.length}
            Icon={Bell}
          />
          <SectionCard
            title="Pending"
            value={pendingNotifications.length}
            Icon={Clock}
          />
          <SectionCard
            title="Terkirim"
            value={sentNotifications.length}
            Icon={CheckCircle}
          />
          <SectionCard
            title="Gagal"
            value={failedNotifications.length}
            Icon={XCircle}
          />
        </div>

        {/* Tabs - Admin */}
        <Tabs defaultValue="all" className="space-y-4">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="all" className="gap-2">
              <Bell className="h-4 w-4" />
              Semua
              <span className="ml-1 rounded-full bg-primary/10 px-2 py-0.5 text-xs">
                {notifications.data.length}
              </span>
            </TabsTrigger>
            <TabsTrigger value="pending" className="gap-2">
              <Clock className="h-4 w-4" />
              Pending
              <span className="ml-1 rounded-full bg-primary/10 px-2 py-0.5 text-xs">
                {pendingNotifications.length}
              </span>
            </TabsTrigger>
            <TabsTrigger value="sent" className="gap-2">
              <CheckCircle className="h-4 w-4" />
              Terkirim
              <span className="ml-1 rounded-full bg-primary/10 px-2 py-0.5 text-xs">
                {sentNotifications.length}
              </span>
            </TabsTrigger>
            <TabsTrigger value="failed" className="gap-2">
              <XCircle className="h-4 w-4" />
              Gagal
              <span className="ml-1 rounded-full bg-primary/10 px-2 py-0.5 text-xs">
                {failedNotifications.length}
              </span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="all">
            <NotificationList
              notifications={notifications.data}
              header="Semua Notifikasi"
              description="Daftar lengkap semua notifikasi sistem"
            />
          </TabsContent>

          <TabsContent value="pending">
            <NotificationList
              notifications={pendingNotifications}
              header="Notifikasi Pending"
              description="Notifikasi yang menunggu untuk dikirim"
            />
          </TabsContent>

          <TabsContent value="sent">
            <NotificationList
              notifications={sentNotifications}
              header="Notifikasi Terkirim"
              description="Notifikasi yang telah berhasil dikirim"
            />
          </TabsContent>

          <TabsContent value="failed">
            <NotificationList
              notifications={failedNotifications}
              header="Notifikasi Gagal"
              description="Notifikasi yang gagal dikirim dan perlu dicoba ulang"
            />
          </TabsContent>
        </Tabs>
      </div>
    );
  }

  return (
    <div className="space-y-6 px-4">
      <div className="grid gap-4 md:grid-cols-3">
        <SectionCard
          title="Total Notifikasi"
          value={allNotifications.length}
          Icon={Bell}
        />
        <SectionCard
          title="Belum Dibaca"
          value={pendingNotifications.length}
          Icon={Clock}
        />
        <SectionCard
          title="Terkirim"
          value={sentNotifications.length}
          Icon={CheckCircle}
        />
      </div>

      <NotificationList
        notifications={notifications.data}
        header="Notifikasi Saya"
        description={`Daftar notifikasi untuk ${authResult.session.user.name}`}
      />
    </div>
  );
}
