"use server";

import { auth } from "@/auth";
import { LABEL, ROLE_GROUP } from "@/lib/constant";
import { RoleGroup, roleType } from "@/lib/type/type.helper";

function isAllowedRole(role: roleType | undefined, group: RoleGroup): boolean {
  return role ? ROLE_GROUP[group].includes(role) : false;
}

export async function requireRole(group: RoleGroup) {
  const session = await auth();

  if (!session?.user?.id) {
    return { ok: false, message: LABEL.ERROR.NOT_LOGIN };
  }

  if (!isAllowedRole(session.user.role as roleType, group)) {
    return { ok: false, message: LABEL.ERROR.UNAUTHORIZED };
  }

  return { ok: true, session, message: LABEL.SUCCESS.AUTH };
}
