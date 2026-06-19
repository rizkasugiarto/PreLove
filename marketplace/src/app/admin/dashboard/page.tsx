'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/lib/supabase';
import { formatPrice } from '@/lib/utils';
import { Users, Store, Package, AlertTriangle, ShieldCheck, Activity } from 'lucide-react';

export default function AdminDashboardPage() {
  const { user, profile, loading } = useAuth();
  const router = useRouter();
  
  const [stats, setStats] = useState({
    users: 0,
    stores: 0,
    products: 0,
    revenue: 0,
  });
  const [reports, setReports] = useState<any[]>([]);
  const [fetching, setFetching] = useState(true);

  useEffect(() => {
    if (!loading && (!user || profile?.role !== 'admin')) {
      router.push('/');
    }
  }, [user, loading, profile]);

  useEffect(() => {
    if (profile?.role === 'admin') {
      fetchDashboardData();
    }
  }, [profile]);

  const fetchDashboardData = async () => {
    // Parallel fetch for stats
    const [usersRes, storesRes, productsRes, ordersRes, reportsRes] = await Promise.all([
      supabase.from('profiles').select('id', { count: 'exact', head: true }),
      supabase.from('stores').select('id', { count: 'exact', head: true }),
      supabase.from('products').select('id', { count: 'exact', head: true }),
      supabase.from('orders').select('total').eq('status', 'completed'),
      supabase.from('reports').select('*, reporter:profiles!reporter_id(username)').order('created_at', { ascending: false }).limit(10)
    ]);

    const totalRevenue = ordersRes.data?.reduce((sum, order) => sum + Number(order.total), 0) || 0;

    setStats({
      users: usersRes.count || 0,
      stores: storesRes.count || 0,
      products: productsRes.count || 0,
      revenue: totalRevenue,
    });
    setReports(reportsRes.data ?? []);
    setFetching(false);
  };

  const resolveReport = async (id: string) => {
    await supabase.from('reports').update({ status: 'resolved' }).eq('id', id);
    setReports(prev => prev.map(r => r.id === id ? { ...r, status: 'resolved' } : r));
  };

  if (loading || fetching) return (
    <div className="min-h-screen flex items-center justify-center" style={{ background: 'var(--bg)' }}>
      <div className="w-12 h-12 rounded-full border-4 border-violet-200 border-t-violet-600 animate-spin" />
    </div>
  );

  return (
    <div className="min-h-screen" style={{ background: 'var(--bg)' }}>
      <div className="page-container py-8">
        
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="section-title flex items-center gap-2">
              <ShieldCheck className="w-6 h-6 text-violet-600" /> Admin Dashboard
            </h1>
            <p className="text-sm mt-1" style={{ color: 'var(--text-muted)' }}>
              Overview sistem PreLove Marketplace
            </p>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="stat-card">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 bg-blue-50 text-blue-600 rounded-lg"><Users className="w-5 h-5" /></div>
              <p className="stat-label">Total Pengguna</p>
            </div>
            <p className="stat-number">{stats.users}</p>
          </div>
          <div className="stat-card">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 bg-emerald-50 text-emerald-600 rounded-lg"><Store className="w-5 h-5" /></div>
              <p className="stat-label">Total Toko</p>
            </div>
            <p className="stat-number">{stats.stores}</p>
          </div>
          <div className="stat-card">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 bg-violet-50 text-violet-600 rounded-lg"><Package className="w-5 h-5" /></div>
              <p className="stat-label">Total Produk</p>
            </div>
            <p className="stat-number">{stats.products}</p>
          </div>
          <div className="stat-card">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 bg-amber-50 text-amber-600 rounded-lg"><Activity className="w-5 h-5" /></div>
              <p className="stat-label">Estimasi Transaksi</p>
            </div>
            <p className="stat-number text-xl">{formatPrice(stats.revenue)}</p>
          </div>
        </div>

        {/* Recent Reports */}
        <div className="card p-6">
          <h3 className="font-bold text-lg mb-6 flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-amber-500" /> Laporan Terbaru
          </h3>
          
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm whitespace-nowrap">
              <thead className="bg-gray-50 border-b border-gray-100">
                <tr>
                  <th className="px-4 py-3 font-bold text-gray-600">Pelapor</th>
                  <th className="px-4 py-3 font-bold text-gray-600">Target</th>
                  <th className="px-4 py-3 font-bold text-gray-600">Alasan</th>
                  <th className="px-4 py-3 font-bold text-gray-600">Status</th>
                  <th className="px-4 py-3 font-bold text-gray-600 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {reports.length === 0 ? (
                  <tr><td colSpan={5} className="px-4 py-8 text-center text-gray-500">Tidak ada laporan.</td></tr>
                ) : (
                  reports.map(report => (
                    <tr key={report.id} className="hover:bg-gray-50/50 transition-colors">
                      <td className="px-4 py-3 font-medium">@{report.reporter?.username}</td>
                      <td className="px-4 py-3">
                        <span className="badge badge-info uppercase text-[10px]">{report.target_type}</span>
                        <span className="text-xs text-gray-500 ml-2 truncate max-w-[150px] inline-block align-bottom">{report.target_id}</span>
                      </td>
                      <td className="px-4 py-3 max-w-[200px] truncate">{report.reason}</td>
                      <td className="px-4 py-3">
                        <span className={`badge ${report.status === 'resolved' ? 'badge-success' : 'badge-warning'}`}>
                          {report.status}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right">
                        {report.status !== 'resolved' && (
                          <button onClick={() => resolveReport(report.id)} className="text-xs font-bold text-violet-600 hover:text-violet-800">
                            Resolve
                          </button>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

      </div>
    </div>
  );
}
