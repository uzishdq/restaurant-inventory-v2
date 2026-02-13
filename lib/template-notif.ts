import {
  TPurchaseNotif,
  TUserProcurementNotif,
  TUserPurchaseStatusNotif,
  TUserReceiptNotif,
} from "./type/type.notification";

// Existing template for supplier
export const templatePurchaseRequest = (props: TPurchaseNotif) => {
  return `*Pemberitahuan Pesanan*

Bapak/Ibu ${props.nameSupplier}  
di ${props.store_name}

Kami ingin memesan beberapa produk berikut:
${props.items.map((i) => `- ${i.nameItem} - ${i.qty} ${i.nameUnit}`).join("\n")}

Mohon konfirmasi ketersediaan dan waktu pengiriman.

Terima kasih.`;
};

// 🔥 NEW: Template when procurement is approved
export const templateProcurementApproved = (props: TUserProcurementNotif) => {
  return `*Pengadaan Disetujui* ✅

Halo ${props.userName},

Pengadaan *${props.procurementId}* telah disetujui dan Purchase Order telah dibuat:

${props.purchaseOrders
  .map(
    (po) => `📦 *${po.purchaseId}*
Supplier: ${po.supplierName}
Item:
${po.items.map((item) => `  • ${item.nameItem} - ${item.qty} ${item.nameUnit}`).join("\n")}`,
  )
  .join("\n\n")}

*Total:*
- ${props.totalSuppliers} supplier
- ${props.totalItems} item

Purchase order sedang dikirim ke supplier.`;
};

// 🔥 NEW: Template when supplier responds to PO
export const templatePurchaseStatusUpdate = (
  props: TUserPurchaseStatusNotif,
) => {
  const statusText = {
    APPROVED: "✅ *Disetujui*",
    REJECTED: "❌ *Ditolak*",
    DELIVERED: "🚚 *Dikirim*",
  };

  return `*Update Purchase Order*

Halo ${props.userName},

Purchase Order *${props.purchaseId}* dari ${props.supplierName}:

Status: ${statusText[props.status]}

Item:
${props.items.map((i) => `- ${i.nameItem} - ${i.qty} ${i.nameUnit}`).join("\n")}

${props.notes ? `\nCatatan:\n${props.notes}` : ""}

${props.status === "APPROVED" ? "\nBarang akan segera dikirim." : ""}
${props.status === "REJECTED" ? "\nSilakan hubungi supplier untuk informasi lebih lanjut." : ""}
${props.status === "DELIVERED" ? "\nSilakan lakukan penerimaan barang di sistem." : ""}`;
};

// 🔥 NEW: Template when goods are received
export const templateGoodsReceived = (props: TUserReceiptNotif) => {
  return `*Barang Diterima* ✅

Halo ${props.userName},

Penerimaan barang telah dicatat:

*No. Penerimaan:* ${props.receiptId}
*Purchase Order:* ${props.purchaseId}
*Supplier:* ${props.supplierName}
*Tanggal Terima:* ${props.receivedDate}
*Total Item:* ${props.totalItems}

Barang telah masuk ke gudang dan siap digunakan.`;
};

// 🔥 NEW: Template for procurement request (Kitchen to Admin)
export const templateProcurementRequest = (props: {
  adminName: string;
  requestedBy: string;
  procurementId: string;
  totalItems: number;
  urgency: "NORMAL" | "URGENT";
}) => {
  return `*Permintaan Pengadaan* ${props.urgency === "URGENT" ? "🔴" : "🟡"}

Halo ${props.adminName},

Permintaan pengadaan baru dari *${props.requestedBy}*:

*No. Pengadaan:* ${props.procurementId}
*Total Item:* ${props.totalItems}
*Prioritas:* ${props.urgency === "URGENT" ? "MENDESAK ⚠️" : "Normal"}

${props.urgency === "URGENT" ? "Mohon segera ditindaklanjuti." : "Silakan review dan proses pengadaan ini."}`;
};

// 🔥 NEW: Template for low stock alert
export const templateLowStockAlert = (props: {
  userName: string;
  items: Array<{
    nameItem: string;
    currentStock: number;
    minStock: number;
    unit: string;
  }>;
}) => {
  return `*Peringatan Stok Menipis* ⚠️

Halo ${props.userName},

Beberapa bahan baku stoknya menipis:

${props.items
  .map(
    (i) =>
      `- ${i.nameItem}: ${i.currentStock} ${i.unit} (min: ${i.minStock} ${i.unit})`,
  )
  .join("\n")}

Silakan segera lakukan pengadaan.`;
};
