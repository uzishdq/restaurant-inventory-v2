"use server";

import z from "zod";

import {
  CreateUnitSchema,
  UpdateUnitSchema,
} from "@/lib/validation/master-validation";
import { LABEL, ROUTES } from "@/lib/constant";
import { db } from "@/lib/db";
import { unitTable } from "@/lib/db/schema";
import { invalidateUnit } from "../data-server/revalidate";
import { revalidatePath } from "next/cache";
import { requireRole } from "./req-role";
import { eq } from "drizzle-orm";
import { IdSchema } from "@/lib/validation/validation-helper";

export const createUnit = async (values: z.infer<typeof CreateUnitSchema>) => {
  try {
    const validateValues = CreateUnitSchema.safeParse(values);

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
      .insert(unitTable)
      .values({ name: validateValues.data.name })
      .returning();

    if (!result) {
      return {
        ok: false,
        message: LABEL.INPUT.FAILED.SAVED,
      };
    }

    invalidateUnit();
    revalidatePath(ROUTES.AUTH.MASTER.UNIT);

    return {
      ok: true,
      message: LABEL.INPUT.SUCCESS.SAVED,
    };
  } catch (error) {
    console.error("error create unit : ", error);
    return {
      ok: false,
      message: LABEL.ERROR.SERVER,
    };
  }
};

export const updateUnit = async (values: z.infer<typeof UpdateUnitSchema>) => {
  try {
    const validateValues = UpdateUnitSchema.safeParse(values);

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
      .update(unitTable)
      .set({ name: validateValues.data.name })
      .where(eq(unitTable.idUnit, validateValues.data.id))
      .returning();

    if (!result) {
      return {
        ok: false,
        message: LABEL.INPUT.FAILED.UPDATE,
      };
    }

    invalidateUnit();
    revalidatePath(ROUTES.AUTH.MASTER.UNIT);

    return {
      ok: true,
      message: LABEL.INPUT.SUCCESS.UPDATE,
    };
  } catch (error) {
    console.error("error update unit : ", error);
    return {
      ok: false,
      message: LABEL.ERROR.SERVER,
    };
  }
};

export const deleteUnit = async (values: z.infer<typeof IdSchema>) => {
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
      .delete(unitTable)
      .where(eq(unitTable.idUnit, validateValues.data.id))
      .returning();

    if (!result) {
      return {
        ok: false,
        message: LABEL.INPUT.FAILED.DELETE,
      };
    }

    invalidateUnit();
    revalidatePath(ROUTES.AUTH.MASTER.UNIT);

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
