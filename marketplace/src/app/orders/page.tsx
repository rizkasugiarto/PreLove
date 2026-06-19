'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/context/AuthContext';
import { formatPrice, formatDate, ORDER_STATUS } from '@/lib/utils';
import toast from 'react-hot-toast';

const TABS = ['Semua', 'Menunggu', 'Diproses', 'Dikirim', 'Selesai'];
const TAB_STATUS: Record<string, string[]> = {
  'Semua': [], 'Menunggu': ['pending'], 'Diproses': ['confirmed', 'packed'],
  'Dikirim': ['shipped', 'delivered'], 'Selesai': ['completed', 'cancelled'],
};

export default function OrdersPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('Semua');

  useEffect(() => {
    if (!user) { router.push('/auth/login'); return; }
    fetchOrders();
  }, [user, activeTab]);

  const fetchOrders = async () => {
    setLoading(true);
    let q = supabase.from('orders')
      .select('*, store:stores(name, logo_url), items:order_items(product_snapshot)')
      .eq('buyer_id', user!.id)
      .order('created_at', { ascending: false });
    const statuses = TAB_STATUS[activeTab];
    if (statuses.length > 0) q = q.in('status', statuses);
    const { data } = await q;
    setOrders(data ?? []);
    setLoading(false);
  };

  const confirmReceived = async (orderId: string) => {
    await supabase.from('orders').update({ status: 'delivered' }).eq('id', orderId);
    toast.success('Pesanan dikonfirmasi diterima! ✅');
    fetchOrders();
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-black text-gray-900 mb-6">📦 Pesanan Saya</h1>

      {/* Tabs */}
      <div className="flex gap-2 overflow-x-auto pb-2 mb-6 scrollbar-hide">
        {TABS.map(tab => (
          <button key={tab} onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 rounded-xl text-sm font-bold whitespace-nowrap transition-all ${activeTab === tab ? 'bg-violet-600 text-white shadow-lg shadow-violet-500/20' : 'bg-white text-gray-600 border border-gray-200 hover:border-violet-300'}`}>
            {tab}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="space-y-4">{[...Array(3)].map((_, i) => <div key={i} className="bg-white rounded-2xl h-32 animate-pulse" />)}</div>
      ) : orders.length === 0 ? (
        <div className="text-center py-20">
          <div className="text-6xl mb-4">📭</div>
          <h2 className="text-xl font-black text-gray-800 mb-2">Belum Ada Pesanan</h2>
          <p className="text-gray-500 mb-6">Yuk mulai belanja preloved!</p>
          <Link href="/" className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-violet-600 to-purple-600 text-white font-bold rounded-2xl shadow-lg shadow-violet-500/30">
            Belanja Sekarang
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map(order => {
            const status = ORDER_STATUS[order.status] ?? ORDER_STATUS.pending;
            const snapshot = order.items?.[0]?.product_snapshot as any;
            const img = snapshot?.images?.find((i: any) => i.is_primary)?.image_url ?? snapshot?.images?.[0]?.image_url;
            return (
              <div key={order.id} className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                {/* Header */}
                <div className="flex items-center justify-between px-5 py-3 border-b border-gray-100 bg-gray-50">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-bold text-gray-600">🏪 {order.store?.name}</span>
                  </div>
                  <span className={`text-xs font-black px-2.5 py-1 rounded-full ${status.color}`}>
                    {status.emoji} {status.label}
                  </span>
                </div>

                {/* Body */}
                <div className="p-5 flex items-center gap-4">
                  <div className="w-16 h-16 rounded-xl bg-gray-100 flex-shrink-0 overflow-hidden">
                    {img ? <img src={img} alt="" className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center text-2xl">📦</div>}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-gray-900 text-sm line-clamp-1">{snapshot?.title ?? 'Produk'}</p>
                    {order.items?.length > 1 && <p className="text-xs text-gray-400">+{order.items.length - 1} produk lainnya</p>}
                    <p className="text-xs text-gray-400 mt-1">{formatDate(order.created_at)}</p>
                    <p className="font-black text-violet-600 mt-1">{formatPrice(order.total)}</p>
                  </div>
                </div>

                {/* Footer Actions */}
                <div className="px-5 py-3 border-t border-gray-100 flex items-center justify-between">
                  {order.tracking_number && (
                    <p className="text-xs text-gray-500">🚚 Resi: <span className="font-bold text-violet-600">{order.tracking_number}</span></p>
                  )}
                  <div className="flex gap-2 ml-auto">
                    {order.status === 'shipped' && (
                      <button onClick={() => confirmReceived(order.id)} className="px-3 py-1.5 bg-emerald-500 hover:bg-emerald-600 text-white text-xs font-bold rounded-xl transition-colors">
                        ✅ Terima Barang
                      </button>
                    )}
                    {order.status === 'delivered' && (
                      <Link href={`/review/${order.id}`} className="px-3 py-1.5 bg-amber-500 hover:bg-amber-600 text-white text-xs font-bold rounded-xl transition-colors">
                        ⭐ Beri Ulasan
                      </Link>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
