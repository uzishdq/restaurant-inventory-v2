"use server";

import z from "zod";

import { LABEL, ROUTES } from "@/lib/constant";
import { db } from "@/lib/db";
import { supplierTable } from "@/lib/db/schema";
import { invalidateSupplier } from "../data-server/revalidate";
import { revalidatePath } from "next/cache";
import { requireRole } from "./req-role";
import { eq } from "drizzle-orm";
import { IdSchema } from "@/lib/validation/validation-helper";
import {
  CreateSupplierSchema,
  UpdateSupplierSchema,
} from "@/lib/validation/master-validation";

export const createSupplier = async (
  values: z.infer<typeof CreateSupplierSchema>,
) => {
  try {
    const validateValues = CreateSupplierSchema.safeParse(values);

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
      .insert(supplierTable)
      .values(validateValues.data)
      .returning();

    if (!result) {
      return {
        ok: false,
        message: LABEL.INPUT.FAILED.SAVED,
      };
    }

    invalidateSupplier();
    revalidatePath(ROUTES.AUTH.MASTER.SUPPLIER);

    return {
      ok: true,
      message: LABEL.INPUT.SUCCESS.SAVED,
    };
  } catch (error) {
    console.error("error create supplier : ", error);
    return {
      ok: false,
      message: LABEL.ERROR.SERVER,
    };
  }
};

export const updateSupplier = async (
  values: z.infer<typeof UpdateSupplierSchema>,
) => {
  try {
    const validateValues = UpdateSupplierSchema.safeParse(values);

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
      .update(supplierTable)
      .set({
        store: validateValues.data.store,
        name: validateValues.data.name,
        phone: validateValues.data.phone,
        address: validateValues.data.address,
      })
      .where(eq(supplierTable.idSupplier, validateValues.data.id))
      .returning();

    if (!result) {
      return {
        ok: false,
        message: LABEL.INPUT.FAILED.UPDATE,
      };
    }

    invalidateSupplier();
    revalidatePath(ROUTES.AUTH.MASTER.SUPPLIER);

    return {
      ok: true,
      message: LABEL.INPUT.SUCCESS.UPDATE,
    };
  } catch (error) {
    console.error("error update supplier : ", error);
    return {
      ok: false,
      message: LABEL.ERROR.SERVER,
    };
  }
};

export const deleteSupplier = async (values: z.infer<typeof IdSchema>) => {
  try {
    const validateValues = IdSchema.safeParse(values);

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
      .delete(supplierTable)
      .where(eq(supplierTable.idSupplier, validateValues.data.id))
      .returning();

    if (!result) {
      return {
        ok: false,
        message: LABEL.INPUT.FAILED.DELETE,
      };
    }

    invalidateSupplier();
    revalidatePath(ROUTES.AUTH.MASTER.SUPPLIER);

    return {
      ok: true,
      message: LABEL.INPUT.SUCCESS.DELETE,
    };
  } catch (error) {
    console.error("error delete supplier : ", error);
    return {
      ok: false,
      message: LABEL.ERROR.SERVER,
    };
  }
};
