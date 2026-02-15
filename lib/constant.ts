import { FormMode, RoleGroup, roleType } from "./type/type.helper";

export const ROUTES = {
  PUBLIC: {
    LOGIN: "/",
  },
  AUTH: {
    DASHBOARD: "/dashboard",
    ACCOUNT: {
      INDEX: "/account",
      NOTIFICATION: "/account/notification",
    },
    MASTER: {
      USERS: "/master/users",
      SUPPLIER: "/master/suppliers",
      ITEMS: "/master/items",
      UNIT: "/master/units",
      CATEGORY: "/master/categories",
    },
    TRANSACTION: {
      CREATE: "/transaction/create-transaction",
      MOVEMENT: "/transaction/movements",
      STOCK_IN: {
        INDEX: "/transaction/incoming-item",
        DETAIL: (id: string) => `/transaction/incoming-item/detail/${id}`,
      },
      STOCK_OUT: {
        INDEX: "/transaction/outgoing-item",
        DETAIL: (id: string) => `/transaction/outgoing-item/detail/${id}`,
      },
      INVENTORY_CHECK: {
        INDEX: "/transaction/inventory-check",
        DETAIL: (id: string) => `/transaction/inventory-check/detail/${id}`,
      },
    },
    PROCUREMENT: {
      INDEX: "/procurement",
      CREATE: "/procurement/create",
      UPDATE: (id: string) => `/procurement/update/${id}`,
      DETAIL: (id: string) => `/procurement/detail/${id}`,
    },
    PURCHASE: {
      INDEX: "/purchase",
      UPDATE: (id: string) => `/purchase/update/${id}`,
      DETAIL: (id: string) => `/purchase/detail/${id}`,
    },
    RECEIPT: {
      INDEX: "/receipt",
      DETAIL: (id: string) => `/receipt/detail/${id}`,
    },
    REPORT: {
      TRANSACTION: "/report/transaction",
      FIND_LAPORAN_TRANSACTION: (query: string) =>
        `/report/transaction?${query}`,
      ITEM: "/report/item",
      FIND_LAPORAN_ITEM: (query: string) => `/report/item?${query}`,
    },
  },
};

export const ROUTE_TITLES: { pattern: RegExp; title: string }[] = [
  // Public
  { pattern: /^\/$/, title: "Login" },

  // Dashboard
  { pattern: /^\/dashboard$/, title: "Dashboard" },

  // Master Data
  { pattern: /^\/master\/users$/, title: "Manajemen Pengguna" },
  { pattern: /^\/master\/suppliers$/, title: "Supplier" },
  { pattern: /^\/master\/items$/, title: "Bahan Baku" },
  { pattern: /^\/master\/units$/, title: "Satuan" },
  { pattern: /^\/master\/categories$/, title: "Kategori" },

  // Procurement
  {
    pattern: /^\/procurement\/create$/,
    title: "Pengajuan Pengadaan Bahan Baku",
  },
  {
    pattern: /^\/procurement\/update\/[^/]+$/,
    title: "Verifikasi Pengadaan Bahan Baku",
  },
  { pattern: /^\/procurement$/, title: "Pengadaan Bahan Baku" },
  {
    pattern: /^\/procurement\/detail\/[^/]+$/,
    title: "Detail Pengadaan",
  },

  //Receipt
  { pattern: /^\/receipt$/, title: "Penerimaan Bahan Baku" },
  { pattern: /^\/receipt\/detail\/[^/]+$/, title: "Detail Penerimaan" },

  // Purchase
  { pattern: /^\/purchase$/, title: "Pembelian Bahan Baku" },
  { pattern: /^\/purchase\/detail\/[^/]+$/, title: "Detail Pembelian" },
  { pattern: /^\/purchase\/update\/[^/]+$/, title: "Penerimaan Bahan Baku" },

  // Transaction
  { pattern: /^\/transaction\/create-transaction$/, title: "Buat Transaksi" },
  { pattern: /^\/transaction\/movements$/, title: "Pergerakan Bahan Baku" },

  // Stock Out
  {
    pattern: /^\/dashboard\/outgoing-item$/,
    title: "Bahan Baku Keluar",
  },
  {
    pattern: /^\/dashboard\/outgoing-item\/detail\/.+$/,
    title: "Detail Bahan Baku Keluar",
  },

  // Inventory Check
  {
    pattern: /^\/dashboard\/inventory-check$/,
    title: "Pemeriksaan Bahan Baku",
  },
  {
    pattern: /^\/dashboard\/inventory-check\/detail\/.+$/,
    title: "Detail Pemeriksaan Bahan Baku",
  },

  // Report
  {
    pattern: /^\/dashboard\/report-transaction$/,
    title: "Laporan Transaksi",
  },
  {
    pattern: /^\/dashboard\/report-item$/,
    title: "Laporan Bahan Baku",
  },

  // Account & Notification
  {
    pattern: /^\/account$/,
    title: "Akun Saya",
  },
  {
    pattern: /^\/account\/notification$/,
    title: "Notifikasi",
  },
];

