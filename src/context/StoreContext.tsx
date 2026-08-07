import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import {
  Product,
  ProductCategory,
  PriceTier,
  CartItem,
  Customer,
  DebtTransaction,
  SaleTransaction,
  StockIncoming,
  StockReturn,
  StockAdjustment,
  StockAdjustmentReason,
  StoreSettings,
  ActiveTab
} from '../types';
import {
  INITIAL_PRODUCTS,
  INITIAL_CUSTOMERS,
  INITIAL_DEBTS,
  INITIAL_SALES,
  INITIAL_INCOMING,
  INITIAL_RETURNS,
  INITIAL_ADJUSTMENTS,
  INITIAL_SETTINGS,
  DEFAULT_WARUNG_SAMPLE_PRODUCTS
} from '../data/mockData';
import { generateInvoiceNo } from '../utils/formatters';
import { sound } from '../utils/sound';

interface StoreContextType {
  // Navigation & UI State
  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  selectedCategory: ProductCategory;
  setSelectedCategory: (cat: ProductCategory) => void;

  // Data States
  products: Product[];
  customers: Customer[];
  debts: DebtTransaction[];
  sales: SaleTransaction[];
  incoming: StockIncoming[];
  returns: StockReturn[];
  adjustments: StockAdjustment[];
  settings: StoreSettings;

  // Cart State & Actions
  cart: CartItem[];
  addToCart: (product: Product, quantity?: number, selectedTier?: PriceTier) => void;
  removeFromCart: (indexOrKey: number | string) => void;
  updateCartQty: (indexOrKey: number | string, quantity: number) => void;
  clearCart: () => void;
  checkout: (params: {
    paymentMethod: 'CASH' | 'HUTANG' | 'TRANSFER';
    cashReceived: number;
    customerId?: string;
    note?: string;
  }) => { success: boolean; invoiceNumber?: string; error?: string };

  // Product Actions
  addProduct: (product: Omit<Product, 'id'>) => Product;
  updateProduct: (product: Product) => void;
  deleteProduct: (id: string) => void;
  quickStockAdjust: (productId: string, delta: number) => void;
  addCustomItemToCart: (name: string, price: number, quantity?: number) => void;
  loadSampleWarungProducts: () => void;

  // Customer & Debt Actions
  addCustomer: (customer: Omit<Customer, 'id' | 'totalDebt'>) => void;
  addDebtManual: (customerId: string, amount: number, itemsSummary: string, note?: string) => void;
  payDebt: (debtId: string, amountPaid: number, note?: string) => void;

  // Incoming Stock Actions (Dari Sales atau Beli Mandiri)
  addStockIncoming: (data: Omit<StockIncoming, 'id' | 'timestamp' | 'date'>) => void;

  // Return Stock Actions (Histori Retur)
  addStockReturn: (data: Omit<StockReturn, 'id' | 'timestamp' | 'date'>) => void;

  // Stock Adjustment / Konsumsi & Kerusakan Actions
  addStockAdjustment: (data: {
    productId: string;
    qty: number;
    reason: StockAdjustmentReason;
    notes?: string;
    date?: string;
  }) => void;
  deleteStockAdjustment: (id: string) => void;

  // Settings & Backup
  updateSettings: (newSettings: StoreSettings) => void;
  exportDataJSON: () => string;
  importDataJSON: (jsonStr: string) => boolean;
  resetDemoData: () => void;
  resetAllData: () => void;
}

const StoreContext = createContext<StoreContextType | undefined>(undefined);

const STORAGE_KEYS = {
  PRODUCTS: 'kasirma_products_v2',
  CUSTOMERS: 'kasirma_customers_v2',
  DEBTS: 'kasirma_debts_v2',
  SALES: 'kasirma_sales_v2',
  INCOMING: 'kasirma_incoming_v2',
  RETURNS: 'kasirma_returns_v2',
  ADJUSTMENTS: 'kasirma_adjustments_v2',
  SETTINGS: 'kasirma_settings_v2',
};

