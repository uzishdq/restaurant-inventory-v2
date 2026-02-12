"use server";

import z from "zod";

import {
  CreateAccountSchema,
  PasswordUpdateSchema,
  ProfileUpdateSchema,
  RoleUpdateSchema,
  UsernameUpdateSchema,
} from "@/lib/validation/master-validation";
import { LABEL, ROUTES } from "@/lib/constant";
import { db } from "@/lib/db";
import { userTable } from "@/lib/db/schema";
import { invalidateUser } from "../data-server/revalidate";
import { revalidatePath } from "next/cache";
import { requireRole } from "./req-role";
import { eq, or } from "drizzle-orm";
import bcrypt from "bcryptjs";

export const createUser = async (
  values: z.infer<typeof CreateAccountSchema>,
) => {
  try {
    const validateValues = CreateAccountSchema.safeParse(values);

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

    const [isExisting] = await db
      .select({
        username: userTable.username,
        phone: userTable.phone,
      })
      .from(userTable)
      .where(
        or(
          eq(userTable.username, validateValues.data.username),
          eq(userTable.phone, validateValues.data.phone),
        ),
      )
      .limit(1);

    if (isExisting) {
      if (isExisting.username === validateValues.data.username) {
        return {
          ok: false,
          message: "Username sudah digunakan. Silakan pilih username lain.",
        };
      }
      if (isExisting.phone === validateValues.data.phone) {
        return {
          ok: false,
          message: "Nomor telepon sudah terdaftar.",
        };
      }
    }

    // Hash password
    const hashedPassword = await bcrypt.hash("gangnikmat", 10);

    const [result] = await db
      .insert(userTable)
      .values({
        name: validateValues.data.name,
        username: validateValues.data.username,
        password: hashedPassword,
        phone: validateValues.data.phone,
        role: validateValues.data.role,
      })
      .returning();

    //nanti tambah notifikasi ke new user
    if (!result) {
      return {
        ok: false,
        message: LABEL.INPUT.FAILED.SAVED,
      };
    }

    invalidateUser();
    revalidatePath(ROUTES.AUTH.MASTER.USERS);

    return {
      ok: true,
      message: LABEL.INPUT.SUCCESS.SAVED,
    };
  } catch (error) {
    console.error("error create user : ", error);
    return {
      ok: false,
      message: LABEL.ERROR.SERVER,
    };
  }
};

export const updateRole = async (values: z.infer<typeof RoleUpdateSchema>) => {
  try {
    const validateValues = RoleUpdateSchema.safeParse(values);

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
      .update(userTable)
      .set({ role: validateValues.data.role })
      .where(eq(userTable.idUser, validateValues.data.id))
      .returning();

    if (!result) {
      return {
        ok: false,
        message: LABEL.INPUT.FAILED.UPDATE,
      };
    }

    invalidateUser();
    revalidatePath(ROUTES.AUTH.MASTER.USERS);

    return {
      ok: true,
      message: LABEL.INPUT.SUCCESS.UPDATE,
    };
  } catch (error) {
    console.error("error update role : ", error);
    return {
      ok: false,
      message: LABEL.ERROR.SERVER,
    };
  }
};

export const updateAccount = async (
  values: z.infer<typeof ProfileUpdateSchema>,
) => {
  try {
    const validateValues = ProfileUpdateSchema.safeParse(values);

    if (!validateValues.success) {
      return { ok: false, message: LABEL.ERROR.INVALID_FIELD };
    }

    const authResult = await requireRole("ALL");

    if (!authResult.ok || !authResult.session) {
      return {
        ok: false,
        message: authResult.message,
      };
    }

    const [result] = await db
      .update(userTable)
      .set({
        name: validateValues.data.name,
        phone: validateValues.data.phone,
      })
      .where(eq(userTable.idUser, authResult.session.user.id))
      .returning();

    if (!result) {
      return {
        ok: false,
        message: LABEL.INPUT.FAILED.UPDATE,
      };
    }

    invalidateUser();
    revalidatePath(ROUTES.AUTH.ACCOUNT.INDEX);

    return {
      ok: true,
      message: LABEL.INPUT.SUCCESS.UPDATE,
    };
  } catch (error) {
    console.error("error update account : ", error);
    return {
      ok: false,
      message: LABEL.ERROR.SERVER,
    };
  }
};