// DATE FILTER
export const YEARS = ["2022", "2023", "2024", "2025", "2026", "2027"];

export const MONTHS = [
  {
    title: "Januari",
    value: "01",
  },
  {
    title: "Februari",
    value: "02",
  },
  {
    title: "Maret",
    value: "03",
  },
  {
    title: "April",
    value: "04",
  },
  {
    title: "Mei",
    value: "05",
  },
  {
    title: "Juni",
    value: "06",
  },
  {
    title: "Juli",
    value: "07",
  },
  {
    title: "Agustus",
    value: "08",
  },
  {
    title: "September",
    value: "09",
  },
  {
    title: "Oktober",
    value: "10",
  },
  {
    title: "November",
    value: "11",
  },
  {
    title: "Desember",
    value: "12",
  },
];

//LABEL
export const LABEL = {
  INPUT: {
    SUCCESS: {
      SAVED: "Berhasil menyimpan data.",
      UPDATE: "Berhasil memperbarui data.",
      DELETE: "Berhasil menghapus data.",
    },
    FAILED: {
      SAVED: "Gagal menyimpan data.",
      UPDATE: "Gagal memperbarui data.",
      DELETE: "Gagal menghapus data.",
    },
  },
  LOG_IN: {
    SUCCESS: "Login berhasil.",
    FAILED: "Username atau password salah.",
  },
  SUCCESS: {
    REVALIDATE: "Data berhasil diperbarui.",
    DATA_FOUND: "Data ditemukan.",
    AUTH: "Akses diterima.",
  },
  ERROR: {
    404: "Halaman tidak ditemukan.",
    CHECK_DATA: "Tidak ada perubahan data.",
    DATA_NOT_FOUND: "Data tidak ditemukan.",
    INVALID_FIELD: "Input tidak valid. Silakan periksa kembali data Anda.",
    DESCRIPTION: "Terjadi gangguan koneksi. Silakan coba lagi nanti.",
    SERVER: "Terjadi kesalahan pada server. Silakan coba lagi nanti.",
    NOT_LOGIN: "Silakan masuk untuk melanjutkan.",
    NOT_ID_USER: "Akses ditolak. ID pengguna tidak valid.",
    UNAUTHORIZED: "Anda tidak memiliki izin untuk melakukan tindakan ini.",
  },
};

export const LabelButton: Record<FormMode, string> = {
  create: "Tambah",
  edit: "Update",
};

//CACHE
export const CACHE_TAGS = {
  master: {
    unit: {
      kode: "last-code-unit",
      list: "get-unit",
      detail: "get-detail-unit",
    },
    categories: {
      kode: "last-code-categories",
      list: "get-categories",
      detail: "get-detail-categories",
    },
    item: {
      kode: "last-code-item",
      list: "get-item",
      select: "get-item-select",
      detail: "get-detail-item",
    },
    supplier: {
      kode: "last-code-supplier",
      list: "get-supplier",
      detail: "get-detail-supplier",
    },
    user: {
      kode: "last-code-user",
      list: "get-user",
      detail: "get-detail-user",
    },
  },
  transaction: {
    procurement: {
      kode: "last-code-procurement",
      list: "get-procurement",
      detail: "get-detail-procurement",
    },
    purchase: {
      kode: "last-code-purchase",
      list: "get-purchase",
      detail: "get-detail-purchase",
    },
    receipt: {
      kode: "last-code-receipt",
      list: "get-receipt",
      detail: "get-detail-receipt",
    },
    notification: {
      kode: "last-code-notification",
      list: "get-notification",
      detail: "get-detail-notification",
    },
    itemMov: {
      kode: "last-code-itemMov",
      list: "get-itemMov",
      detail: "get-detail-itemMov",
    },
  },
} as const;

export const ROLE_GROUP: Record<RoleGroup, readonly roleType[]> = {
  ADMIN_ONLY: ["SUPER_ADMIN", "ADMIN"],
  KITCHEN_ONLY: ["HEADKITCHEN", "KITCHEN"],
  ADMIN_KITCHEN: ["SUPER_ADMIN", "ADMIN", "HEADKITCHEN", "KITCHEN"],
  MANAGEMENT: ["SUPER_ADMIN", "ADMIN", "MANAGER"],
  ALL: ["SUPER_ADMIN", "ADMIN", "HEADKITCHEN", "KITCHEN", "MANAGER"],
} as const;

//ENUM SELECT
export const ROLE_SELECT = [
  {
    name: "Super Admin",
    value: "SUPER_ADMIN",
  },
  {
    name: "Kitchen",
    value: "KITCHEN",
  },
  {
    name: "Admin",
    value: "ADMIN",
  },
  {
    name: "Head Kitchen",
    value: "HEADKITCHEN",
  },
  {
    name: "Manager",
    value: "MANAGER",
  },
];

export const TYPE_ITEM_SELECT = [
  {
    name: "Raw Material",
    value: "RAW_MATERIAL",
  },
  {
    name: "Work in Progress",
    value: "WORK_IN_PROGRESS",
  },
  {
    name: "Finished Good",
    value: "FINISHED_GOOD",
  },
];
