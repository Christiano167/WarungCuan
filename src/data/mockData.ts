import {
  Product,
  Customer,
  SaleTransaction,
  DebtTransaction,
  StockIncoming,
  StockReturn,
  StockAdjustment,
  StoreSettings
} from '../types';

export const INITIAL_SETTINGS: StoreSettings = {
  storeName: "Warung Saya",
  tagline: "Sedia Sembako & Kebutuhan Harian Lengkap",
  ownerName: "Pemilik Warung",
  address: "Jl. Mawar No. 12",
  phone: "0812-0000-0000",
  footerMessage: "Terima kasih sudah berbelanja di warung kami! 🙏",
  lowStockThresholdDefault: 5,
  printReceiptSize: '58mm',
  enableSound: true,
};

// Contoh Produk Warung Siap Pakai (Mama bisa muat ini jika butuh draf/template)
export const DEFAULT_WARUNG_SAMPLE_PRODUCTS: Product[] = [
  {
    id: 'p1',
    name: 'Indomie Goreng Special',
    category: 'Jajanan & Snack',
    buyPrice: 2900,
    sellPrice: 3500,
    stock: 120,
    unit: 'pcs',
    minStockAlert: 20,
    icon: '🍜',
    colorTag: 'bg-amber-100',
    priceTiers: [
      {
        id: 'pt-indo-dus',
        unitName: '1 Dus (40 Pcs)',
        conversionRatio: 40,
        sellPrice: 132000,
        buyPrice: 116000
      }
    ]
  },
  {
    id: 'p2',
    name: 'Kopi Kapal Api Mix 25g',
    category: 'Minuman',
    buyPrice: 1400,
    sellPrice: 2000,
    stock: 100,
    unit: 'sachet',
    minStockAlert: 20,
    icon: '☕',
    colorTag: 'bg-orange-100',
    priceTiers: [
      {
        id: 'pt-kopi-renteng',
        unitName: '1 Renteng (10 Sachet)',
        conversionRatio: 10,
        sellPrice: 18000,
        buyPrice: 14000
      }
    ]
  },
  {
    id: 'p3',
    name: 'Beras Medium Pulen (Cianjur)',
    category: 'Sembako',
    buyPrice: 12500,
    sellPrice: 14500,
    stock: 100, // in kg
    unit: 'kg',
    minStockAlert: 10,
    icon: '🌾',
    colorTag: 'bg-emerald-100',
    priceTiers: [
      {
        id: 'pt-beras-setengah',
        unitName: '½ Kg (0.5 Kg)',
        conversionRatio: 0.5,
        sellPrice: 7500,
        buyPrice: 6250
      },
      {
        id: 'pt-beras-5kg',
        unitName: '1 Karung 5 Kg',
        conversionRatio: 5,
        sellPrice: 70000,
        buyPrice: 62500
      },
      {
        id: 'pt-beras-25kg',
        unitName: '1 Karung 25 Kg',
        conversionRatio: 25,
        sellPrice: 345000,
        buyPrice: 312500
      }
    ]
  },
  {
    id: 'p4',
    name: 'Minyak Goreng Bimoli 1 Liter',
    category: 'Sembako',
    buyPrice: 15500,
    sellPrice: 18000,
    stock: 24,
    unit: 'pouch',
    minStockAlert: 5,
    icon: '🍾',
    colorTag: 'bg-yellow-100',
    priceTiers: [
      {
        id: 'pt-minyak-dus',
        unitName: '1 Dus (12 Pouch)',
        conversionRatio: 12,
        sellPrice: 210000,
        buyPrice: 186000
      }
    ]
  },
  {
    id: 'p5',
    name: 'Gula Pasir Lokal Premium',
    category: 'Sembako',
    buyPrice: 14500,
    sellPrice: 17000,
    stock: 50,
    unit: 'kg',
    minStockAlert: 10,
    icon: '🍬',
    colorTag: 'bg-sky-100',
    priceTiers: [
      {
        id: 'pt-gula-setengah',
        unitName: '½ Kg (0.5 Kg)',
        conversionRatio: 0.5,
        sellPrice: 9000,
        buyPrice: 7250
      }
    ]
  },
  {
    id: 'p6',
    name: 'Telur Ayam Negeri Fresh',
    category: 'Sembako',
    buyPrice: 26000,
    sellPrice: 29000,
    stock: 30, // in kg
    unit: 'kg',
    minStockAlert: 5,
    icon: '🥚',
    colorTag: 'bg-amber-100',
    priceTiers: [
      {
        id: 'pt-telur-setengah',
        unitName: '½ Kg (0.5 Kg)',
        conversionRatio: 0.5,
        sellPrice: 15000,
        buyPrice: 13000
      },
      {
        id: 'pt-telur-1butir',
        unitName: 'Eceran 1 Butir (~0.06 Kg)',
        conversionRatio: 0.0625,
        sellPrice: 2000,
        buyPrice: 1625
      }
    ]
  },
  {
    id: 'p7',
    name: 'Aqua Botol 600ml',
    category: 'Minuman',
    buyPrice: 2500,
    sellPrice: 3500,
    stock: 48,
    unit: 'botol',
    minStockAlert: 10,
    icon: '💧',
    colorTag: 'bg-blue-100',
    priceTiers: [
      {
        id: 'pt-aqua-dus',
        unitName: '1 Dus (24 Botol)',
        conversionRatio: 24,
        sellPrice: 75000,
        buyPrice: 60000
      }
    ]
  }
];

export const INITIAL_PRODUCTS: Product[] = [];
export const INITIAL_CUSTOMERS: Customer[] = [];
export const INITIAL_DEBTS: DebtTransaction[] = [];
export const INITIAL_SALES: SaleTransaction[] = [];
export const INITIAL_INCOMING: StockIncoming[] = [];
export const INITIAL_RETURNS: StockReturn[] = [];
export const INITIAL_ADJUSTMENTS: StockAdjustment[] = [];
