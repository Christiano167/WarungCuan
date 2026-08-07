import React, { useState, useEffect } from 'react';
import { useStore } from '../context/StoreContext';
import { Product, StockAdjustmentReason } from '../types';
import { formatIDR } from '../utils/formatters';
import { sound } from '../utils/sound';
import {
  X,
  AlertTriangle,
  UtensilsCrossed,
  PackageCheck,
  Clock,
  Gift,
  HelpCircle,
  Plus,
  Minus,
  Search,
  CheckCircle2,
  Info
} from 'lucide-react';

interface StockAdjustmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  preSelectedProduct?: Product | null;
}

const REASONS: { id: StockAdjustmentReason; label: string; icon: React.ReactNode; desc: string; bg: string }[] = [
  {
    id: 'KONSUMSI_PRIBADI',
    label: 'Konsumsi / Makan Sendiri',
    icon: <UtensilsCrossed className="w-5 h-5 text-amber-600" />,
    desc: 'Dimakan, diminum, atau dipakai sendiri oleh pemilik/keluarga warung',
    bg: 'bg-amber-50 border-amber-200 text-amber-900'
  },
  {
    id: 'RUSAK_JATUH',
    label: 'Rusak / Jatuh / Bocor',
    icon: <AlertTriangle className="w-5 h-5 text-rose-600" />,
    desc: 'Barang pecah, kemasan bocor, robek, atau tersenggol jatuh',
    bg: 'bg-rose-50 border-rose-200 text-rose-900'
  },
  {
    id: 'KADALUARSA',
    label: 'Kadaluarsa / Basi',
    icon: <Clock className="w-5 h-5 text-purple-600" />,
    desc: 'Barang sudah melewati tanggal expired / tidak layak jual',
    bg: 'bg-purple-50 border-purple-200 text-purple-900'
  },
  {
    id: 'BONUS_SAMPEL',
    label: 'Bonus / Sampel Pelanggan',
    icon: <Gift className="w-5 h-5 text-emerald-600" />,
    desc: 'Diberikan secara cuma-cuma sebagai hadiah / bonus langganan',
    bg: 'bg-emerald-50 border-emerald-200 text-emerald-900'
  },
  {
    id: 'HILANG',
    label: 'Hilang / Selisih Hitung',
    icon: <HelpCircle className="w-5 h-5 text-slate-600" />,
    desc: 'Stok fisik berkurang akibat selisih opname atau tidak ketahuan',
    bg: 'bg-slate-50 border-slate-200 text-slate-900'
  }
];

