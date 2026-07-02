'use client';

import React, { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { 
  Users, ShoppingBag, DollarSign, AlertTriangle, 
  TrendingUp, ArrowRight, ShieldCheck, UserMinus 
} from 'lucide-react';

export default function DashboardView() {
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalProducts: 0,
    totalRevenue: 0,
    activeReports: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    setLoading(true);
    try {
      const [
        { count: userCount },
        { count: prodCount },
        { data: orders },
        { count: reportCount }
      ] = await Promise.all([
        supabase.from('profiles').select('*', { count: 'exact', head: true }),
        supabase.from('products').select('*', { count: 'exact', head: true }),
        supabase.from('orders').select('total').eq('status', 'completed'),
        supabase.from('reports').select('*', { count: 'exact', head: true }),
      ]);

      const revenue = orders ? orders.reduce((sum, order) => sum + (order.total || 0), 0) : 0;

      setStats({
        totalUsers: userCount || 0,
        totalProducts: prodCount || 0,
        totalRevenue: revenue,
        activeReports: reportCount || 0,
      });
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const statItems = [
    { label: 'Total Pengguna', value: stats.totalUsers, icon: Users, color: 'from-blue-500 to-indigo-600', shadow: 'shadow-blue-500/20' },
    { label: 'Total Produk', value: stats.totalProducts, icon: ShoppingBag, color: 'from-emerald-500 to-teal-600', shadow: 'shadow-emerald-500/20' },
    { label: 'Total Transaksi', value: stats.totalRevenue.toLocaleString('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }), icon: DollarSign, color: 'from-violet-500 to-purple-600', shadow: 'shadow-violet-500/20' },
    { label: 'Laporan Masuk', value: stats.activeReports, icon: AlertTriangle, color: 'from-rose-500 to-orange-600', shadow: 'shadow-rose-500/20' },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-violet-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h2 className="text-3xl font-extrabold tracking-tight text-slate-900">Dashboard Utama</h2>
        <p className="text-slate-500 mt-1">Overview metrik operasional marketplace PreLove hari ini.</p>
      </div>

      {/* Grid Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statItems.map((item, idx) => {
          const Icon = item.icon;
          return (
            <div 
              key={idx} 
              className={`bg-white rounded-2xl p-6 shadow-sm border border-slate-100 flex items-center justify-between hover:shadow-md transition-shadow`}
            >
              <div className="space-y-2">
                <span className="text-sm font-semibold text-slate-400">{item.label}</span>
                <h3 className="text-2xl font-extrabold text-slate-900">{item.value}</h3>
              </div>
              <div className={`p-4 rounded-xl bg-gradient-to-br ${item.color} text-white shadow-lg ${item.shadow}`}>
                <Icon className="w-6 h-6" />
              </div>
            </div>
          );
        })}
      </div>

      {/* Admin Quick Rules Info */}
      <div className="bg-gradient-to-r from-slate-900 to-slate-800 rounded-3xl p-8 text-white relative overflow-hidden shadow-xl">
        <div className="relative z-10 space-y-4 max-w-2xl">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-violet-500/20 text-violet-300 border border-violet-500/30 text-xs font-bold uppercase tracking-wider">
            🛡️ Kebijakan Keamanan Admin
          </div>
          <h3 className="text-2xl font-bold">Panduan Moderasi Produk & User</h3>
          <p className="text-slate-300 text-sm leading-relaxed">
            Sebagai Administrator PreLove, pastikan untuk selalu memeriksa laporan yang masuk secara berkala. Tindakan pemblokiran user atau penghapusan barang bekas ilegal wajib mengikuti kode etik perlindungan privasi pengguna dan aturan jual beli platform.
          </p>
        </div>
        <div className="absolute right-0 bottom-0 top-0 w-1/3 opacity-10 bg-[radial-gradient(circle_at_bottom_right,var(--tw-gradient-stops))] from-violet-400 to-transparent pointer-events-none" />
      </div>
    </div>
  );
}
