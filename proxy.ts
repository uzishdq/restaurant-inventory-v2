// proxy.ts (di root project)
import { auth } from "@/auth"; // atau "./auth"
import { NextResponse, type NextRequest } from "next/server";
import { roleType } from "./lib/type/type.helper";
import { ROUTES } from "./lib/constant";

// Helper untuk cek akses berdasarkan role & pathname
function hasAccess(role: roleType | undefined, pathname: string): boolean {
  if (!role) return false;

  // SUPER_ADMIN & ADMIN → full access
  if (role === "SUPER_ADMIN" || role === "ADMIN") {
    return true;
  }

  // HEADKITCHEN & KITCHEN → boleh semua kecuali MASTER
  if (role === "HEADKITCHEN" || role === "KITCHEN") {
    const masterPaths = [
      ROUTES.AUTH.MASTER.USERS,
      ROUTES.AUTH.MASTER.SUPPLIER,
      ROUTES.AUTH.MASTER.ITEMS,
      ROUTES.AUTH.MASTER.UNIT,
      ROUTES.AUTH.MASTER.CATEGORY,
    ];

    return !masterPaths.some((path) => pathname.startsWith(path));
  }

  // MANAGER → hanya REPORT + ACCOUNT + NOTIFICATION + DASHBOARD
  if (role === "MANAGER") {
    const allowedPrefixes = [
      ROUTES.AUTH.REPORT.TRANSACTION,
      ROUTES.AUTH.REPORT.ITEM,
      ROUTES.AUTH.ACCOUNT,
      ROUTES.AUTH.NOTIFICATION,
      ROUTES.AUTH.DASHBOARD,
    ];

    return allowedPrefixes.some(
      (prefix) =>
        pathname === prefix ||
        pathname.startsWith(prefix + "/") ||
        pathname.startsWith(prefix + "?"),
    );
  }

  return false;
}

export default async function proxy(request: NextRequest) {
  const session = await auth();

  const { pathname } = request.nextUrl;

  // Public routes → boleh semua (termasuk login page & api/auth/*)
  if (
    pathname === ROUTES.PUBLIC.LOGIN ||
    pathname.startsWith("/api/auth") ||
    pathname.startsWith("/_next") || // penting untuk static assets
    pathname.startsWith("/static") // kalau ada
  ) {
    return NextResponse.next();
  }

  // Belum login → redirect ke login
  if (!session?.user) {
    const loginUrl = new URL(ROUTES.PUBLIC.LOGIN, request.url);
    loginUrl.searchParams.set("callbackUrl", pathname); // optional: redirect balik setelah login
    return NextResponse.redirect(loginUrl);
  }

  // Cek role access
  const role = session.user.role as roleType | undefined;
  if (!hasAccess(role, pathname)) {
    // Redirect ke unauthorized atau dashboard (sesuaikan)
    const unauthorizedUrl = new URL("/unauthorized", request.url); // atau ke /dashboard
    return NextResponse.redirect(unauthorizedUrl);
  }

  // Lolos semua → lanjutkan request
  return NextResponse.next();
}

// Matcher: hanya jalankan proxy untuk route yang perlu dilindungi
export const config = {
  matcher: [
    "/dashboard/:path*",
    "/master/:path*",
    "/transaction/:path*",
    "/report/:path*",
    // tambah route lain kalau perlu
  ],
};
