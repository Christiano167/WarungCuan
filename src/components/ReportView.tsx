import React, { useState, useMemo } from 'react';
import { useStore } from '../context/StoreContext';
import { formatIDR, formatDateID, formatTimeID } from '../utils/formatters';
import { sound } from '../utils/sound';
import {
  TrendingUp,
  DollarSign,
  Calendar,
  ShoppingBag,
  ArrowUpRight,
  ArrowDownRight,
  BookOpen,
  PieChart,
  BarChart3,
  Award,
  Clock,
  CheckCircle2,
  FileText,
  Filter,
  X
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend
} from 'recharts';

export const ReportView: React.FC = () => {
  const { sales, debts, products, adjustments } = useStore();

  // Filter Period State
  const [period, setPeriod] = useState<'today' | '7days' | 'month' | 'all'>('7days');
  const [selectedSaleId, setSelectedSaleId] = useState<string | null>(null);

  // Filter sales by date
  const filteredSales = useMemo(() => {
    const now = new Date();
    const todayStr = now.toISOString().split('T')[0];

    return sales.filter(s => {
      if (period === 'all') return true;
      if (period === 'today') {
        return s.dateString === todayStr;
      }
      if (period === '7days') {
        const diffDays = (now.getTime() - s.timestamp) / (1000 * 3600 * 24);
        return diffDays <= 7;
      }
      if (period === 'month') {
        const curMonth = todayStr.slice(0, 7); // YYYY-MM
        return s.dateString.startsWith(curMonth);
      }
      return true;
    });
  }, [sales, period]);

  // Calculations
  const totalOmset = useMemo(() => filteredSales.reduce((sum, s) => sum + s.totalAmount, 0), [filteredSales]);
  const totalModal = useMemo(() => filteredSales.reduce((sum, s) => sum + s.totalBuyPrice, 0), [filteredSales]);
  const totalLaba = useMemo(() => filteredSales.reduce((sum, s) => sum + s.totalProfit, 0), [filteredSales]);
  const totalUnpaidDebt = useMemo(() => debts.reduce((sum, d) => d.status === 'BELUM_LUNAS' ? sum + d.remainingAmount : sum, 0), [debts]);
  const totalAdjustmentLoss = useMemo(() => adjustments.reduce((sum, a) => sum + a.totalLossValue, 0), [adjustments]);
  const netProfitFinal = Math.max(0, totalLaba - totalAdjustmentLoss);

  // Group daily chart data
  const chartData = useMemo(() => {
    const map: Record<string, { date: string; omset: number; laba: number }> = {};
    
    // Sort chronological
    const sorted = [...filteredSales].sort((a, b) => a.timestamp - b.timestamp);
    
    sorted.forEach(s => {
      const dStr = s.dateString;
      const shortDate = formatDateID(dStr).split(' ').slice(0, 2).join(' '); // e.g. "27 Jul"
      if (!map[dStr]) {
        map[dStr] = { date: shortDate, omset: 0, laba: 0 };
      }
      map[dStr].omset += s.totalAmount;
      map[dStr].laba += s.totalProfit;
    });

    const arr = Object.values(map);
    // If empty, return placeholder
    if (arr.length === 0) {
      return [{ date: 'Belum Ada Data', omset: 0, laba: 0 }];
    }
    return arr;
  }, [filteredSales]);

  // Top Selling Items in selected period
  const topProducts = useMemo(() => {
    const itemMap: Record<string, { name: string; qty: number; unit: string; omset: number; profit: number }> = {};

    filteredSales.forEach(s => {
      s.items.forEach(it => {
        if (!itemMap[it.productId]) {
          itemMap[it.productId] = { name: it.productName, qty: 0, unit: it.unit, omset: 0, profit: 0 };
        }
        itemMap[it.productId].qty += it.quantity;
        itemMap[it.productId].omset += it.subtotal;
        itemMap[it.productId].profit += it.profit;
      });
    });

    return Object.values(itemMap)
      .sort((a, b) => b.qty - a.qty)
      .slice(0, 5);
  }, [filteredSales]);

  const selectedSaleObj = sales.find(s => s.id === selectedSaleId);

  return (
    <div className="flex flex-col flex-1 h-screen overflow-hidden bg-slate-100 font-sans p-6">
      {/* Top Header & Period Selector */}
      <div className="bg-white rounded-3xl p-5 shadow-sm border border-slate-200 mb-6 flex flex-col md:flex-row items-center justify-between gap-4 shrink-0">
        <div>
          <h1 className="text-2xl font-black text-slate-800 flex items-center gap-2.5">
            <TrendingUp className="w-7 h-7 text-blue-600" />
            <span>Laporan Laba Rugi & Rekap Penjualan</span>
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Pantau perkembangan omset harian & bulanan, total modal terpakai, dan keuntungan bersih warung.
          </p>
        </div>

        {/* Filter Period Pills */}
        <div className="flex items-center gap-1.5 bg-slate-100 p-1.5 rounded-2xl border border-slate-200 w-full md:w-auto overflow-x-auto">
          {[
            { id: 'today', label: 'Hari Ini' },
            { id: '7days', label: '7 Hari Terakhir' },
            { id: 'month', label: 'Bulan Ini (Bulanan)' },
            { id: 'all', label: 'Semua Waktu' }
          ].map((item) => (
            <button
              key={item.id}
              onClick={() => {
                sound.playTap();
                setPeriod(item.id as any);
              }}
              className={`px-4 py-2 rounded-xl text-xs font-black transition-all whitespace-nowrap ${
                period === item.id
                  ? 'bg-blue-600 text-white shadow-md'
                  : 'text-slate-600 hover:bg-white'
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>
      </div>

      {/* Main Grid: Scrollable area for cards, chart, and top items */}
      <div className="flex-1 overflow-y-auto space-y-6 custom-scrollbar pb-12">
        {/* 5 Summary Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3.5">
          <div className="bg-gradient-to-br from-blue-900 to-blue-800 text-white p-4.5 rounded-3xl shadow-lg relative overflow-hidden">
            <div className="text-[11px] font-bold text-blue-200 uppercase tracking-wider">Total Omset (Kotor)</div>
            <div className="text-xl font-black mt-1.5 tracking-tight">{formatIDR(totalOmset)}</div>
            <div className="text-[10px] text-blue-300 mt-1 flex items-center gap-1">
              <ShoppingBag className="w-3 h-3" />
              <span>{filteredSales.length} Transaksi</span>
            </div>
          </div>

          <div className="bg-white p-4.5 rounded-3xl shadow-sm border border-slate-200 relative overflow-hidden">
            <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Modal Belanja (HPP)</div>
            <div className="text-xl font-black text-slate-800 mt-1.5 tracking-tight">{formatIDR(totalModal)}</div>
            <div className="text-[10px] text-slate-500 mt-1 flex items-center gap-1">
              <ArrowDownRight className="w-3 h-3 text-slate-400" />
              <span>Modal barang terjual</span>
            </div>
          </div>

          <div className="bg-amber-50 p-4.5 rounded-3xl shadow-sm border border-amber-200 relative overflow-hidden">
            <div className="text-[11px] font-bold text-amber-800 uppercase tracking-wider">Konsumsi / Rusak</div>
            <div className="text-xl font-black text-amber-900 mt-1.5 tracking-tight">{formatIDR(totalAdjustmentLoss)}</div>
            <div className="text-[10px] text-amber-700 mt-1 flex items-center gap-1 font-semibold">
              <span>{adjustments.length} Catatan Pemakaian</span>
            </div>
          </div>

          <div className="bg-gradient-to-br from-emerald-700 to-emerald-600 text-white p-4.5 rounded-3xl shadow-lg relative overflow-hidden">
            <div className="text-[11px] font-bold text-emerald-100 uppercase tracking-wider">Laba Murni Akurat</div>
            <div className="text-xl font-black mt-1.5 tracking-tight">{formatIDR(netProfitFinal)}</div>
            <div className="text-[10px] text-emerald-100 mt-1 flex items-center gap-1">
              <ArrowUpRight className="w-3 h-3" />
              <span>
                {totalOmset > 0 ? `${((netProfitFinal / totalOmset) * 100).toFixed(1)}% margin` : '0% margin'}
              </span>
            </div>
          </div>

          <div className="bg-rose-50 p-4.5 rounded-3xl shadow-sm border border-rose-200 relative overflow-hidden">
            <div className="text-[11px] font-extrabold text-rose-800 uppercase tracking-wider">Bon Hutang Aktif</div>
            <div className="text-xl font-black text-rose-600 mt-1.5 tracking-tight">{formatIDR(totalUnpaidDebt)}</div>
            <div className="text-[10px] text-rose-700 mt-1 flex items-center gap-1 font-semibold">
              <BookOpen className="w-3 h-3" />
              <span>Kasbon lum lunak</span>
            </div>
          </div>
        </div>

        {/* Chart & Top Products Row */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Chart Section (2 cols) */}
          <div className="lg:col-span-2 bg-white p-5 rounded-3xl shadow-sm border border-slate-200 flex flex-col">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="font-extrabold text-base text-slate-800 flex items-center gap-2">
                  <BarChart3 className="w-5 h-5 text-blue-600" />
                  <span>Grafik Omset vs Laba Bersih</span>
                </h3>
                <p className="text-xs text-slate-400">Perbandingan pemasukan dengan keuntungan per hari</p>
              </div>
            </div>

            <div className="h-72 w-full pt-2">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                  <XAxis dataKey="date" stroke="#64748b" fontSize={11} tickLine={false} axisLine={false} />
                  <YAxis
                    stroke="#64748b"
                    fontSize={11}
                    tickLine={false}
                    axisLine={false}
                    tickFormatter={(val) => val >= 1000 ? `${(val / 1000).toFixed(0)}k` : val}
                  />
                  <Tooltip
                    formatter={(val: number) => [formatIDR(val), '']}
                    contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1)', fontWeight: 'bold' }}
                  />
                  <Legend wrapperStyle={{ fontSize: '12px', paddingTop: '10px' }} />
                  <Bar name="Omset (Kotor)" dataKey="omset" fill="#2563eb" radius={[6, 6, 0, 0]} barSize={24} />
                  <Bar name="Laba Bersih" dataKey="laba" fill="#10b981" radius={[6, 6, 0, 0]} barSize={24} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Top 5 Products Section */}
          <div className="bg-white p-5 rounded-3xl shadow-sm border border-slate-200 flex flex-col">
            <h3 className="font-extrabold text-base text-slate-800 flex items-center gap-2 mb-3">
              <Award className="w-5 h-5 text-amber-500" />
              <span>5 Barang Terlaris</span>
            </h3>

            {topProducts.length === 0 ? (
              <div className="flex-1 flex items-center justify-center text-center text-xs font-bold text-slate-400 py-8">
                Belum ada data barang terjual di periode ini.
              </div>
            ) : (
              <div className="space-y-3 flex-1 overflow-y-auto custom-scrollbar pr-1">
                {topProducts.map((prod, idx) => (
                  <div key={idx} className="flex items-center justify-between p-3 bg-slate-50 rounded-2xl border border-slate-200">
                    <div className="flex items-center gap-2.5 overflow-hidden">
                      <span className={`w-6 h-6 rounded-lg font-black text-xs flex items-center justify-center shrink-0 ${
                        idx === 0 ? 'bg-amber-500 text-white shadow-sm' :
                        idx === 1 ? 'bg-slate-300 text-slate-800' :
                        idx === 2 ? 'bg-amber-700 text-white' : 'bg-slate-200 text-slate-600'
                      }`}>
                        #{idx + 1}
                      </span>
                      <div className="overflow-hidden">
                        <div className="font-extrabold text-xs text-slate-800 truncate">{prod.name}</div>
                        <div className="text-[10px] text-slate-500 font-bold">Terjual {prod.qty} {prod.unit}</div>
                      </div>
                    </div>

                    <div className="text-right shrink-0">
                      <div className="font-black text-xs text-emerald-600">+{formatIDR(prod.profit)}</div>
                      <div className="text-[9px] text-slate-400 font-bold">Omset: {formatIDR(prod.omset)}</div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Transactions Table */}
        <div className="bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="p-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between font-bold text-sm text-slate-700">
            <span>Daftar Riwayat Penjualan ({filteredSales.length} Transaksi)</span>
            <span className="text-xs font-semibold text-slate-400">Klik baris untuk lihat detail struk</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse select-none">
              <thead className="bg-slate-50 border-b border-slate-200 text-[11px] font-black text-slate-500 uppercase tracking-wider">
                <tr>
                  <th className="py-3.5 px-4">No Nota / Waktu</th>
                  <th className="py-3.5 px-4">Ringkasan Barang</th>
                  <th className="py-3.5 px-4">Metode Bayar</th>
                  <th className="py-3.5 px-4">Omset Kotor</th>
                  <th className="py-3.5 px-4">Modal (HPP)</th>
                  <th className="py-3.5 px-4 text-right">Laba Bersih</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-sm">
                {filteredSales.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-12 text-center text-slate-400 font-bold">
                      Tidak ada transaksi penjualan pada periode ini.
                    </td>
                  </tr>
                ) : (
                  filteredSales.map((sale) => (
                    <tr
                      key={sale.id}
                      onClick={() => setSelectedSaleId(sale.id)}
                      className="hover:bg-blue-50/60 transition-colors cursor-pointer"
                    >
                      <td className="py-3.5 px-4">
                        <div className="font-black text-slate-800 text-xs font-mono">{sale.invoiceNumber}</div>
                        <div className="text-[11px] text-slate-400 flex items-center gap-1 mt-0.5 font-semibold">
                          <Clock className="w-3 h-3" />
                          <span>{formatDateID(sale.dateString)} • {formatTimeID(sale.timestamp)}</span>
                        </div>
                      </td>
                      <td className="py-3.5 px-4 max-w-sm">
                        <div className="font-bold text-slate-700 text-xs truncate">
                          {sale.items.map(i => `${i.productName} (${i.quantity})`).join(', ')}
                        </div>
                        {sale.customerName && (
                          <div className="text-[10px] font-extrabold text-rose-600 mt-0.5">
                            Pelanggan Bon: {sale.customerName}
                          </div>
                        )}
                      </td>
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <span className={`text-xs font-extrabold px-2.5 py-1 rounded-full ${
                          sale.paymentMethod === 'CASH'
                            ? 'bg-blue-100 text-blue-800'
                            : sale.paymentMethod === 'HUTANG'
                            ? 'bg-rose-100 text-rose-800 font-black'
                            : 'bg-emerald-100 text-emerald-800'
                        }`}>
                          {sale.paymentMethod === 'HUTANG' ? 'HUTANG / KASBON' : sale.paymentMethod}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 font-bold text-slate-700">
                        {formatIDR(sale.totalAmount)}
                      </td>
                      <td className="py-3.5 px-4 font-semibold text-slate-400">
                        {formatIDR(sale.totalBuyPrice)}
                      </td>
                      <td className="py-3.5 px-4 font-black text-emerald-600 text-right">
                        +{formatIDR(sale.totalProfit)}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* MODAL DETAIL TRANSAKSI */}
      {selectedSaleObj && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-200">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-4">
              <h3 className="font-extrabold text-lg text-slate-800 flex items-center gap-2">
                <FileText className="w-5 h-5 text-blue-600" />
                <span>Detail Nota Penjualan</span>
              </h3>
              <button onClick={() => setSelectedSaleId(null)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="flex justify-between font-bold text-slate-700">
                <span>No Nota:</span>
                <span className="font-mono text-blue-600">{selectedSaleObj.invoiceNumber}</span>
              </div>
              <div className="flex justify-between text-slate-500">
                <span>Waktu Transaksi:</span>
                <span>{formatDateID(selectedSaleObj.dateString)} • {formatTimeID(selectedSaleObj.timestamp)}</span>
              </div>
              <div className="flex justify-between text-slate-500">
                <span>Metode Bayar:</span>
                <span className="font-bold text-slate-800">{selectedSaleObj.paymentMethod}</span>
              </div>
              {selectedSaleObj.customerName && (
                <div className="flex justify-between font-extrabold text-rose-600 bg-rose-50 p-2 rounded-xl">
                  <span>Pelanggan Bon:</span>
                  <span>{selectedSaleObj.customerName}</span>
                </div>
              )}

              <div className="border-t border-b border-slate-100 py-3 space-y-2 max-h-48 overflow-y-auto custom-scrollbar">
                <div className="font-bold text-slate-400 uppercase text-[10px]">Daftar Item Belanja:</div>
                {selectedSaleObj.items.map((it, idx) => (
                  <div key={idx} className="flex justify-between font-semibold text-slate-700">
                    <div>
                      <span>{it.productName}</span>
                      <span className="text-slate-400 ml-1">x{it.quantity} {it.unit}</span>
                    </div>
                    <div className="text-right">
                      <div className="font-bold text-slate-800">{formatIDR(it.subtotal)}</div>
                      <div className="text-[9px] text-emerald-600 font-extrabold">Laba: +{formatIDR(it.profit)}</div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="space-y-1 pt-1 font-bold text-sm">
                <div className="flex justify-between text-slate-600">
                  <span>Omset Kotor:</span>
                  <span>{formatIDR(selectedSaleObj.totalAmount)}</span>
                </div>
                <div className="flex justify-between text-slate-400 text-xs font-normal">
                  <span>Modal Belanja (HPP):</span>
                  <span>{formatIDR(selectedSaleObj.totalBuyPrice)}</span>
                </div>
                <div className="flex justify-between font-black text-emerald-600 text-base pt-1 border-t border-slate-100">
                  <span>Keuntungan Bersih:</span>
                  <span>+{formatIDR(selectedSaleObj.totalProfit)}</span>
                </div>
              </div>

              {selectedSaleObj.note && (
                <div className="bg-slate-50 p-2.5 rounded-xl text-slate-600 italic">
                  Catatan: {selectedSaleObj.note}
                </div>
              )}
            </div>

            <button
              onClick={() => setSelectedSaleId(null)}
              className="w-full mt-5 py-3 bg-blue-600 hover:bg-blue-700 text-white font-black text-sm rounded-xl shadow-md transition-colors"
            >
              Tutup Detail
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
