'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/lib/supabase';
import { formatPrice, formatDate, ORDER_STATUS } from '@/lib/utils';
import { Package, Search, ChevronRight, ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import toast from 'react-hot-toast';

export default function SellerOrdersPage() {
  const { user, profile, loading } = useAuth();
  const router = useRouter();
  const [orders, setOrders] = useState<any[]>([]);
  const [fetching, setFetching] = useState(true);
  const [search, setSearch] = useState('');
  const [activeTab, setActiveTab] = useState('all');

  useEffect(() => {
    if (!loading && !user) router.push('/auth/login');
    if (!loading && user && !profile?.store) router.push('/seller/open-store');
  }, [user, loading, profile]);

  useEffect(() => {
    if (profile?.store) fetchOrders();
  }, [profile]);

  const fetchOrders = async () => {
    const { data } = await supabase
      .from('orders')
      .select('*, items:order_items(*, product:products(title, images:product_images(image_url))), buyer:profiles(full_name, phone)')
      .eq('store_id', profile!.store.id)
      .order('created_at', { ascending: false });
    setOrders(data ?? []);
    setFetching(false);
  };

  const updateStatus = async (orderId: string, newStatus: string) => {
    if (!confirm('Ubah status pesanan ini?')) return;
    const { error } = await supabase.from('orders').update({ status: newStatus }).eq('id', orderId);
    if (error) {
      toast.error('Gagal update status');
    } else {
      toast.success('Status berhasil diupdate');
      setOrders(prev => prev.map(o => o.id === orderId ? { ...o, status: newStatus } : o));
    }
  };

  const TABS = [
    { id: 'all', label: 'Semua' },
    { id: 'pending', label: 'Perlu Diproses' },
    { id: 'packed', label: 'Dikemas' },
    { id: 'shipped', label: 'Dikirim' },
    { id: 'completed', label: 'Selesai' },
  ];

  const filtered = orders.filter(o => {
    const matchSearch = o.order_number.toLowerCase().includes(search.toLowerCase()) || 
                        o.buyer?.full_name?.toLowerCase().includes(search.toLowerCase());
    const matchTab = activeTab === 'all' || 
                    (activeTab === 'pending' && ['waiting_payment', 'pending'].includes(o.status)) ||
                    o.status === activeTab;
    return matchSearch && matchTab;
  });

  if (loading || fetching) return (
    <div className="min-h-screen flex items-center justify-center" style={{ background: 'var(--bg)' }}>
      <div className="w-12 h-12 rounded-full border-4 border-violet-200 border-t-violet-600 animate-spin" />
    </div>
  );

  return (
    <div className="min-h-screen" style={{ background: 'var(--bg)' }}>
      <div className="page-container py-8">
        {/* Header */}
        <div className="flex items-center gap-4 mb-6">
           <Link href="/seller/dashboard" className="p-2 rounded-xl hover:bg-white border border-transparent hover:border-gray-200 transition-all">
                <ArrowLeft className="w-5 h-5 text-gray-600" />
            </Link>
          <div>
            <h1 className="section-title flex items-center gap-2">
              <Package className="w-6 h-6 text-violet-600" /> Pesanan Masuk
            </h1>
            <p className="text-sm mt-1" style={{ color: 'var(--text-muted)' }}>
              Kelola pesanan dari pembeli kamu
            </p>
          </div>
        </div>

        {/* Tabs & Search */}
        <div className="card mb-6">
          <div className="flex overflow-x-auto border-b border-gray-100 scrollbar-hide">
            {TABS.map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-6 py-4 text-sm font-bold whitespace-nowrap border-b-2 transition-colors ${
                  activeTab === tab.id
                    ? 'border-violet-600 text-violet-600'
                    : 'border-transparent text-gray-500 hover:text-gray-900 hover:bg-gray-50'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
          <div className="p-4 bg-gray-50/50">
            <div className="relative max-w-md">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Cari no. pesanan atau nama pembeli..."
                className="input-field pl-11 bg-white"
              />
            </div>
          </div>
        </div>

        {/* Order List */}
        {filtered.length === 0 ? (
          <div className="text-center py-20 card">
            <div className="w-20 h-20 rounded-full bg-gray-50 flex items-center justify-center mx-auto mb-4">
              <Package className="w-10 h-10 text-gray-300" />
            </div>
            <h3 className="text-xl font-black mb-2" style={{ color: 'var(--text)' }}>Belum Ada Pesanan</h3>
            <p style={{ color: 'var(--text-muted)' }}>Coba promosikan toko kamu agar lebih laris!</p>
          </div>
        ) : (
          <div className="space-y-4">
            {filtered.map(order => {
              const status = ORDER_STATUS[order.status] || ORDER_STATUS['pending'];
              return (
                <div key={order.id} className="card p-5">
                  {/* Order Header */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4 pb-4 border-b border-gray-100">
                    <div className="flex items-center gap-3">
                      <span className={`badge ${status.color}`}>
                        {status.emoji} {status.label}
                      </span>
                      <span className="text-xs font-bold text-gray-500">{order.order_number}</span>
                      <span className="text-xs text-gray-400">{formatDate(order.created_at)}</span>
                    </div>
                    <div className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                      👤 {order.buyer?.full_name}
                    </div>
                  </div>

                  {/* Order Items */}
                  <div className="space-y-4 mb-4">
                    {order.items?.map((item: any) => {
                      const img = item.product?.images?.[0]?.image_url;
                      return (
                        <div key={item.id} className="flex gap-4">
                          <div className="w-16 h-16 rounded-xl overflow-hidden bg-gray-100 flex-shrink-0">
                            {img ? (
                              <img src={img} alt="" className="w-full h-full object-cover" />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center text-xl">📦</div>
                            )}
                          </div>
                          <div className="flex-1">
                            <h4 className="font-bold text-sm text-gray-900 line-clamp-1">{item.product_snapshot?.title || item.product?.title}</h4>
                            <p className="text-xs text-gray-500 mt-1">{item.quantity} x {formatPrice(item.price)}</p>
                          </div>
                          <div className="text-right flex-shrink-0">
                            <p className="font-bold text-sm text-violet-600">{formatPrice(item.price * item.quantity)}</p>
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {/* Order Footer & Actions */}
                  <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t border-gray-100">
                    <div>
                      <p className="text-xs text-gray-500 mb-1">Total Pendapatan</p>
                      <p className="font-black text-lg text-gray-900">{formatPrice(order.total)}</p>
                    </div>
                    
                    <div className="flex items-center gap-2 w-full sm:w-auto">
                      {order.status === 'pending' && (
                        <button onClick={() => updateStatus(order.id, 'packed')} className="btn-primary w-full sm:w-auto">
                          Proses Pesanan
                        </button>
                      )}
                      {order.status === 'packed' && (
                        <button onClick={() => updateStatus(order.id, 'shipped')} className="btn-primary w-full sm:w-auto">
                          Kirim Pesanan
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
