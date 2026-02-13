// lib/type/type.notification.ts

// Existing type for supplier
export type TPurchaseNotif = {
  nameSupplier: string;
  store_name: string;
  items: Array<{
    nameItem: string;
    qty: string;
    nameUnit: string;
  }>;
};

// 🔥 NEW: Type for user notifications
export type TUserProcurementNotif = {
  userName: string;
  procurementId: string;
  totalSuppliers: number;
  totalItems: number;
  purchaseOrders: Array<{
    purchaseId: string;
    supplierName: string;
    itemCount: number;
    items: Array<{
      nameItem: string;
      qty: string;
      nameUnit: string;
    }>;
  }>;
};

export type TUserPurchaseStatusNotif = {
  userName: string;
  purchaseId: string;
  supplierName: string;
  status: "APPROVED" | "REJECTED" | "DELIVERED";
  items: Array<{
    nameItem: string;
    qty: number;
    nameUnit: string;
  }>;
  notes?: string;
};

export type TUserReceiptNotif = {
  userName: string;
  receiptId: string;
  purchaseId: string;
  supplierName: string;
  totalItems: number;
  receivedDate: string;
};
