import React from 'react';
import Link from 'next/link';
import { 
  LayoutDashboard, Users, ShoppingBag, AlertTriangle, 
  LogOut
} from 'lucide-react';

const LogoIcon = () => (
  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
    <div style={{
      width: '42px', height: '42px',
      background: 'linear-gradient(135deg, #D946EF, #A855F7)',
      border: '2.5px solid #111827',
      borderRadius: '50%',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      transform: 'rotate(-8deg)',
      boxShadow: '4px 4px 0 #111827',
      flexShrink: 0,
    }}>
      <ShoppingBag size={20} color="white" strokeWidth={2.5} />
    </div>
    <div>
      <div style={{
        fontWeight: 900, fontSize: '18px', color: 'white',
        letterSpacing: '-0.05em', textTransform: 'uppercase',
        lineHeight: 1,
      }}>
        PRELOVE<span style={{ color: '#D946EF', fontSize: '22px' }}>.</span>
      </div>
      <p style={{ fontSize: '10px', color: 'rgba(255,255,255,0.4)', margin: 0, fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase' }}>Admin</p>
    </div>
  </div>
);

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

export default function Sidebar({ activeTab, setActiveTab }: SidebarProps) {
  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'users', label: 'Kelola User', icon: Users },
    { id: 'products', label: 'Kelola Produk', icon: ShoppingBag },
    { id: 'reports', label: 'Laporan Masuk', icon: AlertTriangle },
  ];

  return (
    <aside className="w-64 bg-slate-900 text-white min-h-screen p-4 flex flex-col justify-between">
      <div>
        <div className="px-2 py-4 mb-6">
          <LogoIcon />
        </div>

        <nav className="space-y-1">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all duration-200 ${
                  isActive 
                    ? 'bg-violet-600 text-white shadow-lg shadow-violet-600/30' 
                    : 'text-slate-400 hover:bg-slate-800 hover:text-white'
                }`}
              >
                <Icon className={`w-5 h-5 ${isActive ? 'text-white' : 'text-slate-400 group-hover:text-white'}`} />
                {item.label}
              </button>
            );
          })}
        </nav>
      </div>

      <div className="pt-4 border-t border-slate-800">
        <button 
          onClick={() => alert('Logout...')}
          className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold text-rose-400 hover:bg-rose-500/10 transition-colors"
        >
          <LogOut className="w-5 h-5" />
          Keluar
        </button>
      </div>
    </aside>
  );
}
