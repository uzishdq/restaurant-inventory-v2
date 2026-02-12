import {
  AccountForm,
  AccountResetPassword,
  AccountResetUsername,
} from "@/components/form/user-form";
import { RenderError } from "@/components/render-error";
import { LABEL } from "@/lib/constant";
import { requireRole } from "@/lib/server/action-server/req-role";
import { getUserById } from "@/lib/server/data-server/user";
import React from "react";

export default async function AccountPage() {
  const authResult = await requireRole("ALL");

  if (!authResult.ok || !authResult.session) {
    return RenderError(authResult.message);
  }

  const result = await getUserById(authResult.session.user.id);

  if (!result.ok || !result.data) {
    return RenderError(LABEL.ERROR.DESCRIPTION);
  }

  return (
    <section className="space-y-4">
      <AccountForm data={result.data} />
      <AccountResetUsername />
      <AccountResetPassword />
    </section>
  );
}
