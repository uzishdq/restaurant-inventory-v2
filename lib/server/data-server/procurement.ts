"use server";

import { CACHE_TAGS } from "@/lib/constant";
import { db } from "@/lib/db";
import {
  categoryTable,
  itemTable,
  procurementItemTable,
  procurementTable,
  unitTable,
  userTable,
} from "@/lib/db/schema";
import { TProcerement } from "@/lib/type/type.procurement";
import { procurementByIdSchema } from "@/lib/validation/procurement-validation";
import { and, desc, eq } from "drizzle-orm";
import { unstable_cache } from "next/cache";
import z from "zod";

export const getProcerumentId = async () => {
  const [result] = await db
    .select({ id: procurementTable.idProcurement })
    .from(procurementTable)
    .orderBy(desc(procurementTable.idProcurement))
    .limit(1)
    .execute();

  return result ? result.id : null;
};

export const getProcerumentList = unstable_cache(
  async () => {
    try {
      const rows = await db
        .select({
          idProcurement: procurementTable.idProcurement,
          requestedBy: userTable.name,
          status: procurementTable.status,
          createdAt: procurementTable.createdAt,
          idProcurementItem: procurementItemTable.idProcurementItem,
          itemId: procurementItemTable.itemId,
          itemName: itemTable.name,
          itemType: itemTable.type,
          categoryName: categoryTable.name,
          unitName: unitTable.name,
          qtyRequested: procurementItemTable.qtyRequested,
          notes: procurementItemTable.notes,
        })
        .from(procurementTable)
        .leftJoin(userTable, eq(procurementTable.requestedBy, userTable.idUser))
        .leftJoin(
          procurementItemTable,
          eq(
            procurementTable.idProcurement,
            procurementItemTable.procurementId,
          ),
        )
        .leftJoin(itemTable, eq(procurementItemTable.itemId, itemTable.idItem))
        .leftJoin(unitTable, eq(itemTable.unitId, unitTable.idUnit))
        .leftJoin(
          categoryTable,
          eq(itemTable.categoryId, categoryTable.idCategory),
        );

      const grouped = rows.reduce<Record<string, TProcerement>>((acc, row) => {
        if (!acc[row.idProcurement]) {
          acc[row.idProcurement] = {
            idProcurement: row.idProcurement,
            requestedBy: row.requestedBy,
            status: row.status,
            createdAt: row.createdAt,
            procurementItem: [],
            totalItems: 0,
            totalRawMaterial: 0,
            totalWorkInProgress: 0,
          };
        }

        if (row.idProcurementItem) {
          acc[row.idProcurement].procurementItem.push({
            idProcurementItem: row.idProcurementItem,
            itemId: row.itemId ?? "-",
            itemName: row.itemName ?? "-",
            itemType: row.itemType ?? "RAW_MATERIAL",
            categoryName: row.categoryName ?? "-",
            unitName: row.unitName ?? "-",
            qtyRequested: row.qtyRequested ?? "-",
            notes: row.notes ?? "-",
          });
          acc[row.idProcurement].totalItems += 1;

          if (row.itemType === "RAW_MATERIAL") {
            acc[row.idProcurement].totalRawMaterial += 1;
          } else if (row.itemType === "WORK_IN_PROGRESS") {
            acc[row.idProcurement].totalWorkInProgress += 1;
          }
        }

        return acc;
      }, {});

      const result = Object.values(grouped);

      if (result.length > 0) {
        return { ok: true, data: result };
      } else {
        return { ok: true, data: [] };
      }
    } catch (error) {
      console.error("error get procurement data : ", error);
      return { ok: false, data: null };
    }
  },
  ["get-procurement"],
  {
    tags: [CACHE_TAGS.transaction.procurement.list],
    revalidate: 3600,
  },
);

export const getProcerumentById = unstable_cache(
  async (values: z.infer<typeof procurementByIdSchema>) => {
    try {
      const parsed = procurementByIdSchema.safeParse(values);

      if (!parsed.success) {
        return { ok: true, data: null };
      }

      const whereConditions = [
        eq(procurementTable.idProcurement, parsed.data.id),
      ];

      // Filter by procurement status
      if (parsed.data.status !== "ALL") {
        whereConditions.push(eq(procurementTable.status, parsed.data.status));
      }

      // Filter by item type ← TAMBAHKAN INI
      if (parsed.data.itemType && parsed.data.itemType !== "ALL") {
        whereConditions.push(eq(itemTable.type, parsed.data.itemType));
      }

      const rows = await db
        .select({
          idProcurement: procurementTable.idProcurement,
          requestedBy: userTable.name,
          status: procurementTable.status,
          createdAt: procurementTable.createdAt,
          idProcurementItem: procurementItemTable.idProcurementItem,
          itemId: procurementItemTable.itemId,
          itemName: itemTable.name,
          itemType: itemTable.type,
          categoryName: categoryTable.name,
          unitName: unitTable.name,
          qtyRequested: procurementItemTable.qtyRequested,
          notes: procurementItemTable.notes,
        })
        .from(procurementTable)
        .leftJoin(userTable, eq(procurementTable.requestedBy, userTable.idUser))
        .leftJoin(
          procurementItemTable,
          eq(
            procurementTable.idProcurement,
            procurementItemTable.procurementId,
          ),
        )
        .leftJoin(itemTable, eq(procurementItemTable.itemId, itemTable.idItem))
        .leftJoin(unitTable, eq(itemTable.unitId, unitTable.idUnit))
        .leftJoin(
          categoryTable,
          eq(itemTable.categoryId, categoryTable.idCategory),
        )
        .where(and(...whereConditions));

      const grouped = rows.reduce<Record<string, TProcerement>>((acc, row) => {
        if (!acc[row.idProcurement]) {
          acc[row.idProcurement] = {
            idProcurement: row.idProcurement,
            requestedBy: row.requestedBy,
            status: row.status,
            createdAt: row.createdAt,
            procurementItem: [],
            totalItems: 0,
            totalRawMaterial: 0,
            totalWorkInProgress: 0,
          };
        }

        if (row.idProcurementItem) {
          acc[row.idProcurement].procurementItem.push({
            idProcurementItem: row.idProcurementItem,
            itemId: row.itemId ?? "-",
            itemName: row.itemName ?? "-",
            itemType: row.itemType ?? "RAW_MATERIAL",
            categoryName: row.categoryName ?? "-",
            unitName: row.unitName ?? "-",
            qtyRequested: row.qtyRequested ?? "-",
            notes: row.notes ?? "-",
          });

          acc[row.idProcurement].totalItems += 1;

          if (row.itemType === "RAW_MATERIAL") {
            acc[row.idProcurement].totalRawMaterial += 1;
          } else if (row.itemType === "WORK_IN_PROGRESS") {
            acc[row.idProcurement].totalWorkInProgress += 1;
          }
        }

        return acc;
      }, {});

      const result = Object.values(grouped)[0];

      return {
        ok: true,
        data: result ?? null,
      };
    } catch (error) {
      console.error("error get procurement data by id: ", error);
      return { ok: false, data: null };
    }
  },
  ["get-detail-procurement"],
  {
    tags: [CACHE_TAGS.transaction.procurement.detail],
    revalidate: 3600,
  },
);
