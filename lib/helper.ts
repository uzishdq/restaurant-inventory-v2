import { ArrowRightLeft, Database, Files, PackagePlus } from "lucide-react";
import { ROUTE_TITLES, ROUTES } from "./constant";
import { prefixProcurementType, roleType, typeItems } from "./type/type.helper";

export function getPageTitle(pathname: string): string {
  const title =
    ROUTE_TITLES.find((r) => r.pattern.test(pathname))?.title ?? "Page";

  return title;
}

export function getFilteredNav(role?: roleType) {
  // Kalau belum login atau role undefined → return kosong
  if (!role) {
    return [];
  }

  const navMain = [
    {
      title: "Master",
      url: "#",
      icon: Database,
      items: [
        {
          title: "Kategori",
          url: ROUTES.AUTH.MASTER.CATEGORY,
        },
        {
          title: "Unit",
          url: ROUTES.AUTH.MASTER.UNIT,
        },
        {
          title: "Bahan Baku",
          url: ROUTES.AUTH.MASTER.ITEMS,
        },
        {
          title: "User",
          url: ROUTES.AUTH.MASTER.USERS,
        },
        {
          title: "Supplier",
          url: ROUTES.AUTH.MASTER.SUPPLIER,
        },
      ],
    },
    {
      title: "Pengadaan",
      url: "#",
      icon: PackagePlus,
      items: [
        {
          title: "Pengajuan Pembelian",
          url: ROUTES.AUTH.PROCUREMENT.INDEX,
        },
      ],
    },
    {
      title: "Transaksi",
      url: "#",
      icon: ArrowRightLeft,
      items: [
        {
          title: "Cek Bahan Baku",
          url: ROUTES.AUTH.TRANSACTION.INVENTORY_CHECK.INDEX,
        },
        {
          title: "Pengadaan Bahan Baku",
          url: ROUTES.AUTH.TRANSACTION.STOCK_IN.INDEX,
        },
        {
          title: "Bahan Baku Keluar",
          url: ROUTES.AUTH.TRANSACTION.STOCK_OUT.INDEX,
        },
        {
          title: "Pergerakan Bahan Baku",
          url: ROUTES.AUTH.TRANSACTION.MOVEMENT,
        },
      ],
    },
    {
      title: "Laporan",
      url: "#",
      icon: Files,
      items: [
        {
          title: "Transaksi",
          url: ROUTES.AUTH.REPORT.TRANSACTION,
        },
        {
          title: "Bahan Baku",
          url: ROUTES.AUTH.REPORT.ITEM,
        },
      ],
    },
  ];

  // SUPER_ADMIN & ADMIN → boleh semua
  if (role === "SUPER_ADMIN" || role === "ADMIN") {
    return navMain;
  }

  // HEADKITCHEN & KITCHEN → hilangkan Master
  if (role === "HEADKITCHEN" || role === "KITCHEN") {
    return navMain.filter((nav) => nav.title !== "Master");
  }

  // MANAGER → hanya Laporan + (opsional: Account/Notification kalau ada di sidebar)
  if (role === "MANAGER") {
    return navMain.filter((nav) => nav.title === "Laporan");
  }

  // Default: kosong kalau role tidak dikenal
  return [];
}

export function formatDateWIB(value?: Date | string | null): string {
  if (!value) return "—";

  const date = value instanceof Date ? value : new Date(value);

  const formatter = new Intl.DateTimeFormat("id-ID", {
    timeZone: "Asia/Jakarta",
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });
  const formatted = formatter.format(date);

  return `${formatted} WIB`;
}

const prefixItemId: Record<typeItems, string> = {
  RAW_MATERIAL: "BB-RW-",
  WORK_IN_PROGRESS: "BB-WP-",
  FINISHED_GOOD: "BB-FG-",
};

interface IGenerateItemId {
  previousId: string | null;
  type: typeItems;
  digitLength?: number;
}

export function generateItemId({
  previousId,
  type,
  digitLength = 3,
}: IGenerateItemId): string {
  const prefix = prefixItemId[type];

  if (!prefix) {
    throw new Error(`Tipe tidak dikenal: ${type}`);
  }

  if (!previousId) {
    return prefix + "1".padStart(digitLength, "0");
  }
  if (!previousId.startsWith(prefix)) {
    throw new Error(
      `ID sebelumnya tidak sesuai prefix untuk tipe ${type}. Diharapkan dimulai dengan "${prefix}", tapi dapat: "${previousId}"`,
    );
  }

  const numberPart = previousId.slice(prefix.length);
  const currentNumber = Number.parseInt(numberPart, 10);

  if (Number.isNaN(currentNumber) || currentNumber < 1) {
    throw new Error(`Format nomor pada ID tidak valid: ${previousId}`);
  }

  const nextNumber = currentNumber + 1;
  const padded = nextNumber.toString().padStart(digitLength, "0");

  return prefix + padded;
}

export function generateProcurementId(
  prefix: prefixProcurementType,
  lastId: string | null,
  padLength = 4,
): string {
  const normalizedPrefix = prefix.endsWith("-") ? prefix : `${prefix}-`;

  if (!lastId) {
    return `${normalizedPrefix}${"1".padStart(padLength, "0")}`;
  }

  const numberPart = lastId.replace(normalizedPrefix, "");
  const currentNumber = Number.parseInt(numberPart, 10);

  const nextNumber = currentNumber + 1;

  const nextId = `${normalizedPrefix}${nextNumber
    .toString()
    .padStart(padLength, "0")}`;

  return nextId;
}

export function isProcurementId(id: string) {
  return /^(PR|PO|GR)-\d{4}$/.test(id);
}
