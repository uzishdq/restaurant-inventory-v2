"use server";

import z from "zod";

import {
  CreateCategoriesSchema,
  UpdateCategoriesSchema,
} from "@/lib/validation/master-validation";
import { LABEL, ROUTES } from "@/lib/constant";
import { db } from "@/lib/db";
import { invalidateCategories } from "../data-server/revalidate";
import { revalidatePath } from "next/cache";
import { requireRole } from "./req-role";
import { eq } from "drizzle-orm";
import { IdSchema } from "@/lib/validation/validation-helper";
import { categoryTable } from "@/lib/db/schema";

export const createCategories = async (
  values: z.infer<typeof CreateCategoriesSchema>,
) => {
  try {
    const validateValues = CreateCategoriesSchema.safeParse(values);

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
      .insert(categoryTable)
      .values({ name: validateValues.data.name })
      .returning();

    if (!result) {
      return {
        ok: false,
        message: LABEL.INPUT.FAILED.SAVED,
      };
    }

    invalidateCategories();
    revalidatePath(ROUTES.AUTH.MASTER.CATEGORY);

    return {
      ok: true,
      message: LABEL.INPUT.SUCCESS.SAVED,
    };
  } catch (error) {
    console.error("error create categories : ", error);
    return {
      ok: false,
      message: LABEL.ERROR.SERVER,
    };
  }
};

export const updateCategories = async (
  values: z.infer<typeof UpdateCategoriesSchema>,
) => {
  try {
    const validateValues = UpdateCategoriesSchema.safeParse(values);

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
      .update(categoryTable)
      .set({ name: validateValues.data.name })
      .where(eq(categoryTable.idCategory, validateValues.data.id))
      .returning();

    if (!result) {
      return {
        ok: false,
        message: LABEL.INPUT.FAILED.UPDATE,
      };
    }

    invalidateCategories();
    revalidatePath(ROUTES.AUTH.MASTER.CATEGORY);

    return {
      ok: true,
      message: LABEL.INPUT.SUCCESS.UPDATE,
    };
  } catch (error) {
    console.error("error update categories : ", error);
    return {
      ok: false,
      message: LABEL.ERROR.SERVER,
    };
  }
};

export const deleteCategories = async (values: z.infer<typeof IdSchema>) => {
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
      .delete(categoryTable)
      .where(eq(categoryTable.idCategory, validateValues.data.id))
      .returning();

    if (!result) {
      return {
        ok: false,
        message: LABEL.INPUT.FAILED.DELETE,
      };
    }

    invalidateCategories();
    revalidatePath(ROUTES.AUTH.MASTER.CATEGORY);

    return {
      ok: true,
      message: LABEL.INPUT.SUCCESS.DELETE,
    };
  } catch (error) {
    console.error("error delete categories : ", error);
    return {
      ok: false,
      message: LABEL.ERROR.SERVER,
    };
  }
};
