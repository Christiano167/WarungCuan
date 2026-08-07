export type ProductCategory =
  | 'Semua'
  | 'Sembako'
  | 'Minuman'
  | 'Jajanan & Snack'
  | 'Bumbu & Masakan'
  | 'Mandi & Cuci'
  | 'Rokok & Gas'
  | 'Lainnya';

export interface PriceTier {
  id: string;
  unitName: string;        // e.g., "Dus (40 Pcs)", "Renteng (10 Sachet)", "½ Kg", "1 Karung (25 Kg)"
  conversionRatio: number; // Berapa unit dasar? e.g. 40, 10, 0.5, 25
  sellPrice: number;       // Harga jual kemasan/satuan ini
  buyPrice?: number;       // Modal per kemasan ini (opsional)
}

export interface Product {
  id: string;
  name: string;
  category: Exclude<ProductCategory, 'Semua'>;
  buyPrice: number;   // Harga modal beli (HPP) unit dasar
  sellPrice: number;  // Harga jual unit dasar (misal per Pcs, Sachet, Kg)
  stock: number;      // Stok dalam unit dasar
  unit: string;       // pcs, kg, liter, sachet, dll
  minStockAlert: number;
  icon?: string;      // Emoji atau identifier ikon untuk mudah dikenali mama
  colorTag?: string;  // Warna tag kartu (bg-blue-100, bg-amber-100, dll)
  priceTiers?: PriceTier[]; // Grosir / Kemasan Lain (Dus, Renteng, ½ Kg, dll)
}

export interface CartItem {
  product: Product;
  quantity: number;
  selectedTier?: PriceTier; // Jika dibeli dalam unit Grosir / Kemasan khusus (misal Dus / Renteng)
  discountPrice?: number;
  subtotal: number;
  totalProfit: number; // (sellPrice - buyPrice - discount) * quantity
}

export interface Customer {
  id: string;
  name: string;
  phone?: string;     // Nomor WA untuk pengingat hutang
  address?: string;
  totalDebt: number;  // Total hutang aktif yang belum dibayar
}

export interface DebtTransaction {
  id: string;
  customerId: string;
  customerName: string;
  date: string;       // YYYY-MM-DD
  timestamp: number;
  amount: number;
  remainingAmount: number;
  status: 'BELUM_LUNAS' | 'LUNAS';
  itemsSummary: string;
  saleTransactionId: string;
  note?: string;
}

export interface DebtPaymentLog {
  id: string;
  debtId: string;
  customerId: string;
  customerName: string;
  date: string;
  timestamp: number;
  amountPaid: number;
  note?: string;
}

export interface SaleTransaction {
  id: string;
  invoiceNumber: string; // INV-YYYYMMDD-XXXX
  timestamp: number;
  dateString: string;    // YYYY-MM-DD untuk kemudahan filter laporan
  items: {
    productId: string;
    productName: string;
    quantity: number;
    unit: string;
    price: number;       // Harga jual per unit saat transaksi
    buyPrice: number;    // Harga modal saat transaksi
    subtotal: number;
    profit: number;
    tierName?: string;   // Misal: "Dus (40 Pcs)" atau "Renteng (10 Sachet)"
    baseQtyDeducted?: number; // Total unit dasar yang dipotong dari stok
  }[];
  totalAmount: number;
  totalProfit: number;
  totalBuyPrice: number;
  paymentMethod: 'CASH' | 'HUTANG' | 'TRANSFER';
  customerId?: string;
  customerName?: string;
  cashReceived: number;
  changeAmount: number;
  note?: string;
}

export interface StockIncomingItem {
  productId: string;
  productName: string;
  qty: number;
  unit: string;
  buyPrice: number;
  totalCost: number;
}

export interface StockIncoming {
  id: string;
  date: string;          // YYYY-MM-DD
  timestamp: number;
  source: 'SALES_DISTRIBUTOR' | 'BELI_MANDIRI'; // Dari sales atau belanja ke pasar/grosir
  supplierName: string;  // Contoh: "Sales Indofood (Mas Budi)", "Grosir Laris Manis"
  invoiceNo?: string;
  items: StockIncomingItem[];
  totalCost: number;
  statusBayar: 'LUNAS' | 'TEMPO'; // Jika tempo bisa dicatat
  dueDate?: string;
  notes?: string;
}

export interface StockReturn {
  id: string;
  date: string;
  timestamp: number;
  productId: string;
  productName: string;
  qty: number;
  unit: string;
  returnReason: 'RUSAK_CACAT' | 'EXPIRED' | 'KEMASAN_BOCOR' | 'SALAH_KIRIM' | 'LAINNYA';
  target: 'SALES_DISTRIBUTOR' | 'TOKO_GROSIR';
  targetName: string;    // Nama sales atau grosir tempat retur
  refundAction: 'GANTI_BARANG_BARU' | 'POTONG_TAGIHAN' | 'UANG_KEMBALI';
  notes?: string;
}

export type StockAdjustmentReason =
  | 'KONSUMSI_PRIBADI'   // Makan / minum / konsumsi sendiri oleh penjual / keluarga
  | 'RUSAK_JATUH'        // Barang pecah, bocor, jatuh
  | 'KADALUARSA'         // Expired / basi
  | 'HILANG'             // Selisih hitung / hilang
  | 'BONUS_SAMPEL';      // Bonus / sampel pelanggan

export interface StockAdjustment {
  id: string;
  date: string;          // YYYY-MM-DD
  timestamp: number;
  productId: string;
  productName: string;
  qty: number;
  unit: string;
  buyPrice: number;       // Harga modal (HPP) per unit saat dicatat
  totalLossValue: number; // buyPrice * qty
  reason: StockAdjustmentReason;
  notes?: string;
}

export interface StoreSettings {
  storeName: string;
  tagline: string;
  ownerName: string;
  address: string;
  phone: string;
  footerMessage: string;
  lowStockThresholdDefault: number;
  printReceiptSize: '58mm' | '80mm';
  enableSound: boolean;
}

export type ActiveTab = 
  | 'pos'        // Kasir Penjualan (Utama)
  | 'products'   // Stok & Katalog Barang
  | 'incoming'   // Barang Masuk (Sales / Mandiri)
  | 'returns'    // Retur Barang
  | 'debts'      // Buku Hutang Pelanggan (Kasbon)
  | 'reports'    // Laporan Laba Rugi Bulanan & Harian
  | 'settings';  // Pengaturan & Backup Data
