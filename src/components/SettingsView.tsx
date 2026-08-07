import React, { useState } from 'react';
import { useStore } from '../context/StoreContext';
import { sound } from '../utils/sound';
import {
  Settings,
  Store,
  User,
  Phone,
  MapPin,
  Volume2,
  VolumeX,
  Download,
  Upload,
  RefreshCw,
  CheckCircle2,
  AlertTriangle,
  FileText,
  Save
} from 'lucide-react';

export const SettingsView: React.FC = () => {
  const { settings, updateSettings, exportDataJSON, importDataJSON, resetDemoData, resetAllData } = useStore();

  // Local Form State
  const [storeName, setStoreName] = useState(settings.storeName);
  const [tagline, setTagline] = useState(settings.tagline);
  const [ownerName, setOwnerName] = useState(settings.ownerName);
  const [address, setAddress] = useState(settings.address);
  const [phone, setPhone] = useState(settings.phone);
  const [footerMessage, setFooterMessage] = useState(settings.footerMessage);
  const [enableSound, setEnableSound] = useState(settings.enableSound);

  // Backup/Restore State
  const [importText, setImportText] = useState('');
  const [statusMsg, setStatusMsg] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  // Custom Modal States for Reset
  const [showResetDemoModal, setShowResetDemoModal] = useState<boolean>(false);
  const [showResetAllModal, setShowResetAllModal] = useState<boolean>(false);

  const handleSaveSettings = (e: React.FormEvent) => {
    e.preventDefault();
    updateSettings({
      ...settings,
      storeName: storeName.trim(),
      tagline: tagline.trim(),
      ownerName: ownerName.trim(),
      address: address.trim(),
      phone: phone.trim(),
      footerMessage: footerMessage.trim(),
      enableSound
    });
    sound.playSuccess();
    setStatusMsg({ text: 'Pengaturan toko berhasil disimpan!', type: 'success' });
    setTimeout(() => setStatusMsg(null), 4000);
  };

  const handleExport = () => {
    sound.playTap();
    const jsonStr = exportDataJSON();
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    const date = new Date().toISOString().split('T')[0];
    link.download = `backup_warung_mama_${date}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    setStatusMsg({ text: 'File backup berhasil diunduh ke perangkat tablet!', type: 'success' });
    setTimeout(() => setStatusMsg(null), 4000);
  };

  const handleImport = () => {
    if (!importText.trim()) return;
    const success = importDataJSON(importText.trim());
    if (success) {
      setImportText('');
      setStatusMsg({ text: 'Data warung berhasil dipulihkan dari backup!', type: 'success' });
    } else {
      sound.playWarning();
      setStatusMsg({ text: 'Format JSON backup tidak valid atau rusak.', type: 'error' });
    }
    setTimeout(() => setStatusMsg(null), 4000);
  };

  const confirmResetDemo = () => {
    resetDemoData();
    setShowResetDemoModal(false);
    setStatusMsg({ text: 'Data berhasil dikembalikan ke Data Contoh awal!', type: 'success' });
    setTimeout(() => setStatusMsg(null), 4000);
  };

  const confirmResetAll = () => {
    resetAllData();
    setShowResetAllModal(false);
    setStatusMsg({ text: 'Seluruh data warung berhasil dikosongkan (Bersih 0).', type: 'success' });
    setTimeout(() => setStatusMsg(null), 4000);
  };

  return (
    <div className="flex flex-col flex-1 h-screen overflow-hidden bg-slate-100 font-sans p-6">
      {/* Top Header */}
      <div className="bg-white rounded-3xl p-5 shadow-sm border border-slate-200 mb-6 flex items-center justify-between shrink-0">
        <div>
          <h1 className="text-2xl font-black text-slate-800 flex items-center gap-2.5">
            <Settings className="w-7 h-7 text-blue-600" />
            <span>Pengaturan Toko & Backup Data</span>
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Sesuaikan identitas toko, nomor WhatsApp kasir, suara sentuhan, serta cadangkan data warung secara berkala.
          </p>
        </div>

        {statusMsg && (
          <div className={`px-4 py-3 rounded-2xl text-xs font-black flex items-center gap-2 shadow-sm ${
            statusMsg.type === 'success' ? 'bg-emerald-100 text-emerald-800 border border-emerald-300' : 'bg-rose-100 text-rose-800 border border-rose-300'
          }`}>
            {statusMsg.type === 'success' ? <CheckCircle2 className="w-4 h-4" /> : <AlertTriangle className="w-4 h-4" />}
            <span>{statusMsg.text}</span>
          </div>
        )}
      </div>

      <div className="flex-1 overflow-y-auto space-y-6 custom-scrollbar pb-12">
        {/* Identitas Toko & Suara */}
        <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-200">
          <h2 className="text-lg font-extrabold text-slate-800 flex items-center gap-2 mb-4">
            <Store className="w-5 h-5 text-blue-600" />
            <span>Informasi Warung / Toko Harian</span>
          </h2>

          <form onSubmit={handleSaveSettings} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-bold text-slate-600 mb-1 block">Nama Toko *</label>
                <input
                  type="text"
                  required
                  value={storeName}
                  onChange={(e) => setStoreName(e.target.value)}
                  className="w-full p-3 bg-slate-50 rounded-xl border border-slate-300 font-black text-sm text-slate-800 outline-none focus:bg-white focus:border-blue-600"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-600 mb-1 block">Nama Kasir / Pemilik Warung *</label>
                <input
                  type="text"
                  required
                  value={ownerName}
                  onChange={(e) => setOwnerName(e.target.value)}
                  className="w-full p-3 bg-slate-50 rounded-xl border border-slate-300 font-extrabold text-sm text-slate-800 outline-none focus:bg-white focus:border-blue-600"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-bold text-slate-600 mb-1 block">Alamat Toko</label>
                <input
                  type="text"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  className="w-full p-3 bg-slate-50 rounded-xl border border-slate-300 font-semibold text-sm text-slate-800 outline-none focus:bg-white focus:border-blue-600"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-600 mb-1 block">Nomor HP / WhatsApp Toko</label>
                <input
                  type="text"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full p-3 bg-slate-50 rounded-xl border border-slate-300 font-semibold text-sm text-slate-800 outline-none focus:bg-white focus:border-blue-600"
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-bold text-slate-600 mb-1 block">Pesan Penutup di Struk / Nota WA</label>
              <input
                type="text"
                value={footerMessage}
                onChange={(e) => setFooterMessage(e.target.value)}
                className="w-full p-3 bg-slate-50 rounded-xl border border-slate-300 text-xs font-bold text-slate-700 outline-none focus:bg-white focus:border-blue-600"
              />
            </div>

            <div className="flex items-center justify-between pt-2 border-t border-slate-100">
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={enableSound}
                  onChange={(e) => setEnableSound(e.target.checked)}
                  className="w-5 h-5 text-blue-600 rounded"
                />
                <div>
                  <div className="font-extrabold text-sm text-slate-800 flex items-center gap-1.5">
                    {enableSound ? <Volume2 className="w-4 h-4 text-blue-600" /> : <VolumeX className="w-4 h-4 text-slate-400" />}
                    <span>Aktifkan Suara Efek Sentuhan & Kasir</span>
                  </div>
                  <div className="text-xs text-slate-400">Suara bunyi saat menyentuh tombol di tablet Xiaomi Pad SE</div>
                </div>
              </label>

              <button
                type="submit"
                className="px-8 py-3.5 bg-blue-600 hover:bg-blue-700 text-white font-black text-base rounded-2xl shadow-lg shadow-blue-600/30 transition-all flex items-center gap-2"
              >
                <Save className="w-5 h-5" />
                <span>Simpan Pengaturan</span>
              </button>
            </div>
          </form>
        </div>

        {/* Backup & Restore Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Backup Box */}
          <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-200 flex flex-col justify-between">
            <div>
              <h3 className="text-base font-extrabold text-slate-800 flex items-center gap-2">
                <Download className="w-5 h-5 text-emerald-600" />
                <span>Backup Data (Export JSON)</span>
              </h3>
              <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                Unduh salinan seluruh data barang, harga, catatan kasbon, dan riwayat penjualan ke dalam satu file. Simpan file ini untuk keamanan data.
              </p>
            </div>

            <button
              onClick={handleExport}
              className="mt-6 w-full py-3.5 bg-emerald-600 hover:bg-emerald-700 text-white font-black text-sm rounded-2xl shadow-lg shadow-emerald-600/20 transition-all flex items-center justify-center gap-2"
            >
              <Download className="w-5 h-5" />
              <span>Unduh File Backup Warung</span>
            </button>
          </div>

          {/* Restore Box */}
          <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-200 flex flex-col justify-between">
            <div>
              <h3 className="text-base font-extrabold text-slate-800 flex items-center gap-2">
                <Upload className="w-5 h-5 text-blue-600" />
                <span>Pemulihan Data (Restore JSON)</span>
              </h3>
              <p className="text-xs text-slate-500 mt-1">
                Tempel (paste) isi teks dari file backup JSON yang pernah disimpan sebelumnya di bawah ini:
              </p>
              <textarea
                rows={3}
                placeholder="Tempel teks kode JSON backup di sini..."
                value={importText}
                onChange={(e) => setImportText(e.target.value)}
                className="mt-2 w-full p-3 bg-slate-50 rounded-xl border border-slate-300 font-mono text-xs text-slate-700 outline-none focus:bg-white focus:border-blue-600"
              />
            </div>

            <button
              disabled={!importText.trim()}
              onClick={handleImport}
              className={`mt-4 w-full py-3 rounded-2xl font-black text-sm transition-all flex items-center justify-center gap-2 ${
                !importText.trim()
                  ? 'bg-slate-200 text-slate-400 cursor-not-allowed'
                  : 'bg-blue-600 hover:bg-blue-700 text-white shadow-md'
              }`}
            >
              <Upload className="w-4 h-4" />
              <span>Pulihkan Data Sekarang</span>
            </button>
          </div>
        </div>

        {/* Reset Demo Data Box */}
        <div className="bg-amber-50 p-6 rounded-3xl border border-amber-200 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-amber-500 text-white rounded-2xl flex items-center justify-center shrink-0 shadow-md">
              <RefreshCw className="w-6 h-6" />
            </div>
            <div>
              <h4 className="font-black text-sm text-amber-950">Reset ke Data Contoh Warung Harian</h4>
              <p className="text-xs text-amber-800 mt-0.5 max-w-xl">
                Gunakan tombol ini jika ingin mengembalikan semua data ke kondisi awal saat aplikasi pertama dibuka (lengkap dengan 26 jenis barang sembako, jajanan, rokok, dan catatan hutang tetangga).
              </p>
            </div>
          </div>

          <button
            onClick={() => {
              sound.playTap();
              setShowResetDemoModal(true);
            }}
            className="px-6 py-3 bg-amber-600 hover:bg-amber-700 text-white font-black text-sm rounded-2xl shadow-md transition-all shrink-0 whitespace-nowrap"
          >
            Reset ke Data Contoh
          </button>
        </div>

        {/* Danger Zone: Clear All Data (Reset Kosong 0) */}
        <div className="bg-rose-50 p-6 rounded-3xl border border-rose-200 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-rose-600 text-white rounded-2xl flex items-center justify-center shrink-0 shadow-md">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <div>
              <h4 className="font-black text-sm text-rose-950">Kosongkan / Hapus Seluruh Data Toko (Bersih 0)</h4>
              <p className="text-xs text-rose-800 mt-0.5 max-w-xl">
                Tindakan ini akan menghapus total seluruh data barang, stok, hutang, dan riwayat penjualan hingga bersih dari nol (0) untuk memulai usaha warung baru.
              </p>
            </div>
          </div>

          <button
            onClick={() => {
              sound.playWarning();
              setShowResetAllModal(true);
            }}
            className="px-6 py-3 bg-rose-600 hover:bg-rose-700 text-white font-black text-sm rounded-2xl shadow-md transition-all shrink-0 whitespace-nowrap flex items-center gap-2 active:scale-95"
          >
            <AlertTriangle className="w-4 h-4" />
            <span>🔥 Hapus Semua Data (Kosongkan)</span>
          </button>
        </div>
      </div>

      {/* Modal Konfirmasi Reset Demo Data */}
      {showResetDemoModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl p-6 max-w-md w-full shadow-2xl border border-slate-200 animate-scale-up">
            <div className="flex items-center gap-3 text-amber-600 mb-3">
              <div className="w-10 h-10 bg-amber-100 rounded-2xl flex items-center justify-center font-black">
                <RefreshCw className="w-5 h-5" />
              </div>
              <h3 className="font-extrabold text-lg text-slate-800">Kembalikan ke Data Contoh?</h3>
            </div>
            <p className="text-sm text-slate-600 mb-6 leading-relaxed">
              Apakah Anda yakin ingin mengembalikan seluruh produk, stok, dan hutang ke data contoh awal warung harian?
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowResetDemoModal(false)}
                className="flex-1 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-sm rounded-2xl transition-all"
              >
                Batal
              </button>
              <button
                onClick={confirmResetDemo}
                className="flex-1 py-3 bg-amber-600 hover:bg-amber-700 text-white font-black text-sm rounded-2xl shadow-md transition-all"
              >
                Ya, Reset Contoh
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Konfirmasi Reset ALL (Hapus Bersih 0) */}
      {showResetAllModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl p-6 max-w-md w-full shadow-2xl border border-rose-200 animate-scale-up">
            <div className="flex items-center gap-3 text-rose-600 mb-3">
              <div className="w-12 h-12 bg-rose-100 rounded-2xl flex items-center justify-center font-black">
                <AlertTriangle className="w-6 h-6 text-rose-600" />
              </div>
              <div>
                <h3 className="font-extrabold text-lg text-rose-950">KOSONGKAN SEMUA DATA?</h3>
                <span className="text-xs text-rose-600 font-bold">Hapus Total dari 0 (Bersih)</span>
              </div>
            </div>
            <p className="text-sm text-slate-700 mb-6 leading-relaxed">
              Apakah Anda benar-benar yakin ingin menghapus <strong className="text-rose-600">SELURUH</strong> data barang, stok, riwayat hutang, dan penjualan?
              <br /><br />
              <span className="text-xs text-slate-500 font-medium">⚠️ Tindakan ini tidak dapat dibatalkan. Disarankan melakukan backup terlebih dahulu.</span>
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowResetAllModal(false)}
                className="flex-1 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-sm rounded-2xl transition-all"
              >
                Batal
              </button>
              <button
                onClick={confirmResetAll}
                className="flex-1 py-3 bg-rose-600 hover:bg-rose-700 text-white font-black text-sm rounded-2xl shadow-lg shadow-rose-600/30 transition-all flex items-center justify-center gap-1.5"
              >
                <AlertTriangle className="w-4 h-4" />
                <span>Ya, Hapus Semua</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
