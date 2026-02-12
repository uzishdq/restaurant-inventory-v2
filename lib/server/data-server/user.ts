"use server";

import { CACHE_TAGS } from "@/lib/constant";
import { db } from "@/lib/db";
import { userTable } from "@/lib/db/schema";
import { TUser } from "@/lib/type/type.user";
import { LoginSchema } from "@/lib/validation/auth-validation";
import { IdSchema } from "@/lib/validation/validation-helper";
import bcrypt from "bcryptjs";
import { asc, eq } from "drizzle-orm";
import { unstable_cache } from "next/cache";
import z from "zod";

export const isUser = async (values: z.infer<typeof LoginSchema>) => {
  try {
    const validateValues = LoginSchema.safeParse(values);

    if (!validateValues.success) {
      return null;
    }

    const [user] = await db
      .select()
      .from(userTable)
      .where(eq(userTable.username, validateValues.data.username))
      .limit(1);

    if (!user) return null;

    const isValid = await bcrypt.compare(
      validateValues.data.password,
      user.password,
    );

    if (!isValid) {
      return null;
    }

    const { password: _password, ...userWithoutPass } = user;

    return userWithoutPass as TUser;
  } catch (error) {
    console.error("error validate user : ", error);
    return null;
  }
};

export const getUserList = unstable_cache(
  async () => {
    try {
      const result = await db
        .select({
          idUser: userTable.idUser,
          name: userTable.name,
          username: userTable.username,
          phone: userTable.phone,
          role: userTable.role,
          createdAt: userTable.createdAt,
        })
        .from(userTable)
        .orderBy(asc(userTable.createdAt));

      if (result.length > 0) {
        return { ok: true, data: result as TUser[] };
      } else {
        return { ok: true, data: [] as TUser[] };
      }
    } catch (error) {
      console.error("error user data : ", error);
      return { ok: false, data: null };
    }
  },
  ["get-user"],
  {
    tags: [CACHE_TAGS.master.user.list],
    revalidate: 3600,
  },
);

export const getUserById = unstable_cache(
  async (idUser: string) => {
    try {
      const validateValues = IdSchema.safeParse({ id: idUser });

      if (!validateValues.success) {
        return { ok: false, data: null };
      }

      const [result] = await db
        .select({
          idUser: userTable.idUser,
          username: userTable.username,
          name: userTable.name,
          phone: userTable.phone,
          role: userTable.role,
          createdAt: userTable.createdAt,
        })
        .from(userTable)
        .where(eq(userTable.idUser, idUser))
        .limit(1);

      if (result) {
        return { ok: true, data: result as TUser };
      } else {
        return { ok: true, data: null };
      }
    } catch (error) {
      console.error("error user detail : ", error);
      return { ok: false, data: null };
    }
  },
  ["get-detail-user"],
  {
    tags: [CACHE_TAGS.master.user.detail],
    revalidate: 3600,
  },
);