export const updateUsername = async (
  values: z.infer<typeof UsernameUpdateSchema>,
) => {
  try {
    const validateValues = UsernameUpdateSchema.safeParse(values);

    if (!validateValues.success) {
      return { ok: false, message: LABEL.ERROR.INVALID_FIELD };
    }

    const authResult = await requireRole("ALL");

    if (!authResult.ok || !authResult.session) {
      return {
        ok: false,
        message: authResult.message,
      };
    }

    const [isExisting] = await db
      .select({ username: userTable.username })
      .from(userTable)
      .where(eq(userTable.username, validateValues.data.newUsername))
      .limit(1);

    if (isExisting) {
      return {
        ok: false,
        message: "Username sudah digunakan. Silakan pilih username lain.",
      };
    }

    if (authResult.session.user.email !== validateValues.data.oldUsername) {
      return {
        ok: false,
        message: "Username saat ini tidak sesuai dengan catatan kami.",
      };
    }

    const [result] = await db
      .update(userTable)
      .set({
        username: validateValues.data.newUsername,
      })
      .where(eq(userTable.idUser, authResult.session.user.id))
      .returning();

    if (!result) {
      return {
        ok: false,
        message: LABEL.INPUT.FAILED.UPDATE,
      };
    }

    invalidateUser();
    revalidatePath(ROUTES.AUTH.ACCOUNT.INDEX);

    return {
      ok: true,
      message: LABEL.INPUT.SUCCESS.UPDATE,
    };
  } catch (error) {
    console.error("error update username : ", error);
    return {
      ok: false,
      message: LABEL.ERROR.SERVER,
    };
  }
};

export const updatePassword = async (
  values: z.infer<typeof PasswordUpdateSchema>,
) => {
  try {
    const validateValues = PasswordUpdateSchema.safeParse(values);

    if (!validateValues.success) {
      return { ok: false, message: LABEL.ERROR.INVALID_FIELD };
    }

    const authResult = await requireRole("ALL");

    if (!authResult.ok || !authResult.session) {
      return {
        ok: false,
        message: authResult.message,
      };
    }

    const { oldPassword, newPassword } = validateValues.data;

    const [user] = await db
      .select({
        password: userTable.password,
      })
      .from(userTable)
      .where(eq(userTable.idUser, authResult.session.user.id))
      .limit(1);

    if (!user) {
      return {
        ok: false,
        message: LABEL.ERROR.SERVER,
      };
    }

    const [isMatchPrev, isSameAsOld, newHashedPassword] = await Promise.all([
      bcrypt.compare(oldPassword, user.password), // Apakah password lama cocok?
      bcrypt.compare(newPassword, user.password), // Apakah password baru sama?
      bcrypt.hash(newPassword, 10),
    ]);

    if (!isMatchPrev) {
      return {
        ok: false,
        message: "Password saat ini salah.",
      };
    }

    if (isSameAsOld) {
      return {
        ok: false,
        message: "Password baru harus berbeda dari password saat ini.",
      };
    }

    const result = await db
      .update(userTable)
      .set({ password: newHashedPassword })
      .where(eq(userTable.idUser, authResult.session.user.id))
      .returning();

    if (result.length > 0) {
      invalidateUser();
      revalidatePath(ROUTES.AUTH.ACCOUNT.INDEX);

      return {
        ok: true,
        message: "Reset password berhasil.",
      };
    } else {
      return {
        ok: false,
        message: "Reset password gagal.",
      };
    }
  } catch (error) {
    console.error("error update password : ", error);
    return {
      ok: false,
      message: LABEL.ERROR.SERVER,
    };
  }
};
