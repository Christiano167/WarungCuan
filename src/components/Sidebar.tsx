import React, { useState, useEffect } from 'react';
import { useStore } from '../context/StoreContext';
import { ActiveTab } from '../types';
import {
  ShoppingCart,
  Package,
  Truck,
  RotateCcw,
  BookOpen,
  TrendingUp,
  Settings,
  Store,
  Clock,
  AlertTriangle,
  Volume2,
  VolumeX
} from 'lucide-react';
import { formatShortNumber } from '../utils/formatters';

export const Sidebar: React.FC = () => {
  const { activeTab, setActiveTab, products, customers, settings, updateSettings } = useStore();
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const dateStr = currentTime.toLocaleDateString('id-ID', {
    weekday: 'long',
    day: 'numeric',
    month: 'short',
    year: 'numeric'
  });

  const timeStr = currentTime.toLocaleTimeString('id-ID', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit'
  });

  // Calculate badges
  const lowStockCount = products.filter(p => p.stock <= p.minStockAlert).length;
  const customersWithDebt = customers.filter(c => c.totalDebt > 0).length;
  const totalDebtValue = customers.reduce((sum, c) => sum + c.totalDebt, 0);

  const navItems: { id: ActiveTab; label: string; icon: React.ReactNode; badge?: string | number; badgeColor?: string }[] = [
    {
      id: 'pos',
      label: 'Kasir Penjualan',
      icon: <ShoppingCart className="w-6 h-6" />,
    },
    {
      id: 'products',
      label: 'Stok & Harga',
      icon: <Package className="w-6 h-6" />,
      badge: lowStockCount > 0 ? `${lowStockCount} Menipis` : undefined,
      badgeColor: 'bg-amber-500 text-white'
    },
    {
      id: 'incoming',
      label: 'Barang Masuk',
      icon: <Truck className="w-6 h-6" />,
    },
    {
      id: 'returns',
      label: 'Retur Barang',
      icon: <RotateCcw className="w-6 h-6" />,
    },
    {
      id: 'debts',
      label: 'Buku Hutang',
      icon: <BookOpen className="w-6 h-6" />,
      badge: customersWithDebt > 0 ? `Rp ${formatShortNumber(totalDebtValue)}` : undefined,
      badgeColor: 'bg-rose-500 text-white'
    },
    {
      id: 'reports',
      label: 'Laporan Laba Rugi',
      icon: <TrendingUp className="w-6 h-6" />,
    },
    {
      id: 'settings',
      label: 'Pengaturan & Backup',
      icon: <Settings className="w-6 h-6" />,
    },
  ];

  const toggleSound = () => {
    updateSettings({ ...settings, enableSound: !settings.enableSound });
  };

  return (
    <aside className="w-72 bg-gradient-to-b from-blue-900 via-blue-800 to-indigo-950 text-white flex flex-col h-screen shadow-2xl shrink-0 select-none border-r border-blue-700/50">
      {/* Header Toko */}
      <div className="p-5 border-b border-blue-700/60 bg-blue-950/40">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-blue-500 flex items-center justify-center shadow-lg shadow-blue-500/30 text-white shrink-0 font-bold text-2xl border-2 border-blue-300">
            <Store className="w-7 h-7" />
          </div>
          <div className="overflow-hidden">
            <h1 className="font-extrabold text-lg text-blue-50 leading-tight truncate">
              {settings.storeName}
            </h1>
            <p className="text-xs text-blue-200 truncate mt-0.5 font-medium">
              Mode Tablet Xiaomi Pad SE
            </p>
          </div>
        </div>

        {/* Live Clock Card */}
        <div className="mt-4 bg-blue-950/60 rounded-xl p-3 border border-blue-700/50 flex items-center justify-between">
          <div>
            <div className="text-xs text-blue-300 font-medium">{dateStr}</div>
            <div className="text-lg font-black text-white tracking-wide mt-0.5 flex items-center gap-1.5 font-mono">
              <Clock className="w-4 h-4 text-blue-400 shrink-0" />
              {timeStr}
            </div>
          </div>
          <button
            onClick={toggleSound}
            title={settings.enableSound ? "Suara Kasir Nyala" : "Suara Kasir Mati"}
            className={`p-2.5 rounded-xl border transition-all ${
              settings.enableSound
                ? 'bg-blue-600 border-blue-400 text-white shadow-md'
                : 'bg-blue-900/80 border-blue-800 text-blue-400 opacity-70'
            }`}
          >
            {settings.enableSound ? <Volume2 className="w-5 h-5" /> : <VolumeX className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Navigation Menu */}
      <div className="flex-1 overflow-y-auto py-4 px-3 space-y-1.5 custom-scrollbar">
        <div className="text-[11px] font-bold uppercase tracking-wider text-blue-300 px-3 mb-2">
          Menu Utama Warung
        </div>

        {navItems.map((item) => {
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`w-full flex items-center justify-between px-4 py-3.5 rounded-2xl transition-all duration-200 group text-left ${
                isActive
                  ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/40 font-bold border border-blue-400/50 scale-[1.02]'
                  : 'text-blue-100 hover:bg-blue-800/60 hover:text-white font-medium border border-transparent'
              }`}
            >
              <div className="flex items-center gap-3.5">
                <div className={`p-2 rounded-xl transition-colors ${
                  isActive ? 'bg-white/20 text-white' : 'bg-blue-900/60 text-blue-300 group-hover:text-white group-hover:bg-blue-700'
                }`}>
                  {item.icon}
                </div>
                <span className="text-base">{item.label}</span>
              </div>
              {item.badge && (
                <span className={`text-xs px-2.5 py-1 rounded-full font-bold shadow-sm ${item.badgeColor}`}>
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}

        {/* Quick Alert Banner if low stocks exist */}
        {lowStockCount > 0 && (
          <div
            onClick={() => setActiveTab('products')}
            className="mt-6 mx-1 p-3.5 rounded-2xl bg-amber-500/20 border border-amber-400/40 text-amber-200 cursor-pointer hover:bg-amber-500/30 transition-all flex items-start gap-3 shadow-sm"
          >
            <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5 animate-pulse" />
            <div>
              <div className="text-xs font-bold text-amber-300">Peringatan Stok Warung!</div>
              <div className="text-xs mt-0.5 text-amber-100/90 leading-relaxed">
                Ada <b>{lowStockCount} produk</b> yang stoknya menipis. Klik untuk cek.
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Footer Mama Info */}
      <div className="p-4 border-t border-blue-800/80 bg-blue-950/80 text-center">
        <div className="text-xs text-blue-300">Pengelola Warung:</div>
        <div className="text-sm font-extrabold text-blue-100 mt-0.5 flex items-center justify-center gap-1.5">
          👩‍🍳 {settings.ownerName}
        </div>
        <div className="text-[10px] text-blue-400 mt-1">
          Aplikasi Siap Offline & Ramah Sentuh
        </div>
      </div>
    </aside>
  );
};
