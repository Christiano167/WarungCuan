import React, { useState, useMemo } from 'react';
import { useStore } from '../context/StoreContext';
import { ProductCategory, Product, SaleTransaction } from '../types';
import { formatIDR } from '../utils/formatters';
import { sound } from '../utils/sound';
import confetti from 'canvas-confetti';
import { StockAdjustmentModal } from './StockAdjustmentModal';
import {
  Search,
  Plus,
  Minus,
  Trash2,
  ShoppingCart,
  User,
  CreditCard,
  Banknote,
  BookOpen,
  Printer,
  Share2,
  CheckCircle2,
  AlertCircle,
  X,
  UserPlus,
  ArrowRight,
  Sparkles,
  ShoppingBag,
  QrCode,
  UtensilsCrossed,
  ChevronLeft,
  ChevronRight,
  Maximize2,
  Minimize2
} from 'lucide-react';

const CATEGORIES: ProductCategory[] = [
  'Semua',
  'Sembako',
  'Minuman',
  'Jajanan & Snack',
  'Bumbu & Masakan',
  'Mandi & Cuci',
  'Rokok & Gas',
  'Lainnya'
];

const CATEGORY_ICONS: Record<string, string> = {
  'Semua': '🛒',
  'Sembako': '🍚',
  'Minuman': '🧃',
  'Jajanan & Snack': '🍿',
  'Bumbu & Masakan': '🧂',
  'Mandi & Cuci': '🧼',
  'Rokok & Gas': '🚬',
  'Lainnya': '⚡'
};

const CartItemQtyInput: React.FC<{
  idx: number;
  quantity: number;
  updateCartQty: (idx: number, qty: number) => void;
}> = ({ idx, quantity, updateCartQty }) => {
  const [localVal, setLocalVal] = useState<string>(String(quantity));

  React.useEffect(() => {
    setLocalVal(String(quantity));
  }, [quantity]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const rawStr = e.target.value;
    setLocalVal(rawStr);
    if (rawStr !== '') {
      const parsed = parseInt(rawStr, 10);
      if (!isNaN(parsed) && parsed > 0) {
        updateCartQty(idx, parsed);
      }
    }
  };

  const handleBlur = () => {
    const parsed = parseInt(localVal, 10);
    if (isNaN(parsed) || parsed <= 0) {
      setLocalVal('1');
      updateCartQty(idx, 1);
    } else {
      setLocalVal(String(parsed));
      updateCartQty(idx, parsed);
    }
  };

  return (
    <input
      type="number"
      min="1"
      value={localVal}
      onChange={handleChange}
      onBlur={handleBlur}
      className="w-14 text-center font-black text-sm text-slate-900 bg-white border border-slate-300 rounded-lg py-1 px-1 focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-inner"
      title="Ketik jumlah barang langsung di sini"
    />
  );
};

