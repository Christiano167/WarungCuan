import React, { useState } from 'react';
import { useStore } from '../context/StoreContext';
import { StockReturn } from '../types';
import { formatDateID, formatIDR } from '../utils/formatters';
import { sound } from '../utils/sound';
import { StockAdjustmentModal } from './StockAdjustmentModal';
import {
  RotateCcw,
  Plus,
  Calendar,
  AlertTriangle,
  CheckCircle2,
  X,
  Search,
  RefreshCw,
  DollarSign,
  FileMinus,
  UtensilsCrossed,
  Trash2,
  PackageX,
  Clock,
  Gift,
  HelpCircle,
  TrendingDown
} from 'lucide-react';

export const StockReturnView: React.FC = () => {
  const { products, returns, adjustments, addStockReturn, deleteStockAdjustment } = useStore();

  const [activeSubTab, setActiveSubTab] = useState<'returns' | 'adjustments'>('returns');
  const [showAdjModal, setShowAdjModal] = useState<boolean>(false);

  // Modal States
  const [showModal, setShowModal] = useState<boolean>(false);
  const [selectedProdId, setSelectedProdId] = useState<string>('');
  const [productSearch, setProductSearch] = useState<string>('');
  const [qty, setQty] = useState<number>(1);
  const [returnReason, setReturnReason] = useState<StockReturn['returnReason']>('RUSAK_CACAT');
  const [target, setTarget] = useState<'SALES_DISTRIBUTOR' | 'TOKO_GROSIR'>('SALES_DISTRIBUTOR');
  const [targetName, setTargetName] = useState<string>('');
  const [refundAction, setRefundAction] = useState<StockReturn['refundAction']>('GANTI_BARANG_BARU');
  const [notes, setNotes] = useState<string>('');

  const filteredProducts = products.filter(p =>
    p.name.toLowerCase().includes(productSearch.toLowerCase())
  );

  const selectedProdObj = products.find(p => p.id === selectedProdId);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProdObj || qty <= 0 || !targetName.trim()) return;

    addStockReturn({
      productId: selectedProdObj.id,
      productName: selectedProdObj.name,
      qty,
      unit: selectedProdObj.unit,
      returnReason,
      target,
      targetName: targetName.trim(),
      refundAction,
      notes: notes.trim() || undefined
    });

    // Reset
    setSelectedProdId('');
    setProductSearch('');
    setQty(1);
    setReturnReason('RUSAK_CACAT');
    setTarget('SALES_DISTRIBUTOR');
    setTargetName('');
    setRefundAction('GANTI_BARANG_BARU');
    setNotes('');
    setShowModal(false);
  };

  const totalLossValue = adjustments.reduce((sum, a) => sum + a.totalLossValue, 0);

  return (
    <div className="flex flex-col flex-1 h-screen overflow-hidden bg-slate-100 font-sans p-6">
      {/* Top Header & Actions */}
      <div className="bg-white rounded-3xl p-5 shadow-sm border border-slate-200 mb-4 flex flex-col md:flex-row items-center justify-between gap-4 shrink-0">
        <div>
          <h1 className="text-2xl font-black text-slate-800 flex items-center gap-2.5">
            <RotateCcw className="w-7 h-7 text-blue-600" />
            <span>Retur & Penyesuaian Stok Warung</span>
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Kelola retur ke sales/grosir serta pencatatan konsumsi pribadi, barang pecah/bocor, dan expired.
          </p>
        </div>

        {activeSubTab === 'returns' ? (
          <button
            onClick={() => {
              sound.playTap();
              setShowModal(true);
            }}
            className="w-full md:w-auto px-6 py-3.5 bg-rose-600 hover:bg-rose-700 text-white font-black text-sm rounded-2xl shadow-lg shadow-rose-600/30 transition-all flex items-center justify-center gap-2"
          >
            <Plus className="w-5 h-5 stroke-[3]" />
            <span>+ CATAT RETUR KE SALES</span>
          </button>
        ) : (
          <button
            onClick={() => {
              sound.playTap();
              setShowAdjModal(true);
            }}
            className="w-full md:w-auto px-6 py-3.5 bg-gradient-to-r from-amber-600 to-rose-600 hover:from-amber-700 hover:to-rose-700 text-white font-black text-sm rounded-2xl shadow-lg shadow-rose-500/20 transition-all flex items-center justify-center gap-2"
          >
            <UtensilsCrossed className="w-5 h-5" />
            <span>🍪 + CATAT KONSUMSI / RUSAK</span>
          </button>
        )}
      </div>

      {/* Subtab Selector */}
      <div className="flex items-center gap-2 mb-4 shrink-0">
        <button
          onClick={() => {
            sound.playTap();
            setActiveSubTab('returns');
          }}
          className={`px-5 py-3 rounded-2xl font-black text-xs sm:text-sm transition-all flex items-center gap-2 ${
            activeSubTab === 'returns'
              ? 'bg-blue-600 text-white shadow-md'
              : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
          }`}
        >
          <RotateCcw className="w-4 h-4" />
          <span>Retur ke Sales / Grosir ({returns.length})</span>
        </button>

        <button
          onClick={() => {
            sound.playTap();
            setActiveSubTab('adjustments');
          }}
          className={`px-5 py-3 rounded-2xl font-black text-xs sm:text-sm transition-all flex items-center gap-2 ${
            activeSubTab === 'adjustments'
              ? 'bg-amber-600 text-white shadow-md'
              : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
          }`}
        >
          <UtensilsCrossed className="w-4 h-4" />
          <span>Pemakaian Sendiri & Kerusakan ({adjustments.length})</span>
        </button>
      </div>

      {activeSubTab === 'returns' ? (
        /* Retur Supplier Table */
        <div className="flex-1 bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden flex flex-col">
          <div className="p-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between font-bold text-sm text-slate-700">
            <span>Catatan Retur Inventaris ({returns.length} Catatan)</span>
            <span className="text-xs font-semibold text-rose-600">Otomatis mengurangi stok katalog jika ada di etalase</span>
          </div>

          <div className="overflow-y-auto flex-1 custom-scrollbar">
            <table className="w-full text-left border-collapse select-none">
              <thead className="bg-slate-50 border-b border-slate-200 text-[11px] font-black text-slate-500 uppercase tracking-wider sticky top-0 z-10">
                <tr>
                  <th className="py-3.5 px-4">Tanggal Retur</th>
                  <th className="py-3.5 px-4">Nama Barang & Jumlah</th>
                  <th className="py-3.5 px-4">Alasan Retur</th>
                  <th className="py-3.5 px-4">Tujuan Retur (Sales / Grosir)</th>
                  <th className="py-3.5 px-4">Aksi Penyelesaian / Klaim</th>
                  <th className="py-3.5 px-4">Catatan Detail</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-sm">
                {returns.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-12 text-center text-slate-400 font-bold">
                      Belum ada riwayat retur barang toko.
                    </td>
                  </tr>
                ) : (
                  returns.map((ret) => (
                    <tr key={ret.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-3.5 px-4 font-bold text-slate-700 whitespace-nowrap">
                        <div className="flex items-center gap-1.5">
                          <Calendar className="w-4 h-4 text-slate-400 shrink-0" />
                          <span>{formatDateID(ret.date)}</span>
                        </div>
                      </td>
                      <td className="py-3.5 px-4">
                        <div className="font-extrabold text-slate-800">{ret.productName}</div>
                        <span className="text-xs font-black text-rose-600 bg-rose-50 px-2 py-0.5 rounded mt-0.5 inline-block">
                          -{ret.qty} {ret.unit}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <span className={`text-xs font-extrabold px-2.5 py-1 rounded-full inline-flex items-center gap-1 ${
                          ret.returnReason === 'EXPIRED'
                            ? 'bg-rose-100 text-rose-800'
                            : ret.returnReason === 'RUSAK_CACAT' || ret.returnReason === 'KEMASAN_BOCOR'
                            ? 'bg-amber-100 text-amber-800'
                            : 'bg-slate-100 text-slate-800'
                        }`}>
                          <AlertTriangle className="w-3.5 h-3.5" />
                          {ret.returnReason === 'RUSAK_CACAT' ? 'Rusak / Cacat'
                            : ret.returnReason === 'EXPIRED' ? 'Kadaluwarsa (Expired)'
                            : ret.returnReason === 'KEMASAN_BOCOR' ? 'Kemasan Bocor / Penyok'
                            : ret.returnReason === 'SALAH_KIRIM' ? 'Salah Kirim' : 'Lainnya'}
                        </span>
                      </td>
                      <td className="py-3.5 px-4">
                        <div className="font-bold text-slate-800">{ret.targetName}</div>
                        <span className="text-[10px] text-slate-500 font-semibold uppercase">
                          {ret.target === 'SALES_DISTRIBUTOR' ? '👨‍💼 Sales Distributor' : '🛒 Toko Grosir'}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <span className="px-2.5 py-1 bg-blue-50 text-blue-800 font-bold text-xs rounded-lg inline-flex items-center gap-1.5 border border-blue-200">
                          {ret.refundAction === 'GANTI_BARANG_BARU' ? (
                            <><RefreshCw className="w-3.5 h-3.5 text-blue-600" /> Ditukar Barang Baru</>
                          ) : ret.refundAction === 'POTONG_TAGIHAN' ? (
                            <><FileMinus className="w-3.5 h-3.5 text-amber-600" /> Potong Tagihan Nota</>
                          ) : (
                            <><DollarSign className="w-3.5 h-3.5 text-emerald-600" /> Uang Kembali (Refund)</>
                          )}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-xs text-slate-500 italic max-w-xs">
                        {ret.notes || '-'}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        /* Pemakaian Sendiri & Kerusakan Table */
        <div className="flex-1 flex flex-col min-h-0 space-y-4">
          <div className="bg-amber-500/10 border border-amber-300 rounded-2xl p-4 flex items-center justify-between shrink-0">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-amber-500 text-white rounded-xl shadow-md">
                <TrendingDown className="w-6 h-6" />
              </div>
              <div>
                <div className="text-xs font-bold text-amber-800 uppercase tracking-wider">Total Kerugian Modal (HPP) Pemakaian Sendiri / Rusak</div>
                <div className="text-2xl font-black text-amber-900 mt-0.5">{formatIDR(totalLossValue)}</div>
              </div>
            </div>
            <div className="text-right hidden sm:block">
              <span className="text-xs font-semibold text-amber-700 block">Penyesuaian terdaftar: <b>{adjustments.length} catatan</b></span>
              <span className="text-[11px] text-amber-600">Terpisah dari omset penjualan kasir agar laba bersih akurat.</span>
            </div>
          </div>

          <div className="flex-1 bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden flex flex-col min-h-0">
            <div className="p-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between font-bold text-sm text-slate-700">
              <span>Riwayat Pengurangan Stok Non-Penjualan ({adjustments.length})</span>
              <span className="text-xs font-semibold text-amber-600">Stok otomatis dipotong & dicatat ke laporan laba rugi</span>
            </div>

            <div className="overflow-y-auto flex-1 custom-scrollbar">
              <table className="w-full text-left border-collapse select-none">
                <thead className="bg-slate-50 border-b border-slate-200 text-[11px] font-black text-slate-500 uppercase tracking-wider sticky top-0 z-10">
                  <tr>
                    <th className="py-3.5 px-4">Tanggal & Waktu</th>
                    <th className="py-3.5 px-4">Nama Barang & Jumlah</th>
                    <th className="py-3.5 px-4">Kategori Alasan</th>
                    <th className="py-3.5 px-4">Nilai Modal (Loss)</th>
                    <th className="py-3.5 px-4">Keterangan / Pelaku</th>
                    <th className="py-3.5 px-4 text-right">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-sm">
                  {adjustments.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="py-12 text-center text-slate-400 font-bold">
                        Belum ada catatan pemakaian sendiri atau barang rusak.
                      </td>
                    </tr>
                  ) : (
                    adjustments.map((adj) => {
                      let reasonLabel = 'Pengurangan Stok';
                      let badgeStyle = 'bg-slate-100 text-slate-800';
                      let icon = <HelpCircle className="w-3.5 h-3.5" />;

                      if (adj.reason === 'KONSUMSI_SENDIRI') {
                        reasonLabel = '🍽️ Consumed / Makan Sendiri';
                        badgeStyle = 'bg-amber-100 text-amber-900';
                      } else if (adj.reason === 'RUSAK_PEC_BOCOR') {
                        reasonLabel = '💥 Rusak / Pecah / Jatuh';
                        badgeStyle = 'bg-rose-100 text-rose-900';
                      } else if (adj.reason === 'KADALUARSA') {
                        reasonLabel = '⏳ Kadaluarsa (Expired)';
                        badgeStyle = 'bg-purple-100 text-purple-900';
                      } else if (adj.reason === 'BONUS_HADIAH') {
                        reasonLabel = '🎁 Bonus / Hadiah Pembeli';
                        badgeStyle = 'bg-blue-100 text-blue-900';
                      } else if (adj.reason === 'HILANG') {
                        reasonLabel = '❓ Hilang / Celah Stok';
                        badgeStyle = 'bg-slate-200 text-slate-900';
                      }

                      return (
                        <tr key={adj.id} className="hover:bg-slate-50/80 transition-colors">
                          <td className="py-3.5 px-4 font-bold text-slate-700 whitespace-nowrap">
                            <div className="flex items-center gap-1.5 text-xs">
                              <Clock className="w-3.5 h-3.5 text-slate-400" />
                              <span>{formatDateID(adj.date)}</span>
                            </div>
                          </td>
                          <td className="py-3.5 px-4">
                            <div className="font-extrabold text-slate-800">{adj.productName}</div>
                            <span className="text-xs font-black text-rose-600 bg-rose-50 px-2 py-0.5 rounded mt-0.5 inline-block">
                              -{adj.qty} {adj.unit}
                            </span>
                          </td>
                          <td className="py-3.5 px-4 whitespace-nowrap">
                            <span className={`text-xs font-extrabold px-2.5 py-1 rounded-full inline-flex items-center gap-1 ${badgeStyle}`}>
                              {reasonLabel}
                            </span>
                          </td>
                          <td className="py-3.5 px-4 font-black text-rose-600 whitespace-nowrap">
                            {formatIDR(adj.totalLossValue)}
                            <span className="text-[10px] text-slate-400 block font-normal">@{formatIDR(adj.buyPrice)}/unit</span>
                          </td>
                          <td className="py-3.5 px-4 text-xs text-slate-600 max-w-xs">
                            {adj.notes || '-'}
                          </td>
                          <td className="py-3.5 px-4 text-right">
                            <button
                              onClick={() => {
                                if (window.confirm(`Batalkan pencatatan ${adj.productName} (${adj.qty} ${adj.unit})? Stok barang akan dikembalikan.`)) {
                                  sound.playTap();
                                  deleteStockAdjustment(adj.id);
                                }
                              }}
                              className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-colors"
                              title="Hapus & Kembalikan Stok"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* MODAL CATAT RETUR BARANG */}
      {showModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 max-h-[90vh] overflow-y-auto custom-scrollbar">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-4">
              <h3 className="font-extrabold text-lg text-slate-800 flex items-center gap-2">
                <RotateCcw className="w-6 h-6 text-rose-600" />
                <span>Catat Retur Barang ke Sales/Grosir</span>
              </h3>
              <button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Product Select */}
              <div>
                <label className="text-xs font-bold text-slate-600 mb-1 block">Pilih Barang yang Diretur *</label>
                <div className="relative">
                  <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    placeholder="Cari nama barang..."
                    value={productSearch}
                    onChange={(e) => {
                      setProductSearch(e.target.value);
                      setSelectedProdId('');
                    }}
                    className="w-full pl-9 pr-3 py-2.5 bg-slate-50 rounded-xl border border-slate-300 font-semibold text-sm outline-none focus:bg-white focus:border-blue-600"
                  />
                  {productSearch && !selectedProdId && (
                    <div className="absolute left-0 right-0 top-full mt-1 bg-white border border-slate-300 rounded-xl shadow-xl max-h-40 overflow-y-auto z-20">
                      {filteredProducts.map(p => (
                        <div
                          key={p.id}
                          onClick={() => {
                            setSelectedProdId(p.id);
                            setProductSearch(p.name);
                          }}
                          className="p-2.5 hover:bg-rose-50 cursor-pointer text-xs font-bold text-slate-800 flex justify-between border-b border-slate-100 last:border-0"
                        >
                          <span>{p.icon} {p.name}</span>
                          <span className="text-slate-500">Stok: {p.stock} {p.unit}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
                {selectedProdObj && (
                  <div className="mt-1.5 p-2 bg-blue-50 rounded-xl border border-blue-200 text-xs font-bold text-blue-900 flex justify-between">
                    <span>Terpilih: {selectedProdObj.name}</span>
                    <span>Stok Saat Ini: {selectedProdObj.stock} {selectedProdObj.unit}</span>
                  </div>
                )}
              </div>

              {/* Qty & Reason */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-slate-600 mb-1 block">Jumlah Retur *</label>
                  <input
                    type="number"
                    min={1}
                    value={qty}
                    onChange={(e) => setQty(Number(e.target.value))}
                    className="w-full p-2.5 bg-slate-50 rounded-xl border border-slate-300 font-black text-sm text-center outline-none focus:bg-white focus:border-blue-600"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-600 mb-1 block">Alasan Retur *</label>
                  <select
                    value={returnReason}
                    onChange={(e) => setReturnReason(e.target.value as StockReturn['returnReason'])}
                    className="w-full p-2.5 bg-slate-50 rounded-xl border border-slate-300 font-bold text-xs text-slate-800 outline-none focus:bg-white focus:border-blue-600"
                  >
                    <option value="RUSAK_CACAT">Rusak / Cacat</option>
                    <option value="EXPIRED">Kadaluwarsa (Expired)</option>
                    <option value="KEMASAN_BOCOR">Kemasan Bocor / Penyok</option>
                    <option value="SALAH_KIRIM">Salah Kirim Barang</option>
                    <option value="LAINNYA">Lainnya</option>
                  </select>
                </div>
              </div>

              {/* Target & Target Name */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-slate-600 mb-1 block">Tujuan Retur</label>
                  <select
                    value={target}
                    onChange={(e) => setTarget(e.target.value as 'SALES_DISTRIBUTOR' | 'TOKO_GROSIR')}
                    className="w-full p-2.5 bg-slate-50 rounded-xl border border-slate-300 font-bold text-xs text-slate-800 outline-none focus:bg-white focus:border-blue-600"
                  >
                    <option value="SALES_DISTRIBUTOR">Ke Sales Distributor</option>
                    <option value="TOKO_GROSIR">Ke Toko Grosir/Pasar</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-600 mb-1 block">Nama Sales / Grosir *</label>
                  <input
                    type="text"
                    required
                    placeholder="Misal: Sales Mas Agus..."
                    value={targetName}
                    onChange={(e) => setTargetName(e.target.value)}
                    className="w-full p-2.5 bg-slate-50 rounded-xl border border-slate-300 font-bold text-xs text-slate-800 outline-none focus:bg-white focus:border-blue-600"
                  />
                </div>
              </div>

              {/* Refund Action */}
              <div>
                <label className="text-xs font-bold text-slate-600 mb-1.5 block">Klaim Penyelesaian dari Sales/Grosir</label>
                <div className="space-y-1.5">
                  <label className="flex items-center gap-2.5 p-2.5 bg-slate-50 rounded-xl border border-slate-200 cursor-pointer hover:bg-slate-100">
                    <input
                      type="radio"
                      name="refundAction"
                      checked={refundAction === 'GANTI_BARANG_BARU'}
                      onChange={() => setRefundAction('GANTI_BARANG_BARU')}
                      className="w-4 h-4 text-blue-600"
                    />
                    <span className="text-xs font-bold text-slate-800">Ditukar dengan Barang Baru yang Bagus</span>
                  </label>
                  
                  <label className="flex items-center gap-2.5 p-2.5 bg-slate-50 rounded-xl border border-slate-200 cursor-pointer hover:bg-slate-100">
                    <input
                      type="radio"
                      name="refundAction"
                      checked={refundAction === 'POTONG_TAGIHAN'}
                      onChange={() => setRefundAction('POTONG_TAGIHAN')}
                      className="w-4 h-4 text-blue-600"
                    />
                    <span className="text-xs font-bold text-slate-800">Dipotong di Tagihan Nota Kunjungan Berikutnya</span>
                  </label>

                  <label className="flex items-center gap-2.5 p-2.5 bg-slate-50 rounded-xl border border-slate-200 cursor-pointer hover:bg-slate-100">
                    <input
                      type="radio"
                      name="refundAction"
                      checked={refundAction === 'UANG_KEMBALI'}
                      onChange={() => setRefundAction('UANG_KEMBALI')}
                      className="w-4 h-4 text-blue-600"
                    />
                    <span className="text-xs font-bold text-slate-800">Uang Tunai Dikembalikan (Refund)</span>
                  </label>
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-600 mb-1 block">Catatan Tambahan</label>
                <input
                  type="text"
                  placeholder="Misal: Kaleng penyok di bagian bawah, diganti sales minggu depan..."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 rounded-xl border border-slate-300 text-xs text-slate-700 outline-none focus:bg-white focus:border-blue-600"
                />
              </div>

              <div className="pt-3 flex gap-3">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="flex-1 py-3.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-sm rounded-xl transition-colors"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={!selectedProdObj || !targetName.trim()}
                  className={`flex-1 py-3.5 rounded-xl font-black text-base transition-all shadow-lg ${
                    !selectedProdObj || !targetName.trim()
                      ? 'bg-slate-300 text-slate-500 cursor-not-allowed'
                      : 'bg-rose-600 hover:bg-rose-700 text-white shadow-rose-600/30'
                  }`}
                >
                  Simpan Catatan Retur
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
      />
    </div>
  );
};
