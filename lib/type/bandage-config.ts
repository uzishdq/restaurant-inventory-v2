import {
  roleType,
  statusProcurement,
  statusPurchase,
  statusTransaction,
  stockStatus,
  typeItems,
  typeMovement,
  typeTransactionType,
} from "./type.helper";

export type BadgeCategory =
  | "role"
  | "statusProcurement"
  | "purchaseStatus"
  | "typeItem"
  | "transactionStatus"
  | "movementType"
  | "transactionType"
  | "stockStatus";

export interface BadgeConfig {
  label: string;
  color: string;
}

// Use Record with explicit types
export const BADGE_CONFIG = {
  role: {
    SUPER_ADMIN: { label: "Super Admin", color: "bg-red-500" },
    ADMIN: { label: "Admin", color: "bg-gray-500" },
    MANAGER: { label: "Manager", color: "bg-blue-500" },
    HEADKITCHEN: { label: "Head Kitchen", color: "bg-yellow-500" },
    KITCHEN: { label: "Kitchen", color: "bg-orange-500" },
  } satisfies Record<roleType, BadgeConfig>,

  statusProcurement: {
    DRAFT: { label: "Draft", color: "bg-gray-500" },
    ON_PROGRESS: { label: "Dalam Proses", color: "bg-blue-500" },
    COMPLETED: { label: "Selesai", color: "bg-green-500" },
    CANCELLED: { label: "Dibatalkan", color: "bg-red-500" },
  } satisfies Record<statusProcurement, BadgeConfig>,

  purchaseStatus: {
    DRAFT: { label: "Draft", color: "bg-gray-500" },
    SENT: { label: "Terkirim", color: "bg-blue-500" },
    RECEIVED: { label: "Diterima", color: "bg-yellow-500" },
    COMPLETED: { label: "Selesai", color: "bg-green-500" },
    CANCELLED: { label: "Dibatalkan", color: "bg-red-500" },
  } satisfies Record<statusPurchase, BadgeConfig>,

  typeItem: {
    RAW_MATERIAL: { label: "Bahan Baku", color: "bg-orange-500" },
    WORK_IN_PROGRESS: { label: "Setengah Jadi", color: "bg-purple-500" },
    FINISHED_GOOD: { label: "Barang Jadi", color: "bg-green-500" },
  } satisfies Record<typeItems, BadgeConfig>,

  transactionStatus: {
    PENDING: { label: "Pending", color: "bg-yellow-500" },
    COMPLETED: { label: "Selesai", color: "bg-green-500" },
    CANCELLED: { label: "Dibatalkan", color: "bg-red-500" },
  } satisfies Record<statusTransaction, BadgeConfig>,

  movementType: {
    IN: { label: "Masuk", color: "bg-green-500" },
    OUT: { label: "Keluar", color: "bg-red-500" },
  } satisfies Record<typeMovement, BadgeConfig>,

  transactionType: {
    PURCHASE: { label: "Pembelian", color: "bg-blue-500" },
    PRODUCTION: { label: "Produksi", color: "bg-purple-500" },
    SALES: { label: "Penjualan", color: "bg-orange-500" },
    ADJUSTMENT: { label: "Penyesuaian", color: "bg-gray-500" },
  } satisfies Record<typeTransactionType, BadgeConfig>,

  stockStatus: {
    OUT_OF_STOCK: { label: "Habis", color: "bg-red-500" },
    LOW_STOCK: { label: "Rendah", color: "bg-yellow-500" },
    SUFFICIENT: { label: "Aman", color: "bg-green-500" },
  } satisfies Record<stockStatus, BadgeConfig>,
} as const;

// Helper function to get badge config safely
export function getBadgeConfig(
  category: BadgeCategory,
  value: string,
): BadgeConfig | null {
  const categoryConfig = BADGE_CONFIG[category];

  // Type-safe access
  if (value in categoryConfig) {
    return categoryConfig[value as keyof typeof categoryConfig] as BadgeConfig;
  }

  return null;
}