export const StockAdjustmentModal: React.FC<StockAdjustmentModalProps> = ({
  isOpen,
  onClose,
  preSelectedProduct
}) => {
  const { products, addStockAdjustment } = useStore();

  const [selectedProductId, setSelectedProductId] = useState<string>('');
  const [productSearch, setProductSearch] = useState<string>('');
  const [qty, setQty] = useState<number>(1);
  const [reason, setReason] = useState<StockAdjustmentReason>('KONSUMSI_PRIBADI');
  const [notes, setNotes] = useState<string>('');
  const [successMsg, setSuccessMsg] = useState<boolean>(false);

  useEffect(() => {
    if (preSelectedProduct) {
      setSelectedProductId(preSelectedProduct.id);
    } else if (products.length > 0 && !selectedProductId) {
      setSelectedProductId(products[0].id);
    }
  }, [preSelectedProduct, products]);

  if (!isOpen) return null;

  const currentProduct = products.find(p => p.id === selectedProductId) || preSelectedProduct || products[0];

  const filteredProducts = products.filter(p =>
    p.name.toLowerCase().includes(productSearch.toLowerCase()) ||
    p.category.toLowerCase().includes(productSearch.toLowerCase())
  );

  const totalLossValue = currentProduct ? currentProduct.buyPrice * qty : 0;
  const remainingAfter = currentProduct ? Math.max(0, currentProduct.stock - qty) : 0;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentProduct || qty <= 0) return;

    addStockAdjustment({
      productId: currentProduct.id,
      qty,
      reason,
      notes,
    });

    setSuccessMsg(true);
    setTimeout(() => {
      setSuccessMsg(false);
      onClose();
    }, 1200);
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/70 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col select-none animate-in fade-in zoom-in-95 duration-200">
        {/* Modal Header */}
        <div className="p-5 bg-gradient-to-r from-amber-600 via-orange-600 to-rose-600 text-white flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center font-bold text-xl">
              🍪
            </div>
            <div>
              <h2 className="font-black text-lg">Catat Pemakaian Sendiri / Rusak</h2>
              <p className="text-xs text-amber-100 font-medium">
                Potong stok fisik secara akurat tanpa merusak Laporan Keuangan
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-9 h-9 rounded-xl bg-white/20 hover:bg-white/30 text-white flex items-center justify-center transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Content */}
        {successMsg ? (
          <div className="p-12 text-center flex flex-col items-center justify-center flex-1">
            <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mb-4 animate-bounce">
              <CheckCircle2 className="w-10 h-10" />
            </div>
            <h3 className="text-xl font-black text-slate-800">Pemakaian Berhasil Dicatat!</h3>
            <p className="text-sm text-slate-500 mt-1">
              Stok <strong>{currentProduct?.name}</strong> telah berkurang {qty} {currentProduct?.unit}.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="p-5 overflow-y-auto flex-1 space-y-5 custom-scrollbar">
            {/* 1. Pilih Barang */}
            <div>
              <label className="block text-xs font-black uppercase text-slate-500 mb-1.5 tracking-wider">
                1. Pilih Barang yang Dikonsumsi / Rusak
              </label>

              {!preSelectedProduct && (
                <div className="relative mb-2">
                  <Search className="w-4 h-4 absolute left-3.5 top-3 text-slate-400" />
                  <input
                    type="text"
                    value={productSearch}
                    onChange={(e) => setProductSearch(e.target.value)}
                    placeholder="Cari barang untuk dipotong stok..."
                    className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-amber-500"
                  />
                </div>
              )}

              <div className="max-h-36 overflow-y-auto border border-slate-200 rounded-2xl bg-slate-50 p-1 space-y-1 custom-scrollbar">
                {filteredProducts.map((p) => {
                  const isSelected = p.id === currentProduct?.id;
                  return (
                    <div
                      key={p.id}
                      onClick={() => {
                        sound.playTap();
                        setSelectedProductId(p.id);
                      }}
                      className={`p-2.5 rounded-xl cursor-pointer flex items-center justify-between transition-all ${
                        isSelected
                          ? 'bg-amber-500 text-white font-extrabold shadow-sm'
                          : 'hover:bg-white text-slate-700 font-bold'
                      }`}
                    >
                      <div className="flex items-center gap-2.5 truncate">
                        <span className="text-lg">{p.icon || '📦'}</span>
                        <span className="text-xs truncate">{p.name}</span>
                      </div>
                      <div className="text-[11px] whitespace-nowrap opacity-90 pl-2">
                        Stok: <strong>{p.stock} {p.unit}</strong>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* 2. Jumlah / Qty Stepper */}
            {currentProduct && (
              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200">
                <div className="flex items-center justify-between mb-2">
                  <label className="text-xs font-black uppercase text-slate-500 tracking-wider">
                    2. Jumlah Barang yang Diambil/Rusak
                  </label>
                  <span className="text-xs font-extrabold text-slate-500">
                    Stok Sekarang: <strong className="text-slate-800">{currentProduct.stock} {currentProduct.unit}</strong>
                  </span>
                </div>

                <div className="flex items-center justify-between gap-4">
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setQty(Math.max(1, qty - 1))}
                      className="w-11 h-11 rounded-2xl bg-white border border-slate-300 font-black text-lg text-slate-700 flex items-center justify-center hover:bg-slate-100 active:scale-95 transition-all shadow-sm"
                    >
                      <Minus className="w-5 h-5 stroke-[3]" />
                    </button>

                    <input
                      type="number"
                      min={1}
                      max={currentProduct.stock || 999}
                      value={qty}
                      onChange={(e) => setQty(Math.max(1, parseInt(e.target.value) || 1))}
                      className="w-20 text-center py-2 bg-white border-2 border-amber-500 rounded-2xl font-black text-xl text-slate-900 focus:outline-none"
                    />

                    <button
                      type="button"
                      onClick={() => setQty(qty + 1)}
                      className="w-11 h-11 rounded-2xl bg-amber-500 text-white font-black text-lg flex items-center justify-center hover:bg-amber-600 active:scale-95 transition-all shadow-md shadow-amber-500/20"
                    >
                      <Plus className="w-5 h-5 stroke-[3]" />
                    </button>
                    <span className="font-extrabold text-sm text-slate-600 pl-1">{currentProduct.unit}</span>
                  </div>

                  {/* Preset Qty */}
                  <div className="flex items-center gap-1.5">
                    {[1, 2, 5, 10].map((num) => (
                      <button
                        type="button"
                        key={num}
                        onClick={() => {
                          sound.playTap();
                          setQty(num);
                        }}
                        className={`px-3 py-1.5 rounded-xl text-xs font-black transition-all ${
                          qty === num
                            ? 'bg-amber-600 text-white shadow-sm'
                            : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-100'
                        }`}
                      >
                        +{num}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Stock impact indicator */}
                <div className="mt-3 pt-3 border-t border-slate-200/80 flex items-center justify-between text-xs">
                  <span className="text-slate-500 font-medium">Sisa Stok Setelah Dipotong:</span>
                  <span className={`font-black ${remainingAfter <= 0 ? 'text-rose-600' : 'text-emerald-600'}`}>
                    {remainingAfter} {currentProduct.unit}
                  </span>
                </div>
              </div>
            )}

            {/* 3. Alasan / Kategori */}
            <div>
              <label className="block text-xs font-black uppercase text-slate-500 mb-2 tracking-wider">
                3. Alasan Pengurangan Stok
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {REASONS.map((r) => {
                  const isSelected = reason === r.id;
                  return (
                    <div
                      key={r.id}
                      onClick={() => {
                        sound.playTap();
                        setReason(r.id);
                      }}
                      className={`p-3 rounded-2xl border-2 cursor-pointer transition-all flex items-start gap-2.5 ${
                        isSelected
                          ? 'border-amber-500 bg-amber-50/60 shadow-sm scale-[1.01]'
                          : 'border-slate-100 hover:border-slate-200 bg-white'
                      }`}
                    >
                      <div className="p-1.5 rounded-xl bg-white shadow-sm shrink-0">
                        {r.icon}
                      </div>
                      <div>
                        <div className="font-extrabold text-xs text-slate-800">{r.label}</div>
                        <div className="text-[10px] text-slate-500 leading-tight mt-0.5">{r.desc}</div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* 4. Catatan Opsional */}
            <div>
              <label className="block text-xs font-black uppercase text-slate-500 mb-1 tracking-wider">
                4. Keterangan / Catatan Singkat (Opsional)
              </label>
              <input
                type="text"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Contoh: Dimakan pas makan siang warung / jatuh pas angkat dus..."
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-2xl text-xs font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-amber-500"
              />
            </div>

            {/* Summary Banner */}
            {currentProduct && (
              <div className="bg-amber-50 border border-amber-200 p-3.5 rounded-2xl flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <Info className="w-5 h-5 text-amber-600 shrink-0" />
                  <div>
                    <span className="font-extrabold text-amber-900 block">Nilai Modal (HPP) Terpakai:</span>
                    <span className="text-[11px] text-amber-700">Dicatat sebagai Beban Operational di Laporan</span>
                  </div>
                </div>
                <div className="text-base font-black text-amber-900">
                  {formatIDR(totalLossValue)}
                </div>
              </div>
            )}

            {/* Submit Button */}
            <div className="pt-2 flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={onClose}
                className="px-5 py-3 rounded-2xl text-xs font-black text-slate-500 hover:bg-slate-100 transition-colors"
              >
                Batal
              </button>
              <button
                type="submit"
                disabled={!currentProduct || qty <= 0}
                className="px-6 py-3 rounded-2xl text-xs font-black text-white bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-700 hover:to-orange-700 shadow-lg shadow-amber-500/25 active:scale-95 transition-all flex items-center gap-2 disabled:opacity-50"
              >
                <PackageCheck className="w-4 h-4" />
                <span>Simpan & Potong Stok Real ({qty} {currentProduct?.unit})</span>
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
