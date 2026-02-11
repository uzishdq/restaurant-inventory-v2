import { statusProcurement, statusPurchase, typeItems } from "./type.helper";

export type TPurchase = {
  idPurchase: string;
  procurementId: string;
  supplierId: string;
  supplierName: string;
  status: statusPurchase;
  createdAt: Date;
  items: TPurchaseItem[];
};

export type TProcurement = {
  idProcurement: string;
  requestedBy: string;
  requesterName: string;
  status: statusProcurement;
  createdAt: Date;
  purchases: TPurchase[];
};

export type TPurchaseItem = {
  idPurchaseItem: string;
  purchaseId: string;
  itemId: string;
  itemName: string;
  unitName: string;
  type: typeItems;
  qtyOrdered: string;
};

export type TGoodsReceipt = {
  idReceipt: string;
  purchaseId: string;
  receivedBy: string;
  receiverName: string;
  createdAt: Date;
  items: TGoodsReceiptItem[];
  purchase: {
    idPurchase: string;
    supplierName: string;
  };
};

export type TGoodsReceiptItem = {
  idReceiptItem: string;
  receiptId: string;
  itemId: string;
  itemName: string;
  unitName: string;
  qtyReceived: string;
  qtyDamaged: string;
  qtyOrdered?: string;
};
