"use server";

import { db } from "@/lib/db";
import {
  createProcurementSchema,
  type CreateProcurementValues,
} from "@/lib/validation/procurement-validation";
import { LABEL } from "@/lib/constant";
import { requireRole } from "./req-role";

export const createProcurement = async (values: CreateProcurementValues) => {
  try {
    const validated = createProcurementSchema.safeParse(values);

    if (!validated.success) {
      return { ok: false, message: LABEL.ERROR.INVALID_FIELD };
    }

    const authResult = await requireRole("KITCHEN_ONLY");

    if (!authResult.ok || !authResult.session) {
      return { ok: false, message: authResult.message };
    }

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
