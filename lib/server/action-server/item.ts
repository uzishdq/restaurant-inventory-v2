"use server";

import z from "zod";

import { LABEL, ROUTES } from "@/lib/constant";
import { db } from "@/lib/db";
import { invalidateItem } from "../data-server/revalidate";
import { revalidatePath } from "next/cache";
import { requireRole } from "./req-role";
import {
  CreateItemSchema,
  DeleteItemSchema,
} from "@/lib/validation/master-validation";
import { getItemId } from "../data-server/item";
import { generateItemId } from "@/lib/helper";
import { itemBomDetailTable, itemBomTable, itemTable } from "@/lib/db/schema";
import { eq } from "drizzle-orm";

export const createItem = async (values: z.infer<typeof CreateItemSchema>) => {
  try {
    const validateValues = CreateItemSchema.safeParse(values);

    if (!validateValues.success) {
      return { ok: false, message: LABEL.ERROR.INVALID_FIELD };
    }

    const authResult = await requireRole("ADMIN_ONLY");

    if (!authResult.ok) {
      return {
        ok: false,
        message: authResult.message,
      };
    }

    const { name, unitId, categoryId, type, minStock, bomDetails } =
      validateValues.data;

    const lastId = await getItemId(type);
    const newItemId = generateItemId({ previousId: lastId, type });

    await db.transaction(async (tx) => {
      // Insert item
      await tx.insert(itemTable).values({
        idItem: newItemId,
        name,
        unitId,
        categoryId,
        type,
        minStock,
      });

      // Insert BOM jika type WIP atau FG
      if (
        (type === "WORK_IN_PROGRESS" || type === "FINISHED_GOOD") &&
        bomDetails &&
        bomDetails.length > 0
      ) {
        // Insert BOM header
        const [bom] = await tx
          .insert(itemBomTable)
          .values({
            itemId: newItemId,
          })
          .returning({ idBom: itemBomTable.idBom });

        // Insert BOM details
        const bomDetailValues = bomDetails.map((detail) => ({
          bomId: bom.idBom,
          rawItemId: detail.rawItemId,
          qty: detail.qty,
        }));

        await tx.insert(itemBomDetailTable).values(bomDetailValues);
      }
    });

    invalidateItem();
    revalidatePath(ROUTES.AUTH.MASTER.ITEMS);

    return {
      ok: true,
      message: LABEL.INPUT.SUCCESS.SAVED,
    };
  } catch (error) {
    console.error("error create item : ", error);

    if (error instanceof Error) {
      if (
        error.message.includes("unique") ||
        error.message.includes("duplicate")
      ) {
        return {
          ok: false,
          message: "Nama item sudah digunakan",
        };
      }
    }

    return {
      ok: false,
      message: LABEL.ERROR.SERVER,
    };
  }
};

export const updateItem = async (
  itemId: string,
  values: z.infer<typeof CreateItemSchema>,
) => {
  try {
    // 1. Validate input
    const validateValues = CreateItemSchema.safeParse(values);

    if (!validateValues.success) {
      return { ok: false, message: LABEL.ERROR.INVALID_FIELD };
    }

    // 2. Auth check
    const authResult = await requireRole("ADMIN_ONLY");

    if (!authResult.ok) {
      return {
        ok: false,
        message: authResult.message,
      };
    }

    const { name, unitId, categoryId, type, minStock, bomDetails } =
      validateValues.data;

    // 3. Transaction - All or Nothing
    await db.transaction(async (tx) => {
      // Update item
      await tx
        .update(itemTable)
        .set({
          name,
          unitId,
          categoryId,
          minStock,
          // type tidak di-update karena sudah disabled di form
        })
        .where(eq(itemTable.idItem, itemId));

      // Handle BOM updates
      if (type === "WORK_IN_PROGRESS" || type === "FINISHED_GOOD") {
        // Cek apakah sudah ada BOM
        const existingBom = await tx.query.itemBomTable.findFirst({
          where: eq(itemBomTable.itemId, itemId),
        });

        let bomId: string;

        if (existingBom) {
          // Jika sudah ada BOM, hapus detail lama
          await tx
            .delete(itemBomDetailTable)
            .where(eq(itemBomDetailTable.bomId, existingBom.idBom));

          bomId = existingBom.idBom;
        } else {
          // Jika belum ada BOM, buat baru (edge case: RAW_MATERIAL diubah jadi WIP/FG)
          const [newBom] = await tx
            .insert(itemBomTable)
            .values({
              itemId,
            })
            .returning({ idBom: itemBomTable.idBom });

          bomId = newBom.idBom;
        }

        // Insert BOM details baru
        if (bomDetails && bomDetails.length > 0) {
          const bomDetailValues = bomDetails.map((detail) => ({
            bomId,
            rawItemId: detail.rawItemId,
            qty: detail.qty,
          }));

          await tx.insert(itemBomDetailTable).values(bomDetailValues);
        }
      } else {
        // Jika type RAW_MATERIAL, hapus BOM jika ada
        // (ini seharusnya tidak terjadi karena type disabled di edit)
        const existingBom = await tx.query.itemBomTable.findFirst({
          where: eq(itemBomTable.itemId, itemId),
        });

        if (existingBom) {
          // Delete BOM details first (cascade should handle this, but explicit is better)
          await tx
            .delete(itemBomDetailTable)
            .where(eq(itemBomDetailTable.bomId, existingBom.idBom));

          // Delete BOM header
          await tx
            .delete(itemBomTable)
            .where(eq(itemBomTable.idBom, existingBom.idBom));
        }
      }
    });

    // 4. Revalidate cache
    invalidateItem();
    revalidatePath(ROUTES.AUTH.MASTER.ITEMS);

    return {
      ok: true,
      message: LABEL.INPUT.SUCCESS.UPDATE,
    };
  } catch (error) {
    console.error("error update item : ", error);

    // Handle duplicate name error
    if (error instanceof Error) {
      if (
        error.message.includes("unique") ||
        error.message.includes("duplicate")
      ) {
        return {
          ok: false,
          message: "Nama item sudah digunakan",
        };
      }
    }

    return {
      ok: false,
      message: LABEL.ERROR.SERVER,
    };
  }
};

export const deleteItem = async (values: z.infer<typeof DeleteItemSchema>) => {
  try {
    const validateValues = DeleteItemSchema.safeParse(values);

    if (!validateValues.success) {
      return { ok: false, message: LABEL.ERROR.INVALID_FIELD };
    }

    const authResult = await requireRole("ADMIN_ONLY");

    if (!authResult.ok) {
      return {
        ok: false,
        message: authResult.message,
      };
    }

    const [result] = await db
      .delete(itemTable)
      .where(eq(itemTable.idItem, validateValues.data.id))
      .returning();

    if (!result) {
      return {
        ok: false,
        message: LABEL.INPUT.FAILED.DELETE,
      };
    }

    invalidateItem();
    revalidatePath(ROUTES.AUTH.MASTER.ITEMS);

    return {
      ok: true,
      message: LABEL.INPUT.SUCCESS.DELETE,
    };
  } catch (error) {
    console.error("error delete unit : ", error);
    return {
      ok: false,
      message: LABEL.ERROR.SERVER,
    };
  }
};
