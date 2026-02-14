// lib/actions/notification.action.ts
import { unstable_cache } from "next/cache";
import { desc, eq } from "drizzle-orm";
import type { TNotification } from "@/lib/type/type.notification";
import { requireRole } from "../action-server/req-role";
import { notificationsTable, supplierTable, userTable } from "@/lib/db/schema";
import { db } from "@/lib/db";
import { CACHE_TAGS } from "@/lib/constant";

export const getNotificationList = async () => {
  try {
    const authResult = await requireRole("ALL");

    if (!authResult.ok || !authResult.session) {
      return { ok: false, data: null, message: authResult.message };
    }

    const currentUserId = authResult.session.user.id;
    const userRole = authResult.session.user.role;
    const isAdmin = userRole === "SUPER_ADMIN" || userRole === "ADMIN";

    return await getNotificationListCached(currentUserId, isAdmin);
  } catch (error) {
    console.error("Error get notification data:", error);
    return {
      ok: false,
      data: null,
      message: "Gagal mengambil data notifikasi",
    };
  }
};

const getNotificationListCached = unstable_cache(
  async (userId: string, isAdmin: boolean) => {
    try {
      let whereCondition;

      if (isAdmin) {
        whereCondition = undefined;
      } else {
        whereCondition = eq(notificationsTable.userId, userId);
      }

      const result = await db
        .select({
          idNotification: notificationsTable.idNotification,
          recipientType: notificationsTable.recipientType,
          userId: notificationsTable.userId,
          supplierId: notificationsTable.supplierId,
          refType: notificationsTable.refType,
          refId: notificationsTable.refId,
          message: notificationsTable.message,
          status: notificationsTable.status,
          createdAt: notificationsTable.createdAt,

          // User info
          userName: userTable.name,

          // Supplier info
          supplierName: supplierTable.name,
          supplierStore: supplierTable.store,
        })
        .from(notificationsTable)
        .leftJoin(userTable, eq(notificationsTable.userId, userTable.idUser))
        .leftJoin(
          supplierTable,
          eq(notificationsTable.supplierId, supplierTable.idSupplier),
        )
        .where(whereCondition)
        .orderBy(desc(notificationsTable.createdAt));

      if (result.length > 0) {
        return { ok: true, data: result as TNotification[] };
      } else {
        return { ok: true, data: [] as TNotification[] };
      }
    } catch (error) {
      console.error("Error get notification data:", error);
      return {
        ok: false,
        data: null,
        message: "Gagal mengambil data notifikasi",
      };
    }
  },
  ["get-notification-list"],
  {
    tags: [CACHE_TAGS.transaction.notification.list],
    revalidate: 300, // 5 minutes
  },
);
