import React, { useState, useMemo } from 'react';
import { useStore } from '../context/StoreContext';
import { Product, ProductCategory, PriceTier } from '../types';
import { formatIDR } from '../utils/formatters';
import { sound } from '../utils/sound';
import { StockAdjustmentModal } from './StockAdjustmentModal';
import {
  Search,
  Plus,
  Minus,
  Edit2,
  Trash2,
  AlertTriangle,
  PackagePlus,
  X,
  Filter,
  CheckCircle,
  HelpCircle,
  TrendingUp,
  ArrowUpDown,
  LayoutGrid,
  List,
  UtensilsCrossed,
  Eye,
  EyeOff
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

export const StockCatalog: React.FC = () => {
  const {
    products,
    addProduct,
    updateProduct,
    deleteProduct,
    quickStockAdjust,
    loadSampleWarungProducts,
    selectedCategory,
    setSelectedCategory,
    searchQuery,
    setSearchQuery
  } = useStore();

  // Modal States
  const [showModal, setShowModal] = useState<boolean>(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  // Form States
  const [name, setName] = useState<string>('');
  const [category, setCategory] = useState<Exclude<ProductCategory, 'Semua'>>('Sembako');
  const [buyPrice, setBuyPrice] = useState<number | string>(0);
  const [sellPrice, setSellPrice] = useState<number | string>(0);
  const [stock, setStock] = useState<number | string>(10);
  const [unit, setUnit] = useState<string>('pcs');
  const [minStockAlert, setMinStockAlert] = useState<number | string>(5);
  const [icon, setIcon] = useState<string>('📦');
  const [priceTiers, setPriceTiers] = useState<PriceTier[]>([]);

  // View & Visibility States
  const [showStockSummary, setShowStockSummary] = useState<boolean>(true);
  const [sortBy, setSortBy] = useState<'name' | 'stock' | 'profit'>('name');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  const [viewMode, setViewMode] = useState<'table' | 'grid'>('table');

  // Stock Adjustment Modal
  const [showAdjModal, setShowAdjModal] = useState<boolean>(false);
  const [adjProduct, setAdjProduct] = useState<Product | null>(null);

  const catalogStats = useMemo(() => {
    const totalAssetValue = products.reduce((sum, p) => sum + (p.buyPrice * p.stock), 0);
    const totalSalesPotential = products.reduce((sum, p) => sum + (p.sellPrice * p.stock), 0);
    const lowStockCount = products.filter(p => p.stock <= p.minStockAlert).length;
    return { totalAssetValue, totalSalesPotential, lowStockCount };
  }, [products]);

  const filteredProducts = useMemo(() => {
    let list = products.filter(p => {
      const matchCat = selectedCategory === 'Semua' || p.category === selectedCategory;
      const matchSearch = searchQuery === '' ||
        p.name.toLowerCase().includes(searchQuery.toLowerCase());
      return matchCat && matchSearch;
    });

    return list.sort((a, b) => {
      if (sortBy === 'name') {
        return sortOrder === 'asc' ? a.name.localeCompare(b.name) : b.name.localeCompare(a.name);
      } else if (sortBy === 'stock') {
        return sortOrder === 'asc' ? a.stock - b.stock : b.stock - a.stock;
      } else if (sortBy === 'profit') {
        const profA = a.sellPrice - a.buyPrice;
        const profB = b.sellPrice - b.buyPrice;
        return sortOrder === 'asc' ? profA - profB : profB - profA;
      }
      return 0;
    });
  }, [products, selectedCategory, searchQuery, sortBy, sortOrder]);

  const handleOpenModal = (prod?: Product) => {
    sound.playTap();
    if (prod) {
      setEditingProduct(prod);
      setName(prod.name);
      setCategory(prod.category);
      setBuyPrice(prod.buyPrice);
      setSellPrice(prod.sellPrice);
      setStock(prod.stock);
      setUnit(prod.unit);
      setMinStockAlert(prod.minStockAlert);
      setIcon(prod.icon || '📦');
      setPriceTiers(prod.priceTiers ? JSON.parse(JSON.stringify(prod.priceTiers)) : []);
    } else {
      setEditingProduct(null);
      setName('');
      setCategory('Sembako');
      setBuyPrice(0);
      setSellPrice(0);
      setStock(10);
      setUnit('pcs');
      setMinStockAlert(5);
      setIcon('📦');
      setPriceTiers([]);
    }
    setShowModal(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    const validTiers = priceTiers.filter(t => t.unitName.trim() && Number(t.conversionRatio) > 0 && Number(t.sellPrice) > 0);

    if (editingProduct) {
      updateProduct({
        ...editingProduct,
        name: name.trim(),
        category,
        buyPrice: Number(buyPrice),
        sellPrice: Number(sellPrice),
        stock: Number(stock),
        unit: unit.trim() || 'pcs',
        minStockAlert: Number(minStockAlert),
        icon: icon.trim() || '📦',
        priceTiers: validTiers
      });
    } else {
      addProduct({
        name: name.trim(),
        category,
        buyPrice: Number(buyPrice),
        sellPrice: Number(sellPrice),
        stock: Number(stock),
        unit: unit.trim() || 'pcs',
        minStockAlert: Number(minStockAlert),
        icon: icon.trim() || '📦',
        priceTiers: validTiers
      });
    }

    setShowModal(false);
  };

  const handleDelete = (id: string, name: string) => {
    if (window.confirm(`Hapus barang "${name}" dari daftar stok toko?`)) {
      deleteProduct(id);
    }
  };

  const EMOJI_OPTIONS = ['🍚', '🛢️', '🥚', '🧂', '🌾', '🍵', '💧', '☕', '🥛', '🍊', '🍜', '🍲', '🍪', '🥔', '🍫', '🥢', '🥣', '🧽', '🧼', '🚿', '🪥', '🚬', '🔥', '📦', '🍬', '🍞'];

  return (
    <div className="flex flex-col flex-1 h-screen overflow-hidden bg-slate-100 font-sans p-6">
      {/* Top Header & Actions */}
      <div className="bg-white rounded-3xl p-5 shadow-sm border border-slate-200 mb-6 flex flex-col md:flex-row items-center justify-between gap-4 shrink-0">
        <div>
          <h1 className="text-2xl font-black text-slate-800 flex items-center gap-2.5">
            <span>Stok & Harga Barang Toko</span>
            <span className="text-xs font-extrabold bg-blue-100 text-blue-800 px-3 py-1 rounded-full">
              Total {products.length} Jenis
            </span>
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Kelola katalog, harga beli (modal), harga jual, dan batas peringatan stok menipis.
          </p>
        </div>

        <div className="flex flex-wrap md:flex-nowrap items-center gap-2.5 w-full md:w-auto">
          <button
            onClick={() => {
              sound.playTap();
              setShowStockSummary(!showStockSummary);
            }}
            className="px-4 py-3.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-extrabold text-xs rounded-2xl border border-slate-300 transition-colors flex items-center justify-center gap-1.5 shrink-0"
            title={showStockSummary ? "Sembunyikan Info Modal, Omset, dan Stok Menipis" : "Tampilkan Info Modal, Omset, dan Stok Menipis"}
          >
            {showStockSummary ? <EyeOff className="w-4 h-4 text-slate-500" /> : <Eye className="w-4 h-4 text-blue-600" />}
            <span className="hidden sm:inline">{showStockSummary ? 'Sembunyikan Info' : 'Tampilkan Info'}</span>
          </button>

          <button
            onClick={() => {
              sound.playTap();
              setAdjProduct(null);
              setShowAdjModal(true);
            }}
            className="flex-1 md:flex-initial px-5 py-3.5 bg-gradient-to-r from-amber-600 to-rose-600 hover:from-amber-700 hover:to-rose-700 text-white font-black text-sm rounded-2xl shadow-lg shadow-rose-500/20 transition-all flex items-center justify-center gap-2 shrink-0"
            title="Catat barang yang dikonsumsi/dimakan sendiri atau rusak/jatuh untuk potong stok akurat"
          >
            <UtensilsCrossed className="w-5 h-5" />
            <span>Catat Konsumsi / Rusak</span>
          </button>

          <button
            onClick={() => handleOpenModal()}
            className="flex-1 md:flex-initial px-6 py-3.5 bg-blue-600 hover:bg-blue-700 text-white font-black text-sm rounded-2xl shadow-lg shadow-blue-600/30 transition-all flex items-center justify-center gap-2 shrink-0"
          >
            <PackagePlus className="w-5 h-5" />
            <span>+ TAMBAH BARANG BARU</span>
          </button>
        </div>
      </div>

      {/* Summary Row (Collapsible) */}
      {showStockSummary && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-4 shrink-0 transition-all duration-200">
          <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-200 flex items-center justify-between">
            <div>
              <div className="text-[11px] font-extrabold text-slate-400 uppercase tracking-wider">Nilai Total Modal (HPP)</div>
              <div className="text-xl font-black text-slate-800 mt-0.5">{formatIDR(catalogStats.totalAssetValue)}</div>
            </div>
            <div className="p-3 bg-blue-50 rounded-2xl text-blue-600 font-bold text-xs">
              {products.length} Jenis
            </div>
          </div>

          <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-200 flex items-center justify-between">
            <div>
              <div className="text-[11px] font-extrabold text-slate-400 uppercase tracking-wider">Potensi Total Omset Jual</div>
              <div className="text-xl font-black text-emerald-600 mt-0.5">{formatIDR(catalogStats.totalSalesPotential)}</div>
            </div>
            <TrendingUp className="w-8 h-8 text-emerald-500 opacity-80" />
          </div>

          <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-200 flex items-center justify-between">
            <div>
              <div className="text-[11px] font-extrabold text-slate-400 uppercase tracking-wider">Stok Perlu Ditambah</div>
              <div className={`text-xl font-black mt-0.5 ${catalogStats.lowStockCount > 0 ? 'text-amber-600' : 'text-slate-800'}`}>
                {catalogStats.lowStockCount} Barang Menipis
              </div>
            </div>
            <AlertTriangle className={`w-8 h-8 ${catalogStats.lowStockCount > 0 ? 'text-amber-500' : 'text-slate-300'}`} />
          </div>
        </div>
      )}

      {/* Banner if catalog is empty */}
      {products.length === 0 && (
        <div className="mb-4 bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 text-white p-5 rounded-3xl shadow-lg flex flex-col sm:flex-row items-center justify-between gap-4">
          <div>
            <h3 className="font-extrabold text-lg flex items-center gap-2">
              <span>🏪 Katalog Stok Masih Kosong</span>
            </h3>
            <p className="text-xs text-blue-100 mt-1 max-w-xl">
              Ingin langsung mengisi contoh daftar barang warung (Indomie Dus/Eceran, Kopi Renteng, Beras ½kg, Telur, Minyak, dll)? Mama tinggal ubah harga & stoknya sesuai warung sendiri.
            </p>
          </div>
          <button
            onClick={() => {
              sound.playSuccess();
              loadSampleWarungProducts();
            }}
            className="px-5 py-3 bg-amber-400 hover:bg-amber-300 text-slate-900 font-black text-sm rounded-2xl shadow-md transition-all active:scale-95 shrink-0 whitespace-nowrap"
          >
            ⚡ Isi Contoh Produk Warung
          </button>
        </div>
      )}

      {/* Filter & Search Bar */}
      <div className="bg-white rounded-3xl p-4 shadow-sm border border-slate-200 mb-4 flex flex-col md:flex-row items-center gap-3 shrink-0">
        <div className="relative flex-1 w-full">
          <Search className="w-5 h-5 absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Cari nama barang..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-12 pr-10 py-3 bg-slate-50 rounded-2xl border border-slate-200 text-sm font-bold text-slate-800 placeholder:text-slate-400 outline-none focus:bg-white focus:border-blue-600"
          />
          {searchQuery && (
            <button onClick={() => setSearchQuery('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Sort & View Mode Controls */}
        <div className="flex items-center gap-2 w-full md:w-auto overflow-x-auto pb-1 md:pb-0">
          <div className="flex items-center bg-slate-100 p-1 rounded-xl border border-slate-200">
            <button
              onClick={() => {
                sound.playTap();
                setViewMode('table');
              }}
              title="Tampilan Tabel"
              className={`p-2 rounded-lg transition-all ${
                viewMode === 'table' ? 'bg-white text-blue-600 shadow-sm font-black' : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              <List className="w-4 h-4" />
            </button>
            <button
              onClick={() => {
                sound.playTap();
                setViewMode('grid');
              }}
              title="Tampilan Kartu Touch"
              className={`p-2 rounded-lg transition-all ${
                viewMode === 'grid' ? 'bg-white text-blue-600 shadow-sm font-black' : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              <LayoutGrid className="w-4 h-4" />
            </button>
          </div>

          <span className="text-xs font-extrabold text-slate-500 whitespace-nowrap flex items-center gap-1 ml-1">
            <ArrowUpDown className="w-3.5 h-3.5" />
            <span>Urutkan:</span>
          </span>
          <select
            value={`${sortBy}-${sortOrder}`}
            onChange={(e) => {
              const [by, order] = e.target.value.split('-') as ['name' | 'stock' | 'profit', 'asc' | 'desc'];
              setSortBy(by);
              setSortOrder(order);
            }}
            className="p-2.5 bg-slate-50 rounded-xl border border-slate-200 text-xs font-extrabold text-slate-700 outline-none focus:border-blue-500"
          >
            <option value="name-asc">Nama (A-Z)</option>
            <option value="name-desc">Nama (Z-A)</option>
            <option value="stock-asc">Stok Terendah (Menipis)</option>
            <option value="stock-desc">Stok Terbanyak</option>
            <option value="profit-desc">Keuntungan Tertinggi</option>
          </select>
        </div>
      </div>

      {/* Category Pills */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 mb-3 shrink-0 no-scrollbar">
        {CATEGORIES.map((cat) => (
          <button
            key={cat}
            onClick={() => setSelectedCategory(cat)}
            className={`px-4 py-2 rounded-xl text-xs font-extrabold whitespace-nowrap transition-all ${
              selectedCategory === cat
                ? 'bg-blue-600 text-white shadow-md shadow-blue-500/20'
                : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Table or Grid View of Products */}
      <div className="flex-1 bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden flex flex-col">
        {viewMode === 'grid' ? (
          <div className="overflow-y-auto flex-1 p-4 custom-scrollbar">
            {filteredProducts.length === 0 ? (
              <div className="text-center py-12 text-slate-400 font-bold">
                Barang tidak ditemukan di kategori ini.
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
                {filteredProducts.map((prod) => {
                  const profit = prod.sellPrice - prod.buyPrice;
                  const isLow = prod.stock <= prod.minStockAlert && prod.stock > 0;
                  const isEmpty = prod.stock <= 0;

                  return (
                    <div
                      key={prod.id}
                      className={`p-4 rounded-2xl border-2 transition-all flex flex-col justify-between ${
                        isEmpty
                          ? 'border-rose-200 bg-rose-50/20'
                          : isLow
                          ? 'border-amber-200 bg-amber-50/20'
                          : 'border-slate-100 bg-white hover:border-slate-300'
                      }`}
                    >
                      <div>
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex items-center gap-2.5">
                            <span className="text-3xl p-2 bg-slate-100 rounded-2xl">{prod.icon || '📦'}</span>
                            <div>
                              <h3 className="font-extrabold text-slate-800 text-sm line-clamp-1">{prod.name}</h3>
                              <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-slate-100 text-slate-500">
                                {prod.category}
                              </span>
                            </div>
                          </div>
                          
                          <div className="flex items-center gap-0.5">
                            <button
                              onClick={() => {
                                sound.playTap();
                                setAdjProduct(prod);
                                setShowAdjModal(true);
                              }}
                              className="p-1.5 text-amber-600 hover:bg-amber-50 rounded-xl"
                              title="Catat Konsumsi / Rusak"
                            >
                              <UtensilsCrossed className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => handleOpenModal(prod)}
                              className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-xl"
                            >
                              <Edit2 className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => handleDelete(prod.id, prod.name)}
                              className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-2 my-3 p-2.5 bg-slate-50 rounded-xl text-xs font-bold">
                          <div>
                            <span className="text-[10px] text-slate-400 block font-semibold">Harga Beli (Modal)</span>
                            <span className="text-slate-600">{formatIDR(prod.buyPrice)}</span>
                          </div>
                          <div>
                            <span className="text-[10px] text-slate-400 block font-semibold">Harga Jual</span>
                            <span className="text-blue-600 font-extrabold">{formatIDR(prod.sellPrice)}</span>
                          </div>
                        </div>
                      </div>

                      <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
                        <div>
                          <span className="text-[10px] text-slate-400 font-bold block">Sisa Stok</span>
                          <span className={`text-sm font-black ${isEmpty ? 'text-rose-600' : isLow ? 'text-amber-600' : 'text-slate-800'}`}>
                            {prod.stock} {prod.unit}
                          </span>
                        </div>

                        <div className="flex items-center gap-1.5 bg-slate-100 p-1 rounded-xl">
                          <button
                            onClick={() => quickStockAdjust(prod.id, -1)}
                            className="w-8 h-8 bg-white hover:bg-slate-200 rounded-lg font-black text-slate-800 flex items-center justify-center shadow-sm"
                          >
                            <Minus className="w-4 h-4 stroke-[3]" />
                          </button>
                          <button
                            onClick={() => quickStockAdjust(prod.id, +1)}
                            className="w-8 h-8 bg-blue-600 hover:bg-blue-700 rounded-lg font-black text-white flex items-center justify-center shadow-sm"
                          >
                            <Plus className="w-4 h-4 stroke-[3]" />
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        ) : (
          <div className="overflow-y-auto flex-1 custom-scrollbar">
            <table className="w-full text-left border-collapse select-none">
              <thead className="bg-slate-50 border-b border-slate-200 text-[11px] font-black text-slate-500 uppercase tracking-wider sticky top-0 z-10">
                <tr>
                  <th className="py-3.5 px-4">Nama Barang</th>
                  <th className="py-3.5 px-4">Kategori</th>
                  <th className="py-3.5 px-4">Harga Modal (Beli)</th>
                  <th className="py-3.5 px-4">Harga Jual</th>
                  <th className="py-3.5 px-4">Laba per Unit</th>
                  <th className="py-3.5 px-4 text-center">Stok & Cepat Ubah</th>
                  <th className="py-3.5 px-4 text-center">Status</th>
                  <th className="py-3.5 px-4 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-sm">
                {filteredProducts.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="py-12 text-center text-slate-400 font-bold">
                      Barang tidak ditemukan di kategori ini.
                    </td>
                  </tr>
                ) : (
                  filteredProducts.map((prod) => {
                    const profit = prod.sellPrice - prod.buyPrice;
                    const isLow = prod.stock <= prod.minStockAlert && prod.stock > 0;
                    const isEmpty = prod.stock <= 0;

                    return (
                      <tr key={prod.id} className="hover:bg-slate-50/80 transition-colors">
                        <td className="py-3.5 px-4 font-extrabold text-slate-800 flex items-center gap-3">
                          <span className="text-2xl p-1.5 bg-slate-100 rounded-xl">{prod.icon || '📦'}</span>
                          <div>
                            <div>{prod.name}</div>
                            {prod.barcode && <div className="text-[10px] text-slate-400 font-mono mt-0.5 font-normal">Kode: {prod.barcode}</div>}
                          </div>
                        </td>
                        <td className="py-3.5 px-4">
                          <span className="text-xs font-bold px-2.5 py-1 rounded-lg bg-slate-100 text-slate-600">
                            {prod.category}
                          </span>
                        </td>
                        <td className="py-3.5 px-4 font-bold text-slate-600">
                          {formatIDR(prod.buyPrice)}
                        </td>
                        <td className="py-3.5 px-4 font-black text-blue-600">
                          {formatIDR(prod.sellPrice)}
                        </td>
                        <td className="py-3.5 px-4 font-extrabold text-emerald-600">
                          +{formatIDR(profit)}
                        </td>
                        <td className="py-3.5 px-4">
                          <div className="flex items-center justify-center gap-1.5">
                            <button
                              onClick={() => quickStockAdjust(prod.id, -1)}
                              className="w-7 h-7 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-black flex items-center justify-center transition-colors"
                            >
                              <Minus className="w-3.5 h-3.5 stroke-[3]" />
                            </button>
                            <span className="w-16 text-center font-black text-base text-slate-800">
                              {prod.stock} <span className="text-xs font-bold text-slate-400">{prod.unit}</span>
                            </span>
                            <button
                              onClick={() => quickStockAdjust(prod.id, +1)}
                              className="w-7 h-7 rounded-lg bg-blue-100 hover:bg-blue-200 text-blue-800 font-black flex items-center justify-center transition-colors"
                            >
                              <Plus className="w-3.5 h-3.5 stroke-[3]" />
                            </button>
                          </div>
                        </td>
                        <td className="py-3.5 px-4 text-center">
                          {isEmpty ? (
                            <span className="px-2.5 py-1 bg-rose-100 text-rose-800 font-black text-xs rounded-full inline-flex items-center gap-1">
                              Habis
                            </span>
                          ) : isLow ? (
                            <span className="px-2.5 py-1 bg-amber-100 text-amber-800 font-black text-xs rounded-full inline-flex items-center gap-1 animate-pulse">
                              <AlertTriangle className="w-3 h-3" /> Menipis
                            </span>
                          ) : (
                            <span className="px-2.5 py-1 bg-emerald-100 text-emerald-800 font-bold text-xs rounded-full">
                              Aman
                            </span>
                          )}
                        </td>
                        <td className="py-3.5 px-4 text-right">
                          <div className="flex items-center justify-end gap-1">
                            <button
                              onClick={() => {
                                sound.playTap();
                                setAdjProduct(prod);
                                setShowAdjModal(true);
                              }}
                              className="p-2 text-amber-600 hover:bg-amber-50 rounded-xl transition-colors"
                              title="Catat Konsumsi / Rusak"
                            >
                              <UtensilsCrossed className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleOpenModal(prod)}
                              className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-colors"
                              title="Edit Barang"
                            >
                              <Edit2 className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleDelete(prod.id, prod.name)}
                              className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-colors"
                              title="Hapus Barang"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* MODAL TAMBAH / EDIT BARANG */}
      {showModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 max-h-[90vh] overflow-y-auto custom-scrollbar">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-4">
              <h3 className="font-extrabold text-lg text-slate-800">
                {editingProduct ? 'Edit Data Barang' : 'Tambah Barang Baru'}
              </h3>
              <button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-3.5">
              <div>
                <label className="text-xs font-bold text-slate-600 mb-1 block">Nama Barang *</label>
                <input
                  type="text"
                  required
                  placeholder="Misal: Beras Premium 5kg, Kopi Kapal Api..."
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full p-3 bg-slate-50 rounded-xl border border-slate-300 font-bold text-sm text-slate-800 outline-none focus:bg-white focus:border-blue-600"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-slate-600 mb-1 block">Kategori</label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value as Exclude<ProductCategory, 'Semua'>)}
                    className="w-full p-3 bg-slate-50 rounded-xl border border-slate-300 font-bold text-sm text-slate-800 outline-none focus:bg-white focus:border-blue-600"
                  >
                    {CATEGORIES.filter(c => c !== 'Semua').map(c => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-600 mb-1 block">Satuan (Unit)</label>
                  <input
                    type="text"
                    placeholder="pcs, kg, bungkus, renteng..."
                    value={unit}
                    onChange={(e) => setUnit(e.target.value)}
                    className="w-full p-3 bg-slate-50 rounded-xl border border-slate-300 font-bold text-sm text-slate-800 outline-none focus:bg-white focus:border-blue-600"
                  >
                  </input>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 bg-blue-50/50 p-3 rounded-2xl border border-blue-100">
                <div>
                  <label className="text-xs font-extrabold text-blue-900 mb-1 block">Harga Modal Beli (HPP) *</label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 font-extrabold text-blue-400 text-xs">Rp</span>
                    <input
                      type="number"
                      required
                      min={0}
                      value={buyPrice}
                      onChange={(e) => setBuyPrice(e.target.value)}
                      className="w-full pl-8 pr-3 py-2.5 bg-white rounded-xl border border-blue-300 font-black text-sm text-blue-900 outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-xs font-extrabold text-blue-900 mb-1 block">Harga Jual ke Konsumen *</label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 font-extrabold text-blue-400 text-xs">Rp</span>
                    <input
                      type="number"
                      required
                      min={0}
                      value={sellPrice}
                      onChange={(e) => setSellPrice(e.target.value)}
                      className="w-full pl-8 pr-3 py-2.5 bg-white rounded-xl border border-blue-300 font-black text-sm text-blue-900 outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-slate-600 mb-1 block">Stok Awal / Saat Ini</label>
                  <input
                    type="number"
                    min={0}
                    value={stock}
                    onChange={(e) => setStock(e.target.value)}
                    className="w-full p-3 bg-slate-50 rounded-xl border border-slate-300 font-black text-sm text-slate-800 outline-none focus:bg-white focus:border-blue-600"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-600 mb-1 block">Batas Peringatan Stok Menipis</label>
                  <input
                    type="number"
                    min={1}
                    value={minStockAlert}
                    onChange={(e) => setMinStockAlert(e.target.value)}
                    className="w-full p-3 bg-slate-50 rounded-xl border border-slate-300 font-bold text-sm text-slate-800 outline-none focus:bg-white focus:border-blue-600"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-600 mb-1 block">Pilih Ikon Emoji</label>
                <div className="flex flex-wrap gap-1.5 p-2 bg-slate-50 rounded-2xl border border-slate-200 max-h-24 overflow-y-auto">
                  {EMOJI_OPTIONS.map((em) => (
                    <button
                      type="button"
                      key={em}
                      onClick={() => setIcon(em)}
                      className={`w-9 h-9 rounded-xl text-lg flex items-center justify-center transition-all ${
                        icon === em ? 'bg-blue-600 text-white shadow-md scale-110' : 'bg-white hover:bg-slate-200'
                      }`}
                    >
                      {em}
                    </button>
                  ))}
                </div>
              </div>

              {/* Multi-Unit / Grosir Price Tiers Section */}
              <div className="bg-amber-50/80 p-3.5 rounded-2xl border border-amber-200 space-y-2.5 mt-3">
                <div className="flex items-center justify-between gap-2">
                  <div>
                    <h4 className="font-black text-amber-950 text-xs flex items-center gap-1.5">
                      <span>📦</span>
                      <span>Harga Grosir / Kemasan Tambahan</span>
                    </h4>
                    <p className="text-[11px] text-amber-800 font-medium">
                      Misal: 1 Dus (40 Pcs), 1 Renteng (10 Sachet), atau ½ Kg
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      sound.playTap();
                      setPriceTiers([
                        ...priceTiers,
                        {
                          id: 'tier-' + Date.now(),
                          unitName: '1 Dus',
                          conversionRatio: 40,
                          sellPrice: Math.round((sellPrice || 0) * 38),
                          buyPrice: Math.round((buyPrice || 0) * 38)
                        }
                      ]);
                    }}
                    className="px-3 py-1.5 bg-amber-500 hover:bg-amber-600 text-white font-extrabold text-xs rounded-xl shadow-sm transition-all shrink-0"
                  >
                    + Tambah Kemasan
                  </button>
                </div>

                {/* Quick Presets */}
                <div className="flex items-center gap-1.5 flex-wrap">
                  <span className="text-[10px] font-bold text-amber-800">Tombol Cepat:</span>
                  <button
                    type="button"
                    onClick={() => {
                      sound.playTap();
                      if (!priceTiers.some(t => t.unitName.includes('Dus'))) {
                        setPriceTiers([
                          ...priceTiers,
                          { id: 'tier-' + Date.now(), unitName: '1 Dus', conversionRatio: 40, sellPrice: Math.round((sellPrice || 0) * 38), buyPrice: Math.round((buyPrice || 0) * 38) }
                        ]);
                      }
                    }}
                    className="px-2 py-1 bg-white hover:bg-amber-100 text-amber-900 border border-amber-300 rounded-lg text-[11px] font-bold shadow-xs active:scale-95"
                  >
                    + 📦 1 Dus (40)
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      sound.playTap();
                      if (!priceTiers.some(t => t.unitName.includes('Renteng'))) {
                        setPriceTiers([
                          ...priceTiers,
                          { id: 'tier-' + Date.now(), unitName: '1 Renteng', conversionRatio: 10, sellPrice: Math.round((sellPrice || 0) * 9.5), buyPrice: Math.round((buyPrice || 0) * 9.5) }
                        ]);
                      }
                    }}
                    className="px-2 py-1 bg-white hover:bg-amber-100 text-amber-900 border border-amber-300 rounded-lg text-[11px] font-bold shadow-xs active:scale-95"
                  >
                    + 🧵 1 Renteng (10)
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      sound.playTap();
                      if (!priceTiers.some(t => t.unitName.includes('½'))) {
                        setPriceTiers([
                          ...priceTiers,
                          { id: 'tier-' + Date.now(), unitName: '½ Kg', conversionRatio: 0.5, sellPrice: Math.round((sellPrice || 0) * 0.5), buyPrice: Math.round((buyPrice || 0) * 0.5) }
                        ]);
                      }
                    }}
                    className="px-2 py-1 bg-white hover:bg-amber-100 text-amber-900 border border-amber-300 rounded-lg text-[11px] font-bold shadow-xs active:scale-95"
                  >
                    + 🌾 ½ Kg
                  </button>
                </div>

                {/* Tier Rows */}
                {priceTiers.length > 0 && (
                  <div className="space-y-2 mt-2 pt-2 border-t border-amber-200/60">
                    {priceTiers.map((tier, idx) => (
                      <div key={tier.id || idx} className="bg-white p-2.5 rounded-xl border border-amber-200 flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
                        <div className="flex-1">
                          <label className="text-[10px] font-bold text-amber-900 block">Nama Kemasan</label>
                          <input
                            type="text"
                            placeholder="1 Dus / Renteng / ½ Kg"
                            value={tier.unitName}
                            onChange={(e) => {
                              const copy = [...priceTiers];
                              copy[idx].unitName = e.target.value;
                              setPriceTiers(copy);
                            }}
                            className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-bold"
                          />
                        </div>
                        <div className="w-24">
                          <label className="text-[10px] font-bold text-amber-900 block">Isi ({unit || 'pcs'})</label>
                          <input
                            type="number"
                            step="any"
                            min="0.01"
                            value={tier.conversionRatio}
                            onChange={(e) => {
                              const copy = [...priceTiers];
                              copy[idx].conversionRatio = Number(e.target.value);
                              setPriceTiers(copy);
                            }}
                            className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-extrabold text-amber-800"
                          />
                        </div>
                        <div className="flex-1">
                          <label className="text-[10px] font-bold text-amber-900 block">Harga Jual (Rp)</label>
                          <input
                            type="number"
                            min="0"
                            value={tier.sellPrice}
                            onChange={(e) => {
                              const copy = [...priceTiers];
                              copy[idx].sellPrice = Number(e.target.value);
                              setPriceTiers(copy);
                            }}
                            className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-black text-blue-600"
                          />
                        </div>
                        <button
                          type="button"
                          onClick={() => {
                            sound.playTap();
                            setPriceTiers(priceTiers.filter((_, i) => i !== idx));
                          }}
                          className="p-2 text-rose-500 hover:bg-rose-50 rounded-lg transition-colors shrink-0 self-end sm:self-center"
                          title="Hapus Grosir Ini"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="pt-4 flex gap-3">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="flex-1 py-3.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-sm rounded-xl transition-colors"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="flex-1 py-3.5 bg-blue-600 hover:bg-blue-700 text-white font-black text-base rounded-xl shadow-lg transition-colors"
                >
                  Simpan Barang
                </button>
              </div>
            </form>
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
