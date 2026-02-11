//ENUM
export type roleType =
  | "SUPER_ADMIN"
  | "ADMIN"
  | "HEADKITCHEN"
  | "KITCHEN"
  | "MANAGER";

export type FormMode = "create" | "edit";

export type RoleGroup = "ADMIN_ONLY" | "KITCHEN_ONLY" | "MANAGEMENT" | "ALL";

export type typeItems = "RAW_MATERIAL" | "WORK_IN_PROGRESS" | "FINISHED_GOOD";

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
