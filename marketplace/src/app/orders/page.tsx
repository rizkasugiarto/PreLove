'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/context/AuthContext';
import { formatPrice, formatDate, ORDER_STATUS } from '@/lib/utils';
import toast from 'react-hot-toast';
import { Package, ArrowRight, Store, Clock } from 'lucide-react';

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
    <div style={{ minHeight: '100vh', background: 'radial-gradient(ellipse at top left, #EDE9FE 0%, #F5F3FF 40%, #EFF6FF 100%)', color: '#111827', paddingBottom: '128px', paddingTop: '112px', position: 'relative' }}>
      {/* Aurora Blobs */}
      <div className="absolute top-0 left-0 w-full h-[500px] overflow-hidden pointer-events-none">
        <div className="absolute -top-[20%] -left-[10%] w-[50%] h-[80%] rounded-full blur-[120px] bg-purple-300/40 mix-blend-multiply" />
        <div className="absolute top-[10%] -right-[10%] w-[40%] h-[60%] rounded-full blur-[100px] bg-emerald-200/40 mix-blend-multiply" />
      </div>

      <div style={{ maxWidth: '900px', margin: '0 auto', position: 'relative', zIndex: 10, padding: '0 16px' }}>
        
        {/* Header Glass Card */}
        <div style={{
          background: 'rgba(255,255,255,0.88)', backdropFilter: 'blur(24px)', WebkitBackdropFilter: 'blur(24px)',
          borderRadius: '24px', border: '1px solid rgba(255,255,255,0.9)',
          boxShadow: '0 12px 32px rgba(124,58,237,0.06), 0 4px 12px rgba(0,0,0,0.02)',
          padding: '24px', marginBottom: '24px',
          display: 'flex', alignItems: 'center', gap: '20px'
        }}>
          <div style={{ width: '64px', height: '64px', borderRadius: '20px', background: 'linear-gradient(135deg, #C4B5FD, #A855F7)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, boxShadow: '0 8px 16px rgba(168,85,247,0.2)' }}>
            <Package size={32} color="white" />
          </div>
          <div>
            <h1 style={{ fontSize: '24px', fontWeight: 900, margin: '0 0 4px 0', letterSpacing: '-0.5px' }}>Pesanan Saya</h1>
            <p style={{ fontSize: '14px', color: '#6B7280', margin: 0 }}>Pantau dan kelola semua riwayat belanja preloved kamu di sini.</p>
          </div>
        </div>

        {/* Liquid Tabs */}
        <div style={{ display: 'flex', gap: '8px', overflowX: 'auto', paddingBottom: '8px', marginBottom: '24px' }} className="scrollbar-hide">
          {TABS.map(tab => (
            <button key={tab} onClick={() => setActiveTab(tab)}
              style={{
                padding: '10px 20px', borderRadius: '16px', fontSize: '14px', fontWeight: 800, whiteSpace: 'nowrap', transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                background: activeTab === tab ? 'linear-gradient(135deg, #8B5CF6, #6D28D9)' : 'rgba(255,255,255,0.7)',
                color: activeTab === tab ? '#FFF' : '#6B7280',
                border: activeTab === tab ? 'none' : '1px solid rgba(139,92,246,0.1)',
                boxShadow: activeTab === tab ? '0 8px 16px rgba(109,40,217,0.2)' : 'none',
              }}>
              {tab}
            </button>
          ))}
        </div>

        {/* Content Area */}
        {loading ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {[...Array(3)].map((_, i) => (
              <div key={i} style={{ background: 'rgba(255,255,255,0.6)', height: '140px', borderRadius: '24px', animation: 'pulse 1.5s infinite ease-in-out' }} />
            ))}
          </div>
        ) : orders.length === 0 ? (
          <div style={{
            background: 'rgba(255,255,255,0.7)', backdropFilter: 'blur(20px)', borderRadius: '32px',
            border: '1px dashed rgba(168,85,247,0.3)', padding: '64px 20px', textAlign: 'center',
            display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center'
          }}>
            <div style={{ fontSize: '72px', marginBottom: '16px', filter: 'drop-shadow(0 10px 10px rgba(0,0,0,0.05))' }}>📭</div>
            <h2 style={{ fontSize: '20px', fontWeight: 900, color: '#1F2937', marginBottom: '8px' }}>Belum Ada Pesanan</h2>
            <p style={{ color: '#6B7280', marginBottom: '24px' }}>Yuk mulai belanja item preloved unik yang ramah lingkungan!</p>
            <Link href="/" style={{
              display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '12px 28px',
              background: 'linear-gradient(135deg, #8B5CF6, #6D28D9)', color: 'white', fontWeight: 800,
              borderRadius: '999px', textDecoration: 'none', boxShadow: '0 8px 20px rgba(109,40,217,0.25)',
              transition: 'transform 0.2s',
            }}
            onMouseOver={(e) => e.currentTarget.style.transform = 'scale(1.05)'}
            onMouseOut={(e) => e.currentTarget.style.transform = 'scale(1)'}
            >
              Mulai Belanja <ArrowRight size={16} />
            </Link>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {orders.map(order => {
              const status = ORDER_STATUS[order.status] ?? ORDER_STATUS.pending;
              const snapshot = order.items?.[0]?.product_snapshot as any;
              const img = snapshot?.images?.find((i: any) => i.is_primary)?.image_url ?? snapshot?.images?.[0]?.image_url;
              return (
                <div key={order.id} style={{
                  background: 'rgba(255,255,255,0.85)', backdropFilter: 'blur(24px)',
                  borderRadius: '24px', border: '1px solid rgba(255,255,255,1)',
                  boxShadow: '0 4px 12px rgba(124,58,237,0.03)', overflow: 'hidden',
                  transition: 'transform 0.2s, box-shadow 0.2s'
                }}
                onMouseOver={(e) => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 8px 24px rgba(124,58,237,0.08)'; }}
                onMouseOut={(e) => { e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = '0 4px 12px rgba(124,58,237,0.03)'; }}
                >
                  {/* Order Header */}
                  <div style={{ padding: '16px 20px', borderBottom: '1px solid rgba(0,0,0,0.04)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'rgba(249,250,251,0.5)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <Store size={14} color="#8B5CF6" />
                      <span style={{ fontSize: '13px', fontWeight: 800, color: '#374151' }}>{order.store?.name}</span>
                    </div>
                    <span className={status.color} style={{ fontSize: '12px', fontWeight: 900, padding: '4px 10px', borderRadius: '999px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                      {status.emoji} {status.label}
                    </span>
                  </div>

                  {/* Order Body */}
                  <div style={{ padding: '20px', display: 'flex', gap: '16px', alignItems: 'center' }}>
                    <div style={{ width: '80px', height: '80px', borderRadius: '16px', background: '#F3F4F6', overflow: 'hidden', flexShrink: 0, border: '1px solid rgba(0,0,0,0.05)' }}>
                      {img ? <img src={img} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '32px' }}>📦</div>}
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <p style={{ fontWeight: 800, color: '#1F2937', fontSize: '15px', margin: '0 0 4px 0', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{snapshot?.title ?? 'Produk Preloved'}</p>
                      {order.items?.length > 1 && <p style={{ fontSize: '12px', color: '#8B5CF6', fontWeight: 700, margin: '0 0 4px 0' }}>+{order.items.length - 1} produk lainnya</p>}
                      <div style={{ display: 'flex', alignItems: 'center', gap: '4px', color: '#9CA3AF', fontSize: '12px', marginBottom: '8px' }}>
                        <Clock size={12} /> {formatDate(order.created_at)}
                      </div>
                      <p style={{ fontWeight: 900, color: '#7C3AED', fontSize: '16px', margin: 0 }}>{formatPrice(order.total)}</p>
                    </div>
                  </div>

                  {/* Order Footer */}
                  <div style={{ padding: '16px 20px', borderTop: '1px solid rgba(0,0,0,0.04)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'rgba(255,255,255,0.9)' }}>
                    <div>
                      {order.tracking_number ? (
                        <p style={{ fontSize: '12px', color: '#6B7280', margin: 0 }}>🚚 Resi: <span style={{ fontWeight: 800, color: '#7C3AED' }}>{order.tracking_number}</span></p>
                      ) : <span />}
                    </div>
                    
                    <div style={{ display: 'flex', gap: '8px' }}>
                      {order.status === 'shipped' && (
                        <button onClick={() => confirmReceived(order.id)} style={{
                          padding: '8px 16px', background: '#10B981', color: 'white', fontSize: '13px', fontWeight: 800, borderRadius: '12px', border: 'none', cursor: 'pointer', boxShadow: '0 4px 10px rgba(16,185,129,0.2)'
                        }}>
                          ✅ Konfirmasi Diterima
                        </button>
                      )}
                      {order.status === 'delivered' && (
                        <Link href={`/review/${order.id}`} style={{
                          padding: '8px 16px', background: '#F59E0B', color: 'white', fontSize: '13px', fontWeight: 800, borderRadius: '12px', textDecoration: 'none', boxShadow: '0 4px 10px rgba(245,158,11,0.2)'
                        }}>
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
    </div>
  );
}
