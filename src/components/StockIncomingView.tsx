import React, { useState } from 'react';
import { useStore } from '../context/StoreContext';
import { StockIncoming, StockIncomingItem } from '../types';
import { formatIDR, formatDateID } from '../utils/formatters';
import { sound } from '../utils/sound';
import {
  Truck,
  Plus,
  Trash2,
  Calendar,
  FileText,
  UserCheck,
  ShoppingBag,
  CheckCircle2,
  Clock,
  X,
  Search
} from 'lucide-react';

export const StockIncomingView: React.FC = () => {
  const { products, incoming, addStockIncoming } = useStore();

  // Modal States
  const [showModal, setShowModal] = useState<boolean>(false);
  const [source, setSource] = useState<'SALES_DISTRIBUTOR' | 'BELI_MANDIRI'>('SALES_DISTRIBUTOR');
  const [supplierName, setSupplierName] = useState<string>('');
  const [invoiceNo, setInvoiceNo] = useState<string>('');
  const [statusBayar, setStatusBayar] = useState<'LUNAS' | 'TEMPO'>('LUNAS');
  const [notes, setNotes] = useState<string>('');

  // Items in current incoming form
  const [items, setItems] = useState<StockIncomingItem[]>([]);
  
  // Product search for adding to list
  const [productSearch, setProductSearch] = useState<string>('');
  const [selectedProdId, setSelectedProdId] = useState<string>('');
  const [inputQty, setInputQty] = useState<number>(1);
  const [inputPrice, setInputPrice] = useState<number>(0);

  const filteredProducts = products.filter(p =>
    p.name.toLowerCase().includes(productSearch.toLowerCase())
  );

  const handleSelectProduct = (id: string) => {
    setSelectedProdId(id);
    const prod = products.find(p => p.id === id);
    if (prod) {
      setInputPrice(prod.buyPrice);
      setInputQty(10);
    }
  };

  const handleAddItemToForm = () => {
    if (!selectedProdId || inputQty <= 0) return;
    const prod = products.find(p => p.id === selectedProdId);
    if (!prod) return;

    sound.playTap();
    const existingIdx = items.findIndex(i => i.productId === selectedProdId);
    if (existingIdx > -1) {
      const updated = [...items];
      updated[existingIdx].qty += inputQty;
      updated[existingIdx].buyPrice = inputPrice;
      updated[existingIdx].totalCost = updated[existingIdx].qty * inputPrice;
      setItems(updated);
    } else {
      setItems([
        ...items,
        {
          productId: prod.id,
          productName: prod.name,
          qty: inputQty,
          unit: prod.unit,
          buyPrice: inputPrice,
          totalCost: inputQty * inputPrice
        }
      ]);
    }

    setSelectedProdId('');
    setProductSearch('');
  };

  const handleRemoveItemFromForm = (idx: number) => {
    sound.playTap();
    setItems(items.filter((_, i) => i !== idx));
  };

  const totalFormCost = items.reduce((sum, item) => sum + item.totalCost, 0);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (items.length === 0 || !supplierName.trim()) return;

    addStockIncoming({
      source,
      supplierName: supplierName.trim(),
      invoiceNo: invoiceNo.trim() || undefined,
      items,
      totalCost: totalFormCost,
      statusBayar,
      notes: notes.trim() || undefined
    });

    // Reset Form
    setSupplierName('');
    setInvoiceNo('');
    setStatusBayar('LUNAS');
    setNotes('');
    setItems([]);
    setShowModal(false);
  };

  return (
    <div className="flex flex-col flex-1 h-screen overflow-hidden bg-slate-100 font-sans p-6">
      {/* Top Header & Actions */}
      <div className="bg-white rounded-3xl p-5 shadow-sm border border-slate-200 mb-6 flex flex-col md:flex-row items-center justify-between gap-4 shrink-0">
        <div>
          <h1 className="text-2xl font-black text-slate-800 flex items-center gap-2.5">
            <Truck className="w-7 h-7 text-blue-600" />
            <span>Barang Masuk (Sales & Beli Mandiri)</span>
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Catat penambahan stok barang dari kunjungan sales distributor atau belanja mandiri ke pasar grosir.
          </p>
        </div>

        <button
          onClick={() => {
            sound.playTap();
            setShowModal(true);
          }}
          className="w-full md:w-auto px-6 py-3.5 bg-blue-600 hover:bg-blue-700 text-white font-black text-base rounded-2xl shadow-lg shadow-blue-600/30 transition-all flex items-center justify-center gap-2"
        >
          <Plus className="w-5 h-5 stroke-[3]" />
          <span>+ CATAT BARANG MASUK</span>
        </button>
      </div>

      {/* History Table */}
      <div className="flex-1 bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden flex flex-col">
        <div className="p-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between font-bold text-sm text-slate-700">
          <span>Histori Sirkulasi Stok Masuk ({incoming.length} Catatan)</span>
          <span className="text-xs font-semibold text-slate-500">Otomatis menambah stok katalog</span>
        </div>

        <div className="overflow-y-auto flex-1 custom-scrollbar">
          <table className="w-full text-left border-collapse select-none">
            <thead className="bg-slate-50 border-b border-slate-200 text-[11px] font-black text-slate-500 uppercase tracking-wider sticky top-0 z-10">
              <tr>
                <th className="py-3.5 px-4">Tanggal</th>
                <th className="py-3.5 px-4">Sumber & Sales / Supplier</th>
                <th className="py-3.5 px-4">No Nota / Faktur</th>
                <th className="py-3.5 px-4">Rincian Barang & Jumlah</th>
                <th className="py-3.5 px-4">Total Belanja Modal</th>
                <th className="py-3.5 px-4">Status Bayar</th>
                <th className="py-3.5 px-4">Catatan</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-sm">
              {incoming.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-400 font-bold">
                    Belum ada riwayat barang masuk dari sales atau belanja mandiri.
                  </td>
                </tr>
              ) : (
                incoming.map((inc) => (
                  <tr key={inc.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3.5 px-4 font-bold text-slate-700 whitespace-nowrap">
                      <div className="flex items-center gap-1.5">
                        <Calendar className="w-4 h-4 text-slate-400 shrink-0" />
                        <span>{formatDateID(inc.date)}</span>
                      </div>
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="font-extrabold text-slate-800">{inc.supplierName}</div>
                      <span className={`text-[10px] font-extrabold px-2 py-0.5 rounded-md inline-block mt-1 ${
                        inc.source === 'SALES_DISTRIBUTOR'
                          ? 'bg-blue-100 text-blue-800'
                          : 'bg-emerald-100 text-emerald-800'
                      }`}>
                        {inc.source === 'SALES_DISTRIBUTOR' ? '👨‍💼 Sales Distributor' : '🛒 Belanja Mandiri'}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 font-mono text-xs text-slate-500">
                      {inc.invoiceNo || '-'}
                    </td>
                    <td className="py-3.5 px-4 max-w-xs">
                      <div className="space-y-1">
                        {inc.items.map((it, idx) => (
                          <div key={idx} className="text-xs bg-slate-100 px-2.5 py-1 rounded-lg font-bold text-slate-700 flex justify-between">
                            <span>{it.productName}</span>
                            <span className="text-blue-600">+{it.qty} {it.unit}</span>
                          </div>
                        ))}
                      </div>
                    </td>
                    <td className="py-3.5 px-4 font-black text-blue-600 whitespace-nowrap">
                      {formatIDR(inc.totalCost)}
                    </td>
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      {inc.statusBayar === 'LUNAS' ? (
                        <span className="px-2.5 py-1 bg-emerald-100 text-emerald-800 font-bold text-xs rounded-full inline-flex items-center gap-1">
                          <CheckCircle2 className="w-3 h-3" /> Lunas (Cash)
                        </span>
                      ) : (
                        <span className="px-2.5 py-1 bg-amber-100 text-amber-800 font-bold text-xs rounded-full inline-flex items-center gap-1">
                          <Clock className="w-3 h-3" /> Tempo / Kasbon
                        </span>
                      )}
                    </td>
                    <td className="py-3.5 px-4 text-xs text-slate-500 italic max-w-xs">
                      {inc.notes || '-'}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* MODAL CATAT BARANG MASUK BARU */}
      {showModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl max-w-3xl w-full p-6 shadow-2xl border border-slate-200 max-h-[90vh] overflow-y-auto custom-scrollbar">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-4">
              <h3 className="font-extrabold text-lg text-slate-800 flex items-center gap-2">
                <Truck className="w-6 h-6 text-blue-600" />
                <span>Catat Barang Masuk (Tambah Stok)</span>
              </h3>
              <button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Source Selector */}
              <div>
                <label className="text-xs font-bold text-slate-600 mb-1.5 block">Sumber Barang Masuk</label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => {
                      sound.playTap();
                      setSource('SALES_DISTRIBUTOR');
                    }}
                    className={`p-3 rounded-2xl font-extrabold text-sm flex items-center justify-center gap-2 border-2 transition-all ${
                      source === 'SALES_DISTRIBUTOR'
                        ? 'bg-blue-600 text-white border-blue-600 shadow-md'
                        : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    <UserCheck className="w-5 h-5" />
                    <span>👨‍💼 Dari Sales yang Datang</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      sound.playTap();
                      setSource('BELI_MANDIRI');
                    }}
                    className={`p-3 rounded-2xl font-extrabold text-sm flex items-center justify-center gap-2 border-2 transition-all ${
                      source === 'BELI_MANDIRI'
                        ? 'bg-blue-600 text-white border-blue-600 shadow-md'
                        : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    <ShoppingBag className="w-5 h-5" />
                    <span>🛒 Belanja Mandiri ke Grosir/Pasar</span>
                  </button>
                </div>
              </div>

              {/* Supplier & Invoice */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-slate-600 mb-1 block">
                    {source === 'SALES_DISTRIBUTOR' ? 'Nama Sales / Distributor *' : 'Nama Toko Grosir / Pasar *'}
                  </label>
                  <input
                    type="text"
                    required
                    placeholder={source === 'SALES_DISTRIBUTOR' ? 'Misal: Sales Indofood (Mas Agus)...' : 'Misal: Grosir Laris Manis Pasar Induk...'}
                    value={supplierName}
                    onChange={(e) => setSupplierName(e.target.value)}
                    className="w-full p-3 bg-slate-50 rounded-xl border border-slate-300 font-bold text-sm text-slate-800 outline-none focus:bg-white focus:border-blue-600"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-600 mb-1 block">Nomor Nota / Faktur (Opsional)</label>
                  <input
                    type="text"
                    placeholder="Misal: INV-8923..."
                    value={invoiceNo}
                    onChange={(e) => setInvoiceNo(e.target.value)}
                    className="w-full p-3 bg-slate-50 rounded-xl border border-slate-300 font-mono text-sm text-slate-800 outline-none focus:bg-white focus:border-blue-600"
                  />
                </div>
              </div>

              {/* Status Bayar */}
              <div>
                <label className="text-xs font-bold text-slate-600 mb-1 block">Status Pembayaran ke Sales/Grosir</label>
                <div className="flex gap-4">
                  <label className="flex items-center gap-2 font-bold text-sm text-slate-700 cursor-pointer">
                    <input
                      type="radio"
                      name="statusBayar"
                      checked={statusBayar === 'LUNAS'}
                      onChange={() => setStatusBayar('LUNAS')}
                      className="w-4 h-4 text-blue-600"
                    />
                    <span>Lunas (Dibayar Cash)</span>
                  </label>
                  <label className="flex items-center gap-2 font-bold text-sm text-slate-700 cursor-pointer">
                    <input
                      type="radio"
                      name="statusBayar"
                      checked={statusBayar === 'TEMPO'}
                      onChange={() => setStatusBayar('TEMPO')}
                      className="w-4 h-4 text-blue-600"
                    />
                    <span>Tempo / Kasbon (Bayar Kunjungan Berikutnya)</span>
                  </label>
                </div>
              </div>

              {/* Add Item Box */}
              <div className="bg-blue-50/70 p-4 rounded-2xl border border-blue-200 space-y-3">
                <div className="text-xs font-extrabold text-blue-900 uppercase">Pilih Barang yang Datang / Dibeli</div>
                
                <div className="grid grid-cols-1 md:grid-cols-4 gap-2.5">
                  <div className="md:col-span-2">
                    <label className="text-[11px] font-bold text-blue-800 block mb-1">Cari Nama Barang Toko:</label>
                    <div className="relative">
                      <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                      <input
                        type="text"
                        placeholder="Ketik nama barang..."
                        value={productSearch}
                        onChange={(e) => {
                          setProductSearch(e.target.value);
                          setSelectedProdId('');
                        }}
                        className="w-full pl-9 pr-3 py-2 bg-white rounded-xl border border-blue-300 font-semibold text-sm outline-none focus:ring-2 focus:ring-blue-500"
                      />
                      {productSearch && !selectedProdId && (
                        <div className="absolute left-0 right-0 top-full mt-1 bg-white border border-slate-300 rounded-xl shadow-xl max-h-40 overflow-y-auto z-20">
                          {filteredProducts.map(p => (
                            <div
                              key={p.id}
                              onClick={() => {
                                handleSelectProduct(p.id);
                                setProductSearch(p.name);
                              }}
                              className="p-2.5 hover:bg-blue-50 cursor-pointer text-xs font-bold text-slate-800 flex justify-between border-b border-slate-100 last:border-0"
                            >
                              <span>{p.icon} {p.name}</span>
                              <span className="text-blue-600">Stok: {p.stock} {p.unit}</span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>

                  <div>
                    <label className="text-[11px] font-bold text-blue-800 block mb-1">Jumlah Masuk:</label>
                    <input
                      type="number"
                      min={1}
                      value={inputQty}
                      onChange={(e) => setInputQty(Number(e.target.value))}
                      className="w-full p-2 bg-white rounded-xl border border-blue-300 font-black text-sm text-center outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div>
                    <label className="text-[11px] font-bold text-blue-800 block mb-1">Harga Beli / Satuan:</label>
                    <input
                      type="number"
                      min={0}
                      value={inputPrice}
                      onChange={(e) => setInputPrice(Number(e.target.value))}
                      className="w-full p-2 bg-white rounded-xl border border-blue-300 font-black text-sm text-right outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>

                <button
                  type="button"
                  disabled={!selectedProdId}
                  onClick={handleAddItemToForm}
                  className={`w-full py-2.5 rounded-xl font-extrabold text-sm flex items-center justify-center gap-1 transition-all ${
                    !selectedProdId
                      ? 'bg-slate-200 text-slate-400 cursor-not-allowed'
                      : 'bg-blue-600 hover:bg-blue-700 text-white shadow-md'
                  }`}
                >
                  <Plus className="w-4 h-4 stroke-[3]" />
                  <span>Tambahkan ke Daftar Masuk</span>
                </button>
              </div>

              {/* Added Items Table */}
              <div>
                <div className="text-xs font-extrabold text-slate-600 mb-1">Daftar Barang yang Dicatat ({items.length} jenis)</div>
                {items.length === 0 ? (
                  <div className="p-4 bg-slate-50 rounded-xl text-center text-xs text-slate-400 font-bold border border-dashed border-slate-300">
                    Belum ada barang dipilih. Cari barang di atas lalu klik Tambahkan.
                  </div>
                ) : (
                  <div className="space-y-1.5 max-h-40 overflow-y-auto custom-scrollbar">
                    {items.map((it, idx) => (
                      <div key={idx} className="bg-slate-50 p-2.5 rounded-xl border border-slate-200 flex items-center justify-between text-xs font-bold">
                        <div>
                          <div className="text-slate-800">{it.productName}</div>
                          <div className="text-[11px] text-slate-500 font-normal">
                            {it.qty} {it.unit} x {formatIDR(it.buyPrice)}
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className="font-black text-blue-600 text-sm">{formatIDR(it.totalCost)}</span>
                          <button
                            type="button"
                            onClick={() => handleRemoveItemFromForm(idx)}
                            className="text-slate-400 hover:text-rose-600 p-1"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Total Cost Box */}
              <div className="bg-slate-100 p-3 rounded-2xl border border-slate-200 flex justify-between items-center">
                <span className="font-extrabold text-slate-700">Total Modal Masuk:</span>
                <span className="text-xl font-black text-blue-900">{formatIDR(totalFormCost)}</span>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-600 mb-1 block">Catatan Opsional</label>
                <input
                  type="text"
                  placeholder="Misal: Diantar oleh Mas Agus, ada bonus 1 bungkus, dll..."
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
                  disabled={items.length === 0 || !supplierName.trim()}
                  className={`flex-1 py-3.5 rounded-xl font-black text-base transition-all shadow-lg ${
                    items.length === 0 || !supplierName.trim()
                      ? 'bg-slate-300 text-slate-500 cursor-not-allowed'
                      : 'bg-blue-600 hover:bg-blue-700 text-white shadow-blue-600/30'
                  }`}
                >
                  Simpan Stok Masuk Sekarang
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