export const POSView: React.FC = () => {
  const {
    products,
    customers,
    cart,
    addToCart,
    removeFromCart,
    updateCartQty,
    clearCart,
    checkout,
    addCustomer,
    addProduct,
    addCustomItemToCart,
    loadSampleWarungProducts,
    selectedCategory,
    setSelectedCategory,
    searchQuery,
    setSearchQuery,
    settings
  } = useStore();

  // Tier Modal State for Multi-Unit (Dus, Renteng, ½ Kg)
  const [tierModalProduct, setTierModalProduct] = useState<Product | null>(null);

  // Minimize Cart Panel State
  const [isCartMinimized, setIsCartMinimized] = useState<boolean>(false);

  // Payment States
  const [paymentMethod, setPaymentMethod] = useState<'CASH' | 'HUTANG' | 'TRANSFER'>('CASH');
  const [cashReceived, setCashReceived] = useState<number>(0);
  const [selectedCustomerId, setSelectedCustomerId] = useState<string>('');
  const [transactionNote, setTransactionNote] = useState<string>('');

  // Modal States
  const [lastInvoice, setLastInvoice] = useState<string | null>(null);
  const [showReceiptModal, setShowReceiptModal] = useState<boolean>(false);
  const [showAddCustomerModal, setShowAddCustomerModal] = useState<boolean>(false);
  const [newCustName, setNewCustName] = useState<string>('');
  const [newCustPhone, setNewCustPhone] = useState<string>('');
  const [newCustAddress, setNewCustAddress] = useState<string>('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Quick Add & Manual Item States
  const [showQuickAddModal, setShowQuickAddModal] = useState<boolean>(false);
  const [quickName, setQuickName] = useState<string>('');
  const [quickPrice, setQuickPrice] = useState<string>('');
  const [quickBuyPrice, setQuickBuyPrice] = useState<string>('');
  const [quickStock, setQuickStock] = useState<string>('10');
  const [quickCategory, setQuickCategory] = useState<ProductCategory>('Sembako');

  const [showManualItemModal, setShowManualItemModal] = useState<boolean>(false);
  const [manualName, setManualName] = useState<string>('');
  const [manualPrice, setManualPrice] = useState<string>('');
  const [manualQty, setManualQty] = useState<string>('1');

  // Stock Adjustment Modal
  const [showAdjModal, setShowAdjModal] = useState<boolean>(false);
  const [adjProduct, setAdjProduct] = useState<Product | null>(null);

  // Filtered products
  const filteredProducts = useMemo(() => {
    return products.filter(p => {
      const matchCat = selectedCategory === 'Semua' || p.category === selectedCategory;
      const matchSearch = searchQuery === '' ||
        p.name.toLowerCase().includes(searchQuery.toLowerCase());
      return matchCat && matchSearch;
    });
  }, [products, selectedCategory, searchQuery]);

  const totalAmount = useMemo(() => {
    return cart.reduce((sum, item) => sum + item.subtotal, 0);
  }, [cart]);

  // Set default cash received when cart total changes
  React.useEffect(() => {
    if (totalAmount > 0 && cashReceived < totalAmount && paymentMethod === 'CASH') {
      setCashReceived(totalAmount);
    }
  }, [totalAmount, paymentMethod]);

  const changeAmount = Math.max(0, cashReceived - totalAmount);

  // Smart Cash Options calculation
  const smartCashOptions = useMemo(() => {
    if (totalAmount <= 0) return [10000, 20000, 50000, 100000];
    const options = new Set<number>();
    options.add(totalAmount); // Uang Pas

    [5000, 10000, 20000, 50000, 100000, 200000].forEach(denom => {
      if (denom >= totalAmount) {
        options.add(denom);
      } else {
        const rounded = Math.ceil(totalAmount / denom) * denom;
        if (rounded >= totalAmount) options.add(rounded);
      }
    });

    return Array.from(options).sort((a, b) => a - b).slice(0, 5);
  }, [totalAmount]);

  // Quick Cash Shortcut Buttons
  const handleQuickCash = (amount: number) => {
    sound.playTap();
    setCashReceived(amount);
  };

  const handleCheckout = () => {
    setErrorMessage(null);
    const result = checkout({
      paymentMethod,
      cashReceived: paymentMethod === 'CASH' ? cashReceived : totalAmount,
      customerId: paymentMethod === 'HUTANG' ? selectedCustomerId : undefined,
      note: transactionNote
    });

    if (result.success && result.invoiceNumber) {
      setLastInvoice(result.invoiceNumber);
      setShowReceiptModal(true);
      setTransactionNote('');
      try {
        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.6 }
        });
      } catch {
        // ignore if confetti fails
      }
    } else if (result.error) {
      setErrorMessage(result.error);
    }
  };

  const handleCreateCustomer = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCustName.trim()) return;
    addCustomer({
      name: newCustName.trim(),
      phone: newCustPhone.trim(),
      address: newCustAddress.trim()
    });
    setNewCustName('');
    setNewCustPhone('');
    setNewCustAddress('');
    setShowAddCustomerModal(false);
  };

  const selectedCustomerObj = customers.find(c => c.id === selectedCustomerId);

  // Generate WhatsApp text for receipt
  const handleSendWhatsApp = () => {
    sound.playTap();
    const store = settings.storeName;
    const dateStr = new Date().toLocaleDateString('id-ID');
    let text = `*STRUK BELANJA - ${store.toUpperCase()}*\n`;
    text += `Tanggal: ${dateStr}\n`;
    text += `No Nota: ${lastInvoice || '-'}\n`;
    if (selectedCustomerObj) {
      text += `Pelanggan: *${selectedCustomerObj.name}*\n`;
    }
    text += `--------------------------\n`;
    
    // We display items from recent transaction if available
    text += `Total Belanja: *${formatIDR(totalAmount)}*\n`;
    text += `Metode Bayar: *${paymentMethod === 'HUTANG' ? 'KASBON / HUTANG WARUNG' : 'LUNAS (CASH)'}*\n`;
    text += `--------------------------\n`;
    text += `${settings.footerMessage}\n`;

    const targetPhone = selectedCustomerObj?.phone || '';
    let waUrl = `https://api.whatsapp.com/send?text=${encodeURIComponent(text)}`;
    if (targetPhone) {
      let formattedPhone = targetPhone.replace(/\D/g, '');
      if (formattedPhone.startsWith('0')) formattedPhone = '62' + formattedPhone.slice(1);
      waUrl = `https://api.whatsapp.com/send?phone=${formattedPhone}&text=${encodeURIComponent(text)}`;
    }
    window.open(waUrl, '_blank');
  };

  return (
    <div className="flex flex-1 h-screen overflow-hidden bg-slate-100 font-sans">
      {/* Left Column: Katalog Produk & Filter */}
      <div className="flex-1 flex flex-col h-full overflow-hidden border-r border-slate-200">
        {/* Top Search & Filter Bar */}
        <div className="p-4 bg-white border-b border-slate-200 shadow-sm space-y-3 shrink-0">
          <div className="flex flex-wrap lg:flex-nowrap items-center gap-2.5">
            <div className="relative flex-1 min-w-[220px]">
              <Search className="w-6 h-6 absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Cari nama barang (misal: Beras, Minyak, Indomie)..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-13 pr-10 py-3.5 bg-slate-100 rounded-2xl border-2 border-transparent focus:border-blue-600 focus:bg-white text-base font-semibold text-slate-800 placeholder:text-slate-400 outline-none transition-all shadow-inner"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-1.5 rounded-full hover:bg-slate-200 text-slate-500"
                >
                  <X className="w-5 h-5" />
                </button>
              )}
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <button
                onClick={() => {
                  sound.playTap();
                  setQuickName(searchQuery || '');
                  setQuickPrice('');
                  setQuickBuyPrice('');
                  setQuickStock('10');
                  setShowQuickAddModal(true);
                }}
                className="px-4 py-3 bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white rounded-2xl font-extrabold text-xs sm:text-sm flex items-center gap-1.5 shadow-md shadow-emerald-500/20 transition-all"
                title="Tambah Barang Baru ke Stok & Langsung Masukkan ke Keranjang"
              >
                <Plus className="w-4 h-4 stroke-[3]" />
                <span>+ Stok Baru</span>
              </button>

              <button
                onClick={() => {
                  sound.playTap();
                  setManualName(searchQuery || '');
                  setManualPrice('');
                  setManualQty('1');
                  setShowManualItemModal(true);
                }}
                className="px-3.5 py-3 bg-amber-500 hover:bg-amber-600 active:scale-95 text-white rounded-2xl font-extrabold text-xs sm:text-sm flex items-center gap-1.5 shadow-md shadow-amber-500/20 transition-all shrink-0"
                title="Masukkan Item / Jasa Manual Langsung ke Keranjang tanpa potong stok"
              >
                <Sparkles className="w-4 h-4" />
                <span>+ Item Bebas</span>
              </button>

              <button
                onClick={() => {
                  sound.playTap();
                  setAdjProduct(null);
                  setShowAdjModal(true);
                }}
                className="px-3.5 py-3 bg-rose-600 hover:bg-rose-700 active:scale-95 text-white rounded-2xl font-extrabold text-xs sm:text-sm flex items-center gap-1.5 shadow-md shadow-rose-500/20 transition-all shrink-0"
                title="Catat barang yang dikonsumsi/dimakan sendiri atau rusak/jatuh untuk potong stok akurat"
              >
                <UtensilsCrossed className="w-4 h-4" />
                <span>🍪 Ambil Sendiri / Rusak</span>
              </button>

              <div className="hidden xl:flex text-sm font-bold bg-blue-50 text-blue-800 px-3.5 py-3 rounded-2xl border border-blue-200 items-center gap-1.5 shrink-0">
                <ShoppingBag className="w-4 h-4 text-blue-600" />
                <span>{filteredProducts.length}</span>
              </div>
            </div>
          </div>

          {/* Category Filter Pills - Horizontal Scrollable for Touch */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar">
            {CATEGORIES.map((cat) => {
              const isActive = selectedCategory === cat;
              const emoji = CATEGORY_ICONS[cat] || '📦';
              return (
                <button
                  key={cat}
                  onClick={() => {
                    sound.playTap();
                    setSelectedCategory(cat);
                  }}
                  className={`px-4.5 py-2.5 rounded-2xl text-xs sm:text-sm font-extrabold whitespace-nowrap transition-all duration-200 shrink-0 flex items-center gap-2 ${
                    isActive
                      ? 'bg-blue-600 text-white shadow-md shadow-blue-500/30 border border-blue-500 scale-[1.02]'
                      : 'bg-slate-100 text-slate-700 hover:bg-slate-200 hover:text-slate-900 border border-slate-200'
                  }`}
                >
                  <span className="text-base leading-none">{emoji}</span>
                  <span>{cat}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Banner if catalog is empty */}
        {products.length === 0 && (
          <div className="m-4 mb-0 bg-gradient-to-r from-blue-600 to-indigo-700 text-white p-4.5 rounded-3xl shadow-md flex flex-col sm:flex-row items-center justify-between gap-3">
            <div>
              <h4 className="font-black text-base flex items-center gap-2">
                <span>🏪 Stok Warung Belum Ada Barang</span>
              </h4>
              <p className="text-xs text-blue-100 mt-0.5">
                Ingin langsung memuat contoh produk warung lengkap (Indomie Dus/Eceran, Kopi Renteng, Beras ½kg, Telur, dll)?
              </p>
            </div>
            <button
              onClick={() => {
                sound.playSuccess();
                loadSampleWarungProducts();
              }}
              className="px-4 py-2.5 bg-amber-400 hover:bg-amber-300 text-slate-900 font-black text-xs sm:text-sm rounded-2xl shadow-md transition-all active:scale-95 shrink-0 whitespace-nowrap"
            >
              ⚡ Isi Contoh Barang Warung
            </button>
          </div>
        )}

        {/* Product Grid - Tablet Optimized (3 or 4 columns) */}
        <div className="flex-1 overflow-y-auto p-4 custom-scrollbar">
          {filteredProducts.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center p-8 text-slate-400">
              <div className="w-20 h-20 bg-slate-200 rounded-full flex items-center justify-center mb-4">
                <Search className="w-10 h-10 text-slate-400" />
              </div>
              <h3 className="text-xl font-bold text-slate-700">Barang "{searchQuery || 'tersebut'}" tidak ada di stok!</h3>
              <p className="text-sm mt-1 max-w-sm text-slate-500 mb-6">
                Belum terdaftar di sistem warung. Mau langsung tambahkan sekarang dan masukkan ke keranjang?
              </p>
              <div className="flex flex-wrap items-center justify-center gap-3">
                <button
                  onClick={() => {
                    sound.playTap();
                    setQuickName(searchQuery || '');
                    setQuickPrice('');
                    setQuickBuyPrice('');
                    setQuickStock('10');
                    setShowQuickAddModal(true);
                  }}
                  className="px-5 py-3.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-2xl font-extrabold text-sm flex items-center gap-2 shadow-lg shadow-emerald-500/20 transition-all active:scale-95"
                >
                  <Plus className="w-5 h-5 stroke-[3]" />
                  <span>+ Simpan "{searchQuery || 'Barang Baru'}" ke Stok & Keranjang</span>
                </button>
                <button
                  onClick={() => {
                    sound.playTap();
                    setManualName(searchQuery || '');
                    setManualPrice('');
                    setManualQty('1');
                    setShowManualItemModal(true);
                  }}
                  className="px-5 py-3.5 bg-amber-500 hover:bg-amber-600 text-white rounded-2xl font-extrabold text-sm flex items-center gap-2 shadow-lg shadow-amber-500/20 transition-all active:scale-95"
                >
                  <Sparkles className="w-5 h-5" />
                  <span>+ Masukkan "{searchQuery || 'Item Bebas'}" Tanpa Simpan Stok</span>
                </button>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3.5 pb-20">
              {filteredProducts.map((product) => {
                const isOutOfStock = product.stock <= 0;
                const isLowStock = !isOutOfStock && product.stock <= product.minStockAlert;
                const inCartItems = cart.filter(i => i.product.id === product.id);
                const totalInCartQty = inCartItems.reduce((sum, i) => sum + i.quantity, 0);
                const hasTiers = product.priceTiers && product.priceTiers.length > 0;

                const handleCardClick = () => {
                  if (isOutOfStock) {
                    sound.playWarning();
                    return;
                  }
                  if (hasTiers) {
                    sound.playTap();
                    setTierModalProduct(product);
                  } else {
                    addToCart(product, 1);
                  }
                };

                return (
                  <div
                    key={product.id}
                    onClick={handleCardClick}
                    className={`relative bg-white rounded-3xl p-4 border-2 transition-all duration-150 flex flex-col justify-between select-none shadow-sm ${
                      isOutOfStock
                        ? 'opacity-60 border-slate-200 bg-slate-50 cursor-not-allowed'
                        : totalInCartQty > 0
                        ? 'border-blue-500 bg-blue-50/40 shadow-md ring-2 ring-blue-500/20 cursor-pointer active:scale-[0.98]'
                        : 'border-slate-200 hover:border-blue-300 hover:shadow-md cursor-pointer active:scale-[0.98]'
                    }`}
                  >
                    {/* Badge In Cart */}
                    {totalInCartQty > 0 && (
                      <div className="absolute -top-2.5 -right-2.5 bg-blue-600 text-white font-black text-xs px-3 py-1 rounded-full shadow-lg border-2 border-white z-10 animate-bounce">
                        {totalInCartQty}x di Keranjang
                      </div>
                    )}

                    <div>
                      {/* Top Row: Icon & Stock Badge */}
                      <div className="flex items-start justify-between gap-2 mb-2">
                        <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-2xl shrink-0 ${product.colorTag || 'bg-blue-50 text-blue-900'}`}>
                          {product.icon || '📦'}
                        </div>
                        <span className={`text-[11px] font-extrabold px-2.5 py-1 rounded-full whitespace-nowrap ${
                          isOutOfStock
                            ? 'bg-rose-100 text-rose-700 border border-rose-200'
                            : isLowStock
                            ? 'bg-amber-100 text-amber-800 border border-amber-300 font-black animate-pulse'
                            : 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                        }`}>
                          {isOutOfStock ? 'Habis' : `${product.stock} ${product.unit}`}
                        </span>
                      </div>

                      {/* Product Name */}
                      <h3 className="font-extrabold text-slate-800 text-sm leading-snug line-clamp-2">
                        {product.name}
                      </h3>

                      {/* Grosir Badge if available */}
                      {hasTiers && (
                        <div className="mt-1 text-[10px] font-black text-amber-800 bg-amber-100/90 px-2 py-0.5 rounded-md inline-flex items-center gap-1 border border-amber-300/60">
                          <span>📦</span>
                          <span>Ada Kemasan Grosir</span>
                        </div>
                      )}
                    </div>

                    {/* Bottom Row: Price & Add Button */}
                    <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-center justify-between gap-1">
                      <div>
                        <div className="text-[10px] font-bold text-slate-400 uppercase">Harga Jual</div>
                        <div className="text-base font-black text-blue-600 leading-none">
                          {formatIDR(product.sellPrice)}
                        </div>
                      </div>
                      <button
                        disabled={isOutOfStock}
                        onClick={(e) => {
                          e.stopPropagation();
                          handleCardClick();
                        }}
                        className={`w-10 h-10 rounded-2xl flex items-center justify-center font-bold text-lg transition-colors shrink-0 shadow-sm ${
                          isOutOfStock
                            ? 'bg-slate-200 text-slate-400'
                            : hasTiers
                            ? 'bg-amber-500 hover:bg-amber-600 text-white shadow-amber-500/20 active:bg-amber-700'
                            : 'bg-blue-600 hover:bg-blue-700 text-white shadow-blue-500/20 active:bg-blue-800'
                        }`}
                      >
                        <Plus className="w-5 h-5 stroke-[3]" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Right Column: Keranjang & Pembayaran (Collapsible width) */}
      {isCartMinimized ? (
        /* Minimized Cart Strip Bar */
        <div className="w-16 bg-slate-900 text-white flex flex-col items-center justify-between py-4 shadow-xl z-10 shrink-0 border-l border-slate-800 select-none animate-fade-in">
          <div className="flex flex-col items-center gap-4">
            <button
              onClick={() => {
                sound.playTap();
                setIsCartMinimized(false);
              }}
              className="w-10 h-10 rounded-2xl bg-blue-600 hover:bg-blue-500 text-white flex items-center justify-center shadow-lg transition-transform active:scale-95"
              title="Buka / Buka Lebar Keranjang (Expand Cart)"
            >
              <ChevronLeft className="w-6 h-6 stroke-[3]" />
            </button>

            <div className="relative mt-2">
              <button
                onClick={() => setIsCartMinimized(false)}
                className="w-12 h-12 rounded-2xl bg-slate-800 flex items-center justify-center text-blue-400 hover:bg-slate-700 transition-colors"
                title="Lihat Isi Keranjang"
              >
                <ShoppingCart className="w-6 h-6" />
              </button>
              {cart.length > 0 && (
                <span className="absolute -top-1.5 -right-1.5 bg-rose-500 text-white text-[11px] font-black w-6 h-6 rounded-full flex items-center justify-center border-2 border-slate-900 shadow-md">
                  {cart.length}
                </span>
              )}
            </div>
          </div>

          <div className="flex flex-col items-center gap-3">
            <div className="writing-mode-vertical text-center text-xs font-black text-blue-300 tracking-wider">
              {formatIDR(totalAmount)}
            </div>
            <button
              onClick={() => {
                sound.playTap();
                setIsCartMinimized(false);
              }}
              className="w-10 h-10 rounded-2xl bg-emerald-500 hover:bg-emerald-400 text-slate-900 font-black flex items-center justify-center shadow-lg transition-all active:scale-95"
              title="Buka untuk Bayar"
            >
              <ArrowRight className="w-5 h-5 stroke-[3]" />
            </button>
          </div>
        </div>
      ) : (
        /* Expanded Cart Panel */
        <div className="w-96 lg:w-[420px] bg-white flex flex-col h-full shadow-xl z-10 shrink-0 border-l border-slate-200 select-none transition-all duration-200">
          {/* Cart Header */}
          <div className="p-4 bg-gradient-to-r from-blue-900 to-blue-800 text-white flex items-center justify-between shadow-md shrink-0">
            <div className="flex items-center gap-2.5">
              <ShoppingCart className="w-6 h-6 text-blue-300" />
              <div>
                <h2 className="font-extrabold text-base leading-none">Keranjang Belanja</h2>
                <p className="text-xs text-blue-200 mt-0.5 font-medium">
                  {cart.length} jenis barang dipilih
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {cart.length > 0 && (
                <button
                  onClick={clearCart}
                  className="px-2.5 py-1.5 rounded-xl bg-rose-500/20 hover:bg-rose-500/40 text-rose-200 border border-rose-400/30 text-xs font-bold flex items-center gap-1 transition-colors"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Hapus</span>
                </button>
              )}
              <button
                onClick={() => {
                  sound.playTap();
                  setIsCartMinimized(true);
                }}
                className="p-1.5 rounded-xl bg-blue-800/80 hover:bg-blue-700 text-blue-100 border border-blue-700 text-xs font-bold flex items-center gap-1 transition-colors"
                title="Kecilkan / Minimize Keranjang agar Layar Produk Lebih Luas"
              >
                <ChevronRight className="w-5 h-5 stroke-[2.5]" />
              </button>
            </div>
          </div>

          {/* Cart Items List */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3 custom-scrollbar bg-slate-50/60">
            {cart.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center p-6 text-slate-400">
                <div className="w-16 h-16 bg-slate-100 rounded-3xl flex items-center justify-center mb-3 border border-slate-200">
                  <ShoppingCart className="w-8 h-8 text-slate-300" />
                </div>
                <p className="font-bold text-slate-600 text-sm">Keranjang Masih Kosong</p>
                <p className="text-xs text-slate-400 mt-1">
                  Sentuh kartu barang di kiri untuk memasukkan ke keranjang kasir.
                </p>
              </div>
            ) : (
              cart.map((item, idx) => {
                const isTier = !!item.selectedTier;
                const unitLabel = item.selectedTier ? item.selectedTier.unitName : item.product.unit;
                const unitPrice = item.selectedTier ? item.selectedTier.sellPrice : item.product.sellPrice;

                return (
                  <div
                    key={`${item.product.id}-${item.selectedTier?.id || 'base'}-${idx}`}
                    className="bg-white p-3.5 rounded-2xl border border-slate-200/80 shadow-sm flex flex-col gap-2"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <span className="text-xl">{item.product.icon || '📦'}</span>
                        <div>
                          <h4 className="font-bold text-slate-800 text-sm leading-snug">
                            {item.product.name}
                          </h4>
                          <div className="flex items-center gap-1.5 flex-wrap mt-0.5">
                            <span className="text-xs text-blue-600 font-extrabold">
                              {formatIDR(unitPrice)} / {unitLabel}
                            </span>
                            {isTier && (
                              <span className="text-[10px] font-black px-1.5 py-0.5 bg-amber-100 text-amber-800 rounded border border-amber-300">
                                Grosir
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                      <button
                        onClick={() => removeFromCart(idx)}
                        className="text-slate-400 hover:text-rose-600 p-1 rounded-lg hover:bg-rose-50 transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>

                    {/* Quantity Controls (Direct Editable Input + Buttons) & Subtotal */}
                    <div className="flex items-center justify-between pt-2 border-t border-slate-100 mt-1">
                      <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl border border-slate-200">
                        <button
                          onClick={() => updateCartQty(idx, item.quantity - 1)}
                          className="w-8 h-8 rounded-lg bg-white hover:bg-slate-200 text-slate-700 font-black flex items-center justify-center shadow-sm active:scale-95 shrink-0"
                        >
                          <Minus className="w-4 h-4 stroke-[3]" />
                        </button>
                        
                        {/* Direct Editable Input Number (Mama bisa ketik 10, 25, dll) */}
                        <CartItemQtyInput
                          idx={idx}
                          quantity={item.quantity}
                          updateCartQty={updateCartQty}
                        />

                        <button
                          onClick={() => updateCartQty(idx, item.quantity + 1)}
                          className="w-8 h-8 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-black flex items-center justify-center shadow-sm active:scale-95 shrink-0"
                        >
                          <Plus className="w-4 h-4 stroke-[3]" />
                        </button>
                      </div>

                      <div className="text-right">
                        <div className="text-[10px] text-slate-400 font-bold">Subtotal</div>
                        <div className="font-black text-blue-600 text-base">
                          {formatIDR(item.subtotal)}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>

        {/* Payment & Checkout Section (Bottom Box) */}
        <div className="p-4 bg-white border-t border-slate-200 space-y-3 shrink-0 shadow-lg">
          {/* Payment Method Selector */}
          <div>
            <div className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">
              Metode Pembayaran
            </div>
            <div className="grid grid-cols-2 gap-2.5">
              <button
                onClick={() => {
                  sound.playTap();
                  setPaymentMethod('CASH');
                  setCashReceived(totalAmount);
                }}
                className={`py-3 px-3 rounded-xl font-extrabold text-sm flex items-center justify-center gap-2 border-2 transition-all ${
                  paymentMethod === 'CASH'
                    ? 'bg-blue-600 text-white border-blue-600 shadow-md shadow-blue-500/20'
                    : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                }`}
              >
                <Banknote className="w-5 h-5" />
                <span>Uang Tunai (Cash)</span>
              </button>

              <button
                onClick={() => {
                  sound.playTap();
                  setPaymentMethod('HUTANG');
                }}
                className={`py-3 px-3 rounded-xl font-extrabold text-sm flex items-center justify-center gap-2 border-2 transition-all ${
                  paymentMethod === 'HUTANG'
                    ? 'bg-rose-600 text-white border-rose-600 shadow-md shadow-rose-500/20'
                    : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                }`}
              >
                <BookOpen className="w-5 h-5" />
                <span>Kasbon (Hutang)</span>
              </button>
            </div>
          </div>

          {/* Conditional Input based on Payment Method */}
          {paymentMethod === 'HUTANG' ? (
            <div className="bg-rose-50 p-3 rounded-2xl border border-rose-200 space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-xs font-extrabold text-rose-900 flex items-center gap-1">
                  <User className="w-4 h-4 text-rose-600" />
                  <span>Pilih Pelanggan Hutang (Kasbon)</span>
                </label>
                <button
                  onClick={() => setShowAddCustomerModal(true)}
                  className="text-xs font-extrabold text-blue-600 hover:underline flex items-center gap-1"
                >
                  <UserPlus className="w-3.5 h-3.5" />
                  <span>+ Baru</span>
                </button>
              </div>
              <select
                value={selectedCustomerId}
                onChange={(e) => setSelectedCustomerId(e.target.value)}
                className="w-full p-2.5 bg-white rounded-xl border border-rose-300 text-sm font-bold text-slate-800 outline-none focus:ring-2 focus:ring-rose-500"
              >
                <option value="">-- Pilih Nama Pelanggan --</option>
                {customers.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name} {c.totalDebt > 0 ? `(Hutang aktif: ${formatIDR(c.totalDebt)})` : ''}
                  </option>
                ))}
              </select>
            </div>
          ) : paymentMethod === 'CASH' ? (
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs font-bold text-slate-500">
                <span>Uang Tunai Diterima</span>
                <span className="text-blue-600">Pilih cepat:</span>
              </div>
              
              {/* Quick Cash Buttons */}
              <div className="flex flex-wrap gap-1.5">
                {smartCashOptions.map((opt) => {
                  const isExact = opt === totalAmount;
                  const isSelected = cashReceived === opt;
                  const label = isExact ? 'Uang Pas' : opt >= 1000000 ? `${(opt/1000000).toFixed(1)}Jt` : `${opt/1000}Rb`;
                  return (
                    <button
                      key={opt}
                      onClick={() => handleQuickCash(opt)}
                      className={`flex-1 min-w-[64px] py-2 px-1.5 border font-black text-xs rounded-xl transition-all ${
                        isSelected
                          ? 'bg-blue-600 border-blue-600 text-white shadow-md'
                          : isExact
                          ? 'bg-emerald-50 border-emerald-300 text-emerald-800 hover:bg-emerald-100'
                          : 'bg-slate-100 border-slate-200 text-slate-800 hover:bg-slate-200'
                      }`}
                    >
                      {label}
                    </button>
                  );
                })}
              </div>

              {/* Cash Input */}
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 font-extrabold text-slate-400 text-sm">Rp</span>
                <input
                  type="number"
                  value={cashReceived || ''}
                  onChange={(e) => setCashReceived(Number(e.target.value))}
                  placeholder="0"
                  className="w-full pl-9 pr-3 py-2.5 bg-slate-100 rounded-xl border border-slate-300 font-black text-lg text-slate-800 outline-none focus:bg-white focus:border-blue-600 focus:ring-2 focus:ring-blue-500/20"
                />
              </div>
            </div>
          ) : (
            <div className="bg-blue-50 p-3 rounded-2xl border border-blue-200 text-center">
              <QrCode className="w-8 h-8 text-blue-600 mx-auto mb-1" />
              <p className="text-xs font-bold text-blue-900">Pembayaran QRIS / Transfer Bank</p>
              <p className="text-[11px] text-blue-700 mt-0.5">Pastikan notifikasi uang masuk sudah diterima di HP sebelum klik selesai.</p>
            </div>
          )}

          {/* Optional Note */}
          <input
            type="text"
            placeholder="Catatan opsional (misal: titipan barang, bonus, dll)..."
            value={transactionNote}
            onChange={(e) => setTransactionNote(e.target.value)}
            className="w-full px-3 py-2 bg-slate-50 rounded-xl border border-slate-200 text-xs text-slate-700 outline-none focus:border-blue-500"
          />

          {/* Error Banner */}
          {errorMessage && (
            <div className="p-2.5 bg-rose-100 border border-rose-300 rounded-xl text-rose-800 text-xs font-extrabold flex items-center justify-between gap-2">
              <div className="flex items-center gap-1.5">
                <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
                <span>{errorMessage}</span>
              </div>
              <button onClick={() => setErrorMessage(null)} className="text-rose-600 hover:text-rose-900">
                <X className="w-4 h-4" />
              </button>
            </div>
          )}

          {/* Totals Box */}
          <div className="bg-slate-100 p-3.5 rounded-2xl border border-slate-200 space-y-1.5">
            <div className="flex justify-between items-center text-sm font-bold text-slate-600">
              <span>Total Belanja:</span>
              <span className="text-xl font-black text-blue-900">{formatIDR(totalAmount)}</span>
            </div>
            {paymentMethod === 'CASH' && (
              <div className="flex justify-between items-center text-xs font-extrabold pt-1 border-t border-slate-200">
                <span className="text-slate-500">Kembalian Konsumen:</span>
                <span className={`text-base font-black ${changeAmount > 0 ? 'text-emerald-600' : 'text-slate-700'}`}>
                  {formatIDR(changeAmount)}
                </span>
              </div>
            )}
          </div>

          {/* Big Touch Checkout Button */}
          <button
            disabled={cart.length === 0}
            onClick={handleCheckout}
            className={`w-full py-4 rounded-2xl font-black text-base transition-all flex items-center justify-center gap-2 shadow-lg ${
              cart.length === 0
                ? 'bg-slate-300 text-slate-500 cursor-not-allowed'
                : paymentMethod === 'HUTANG'
                ? 'bg-rose-600 hover:bg-rose-700 text-white shadow-rose-500/30 active:scale-[0.99]'
                : 'bg-blue-600 hover:bg-blue-700 text-white shadow-blue-600/30 active:scale-[0.99]'
            }`}
          >
            {paymentMethod === 'HUTANG' ? (
              <>
                <BookOpen className="w-5 h-5" />
                <span>SIMPAN BON HUTANG (KASBON)</span>
              </>
            ) : (
              <>
                <CheckCircle2 className="w-5 h-5" />
                <span>SELESAI & BAYAR ({formatIDR(totalAmount)})</span>
              </>
            )}
          </button>
        </div>
      </div>
      )}

      {/* MODAL STRUK BELANJA (Receipt Preview & Share) */}
      {showReceiptModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-200 flex flex-col max-h-[90vh]">
            <div className="text-center pb-4 border-b border-dashed border-slate-300">
              <div className="w-12 h-12 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-2 shadow-sm">
                <CheckCircle2 className="w-8 h-8" />
              </div>
              <h3 className="text-lg font-black text-slate-800">Transaksi Berhasil!</h3>
              <p className="text-xs text-slate-500 mt-0.5">Nota: {lastInvoice || 'INV-001'}</p>
            </div>

            {/* Receipt Preview Paper */}
            <div className="my-4 bg-slate-50 p-4 rounded-2xl border border-slate-200 font-mono text-xs text-slate-700 space-y-2 overflow-y-auto max-h-60 custom-scrollbar">
              <div className="text-center font-bold text-sm text-slate-800">{settings.storeName}</div>
              <div className="text-center text-[10px] text-slate-500">{settings.address}</div>
              <div className="text-center text-[10px] text-slate-500">Telp/WA: {settings.phone}</div>
              <div className="border-b border-dashed border-slate-300 my-2" />
              
              <div className="flex justify-between text-[11px]">
                <span>Tgl: {new Date().toLocaleDateString('id-ID')}</span>
                <span>Kasir: {settings.ownerName}</span>
              </div>
              {selectedCustomerObj && (
                <div className="text-[11px] font-bold text-rose-700 bg-rose-50 p-1 rounded">
                  Pelanggan Bon: {selectedCustomerObj.name}
                </div>
              )}
              
              <div className="border-b border-dashed border-slate-300 my-2" />
              
              <div className="space-y-1">
                {cart.length === 0 ? (
                  <div className="text-slate-400 italic text-center py-2">Detail item tercatat di sistem</div>
                ) : (
                  cart.map((item, idx) => (
                    <div key={idx} className="flex justify-between">
                      <span className="truncate pr-2">{item.product.name} ({item.quantity}x)</span>
                      <span className="font-bold">{formatIDR(item.subtotal)}</span>
                    </div>
                  ))
                )}
              </div>

              <div className="border-b border-dashed border-slate-300 my-2" />
              
              <div className="flex justify-between font-extrabold text-sm text-slate-900">
                <span>TOTAL:</span>
                <span>{formatIDR(totalAmount)}</span>
              </div>
              <div className="flex justify-between text-xs">
                <span>Metode Bayar:</span>
                <span className="font-bold">{paymentMethod === 'HUTANG' ? 'Hutang / Kasbon' : paymentMethod}</span>
              </div>
              {paymentMethod === 'CASH' && (
                <>
                  <div className="flex justify-between text-xs">
                    <span>Uang Tunai:</span>
                    <span>{formatIDR(cashReceived)}</span>
                  </div>
                  <div className="flex justify-between text-xs font-bold text-emerald-700">
                    <span>Kembalian:</span>
                    <span>{formatIDR(changeAmount)}</span>
                  </div>
                </>
              )}
              <div className="border-b border-dashed border-slate-300 my-2" />
              <div className="text-center text-[10px] text-slate-500 leading-tight">
                {settings.footerMessage}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="grid grid-cols-2 gap-2 mt-2">
              <button
                onClick={() => {
                  sound.playTap();
                  window.print();
                }}
                className="py-3 px-4 bg-slate-100 hover:bg-slate-200 text-slate-800 font-extrabold text-sm rounded-2xl flex items-center justify-center gap-2 border border-slate-300 transition-colors"
              >
                <Printer className="w-4 h-4" />
                <span>Cetak Struk</span>
              </button>
              
              <button
                onClick={handleSendWhatsApp}
                className="py-3 px-4 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-sm rounded-2xl flex items-center justify-center gap-2 shadow-md shadow-emerald-600/20 transition-colors"
              >
                <Share2 className="w-4 h-4" />
                <span>Kirim WA</span>
              </button>
            </div>

            <button
              onClick={() => {
                sound.playTap();
                setShowReceiptModal(false);
              }}
              className="w-full mt-3 py-3.5 bg-blue-600 hover:bg-blue-700 text-white font-black text-base rounded-2xl shadow-lg shadow-blue-600/30 transition-all flex items-center justify-center gap-2"
            >
              <span>Transaksi Baru Selanjutnya</span>
              <ArrowRight className="w-5 h-5" />
            </button>
          </div>
        </div>
      )}

      {/* MODAL TAMBAH PELANGGAN BARU (For Hutang / Kasbon) */}
      {showAddCustomerModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-200">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-4">
              <h3 className="font-extrabold text-lg text-slate-800 flex items-center gap-2">
                <UserPlus className="w-5 h-5 text-blue-600" />
                <span>Tambah Pelanggan Baru</span>
              </h3>
              <button onClick={() => setShowAddCustomerModal(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateCustomer} className="space-y-3">
              <div>
                <label className="text-xs font-bold text-slate-600 mb-1 block">Nama Lengkap / Panggilan *</label>
                <input
                  type="text"
                  required
                  placeholder="Misal: Bu Ani (Warung Kopi), Pak Joko..."
                  value={newCustName}
                  onChange={(e) => setNewCustName(e.target.value)}
                  className="w-full p-3 bg-slate-50 rounded-xl border border-slate-300 font-bold text-sm text-slate-800 outline-none focus:bg-white focus:border-blue-600"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-600 mb-1 block">Nomor WhatsApp / HP (Untuk Ingatkan Hutang)</label>
                <input
                  type="tel"
                  placeholder="Misal: 081234567890"
                  value={newCustPhone}
                  onChange={(e) => setNewCustPhone(e.target.value)}
                  className="w-full p-3 bg-slate-50 rounded-xl border border-slate-300 font-semibold text-sm text-slate-800 outline-none focus:bg-white focus:border-blue-600"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-600 mb-1 block">Alamat / Catatan Ciri Rumah</label>
                <input
                  type="text"
                  placeholder="Misal: Rumah cat kuning depan lapangan blok B"
                  value={newCustAddress}
                  onChange={(e) => setNewCustAddress(e.target.value)}
                  className="w-full p-3 bg-slate-50 rounded-xl border border-slate-300 font-semibold text-sm text-slate-800 outline-none focus:bg-white focus:border-blue-600"
                />
              </div>

              <div className="pt-3 flex gap-2">
                <button
                  type="button"
                  onClick={() => setShowAddCustomerModal(false)}
                  className="flex-1 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-sm rounded-xl transition-colors"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="flex-1 py-3 bg-blue-600 hover:bg-blue-700 text-white font-black text-sm rounded-xl shadow-md transition-colors"
                >
                  Simpan & Pilih
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL TAMBAH BARANG BARU KE STOK & KERANJANG (Quick Add) */}
      {showQuickAddModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-200">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-4">
              <h3 className="font-extrabold text-lg text-slate-800 flex items-center gap-2">
                <Plus className="w-5 h-5 text-emerald-600 stroke-[3]" />
                <span>Tambah Stok Baru & Masuk Keranjang</span>
              </h3>
              <button onClick={() => setShowQuickAddModal(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                if (!quickName.trim() || !quickPrice) return;
                sound.playSuccess();
                const sellP = Number(quickPrice);
                const buyP = quickBuyPrice ? Number(quickBuyPrice) : Math.round(sellP * 0.8);
                const newProd = addProduct({
                  name: quickName.trim(),
                  category: quickCategory,
                  sellPrice: sellP,
                  buyPrice: buyP,
                  stock: Number(quickStock) || 10,
                  unit: 'pcs',
                  minStockAlert: 3,
                  icon: '📦'
                });
                addToCart(newProd, 1);
                setShowQuickAddModal(false);
                setSearchQuery('');
              }}
              className="space-y-3"
            >
              <div>
                <label className="text-xs font-bold text-slate-600 mb-1 block">Nama Barang *</label>
                <input
                  type="text"
                  required
                  placeholder="Misal: Minyak Goreng Curah 1 Kg..."
                  value={quickName}
                  onChange={(e) => setQuickName(e.target.value)}
                  className="w-full p-3 bg-slate-50 rounded-xl border border-slate-300 font-bold text-sm text-slate-800 outline-none focus:bg-white focus:border-emerald-600"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-slate-600 mb-1 block">Kategori</label>
                  <select
                    value={quickCategory}
                    onChange={(e) => setQuickCategory(e.target.value as ProductCategory)}
                    className="w-full p-3 bg-slate-50 rounded-xl border border-slate-300 font-semibold text-sm text-slate-800 outline-none focus:bg-white focus:border-emerald-600"
                  >
                    {CATEGORIES.filter(c => c !== 'Semua').map(c => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-600 mb-1 block">Stok Awal</label>
                  <input
                    type="number"
                    required
                    min="1"
                    value={quickStock}
                    onChange={(e) => setQuickStock(e.target.value)}
                    className="w-full p-3 bg-slate-50 rounded-xl border border-slate-300 font-bold text-sm text-slate-800 outline-none focus:bg-white focus:border-emerald-600"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-slate-600 mb-1 block">Harga Jual (Rp) *</label>
                  <input
                    type="number"
                    required
                    min="100"
                    placeholder="16000"
                    value={quickPrice}
                    onChange={(e) => setQuickPrice(e.target.value)}
                    className="w-full p-3 bg-slate-50 rounded-xl border border-slate-300 font-black text-sm text-emerald-600 outline-none focus:bg-white focus:border-emerald-600"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-600 mb-1 block">Harga Modal / Beli (Opsional)</label>
                  <input
                    type="number"
                    placeholder="Otomatis 80%"
                    value={quickBuyPrice}
                    onChange={(e) => setQuickBuyPrice(e.target.value)}
                    className="w-full p-3 bg-slate-50 rounded-xl border border-slate-300 font-semibold text-sm text-slate-800 outline-none focus:bg-white focus:border-emerald-600"
                  />
                </div>
              </div>

              <div className="pt-3 flex gap-2">
                <button
                  type="button"
                  onClick={() => setShowQuickAddModal(false)}
                  className="flex-1 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-sm rounded-xl transition-colors"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="flex-1 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-black text-sm rounded-xl shadow-md transition-colors flex items-center justify-center gap-1.5"
                >
                  <Plus className="w-4 h-4 stroke-[3]" />
                  <span>Simpan & Masuk Keranjang</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL ITEM BEBAS / MANUAL (Tanpa Simpan Stok) */}
      {showManualItemModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-200">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-4">
              <h3 className="font-extrabold text-lg text-slate-800 flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-amber-500" />
                <span>Masukkan Item Bebas / Manual</span>
              </h3>
              <button onClick={() => setShowManualItemModal(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-slate-500 mb-4 font-medium">
              Gunakan untuk jasa (seperti antar galon, es batu), barang titipan, atau item cepat yang tidak perlu dicatat stoknya.
            </p>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                if (!manualPrice) return;
                sound.playSuccess();
                addCustomItemToCart(
                  manualName.trim() || 'Item / Jasa Manual',
                  Number(manualPrice),
                  Number(manualQty) || 1
                );
                setShowManualItemModal(false);
                setSearchQuery('');
              }}
              className="space-y-3"
            >
              <div>
                <label className="text-xs font-bold text-slate-600 mb-1 block">Nama Item / Jasa</label>
                <input
                  type="text"
                  placeholder="Misal: Es Batu, Jasa Antar, Plastik Kresek..."
                  value={manualName}
                  onChange={(e) => setManualName(e.target.value)}
                  className="w-full p-3 bg-slate-50 rounded-xl border border-slate-300 font-bold text-sm text-slate-800 outline-none focus:bg-white focus:border-amber-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-slate-600 mb-1 block">Harga (Rp) *</label>
                  <input
                    type="number"
                    required
                    min="100"
                    placeholder="2000"
                    value={manualPrice}
                    onChange={(e) => setManualPrice(e.target.value)}
                    className="w-full p-3 bg-slate-50 rounded-xl border border-slate-300 font-black text-sm text-amber-600 outline-none focus:bg-white focus:border-amber-500"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-600 mb-1 block">Jumlah (Qty)</label>
                  <input
                    type="number"
                    required
                    min="1"
                    value={manualQty}
                    onChange={(e) => setManualQty(e.target.value)}
                    className="w-full p-3 bg-slate-50 rounded-xl border border-slate-300 font-bold text-sm text-slate-800 outline-none focus:bg-white focus:border-amber-500"
                  />
                </div>
              </div>

              <div className="pt-3 flex gap-2">
                <button
                  type="button"
                  onClick={() => setShowManualItemModal(false)}
                  className="flex-1 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-sm rounded-xl transition-colors"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="flex-1 py-3 bg-amber-500 hover:bg-amber-600 text-white font-black text-sm rounded-xl shadow-md transition-colors flex items-center justify-center gap-1.5"
                >
                  <Sparkles className="w-4 h-4" />
                  <span>Langsung Masuk Keranjang</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      {/* Unit / Grosir Selection Modal */}
      {tierModalProduct && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-white rounded-3xl p-6 max-w-md w-full shadow-2xl border border-slate-200 animate-scale-up">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div className="flex items-center gap-3">
                <span className="text-3xl">{tierModalProduct.icon || '📦'}</span>
                <div>
                  <h3 className="font-extrabold text-slate-800 text-base leading-snug">
                    {tierModalProduct.name}
                  </h3>
                  <p className="text-xs text-slate-500 font-semibold mt-0.5">
                    Stok Utama Tersedia: <span className="text-blue-600 font-extrabold">{tierModalProduct.stock} {tierModalProduct.unit}</span>
                  </p>
                </div>
              </div>
              <button
                onClick={() => setTierModalProduct(null)}
                className="w-8 h-8 rounded-full bg-slate-100 text-slate-500 flex items-center justify-center hover:bg-slate-200 font-bold"
              >
                ✕
              </button>
            </div>

            <div className="mt-4 mb-2 text-xs font-bold text-slate-400 uppercase tracking-wider">
              Pilih Kemasan / Satuan Penjualan:
            </div>

            <div className="space-y-2.5">
              {/* Base Unit Option */}
              <button
                onClick={() => {
                  addToCart(tierModalProduct, 1);
                  setTierModalProduct(null);
                }}
                className="w-full text-left p-4 rounded-2xl bg-slate-50 hover:bg-blue-50/80 border-2 border-slate-200 hover:border-blue-400 transition-all flex items-center justify-between group"
              >
                <div>
                  <div className="font-extrabold text-slate-800 group-hover:text-blue-700 text-sm">
                    1 {tierModalProduct.unit} (Satuan Eceran)
                  </div>
                  <div className="text-xs text-slate-500 font-medium mt-0.5">
                    Memotong stok 1 {tierModalProduct.unit}
                  </div>
                </div>
                <div className="text-base font-black text-blue-600">
                  {formatIDR(tierModalProduct.sellPrice)}
                </div>
              </button>

              {/* Tier Options */}
              {tierModalProduct.priceTiers?.map((tier) => (
                <button
                  key={tier.id}
                  onClick={() => {
                    addToCart(tierModalProduct, 1, tier);
                    setTierModalProduct(null);
                  }}
                  className="w-full text-left p-4 rounded-2xl bg-amber-50/70 hover:bg-amber-100/90 border-2 border-amber-200 hover:border-amber-400 transition-all flex items-center justify-between group"
                >
                  <div>
                    <div className="font-black text-amber-950 text-sm flex items-center gap-1.5">
                      <span>📦</span>
                      <span>{tier.unitName}</span>
                    </div>
                    <div className="text-xs text-amber-800 font-semibold mt-0.5">
                      Grosir (Memotong stok {tier.conversionRatio} {tierModalProduct.unit})
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-base font-black text-amber-900">
                      {formatIDR(tier.sellPrice)}
                    </div>
                    <div className="text-[10px] text-amber-700 font-bold">
                      (~{formatIDR(Math.round(tier.sellPrice / tier.conversionRatio))}/{tierModalProduct.unit})
                    </div>
                  </div>
                </button>
              ))}
            </div>

            <div className="mt-5 pt-3 border-t border-slate-100 text-center">
              <button
                onClick={() => setTierModalProduct(null)}
                className="w-full py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-bold text-xs"
              >
                Batal
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Stock Adjustment Modal */}
      <StockAdjustmentModal
        isOpen={showAdjModal}
        onClose={() => setShowAdjModal(false)}
        preSelectedProduct={adjProduct}
      />
    </div>
  );
};
