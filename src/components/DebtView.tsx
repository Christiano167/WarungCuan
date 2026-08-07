import React, { useState, useMemo } from 'react';
import { useStore } from '../context/StoreContext';
import { Customer } from '../types';
import { formatIDR, formatDateID } from '../utils/formatters';
import { sound } from '../utils/sound';
import {
  BookOpen,
  Plus,
  UserPlus,
  Phone,
  MapPin,
  CheckCircle2,
  DollarSign,
  Share2,
  X,
  Search,
  AlertCircle,
  FileText,
  User,
  Eye,
  EyeOff
} from 'lucide-react';

export const DebtView: React.FC = () => {
  const { customers, debts, addCustomer, addDebtManual, payDebt, settings } = useStore();

  // Selected customer & UI view state
  const [selectedCustId, setSelectedCustId] = useState<string | null>(customers[0]?.id || null);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [showDebtSummary, setShowDebtSummary] = useState<boolean>(true);

  // Modals
  const [showAddCustModal, setShowAddCustModal] = useState<boolean>(false);
  const [showAddDebtModal, setShowAddDebtModal] = useState<boolean>(false);
  const [showPayModal, setShowPayModal] = useState<boolean>(false);
  const [activeDebtIdToPay, setActiveDebtIdToPay] = useState<string | null>(null);

  // Form states for Add Cust
  const [custName, setCustName] = useState<string>('');
  const [custPhone, setCustPhone] = useState<string>('');
  const [custAddr, setCustAddr] = useState<string>('');

  // Form states for Manual Debt
  const [manualAmount, setManualAmount] = useState<number>(0);
  const [manualItems, setManualItems] = useState<string>('');
  const [manualNote, setManualNote] = useState<string>('');

  // Form states for Pay Debt
  const [payAmount, setPayAmount] = useState<number>(0);
  const [payNote, setPayNote] = useState<string>('');

  const filteredCustomers = useMemo(() => {
    return customers.filter(c =>
      c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (c.phone && c.phone.includes(searchQuery))
    );
  }, [customers, searchQuery]);

  const selectedCustomer = customers.find(c => c.id === selectedCustId) || filteredCustomers[0];

  const customerDebts = useMemo(() => {
    if (!selectedCustomer) return [];
    return debts.filter(d => d.customerId === selectedCustomer.id);
  }, [debts, selectedCustomer]);

  const totalActiveDebt = customers.reduce((sum, c) => sum + c.totalDebt, 0);
  const activeDebtorsCount = customers.filter(c => c.totalDebt > 0).length;

  const handleCreateCustomer = (e: React.FormEvent) => {
    e.preventDefault();
    if (!custName.trim()) return;
    addCustomer({
      name: custName.trim(),
      phone: custPhone.trim() || undefined,
      address: custAddr.trim() || undefined
    });
    setCustName('');
    setCustPhone('');
    setCustAddr('');
    setShowAddCustModal(false);
  };

  const handleCreateManualDebt = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCustomer || manualAmount <= 0) return;
    addDebtManual(
      selectedCustomer.id,
      manualAmount,
      manualItems.trim() || "Bon manual warung",
      manualNote.trim() || undefined
    );
    setManualAmount(0);
    setManualItems('');
    setManualNote('');
    setShowAddDebtModal(false);
  };

  const handleOpenPayModal = (debtId: string, remaining: number) => {
    sound.playTap();
    setActiveDebtIdToPay(debtId);
    setPayAmount(remaining);
    setPayNote('');
    setShowPayModal(true);
  };

  const handleSubmitPay = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeDebtIdToPay || payAmount <= 0) return;
    payDebt(activeDebtIdToPay, payAmount, payNote.trim() || undefined);
    setPayAmount(0);
    setPayNote('');
    setShowPayModal(false);
    setActiveDebtIdToPay(null);
  };

  const handleSendReminderWA = (cust: Customer) => {
    sound.playTap();
    const store = settings.storeName;
    const text = `Halo *${cust.name}*, ini dari *${store}* 🙏.\n\nMengingatkan catatan bon/hutang warung yang belum selesai sebesar *${formatIDR(cust.totalDebt)}*.\n\nTerima kasih banyak, semoga rezeki lancar dan sehat selalu ya! ✨`;

    let waUrl = `https://api.whatsapp.com/send?text=${encodeURIComponent(text)}`;
    if (cust.phone) {
      let phone = cust.phone.replace(/\D/g, '');
      if (phone.startsWith('0')) phone = '62' + phone.slice(1);
      waUrl = `https://api.whatsapp.com/send?phone=${phone}&text=${encodeURIComponent(text)}`;
    }
    window.open(waUrl, '_blank');
  };

  return (
    <div className="flex flex-col flex-1 h-screen overflow-hidden bg-slate-100 font-sans p-6">
      {/* Top Header & Summary Cards */}
      <div className="bg-white rounded-3xl p-5 shadow-sm border border-slate-200 mb-6 flex flex-col md:flex-row items-center justify-between gap-4 shrink-0">
        <div>
          <h1 className="text-2xl font-black text-slate-800 flex items-center gap-2.5">
            <BookOpen className="w-7 h-7 text-rose-600" />
            <span>Buku Hutang & Kasbon Pelanggan</span>
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Kelola kasbon warga, catat pembayaran cicilan atau lunas, serta kirim pesan pengingat praktis via WhatsApp.
          </p>
        </div>

        <div className="flex items-center gap-3 w-full md:w-auto">
          <button
            onClick={() => {
              sound.playTap();
              setShowDebtSummary(!showDebtSummary);
            }}
            className="px-4 py-3 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-sm rounded-2xl border border-slate-300 transition-colors flex items-center justify-center gap-2"
            title={showDebtSummary ? "Sembunyikan Ringkasan Total Hutang & Pelanggan" : "Tampilkan Ringkasan Total Hutang & Pelanggan"}
          >
            {showDebtSummary ? <EyeOff className="w-4 h-4 text-slate-500" /> : <Eye className="w-4 h-4 text-blue-600" />}
            <span className="hidden sm:inline">{showDebtSummary ? 'Sembunyikan Ringkasan' : 'Tampilkan Ringkasan'}</span>
          </button>

          <button
            onClick={() => {
              sound.playTap();
              setShowAddCustModal(true);
            }}
            className="flex-1 md:flex-none px-4 py-3 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-sm rounded-2xl border border-slate-300 transition-colors flex items-center justify-center gap-2"
          >
            <UserPlus className="w-4 h-4" />
            <span>+ Pelanggan</span>
          </button>

          <button
            disabled={!selectedCustomer}
            onClick={() => {
              sound.playTap();
              setShowAddDebtModal(true);
            }}
            className="flex-1 md:flex-none px-5 py-3 bg-rose-600 hover:bg-rose-700 text-white font-black text-sm rounded-2xl shadow-lg shadow-rose-600/30 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
          >
            <Plus className="w-4 h-4 stroke-[3]" />
            <span>+ Bon Manual</span>
          </button>
        </div>
      </div>

      {/* Summary Row (Collapsible) */}
      {showDebtSummary && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6 shrink-0 transition-all duration-200">
          <div className="bg-rose-600 text-white p-4 rounded-3xl shadow-md flex items-center justify-between">
            <div>
              <div className="text-xs text-rose-200 font-bold uppercase">Total Hutang Aktif</div>
              <div className="text-2xl font-black mt-1">{formatIDR(totalActiveDebt)}</div>
            </div>
            <AlertCircle className="w-10 h-10 text-rose-300 opacity-80" />
          </div>

          <div className="bg-white p-4 rounded-3xl shadow-sm border border-slate-200 flex items-center justify-between">
            <div>
              <div className="text-xs text-slate-400 font-bold uppercase">Pelanggan Berhutang</div>
              <div className="text-2xl font-black text-slate-800 mt-1">{activeDebtorsCount} Orang</div>
            </div>
            <User className="w-10 h-10 text-blue-500 opacity-80" />
          </div>

          <div className="bg-white p-4 rounded-3xl shadow-sm border border-slate-200 flex items-center justify-between">
            <div>
              <div className="text-xs text-slate-400 font-bold uppercase">Total Pelanggan Terdaftar</div>
              <div className="text-2xl font-black text-slate-800 mt-1">{customers.length} Warga</div>
            </div>
            <CheckCircle2 className="w-10 h-10 text-emerald-500 opacity-80" />
          </div>
        </div>
      )}

      {/* Main Content Split: Left (Customer List) & Right (Debt History Detail) */}
      <div className="flex-1 flex gap-6 overflow-hidden">
        {/* Left: Customer List (Width 360px) */}
        <div className="w-80 md:w-96 bg-white rounded-3xl shadow-sm border border-slate-200 flex flex-col h-full overflow-hidden shrink-0">
          <div className="p-4 border-b border-slate-200 bg-slate-50">
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Cari nama pelanggan..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3 py-2 bg-white rounded-xl border border-slate-200 text-xs font-bold text-slate-800 outline-none focus:border-blue-600"
              />
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-3 space-y-2 custom-scrollbar">
            {filteredCustomers.length === 0 ? (
              <div className="text-center py-8 text-xs font-bold text-slate-400">
                Pelanggan tidak ditemukan.
              </div>
            ) : (
              filteredCustomers.map((cust) => {
                const isSelected = selectedCustomer?.id === cust.id;
                const hasDebt = cust.totalDebt > 0;
                return (
                  <button
                    key={cust.id}
                    onClick={() => {
                      sound.playTap();
                      setSelectedCustId(cust.id);
                    }}
                    className={`w-full p-3.5 rounded-2xl text-left transition-all flex items-center justify-between border-2 ${
                      isSelected
                        ? 'bg-blue-50 border-blue-600 shadow-sm'
                        : 'bg-white border-slate-100 hover:border-slate-300'
                    }`}
                  >
                    <div>
                      <div className="font-extrabold text-sm text-slate-800">{cust.name}</div>
                      <div className="text-[11px] text-slate-400 mt-0.5 flex items-center gap-1">
                        {cust.phone && (
                          <span className="flex items-center gap-0.5"><Phone className="w-3 h-3" /> {cust.phone}</span>
                        )}
                      </div>
                    </div>

                    <div className="text-right shrink-0">
                      <div className={`text-xs font-black ${hasDebt ? 'text-rose-600' : 'text-emerald-600'}`}>
                        {hasDebt ? formatIDR(cust.totalDebt) : 'Lunas'}
                      </div>
                      <span className="text-[10px] font-bold text-slate-400">
                        {hasDebt ? 'Belum Bayar' : 'Bersih'}
                      </span>
                    </div>
                  </button>
                );
              })
            )}
          </div>
        </div>

        {/* Right: Customer Detail & Debt Records */}
        <div className="flex-1 bg-white rounded-3xl shadow-sm border border-slate-200 flex flex-col h-full overflow-hidden">
          {selectedCustomer ? (
            <>
              {/* Customer Detail Header */}
              <div className="p-5 border-b border-slate-200 bg-gradient-to-r from-slate-800 to-slate-900 text-white flex items-center justify-between shrink-0">
                <div>
                  <h2 className="text-xl font-black flex items-center gap-2">
                    <User className="w-6 h-6 text-blue-400" />
                    <span>{selectedCustomer.name}</span>
                  </h2>
                  <div className="flex items-center gap-4 mt-1 text-xs text-slate-300">
                    {selectedCustomer.phone && (
                      <span className="flex items-center gap-1"><Phone className="w-3.5 h-3.5 text-blue-400" /> {selectedCustomer.phone}</span>
                    )}
                    {selectedCustomer.address && (
                      <span className="flex items-center gap-1"><MapPin className="w-3.5 h-3.5 text-rose-400" /> {selectedCustomer.address}</span>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="text-right bg-slate-800/80 p-2.5 rounded-2xl border border-slate-700">
                    <div className="text-[10px] text-slate-400 uppercase font-bold">Total Hutang</div>
                    <div className={`text-xl font-black ${selectedCustomer.totalDebt > 0 ? 'text-rose-400' : 'text-emerald-400'}`}>
                      {formatIDR(selectedCustomer.totalDebt)}
                    </div>
                  </div>

                  {selectedCustomer.totalDebt > 0 && (
                    <button
                      onClick={() => handleSendReminderWA(selectedCustomer)}
                      className="px-4 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs rounded-2xl shadow-lg transition-all flex items-center gap-2"
                    >
                      <Share2 className="w-4 h-4" />
                      <span>Ingatkan WA</span>
                    </button>
                  )}
                </div>
              </div>

              {/* Debt Transactions List */}
              <div className="flex-1 overflow-y-auto p-4 space-y-3 custom-scrollbar bg-slate-50/50">
                <div className="text-xs font-extrabold text-slate-500 uppercase tracking-wider mb-2">
                  Riwayat Bon & Kasbon ({customerDebts.length} catatan)
                </div>

                {customerDebts.length === 0 ? (
                  <div className="text-center py-12 bg-white rounded-2xl border border-slate-200 text-slate-400">
                    <CheckCircle2 className="w-12 h-12 text-emerald-500 mx-auto mb-2 opacity-80" />
                    <p className="font-bold text-slate-700">Tidak ada catatan hutang.</p>
                    <p className="text-xs text-slate-400 mt-0.5">Semua transaksi warga ini sudah lunas atau belum ada bon.</p>
                  </div>
                ) : (
                  customerDebts.map((debt) => {
                    const isLunas = debt.status === 'LUNAS';
                    return (
                      <div
                        key={debt.id}
                        className={`bg-white p-4 rounded-2xl border transition-all flex flex-col md:flex-row items-start md:items-center justify-between gap-3 shadow-sm ${
                          isLunas ? 'border-slate-200 opacity-70 bg-slate-50' : 'border-rose-200 bg-rose-50/20'
                        }`}
                      >
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <span className={`text-[10px] font-extrabold px-2 py-0.5 rounded ${
                              isLunas ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
                            }`}>
                              {isLunas ? 'LUNAS' : 'BELUM LUNAS'}
                            </span>
                            <span className="text-xs font-bold text-slate-500">{formatDateID(debt.date)}</span>
                            {debt.saleTransactionId !== 'BON-MANUAL' && (
                              <span className="text-[10px] font-mono bg-slate-100 px-1.5 py-0.5 rounded text-slate-500">
                                Nota: {debt.saleTransactionId}
                              </span>
                            )}
                          </div>

                          <h4 className="font-bold text-slate-800 text-sm">{debt.itemsSummary}</h4>
                          {debt.note && <p className="text-xs text-slate-500 italic">Catatan: {debt.note}</p>}
                        </div>

                        <div className="flex items-center gap-4 self-end md:self-center shrink-0">
                          <div className="text-right">
                            <div className="text-[10px] text-slate-400 font-bold">Total Bon</div>
                            <div className="text-sm font-bold text-slate-600">{formatIDR(debt.amount)}</div>
                            {!isLunas && (
                              <div className="text-xs font-black text-rose-600 mt-0.5">
                                Sisa: {formatIDR(debt.remainingAmount)}
                              </div>
                            )}
                          </div>

                          {!isLunas && (
                            <button
                              onClick={() => handleOpenPayModal(debt.id, debt.remainingAmount)}
                              className="px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-black text-xs rounded-xl shadow-md transition-all flex items-center gap-1.5"
                            >
                              <DollarSign className="w-4 h-4" />
                              <span>Bayar / Cicil</span>
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </>
          ) : (
            <div className="h-full flex items-center justify-center text-slate-400 font-bold">
              Pilih pelanggan di samping kiri untuk melihat detail catatan bon.
            </div>
          )}
        </div>
      </div>

      {/* MODAL TAMBAH PELANGGAN BARU */}
      {showAddCustModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-200">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-4">
              <h3 className="font-extrabold text-lg text-slate-800 flex items-center gap-2">
                <UserPlus className="w-5 h-5 text-blue-600" />
                <span>Tambah Warga Pelanggan Baru</span>
              </h3>
              <button onClick={() => setShowAddCustModal(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateCustomer} className="space-y-3">
              <div>
                <label className="text-xs font-bold text-slate-600 mb-1 block">Nama Warga / Panggilan *</label>
                <input
                  type="text"
                  required
                  placeholder="Misal: Bu Ani, Pak Joko RT 3..."
                  value={custName}
                  onChange={(e) => setCustName(e.target.value)}
                  className="w-full p-3 bg-slate-50 rounded-xl border border-slate-300 font-bold text-sm text-slate-800 outline-none focus:bg-white focus:border-blue-600"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-600 mb-1 block">Nomor WhatsApp / HP</label>
                <input
                  type="tel"
                  placeholder="081234567890"
                  value={custPhone}
                  onChange={(e) => setCustPhone(e.target.value)}
                  className="w-full p-3 bg-slate-50 rounded-xl border border-slate-300 font-semibold text-sm text-slate-800 outline-none focus:bg-white focus:border-blue-600"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-600 mb-1 block">Alamat / Ciri Rumah</label>
                <input
                  type="text"
                  placeholder="Misal: Rumah cat hijau samping musala"
                  value={custAddr}
                  onChange={(e) => setCustAddr(e.target.value)}
                  className="w-full p-3 bg-slate-50 rounded-xl border border-slate-300 font-semibold text-sm text-slate-800 outline-none focus:bg-white focus:border-blue-600"
                />
              </div>

              <div className="pt-3 flex gap-2">
                <button
                  type="button"
                  onClick={() => setShowAddCustModal(false)}
                  className="flex-1 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-sm rounded-xl transition-colors"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="flex-1 py-3 bg-blue-600 hover:bg-blue-700 text-white font-black text-sm rounded-xl shadow-md transition-colors"
                >
                  Simpan Pelanggan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL CATAT BON MANUAL */}
      {showAddDebtModal && selectedCustomer && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-200">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-4">
              <h3 className="font-extrabold text-lg text-slate-800 flex items-center gap-2">
                <Plus className="w-5 h-5 text-rose-600 stroke-[3]" />
                <span>Catat Bon Manual untuk {selectedCustomer.name}</span>
              </h3>
              <button onClick={() => setShowAddDebtModal(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateManualDebt} className="space-y-3">
              <div>
                <label className="text-xs font-extrabold text-rose-900 mb-1 block">Nominal Bon / Hutang *</label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 font-extrabold text-rose-400 text-sm">Rp</span>
                  <input
                    type="number"
                    required
                    min={500}
                    value={manualAmount || ''}
                    onChange={(e) => setManualAmount(Number(e.target.value))}
                    className="w-full pl-9 pr-3 py-3 bg-rose-50 rounded-xl border border-rose-300 font-black text-lg text-rose-900 outline-none focus:ring-2 focus:ring-rose-500"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-600 mb-1 block">Rincian Barang / Keperluan *</label>
                <input
                  type="text"
                  required
                  placeholder="Misal: Pinjam uang cash / bon beras & gula..."
                  value={manualItems}
                  onChange={(e) => setManualItems(e.target.value)}
                  className="w-full p-3 bg-slate-50 rounded-xl border border-slate-300 font-bold text-sm text-slate-800 outline-none focus:bg-white focus:border-blue-600"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-600 mb-1 block">Catatan Tambahan</label>
                <input
                  type="text"
                  placeholder="Misal: Janji bayar sabtu sore..."
                  value={manualNote}
                  onChange={(e) => setManualNote(e.target.value)}
                  className="w-full p-3 bg-slate-50 rounded-xl border border-slate-300 text-xs text-slate-700 outline-none focus:bg-white focus:border-blue-600"
                />
              </div>

              <div className="pt-3 flex gap-2">
                <button
                  type="button"
                  onClick={() => setShowAddDebtModal(false)}
                  className="flex-1 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-sm rounded-xl transition-colors"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="flex-1 py-3 bg-rose-600 hover:bg-rose-700 text-white font-black text-sm rounded-xl shadow-md transition-colors"
                >
                  Simpan Bon
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL BAYAR / CICIL HUTANG */}
      {showPayModal && activeDebtIdToPay && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-200">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-4">
              <h3 className="font-extrabold text-lg text-slate-800 flex items-center gap-2">
                <DollarSign className="w-6 h-6 text-emerald-600" />
                <span>Bayar / Cicil Hutang</span>
              </h3>
              <button onClick={() => setShowPayModal(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmitPay} className="space-y-3">
              <div>
                <label className="text-xs font-extrabold text-emerald-900 mb-1 block">Nominal yang Dibayar *</label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 font-extrabold text-emerald-500 text-sm">Rp</span>
                  <input
                    type="number"
                    required
                    min={500}
                    max={payAmount * 2} // allow overpay if needed or exact
                    value={payAmount || ''}
                    onChange={(e) => setPayAmount(Number(e.target.value))}
                    className="w-full pl-9 pr-3 py-3 bg-emerald-50 rounded-xl border border-emerald-300 font-black text-lg text-emerald-900 outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-600 mb-1 block">Catatan Pembayaran (Opsional)</label>
                <input
                  type="text"
                  placeholder="Misal: Bayar lunas pakai cash / cicil separuh dulu..."
                  value={payNote}
                  onChange={(e) => setPayNote(e.target.value)}
                  className="w-full p-3 bg-slate-50 rounded-xl border border-slate-300 text-xs text-slate-700 outline-none focus:bg-white focus:border-blue-600"
                />
              </div>

              <div className="pt-3 flex gap-2">
                <button
                  type="button"
                  onClick={() => setShowPayModal(false)}
                  className="flex-1 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-sm rounded-xl transition-colors"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="flex-1 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-black text-sm rounded-xl shadow-md transition-colors"
                >
                  Konfirmasi Bayar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
