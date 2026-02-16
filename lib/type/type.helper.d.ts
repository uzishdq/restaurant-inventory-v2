//ENUM
export type roleType =
  | "SUPER_ADMIN"
  | "ADMIN"
  | "HEADKITCHEN"
  | "KITCHEN"
  | "MANAGER";

export type prefixProcurementType = "PR" | "PO" | "GR";

export type FormMode = "create" | "edit";

export type RoleGroup =
  | "ADMIN_ONLY"
  | "KITCHEN_ONLY"
  | "ADMIN_KITCHEN"
  | "MANAGEMENT"
  | "ALL";

export type typeItems = "RAW_MATERIAL" | "WORK_IN_PROGRESS" | "FINISHED_GOOD";

type typeGetItem = typeItems | "ALL";

export type statusProcurement =
  | "DRAFT"
  | "ON_PROGRESS"
  | "COMPLETED"
  | "CANCELLED";

export type statusPurchase =
  | "DRAFT"
  | "SENT"
  | "RECEIVED"
  | "COMPLETED"
  | "CANCELLED";

export type typeTransactionType =
  | "PURCHASE"
  | "PRODUCTION"
  | "SALES"
  | "ADJUSTMENT";

export type statusTransaction = "PENDING" | "COMPLETED" | "CANCELLED";

export type typeMovement = "IN" | "OUT";

export type stockStatus = "OUT_OF_STOCK" | "LOW_STOCK" | "SUFFICIENT";
