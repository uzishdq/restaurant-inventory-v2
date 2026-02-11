"use server";

import z from "zod";
import { signIn } from "@/auth";
import { LABEL, ROUTES } from "@/lib/constant";
import { LoginSchema } from "@/lib/validation/auth-validation";
import { AuthError } from "next-auth";

type LoginResult = {
  ok: boolean;
  message: string;
};

export const login = async (
  values: z.infer<typeof LoginSchema>,
): Promise<LoginResult> => {
  try {
    const parsed = LoginSchema.safeParse(values);
    if (!parsed.success) {
      return {
        ok: false,
        message: LABEL.ERROR.INVALID_FIELD,
      };
    }

    await signIn("credentials", {
      redirect: false,
      username: parsed.data.username,
      password: parsed.data.password,
      redirectTo: ROUTES.AUTH.DASHBOARD,
    });

    return {
      ok: true,
      message: LABEL.LOG_IN.SUCCESS,
    };
  } catch (error) {
    console.error("Login action error:", error);

    if (error instanceof AuthError) {
      switch (error.type) {
        case "CredentialsSignin":
          return {
            ok: false,
            message: LABEL.LOG_IN.FAILED || "Username atau password salah.",
          };
        case "CallbackRouteError":
          // Ini sering muncul kalau authorize throw atau internal error
          return {
            ok: false,
            message:
              "Terjadi kesalahan internal. Coba lagi atau hubungi admin.",
          };
        default:
          return {
            ok: false,
            message: error.message || LABEL.ERROR.DATA_NOT_FOUND,
          };
      }
    }

    // Error lain (bukan Auth.js)
    return {
      ok: false,
      message: LABEL.ERROR.SERVER,
    };
  }
};
