"use server";

import { db } from "@/lib/db";
import {
  createProcurementSchema,
  verifyProcurementSchema,
  VerifyProcurementValues,
  type CreateProcurementValues,
} from "@/lib/validation/procurement-validation";
import { LABEL } from "@/lib/constant";
import { requireRole } from "./req-role";
import { getProcerumentId } from "../data-server/procurement";
import { generateProcurementId } from "@/lib/helper";
import { procurementItemTable, procurementTable } from "@/lib/db/schema";

export const createProcurement = async (values: CreateProcurementValues) => {
  try {
    const validated = createProcurementSchema.safeParse(values);

    if (!validated.success) {
      return { ok: false, message: LABEL.ERROR.INVALID_FIELD };
    }

    const authResult = await requireRole("ADMIN_KITCHEN");

    if (!authResult.ok || !authResult.session) {
      return { ok: false, message: authResult.message };
    }

    const lastId = await getProcerumentId();
    const newProcurementId = generateProcurementId("PR", lastId);

    await db.transaction(async (tx) => {
      await tx.insert(procurementTable).values({
        idProcurement: newProcurementId,
        requestedBy: authResult.session.user.id,
      });

      const procurementValues = validated.data.items.map((item) => ({
        procurementId: newProcurementId,
        itemId: item.itemId,
        qtyRequested: item.qtyRequested,
        notes: item.notes,
      }));

      await tx.insert(procurementItemTable).values(procurementValues);
    });

    return {
      ok: true,
      message: LABEL.INPUT.SUCCESS.SAVED,
    };
  } catch (error) {
    console.error("Error create procurement:", error);
    return {
      ok: false,
      message: LABEL.ERROR.SERVER,
    };
  }
};

export const verifProcurement = async (values: VerifyProcurementValues) => {
  try {
    const validated = verifyProcurementSchema.safeParse(values);

    if (!validated.success) {
      return { ok: false, message: LABEL.ERROR.INVALID_FIELD };
    }

    const authResult = await requireRole("ADMIN_KITCHEN");

    if (!authResult.ok || !authResult.session) {
      return { ok: false, message: authResult.message };
    }

    return {
      ok: true,
      message: LABEL.INPUT.SUCCESS.SAVED,
    };
  } catch (error) {
    console.error("Error verif procurement:", error);
    return {
      ok: false,
      message: LABEL.ERROR.SERVER,
    };
  }
};