export const StoreProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [activeTab, setActiveTab] = useState<ActiveTab>('pos');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<ProductCategory>('Semua');
  const [cart, setCart] = useState<CartItem[]>([]);

  // Persistent States
  const [products, setProducts] = useState<Product[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.PRODUCTS);
    return saved ? JSON.parse(saved) : INITIAL_PRODUCTS;
  });

  const [customers, setCustomers] = useState<Customer[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.CUSTOMERS);
    return saved ? JSON.parse(saved) : INITIAL_CUSTOMERS;
  });

  const [debts, setDebts] = useState<DebtTransaction[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.DEBTS);
    return saved ? JSON.parse(saved) : INITIAL_DEBTS;
  });

  const [sales, setSales] = useState<SaleTransaction[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.SALES);
    return saved ? JSON.parse(saved) : INITIAL_SALES;
  });

  const [incoming, setIncoming] = useState<StockIncoming[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.INCOMING);
    return saved ? JSON.parse(saved) : INITIAL_INCOMING;
  });

  const [returns, setReturns] = useState<StockReturn[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.RETURNS);
    return saved ? JSON.parse(saved) : INITIAL_RETURNS;
  });

  const [adjustments, setAdjustments] = useState<StockAdjustment[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.ADJUSTMENTS);
    return saved ? JSON.parse(saved) : INITIAL_ADJUSTMENTS;
  });

  const [settings, setSettings] = useState<StoreSettings>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.SETTINGS);
    return saved ? JSON.parse(saved) : INITIAL_SETTINGS;
  });

  // Sync to localStorage
  useEffect(() => { localStorage.setItem(STORAGE_KEYS.PRODUCTS, JSON.stringify(products)); }, [products]);
  useEffect(() => { localStorage.setItem(STORAGE_KEYS.CUSTOMERS, JSON.stringify(customers)); }, [customers]);
  useEffect(() => { localStorage.setItem(STORAGE_KEYS.DEBTS, JSON.stringify(debts)); }, [debts]);
  useEffect(() => { localStorage.setItem(STORAGE_KEYS.SALES, JSON.stringify(sales)); }, [sales]);
  useEffect(() => { localStorage.setItem(STORAGE_KEYS.INCOMING, JSON.stringify(incoming)); }, [incoming]);
  useEffect(() => { localStorage.setItem(STORAGE_KEYS.RETURNS, JSON.stringify(returns)); }, [returns]);
  useEffect(() => { localStorage.setItem(STORAGE_KEYS.ADJUSTMENTS, JSON.stringify(adjustments)); }, [adjustments]);
  useEffect(() => { 
    localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(settings)); 
    sound.setEnabled(settings.enableSound);
  }, [settings]);

  // Cart Functions
  const addToCart = (product: Product, quantity: number = 1, selectedTier?: PriceTier) => {
    const isManual = product.id.startsWith('manual-');
    if (!isManual && product.stock <= 0) {
      sound.playWarning();
      return;
    }

    const conversionRatio = selectedTier ? selectedTier.conversionRatio : 1;
    const baseQtyToAdd = quantity * conversionRatio;

    sound.playTap();
    setCart(prev => {
      // Find matching item in cart (same product AND same tier)
      const existingIdx = prev.findIndex(item => {
        if (item.product.id !== product.id) return false;
        if (!selectedTier && !item.selectedTier) return true;
        if (selectedTier && item.selectedTier && selectedTier.id === item.selectedTier.id) return true;
        return false;
      });

      // Calculate total base quantity currently in cart for this product
      const currentTotalBaseQtyInCart = prev
        .filter(i => i.product.id === product.id)
        .reduce((sum, i) => sum + (i.quantity * (i.selectedTier ? i.selectedTier.conversionRatio : 1)), 0);

      if (!isManual && (currentTotalBaseQtyInCart + baseQtyToAdd) > product.stock) {
        sound.playWarning();
        return prev;
      }

      const unitSellPrice = selectedTier ? selectedTier.sellPrice : product.sellPrice;
      const unitBuyPrice = (selectedTier && selectedTier.buyPrice !== undefined)
        ? selectedTier.buyPrice
        : (product.buyPrice * conversionRatio);

      if (existingIdx > -1) {
        const updated = [...prev];
        const item = updated[existingIdx];
        const newQty = item.quantity + quantity;
        const subtotal = unitSellPrice * newQty;
        const totalProfit = (unitSellPrice - unitBuyPrice) * newQty;

        updated[existingIdx] = {
          ...item,
          quantity: newQty,
          subtotal,
          totalProfit
        };
        return updated;
      } else {
        const subtotal = unitSellPrice * quantity;
        const totalProfit = (unitSellPrice - unitBuyPrice) * quantity;
        return [...prev, {
          product,
          quantity,
          selectedTier,
          subtotal,
          totalProfit
        }];
      }
    });
  };

  const removeFromCart = (indexOrKey: number | string) => {
    sound.playTap();
    setCart(prev => prev.filter((item, idx) => {
      if (typeof indexOrKey === 'number') return idx !== indexOrKey;
      return item.product.id !== indexOrKey;
    }));
  };

  const updateCartQty = (indexOrKey: number | string, quantity: number) => {
    sound.playTap();
    if (quantity <= 0) {
      removeFromCart(indexOrKey);
      return;
    }
    setCart(prev => {
      const idx = typeof indexOrKey === 'number'
        ? indexOrKey
        : prev.findIndex(item => item.product.id === indexOrKey);
      if (idx === -1 || idx >= prev.length) return prev;

      const item = prev[idx];
      const product = item.product;
      const isManual = product.id.startsWith('manual-');
      const conversionRatio = item.selectedTier ? item.selectedTier.conversionRatio : 1;

      // Calculate total base qty in cart excluding this item
      const otherBaseQty = prev
        .filter((_, i) => i !== idx && prev[i].product.id === product.id)
        .reduce((sum, i) => sum + (i.quantity * (i.selectedTier ? i.selectedTier.conversionRatio : 1)), 0);

      const newBaseQtyNeeded = otherBaseQty + (quantity * conversionRatio);

      if (!isManual && newBaseQtyNeeded > product.stock) {
        sound.playWarning();
        return prev;
      }

      const unitSellPrice = item.selectedTier ? item.selectedTier.sellPrice : product.sellPrice;
      const unitBuyPrice = (item.selectedTier && item.selectedTier.buyPrice !== undefined)
        ? item.selectedTier.buyPrice
        : (product.buyPrice * conversionRatio);

      const updated = [...prev];
      updated[idx] = {
        ...item,
        quantity,
        subtotal: unitSellPrice * quantity,
        totalProfit: (unitSellPrice - unitBuyPrice) * quantity
      };
      return updated;
    });
  };

  const clearCart = () => {
    sound.playTap();
    setCart([]);
  };

  const loadSampleWarungProducts = () => {
    sound.playSuccess();
    setProducts(DEFAULT_WARUNG_SAMPLE_PRODUCTS);
  };

  // Checkout Function
  const checkout = ({
    paymentMethod,
    cashReceived,
    customerId,
    note
  }: {
    paymentMethod: 'CASH' | 'HUTANG' | 'TRANSFER';
    cashReceived: number;
    customerId?: string;
    note?: string;
  }) => {
    if (cart.length === 0) return { success: false, error: "Keranjang masih kosong" };

    const totalAmount = cart.reduce((sum, item) => sum + item.subtotal, 0);
    const totalProfit = cart.reduce((sum, item) => sum + item.totalProfit, 0);
    const totalBuyPrice = cart.reduce((sum, item) => {
      const ratio = item.selectedTier ? item.selectedTier.conversionRatio : 1;
      const buyP = (item.selectedTier && item.selectedTier.buyPrice !== undefined)
        ? item.selectedTier.buyPrice
        : (item.product.buyPrice * ratio);
      return sum + (buyP * item.quantity);
    }, 0);

    if (paymentMethod === 'HUTANG' && !customerId) {
      sound.playWarning();
      return { success: false, error: "Pilih pelanggan jika sistem bayar hutang (kasbon)" };
    }

    if (paymentMethod === 'CASH' && cashReceived < totalAmount) {
      sound.playWarning();
      return { success: false, error: "Uang yang diterima kurang dari total belanja" };
    }

    const invoiceNumber = generateInvoiceNo();
    const now = Date.now();
    const dateStr = new Date(now).toISOString().split('T')[0];

    const customer = customerId ? customers.find(c => c.id === customerId) : undefined;

    // Create Sale Transaction
    const newSale: SaleTransaction = {
      id: "sale-" + now,
      invoiceNumber,
      timestamp: now,
      dateString: dateStr,
      items: cart.map(item => {
        const ratio = item.selectedTier ? item.selectedTier.conversionRatio : 1;
        const unitLabel = item.selectedTier ? item.selectedTier.unitName : item.product.unit;
        const itemSellPrice = item.selectedTier ? item.selectedTier.sellPrice : item.product.sellPrice;
        const itemBuyPrice = (item.selectedTier && item.selectedTier.buyPrice !== undefined)
          ? item.selectedTier.buyPrice
          : (item.product.buyPrice * ratio);
        return {
          productId: item.product.id,
          productName: item.product.name,
          quantity: item.quantity,
          unit: unitLabel,
          price: itemSellPrice,
          buyPrice: itemBuyPrice,
          subtotal: item.subtotal,
          profit: item.totalProfit,
          tierName: item.selectedTier?.unitName,
          baseQtyDeducted: item.quantity * ratio
        };
      }),
      totalAmount,
      totalProfit,
      totalBuyPrice,
      paymentMethod,
      customerId,
      customerName: customer ? customer.name : undefined,
      cashReceived: paymentMethod === 'HUTANG' ? 0 : cashReceived,
      changeAmount: paymentMethod === 'HUTANG' ? 0 : Math.max(0, cashReceived - totalAmount),
      note
    };

    // 1. Deduct Product Stocks (accounting for multi-unit conversion ratio!)
    setProducts(prevProducts =>
      prevProducts.map(prod => {
        const totalBaseQtyDeducted = cart
          .filter(item => item.product.id === prod.id)
          .reduce((sum, item) => {
            const ratio = item.selectedTier ? item.selectedTier.conversionRatio : 1;
            return sum + (item.quantity * ratio);
          }, 0);

        if (totalBaseQtyDeducted > 0) {
          return { ...prod, stock: Math.max(0, prod.stock - totalBaseQtyDeducted) };
        }
        return prod;
      })
    );

    // 2. If HUTANG, create Debt Transaction and update Customer Total Debt
    if (paymentMethod === 'HUTANG' && customer) {
      const itemsSummary = cart.map(i => `${i.product.name} (${i.quantity})`).join(', ');
      const newDebt: DebtTransaction = {
        id: "debt-" + now,
        customerId: customer.id,
        customerName: customer.name,
        date: dateStr,
        timestamp: now,
        amount: totalAmount,
        remainingAmount: totalAmount,
        status: 'BELUM_LUNAS',
        itemsSummary,
        saleTransactionId: invoiceNumber,
        note: note || "Bon dari kasir penjualan"
      };

      setDebts(prev => [newDebt, ...prev]);
      setCustomers(prev =>
        prev.map(c => c.id === customer.id ? { ...c, totalDebt: c.totalDebt + totalAmount } : c)
      );
    }

    // 3. Save Sale
    setSales(prev => [newSale, ...prev]);

    // 4. Play celebration sound and clear cart!
    sound.playSuccess();
    setCart([]);

    return { success: true, invoiceNumber };
  };

  // Product Actions
  const addProduct = (productData: Omit<Product, 'id'>): Product => {
    sound.playTap();
    const newProd: Product = {
      ...productData,
      id: "prod-" + Date.now(),
      colorTag: "bg-blue-50 border-blue-200 text-blue-900"
    };
    setProducts(prev => [newProd, ...prev]);
    return newProd;
  };

  const addCustomItemToCart = (name: string, price: number, quantity: number = 1) => {
    sound.playTap();
    const dummyProduct: Product = {
      id: "manual-" + Date.now() + "-" + Math.floor(Math.random() * 1000),
      name: name.trim() || "Item / Jasa Manual",
      category: "Lainnya",
      buyPrice: price,
      sellPrice: price,
      stock: 999999,
      unit: "pcs",
      minStockAlert: 0,
      icon: "⚡",
      colorTag: "bg-amber-50 border-amber-200 text-amber-900"
    };
    setCart(prev => {
      const subtotal = dummyProduct.sellPrice * quantity;
      return [...prev, { product: dummyProduct, quantity, subtotal, totalProfit: 0 }];
    });
  };

  const updateProduct = (updatedProd: Product) => {
    sound.playTap();
    setProducts(prev => prev.map(p => p.id === updatedProd.id ? updatedProd : p));
  };

  const deleteProduct = (id: string) => {
    sound.playTap();
    setProducts(prev => prev.filter(p => p.id !== id));
  };

  const quickStockAdjust = (productId: string, delta: number) => {
    sound.playTap();
    setProducts(prev =>
      prev.map(p => {
        if (p.id === productId) {
          return { ...p, stock: Math.max(0, p.stock + delta) };
        }
        return p;
      })
    );
  };

  // Customer & Debt Actions
  const addCustomer = (custData: Omit<Customer, 'id' | 'totalDebt'>) => {
    sound.playTap();
    const newCust: Customer = {
      ...custData,
      id: "cust-" + Date.now(),
      totalDebt: 0
    };
    setCustomers(prev => [...prev, newCust]);
  };

  const addDebtManual = (customerId: string, amount: number, itemsSummary: string, note?: string) => {
    sound.playTap();
    const customer = customers.find(c => c.id === customerId);
    if (!customer) return;

    const now = Date.now();
    const dateStr = new Date(now).toISOString().split('T')[0];

    const newDebt: DebtTransaction = {
      id: "debt-" + now,
      customerId,
      customerName: customer.name,
      date: dateStr,
      timestamp: now,
      amount,
      remainingAmount: amount,
      status: 'BELUM_LUNAS',
      itemsSummary,
      saleTransactionId: "BON-MANUAL",
      note
    };

    setDebts(prev => [newDebt, ...prev]);
    setCustomers(prev =>
      prev.map(c => c.id === customerId ? { ...c, totalDebt: c.totalDebt + amount } : c)
    );
  };

  const payDebt = (debtId: string, amountPaid: number, note?: string) => {
    sound.playTap();
    setDebts(prev =>
      prev.map(debt => {
        if (debt.id === debtId) {
          const newRemaining = Math.max(0, debt.remainingAmount - amountPaid);
          const newStatus = newRemaining === 0 ? 'LUNAS' : 'BELUM_LUNAS';
          
          // Also reduce customer total debt
          setCustomers(prevCust =>
            prevCust.map(c => c.id === debt.customerId ? {
              ...c,
              totalDebt: Math.max(0, c.totalDebt - amountPaid)
            } : c)
          );

          return {
            ...debt,
            remainingAmount: newRemaining,
            status: newStatus,
            note: note ? `${debt.note ? debt.note + ' | ' : ''}Bayar Rp ${amountPaid}: ${note}` : debt.note
          };
        }
        return debt;
      })
    );
  };

  // Incoming Stock (Barang Masuk dari Sales atau Beli Mandiri)
  const addStockIncoming = (data: Omit<StockIncoming, 'id' | 'timestamp' | 'date'>) => {
    sound.playTap();
    const now = Date.now();
    const dateStr = new Date(now).toISOString().split('T')[0];

    const newIncoming: StockIncoming = {
      ...data,
      id: "in-" + now,
      date: dateStr,
      timestamp: now,
    };

    // Update stocks and buy prices in product list
    setProducts(prev => {
      const updated = [...prev];
      data.items.forEach(item => {
        const idx = updated.findIndex(p => p.id === item.productId);
        if (idx > -1) {
          updated[idx] = {
            ...updated[idx],
            stock: updated[idx].stock + item.qty,
            buyPrice: item.buyPrice > 0 ? item.buyPrice : updated[idx].buyPrice
          };
        }
      });
      return updated;
    });

    setIncoming(prev => [newIncoming, ...prev]);
  };

  // Return Stock (Histori Retur Barang)
  const addStockReturn = (data: Omit<StockReturn, 'id' | 'timestamp' | 'date'>) => {
    sound.playTap();
    const now = Date.now();
    const dateStr = new Date(now).toISOString().split('T')[0];

    const newReturn: StockReturn = {
      ...data,
      id: "ret-" + now,
      date: dateStr,
      timestamp: now,
    };

    // If item returned from existing stock, reduce the stock
    setProducts(prev =>
      prev.map(p => {
        if (p.id === data.productId) {
          return { ...p, stock: Math.max(0, p.stock - data.qty) };
        }
        return p;
      })
    );

    setReturns(prev => [newReturn, ...prev]);
  };

  // Stock Adjustment / Konsumsi & Kerusakan Actions
  const addStockAdjustment = (data: {
    productId: string;
    qty: number;
    reason: StockAdjustmentReason;
    notes?: string;
    date?: string;
  }) => {
    const product = products.find(p => p.id === data.productId);
    if (!product) return;

    sound.playSuccess();
    const now = Date.now();
    const dateStr = data.date || new Date(now).toISOString().split('T')[0];

    // 1. Kurangi stok barang secara akurat di sistem!
    const newStock = Math.max(0, product.stock - data.qty);
    setProducts(prev =>
      prev.map(p => (p.id === data.productId ? { ...p, stock: newStock } : p))
    );

    // 2. Catat riwayat penyesuaian/konsumsi/kerusakan
    const newAdj: StockAdjustment = {
      id: "adj-" + now,
      date: dateStr,
      timestamp: now,
      productId: product.id,
      productName: product.name,
      qty: data.qty,
      unit: product.unit,
      buyPrice: product.buyPrice,
      totalLossValue: product.buyPrice * data.qty,
      reason: data.reason,
      notes: data.notes || ''
    };

    setAdjustments(prev => [newAdj, ...prev]);
  };

  const deleteStockAdjustment = (id: string) => {
    sound.playTap();
    const adj = adjustments.find(a => a.id === id);
    if (!adj) return;

    // Kembalikan stok yang sebelumnya dikurangi
    setProducts(prev =>
      prev.map(p => {
        if (p.id === adj.productId) {
          return { ...p, stock: p.stock + adj.qty };
        }
        return p;
      })
    );

    setAdjustments(prev => prev.filter(a => a.id !== id));
  };

  // Settings & Backup
  const updateSettings = (newSettings: StoreSettings) => {
    sound.playTap();
    setSettings(newSettings);
  };

  const exportDataJSON = (): string => {
    const backup = {
      version: "1.0",
      timestamp: Date.now(),
      dateString: new Date().toLocaleString("id-ID"),
      settings,
      products,
      customers,
      debts,
      sales,
      incoming,
      returns,
      adjustments
    };
    return JSON.stringify(backup, null, 2);
  };

  const importDataJSON = (jsonStr: string): boolean => {
    try {
      const data = JSON.parse(jsonStr);
      if (!data || !data.products) return false;
      if (data.products) setProducts(data.products);
      if (data.customers) setCustomers(data.customers);
      if (data.debts) setDebts(data.debts);
      if (data.sales) setSales(data.sales);
      if (data.incoming) setIncoming(data.incoming);
      if (data.returns) setReturns(data.returns);
      if (data.adjustments) setAdjustments(data.adjustments);
      if (data.settings) setSettings(data.settings);
      sound.playSuccess();
      return true;
    } catch {
      return false;
    }
  };

  const resetDemoData = () => {
    sound.playTap();
    setProducts(INITIAL_PRODUCTS);
    setCustomers(INITIAL_CUSTOMERS);
    setDebts(INITIAL_DEBTS);
    setSales(INITIAL_SALES);
    setIncoming(INITIAL_INCOMING);
    setReturns(INITIAL_RETURNS);
    setAdjustments(INITIAL_ADJUSTMENTS);
    setSettings(INITIAL_SETTINGS);
    setCart([]);
  };

  const resetAllData = () => {
    sound.playWarning();
    setProducts([]);
    setCustomers([]);
    setDebts([]);
    setSales([]);
    setIncoming([]);
    setReturns([]);
    setAdjustments([]);
    setCart([]);
    Object.values(STORAGE_KEYS).forEach((key) => {
      localStorage.removeItem(key);
    });
  };

  return (
    <StoreContext.Provider value={{
      activeTab, setActiveTab,
      searchQuery, setSearchQuery,
      selectedCategory, setSelectedCategory,
      products, customers, debts, sales, incoming, returns, adjustments, settings,
      cart, addToCart, removeFromCart, updateCartQty, clearCart, checkout,
      addProduct, updateProduct, deleteProduct, quickStockAdjust, addCustomItemToCart, loadSampleWarungProducts,
      addCustomer, addDebtManual, payDebt,
      addStockIncoming,
      addStockReturn,
      addStockAdjustment,
      deleteStockAdjustment,
      updateSettings, exportDataJSON, importDataJSON, resetDemoData, resetAllData
    }}>
      {children}
    </StoreContext.Provider>
  );
};

export const useStore = () => {
  const context = useContext(StoreContext);
  if (!context) throw new Error("useStore must be used within StoreProvider");
  return context;
};
