import type { typeItems } from "./type.helper";

export type TProductionMaterial = {
  idProductionMaterial: string;
  itemId: string;
  itemName: string;
  unitName: string | null;
  qtyRequired: string;
  qtyUsed: string;
};

export type TProductionRecord = {
  idProductionRecord: string;
  producedBy: string;
  producerName: string;
  qtyProduced: string;
  notes: string | null;
  createdAt: Date;
};

export type TProductionOrder = {
  idProductionOrder: string;
  procurementId: string;
  itemId: string;
  itemName: string;
  itemType: typeItems;
  categoryName: string | null;
  unitName: string | null;
  qtyTarget: string;
  qtyProduced: string;
  status: string;
  scheduledDate: Date | null;
  completedDate: Date | null;
  notes: string | null;
  createdAt: Date;
  materials: TProductionMaterial[];
  records: TProductionRecord[];
  progressPercentage: number; // qtyProduced / qtyTarget * 100
};
