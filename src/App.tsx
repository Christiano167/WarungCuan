import React, { useState } from 'react';
import { StoreProvider, useStore } from './context/StoreContext';
import { Sidebar } from './components/Sidebar';
import { POSView } from './components/POSView';
import { StockCatalog } from './components/StockCatalog';
import { StockIncomingView } from './components/StockIncomingView';
import { StockReturnView } from './components/StockReturnView';
import { DebtView } from './components/DebtView';
import { ReportView } from './components/ReportView';
import { SettingsView } from './components/SettingsView';
import {
  ShoppingCart,
  Package,
  Truck,
  RotateCcw,
  BookOpen,
  TrendingUp,
  Settings,
  Menu,
  X,
  Store
} from 'lucide-react';

const MainContent: React.FC = () => {
  const { activeTab, setActiveTab, settings } = useStore();
  const [mobileMenuOpen, setMobileMenuOpen] = useState<boolean>(false);

  const renderView = () => {
    switch (activeTab) {
      case 'pos':
        return <POSView />;
      case 'products':
        return <StockCatalog />;
      case 'incoming':
        return <StockIncomingView />;
      case 'returns':
        return <StockReturnView />;
      case 'debts':
        return <DebtView />;
      case 'reports':
        return <ReportView />;
      case 'settings':
        return <SettingsView />;
      default:
        return <POSView />;
    }
  };

  const navItems = [
    { id: 'pos', label: 'Kasir', icon: <ShoppingCart className="w-5 h-5" /> },
    { id: 'products', label: 'Stok & Harga', icon: <Package className="w-5 h-5" /> },
    { id: 'incoming', label: 'Stok Masuk', icon: <Truck className="w-5 h-5" /> },
    { id: 'returns', label: 'Retur', icon: <RotateCcw className="w-5 h-5" /> },
    { id: 'debts', label: 'Hutang', icon: <BookOpen className="w-5 h-5" /> },
    { id: 'reports', label: 'Laporan', icon: <TrendingUp className="w-5 h-5" /> },
    { id: 'settings', label: 'Pengaturan', icon: <Settings className="w-5 h-5" /> },
  ];

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-slate-100 select-none">
      {/* Desktop / Tablet Landscape Sidebar (hidden on very small screens, visible on md/lg and up) */}
      <div className="hidden md:flex h-full shrink-0">
        <Sidebar />
      </div>

      {/* Mobile / Small Screen Topbar (when tablet is held portrait or narrow window) */}
      <div className="flex flex-col flex-1 h-full overflow-hidden">
        <div className="md:hidden bg-blue-900 text-white p-3 flex items-center justify-between shadow-md shrink-0 z-30">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center font-bold">
              <Store className="w-5 h-5" />
            </div>
            <span className="font-extrabold text-sm truncate">{settings.storeName}</span>
          </div>
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 bg-blue-800 rounded-xl text-blue-200"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {/* Mobile Slide-out Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden fixed inset-0 bg-slate-900/80 z-40 flex">
            <div className="w-72 bg-blue-900 text-white p-4 flex flex-col h-full shadow-2xl">
              <div className="flex justify-between items-center pb-4 border-b border-blue-800 mb-3">
                <span className="font-black text-lg">Menu Warung</span>
                <button onClick={() => setMobileMenuOpen(false)} className="text-blue-300">
                  <X className="w-6 h-6" />
                </button>
              </div>
              <div className="space-y-1.5 flex-1 overflow-y-auto">
                {navItems.map((item) => (
                  <button
                    key={item.id}
                    onClick={() => {
                      setActiveTab(item.id as any);
                      setMobileMenuOpen(false);
                    }}
                    className={`w-full flex items-center gap-3 p-3.5 rounded-2xl font-bold text-sm text-left ${
                      activeTab === item.id ? 'bg-blue-600 text-white' : 'text-blue-200 hover:bg-blue-800'
                    }`}
                  >
                    {item.icon}
                    <span>{item.label}</span>
                  </button>
                ))}
              </div>
            </div>
            <div className="flex-1" onClick={() => setMobileMenuOpen(false)} />
          </div>
        )}

        {/* Active View */}
        <main className="flex-1 overflow-hidden flex flex-col">
          {renderView()}
        </main>
      </div>
    </div>
  );
};

export default function App() {
  return (
    <StoreProvider>
      <MainContent />
    </StoreProvider>
  );
}
