'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/lib/supabase';
import { formatPrice, formatDate, ORDER_STATUS } from '@/lib/utils';
import { ArrowLeft, MapPin, Store, CreditCard, MessageCircle, Clock } from 'lucide-react';
import Link from 'next/link';
import toast from 'react-hot-toast';
import LogoLoader from '@/components/LogoLoader';

export default function OrderDetailPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const { id } = useParams<{ id: string }>();
  
  const [order, setOrder] = useState<any>(null);
  const [fetching, setFetching] = useState(true);

  useEffect(() => {
    if (!loading && !user) router.push('/auth/login');
  }, [user, loading]);

  useEffect(() => {
    if (user && id) fetchOrder();
  }, [user, id]);

  const fetchOrder = async () => {
    const { data } = await supabase
      .from('orders')
      .select('*, store:stores(id,name,logo_url), items:order_items(*, product:products(id,title,images:product_images(image_url))), reviews(*)')
      .eq('id', id)
      .single();
    
    setOrder(data);
    setFetching(false);
  };

  const confirmDelivery = async () => {
    if (!confirm('Apakah kamu sudah menerima barang dengan baik?')) return;
    const { error } = await supabase.from('orders').update({ status: 'delivered' }).eq('id', id);
    if (error) {
      toast.error('Gagal konfirmasi penerimaan');
    } else {
      toast.success('Pesanan selesai! Silakan beri ulasan ⭐');
      fetchOrder();
    }
  };

  if (loading || fetching) return <LogoLoader text="Memuat Rincian Pesanan..." />;

  if (!order) return (
    <div style={{ minHeight: '100vh', background: 'radial-gradient(ellipse at top left, #EDE9FE 0%, #F5F3FF 40%, #EFF6FF 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ textAlign: 'center', background: 'rgba(255,255,255,0.7)', backdropFilter: 'blur(20px)', padding: '64px', borderRadius: '32px', border: '1px dashed rgba(168,85,247,0.3)' }}>
        <div style={{ fontSize: '64px', marginBottom: '16px' }}>🔍</div>
        <h2 style={{ fontSize: '20px', fontWeight: 900, color: '#1F2937' }}>Pesanan tidak ditemukan</h2>
      </div>
    </div>
  );

  const status = ORDER_STATUS[order.status] || ORDER_STATUS['pending'];

  return (
    <div style={{ minHeight: '100vh', background: 'radial-gradient(ellipse at top left, #EDE9FE 0%, #F5F3FF 40%, #EFF6FF 100%)', color: '#111827', paddingBottom: '128px', paddingTop: '112px', position: 'relative' }}>
      {/* Aurora Blobs */}
      <div className="absolute top-0 left-0 w-full h-[500px] overflow-hidden pointer-events-none">
        <div className="absolute -top-[20%] -left-[10%] w-[50%] h-[80%] rounded-full blur-[120px] bg-purple-300/40 mix-blend-multiply" />
        <div className="absolute top-[10%] -right-[10%] w-[40%] h-[60%] rounded-full blur-[100px] bg-emerald-200/40 mix-blend-multiply" />
      </div>

      <div style={{ maxWidth: '800px', margin: '0 auto', position: 'relative', zIndex: 10, padding: '0 16px' }}>
        
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '32px' }}>
          <Link href="/orders" style={{
            width: '44px', height: '44px', borderRadius: '16px', background: 'rgba(255,255,255,0.8)', backdropFilter: 'blur(10px)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid rgba(0,0,0,0.05)', boxShadow: '0 4px 12px rgba(0,0,0,0.05)', flexShrink: 0
          }} className="hover:bg-white hover:scale-105 transition-all">
            <ArrowLeft size={20} color="#374151" />
          </Link>
          <div style={{ minWidth: 0 }}>
            <h1 style={{ fontSize: '28px', fontWeight: 900, margin: '0 0 4px 0', letterSpacing: '-0.5px', color: '#111827', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>Detail Pesanan</h1>
            <p style={{ fontSize: '14px', color: '#6B7280', margin: 0, fontWeight: 600 }}>{order.order_number}</p>
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          
          {/* Status & Date Card */}
          <div style={{
            background: 'rgba(255,255,255,0.88)', backdropFilter: 'blur(24px)', WebkitBackdropFilter: 'blur(24px)',
            borderRadius: '24px', border: '1px solid rgba(255,255,255,0.9)',
            boxShadow: '0 12px 32px rgba(124,58,237,0.06), 0 4px 12px rgba(0,0,0,0.02)',
            padding: '24px 32px', display: 'flex', flexWrap: 'wrap', alignItems: 'flex-start', justifyContent: 'space-between', gap: '20px'
          }}>
            <div>
              <p style={{ fontSize: '12px', fontWeight: 800, color: '#9CA3AF', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '8px' }}>Status Pesanan</p>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <span className={status.color} style={{ fontSize: '14px', fontWeight: 900, padding: '6px 16px', borderRadius: '999px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  {status.emoji} {status.label}
                </span>
              </div>
              {order.tracking_number && (
                <p style={{ fontSize: '13px', color: '#4B5563', margin: '12px 0 0 0', fontWeight: 600 }}>
                  Resi: <span style={{ fontWeight: 800, color: '#7C3AED' }}>{order.tracking_number}</span>
                </p>
              )}
            </div>
            <div style={{ textAlign: 'left' }} className="sm:text-right">
              <p style={{ fontSize: '12px', fontWeight: 800, color: '#9CA3AF', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '8px' }}>Tanggal Transaksi</p>
              <p style={{ fontSize: '15px', fontWeight: 800, color: '#1F2937', margin: 0, display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Clock size={16} color="#8B5CF6" /> {formatDate(order.created_at)}
              </p>
            </div>
          </div>

          {/* Action Callouts */}
          {order.status === 'waiting_payment' && order.payment_bank !== 'COD' && (
             <div style={{ background: 'linear-gradient(135deg, #FFFBEB, #FEF3C7)', borderRadius: '24px', padding: '24px 32px', display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: '16px', border: '1px solid #FDE68A' }}>
               <div>
                 <h3 style={{ fontSize: '16px', fontWeight: 900, color: '#D97706', margin: '0 0 4px 0' }}>Selesaikan Pembayaran</h3>
                 <p style={{ fontSize: '13px', color: '#B45309', margin: 0, fontWeight: 500 }}>Segera bayar dan unggah bukti transfer agar pesanan bisa diproses.</p>
               </div>
               <Link href={`/orders/${order.id}/payment`} style={{ background: '#D97706', color: 'white', fontWeight: 800, padding: '12px 24px', borderRadius: '16px', textDecoration: 'none', whiteSpace: 'nowrap', boxShadow: '0 8px 16px rgba(217,119,6,0.2)' }} className="hover:scale-105 transition-transform w-full sm:w-auto text-center">
                 Bayar Sekarang
               </Link>
             </div>
          )}

          {order.status === 'shipped' && (
             <div style={{ background: 'linear-gradient(135deg, #ECFDF5, #D1FAE5)', borderRadius: '24px', padding: '24px 32px', display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: '16px', border: '1px solid #A7F3D0' }}>
               <div>
                 <h3 style={{ fontSize: '16px', fontWeight: 900, color: '#059669', margin: '0 0 4px 0' }}>Barang Sudah Diterima?</h3>
                 <p style={{ fontSize: '13px', color: '#047857', margin: 0, fontWeight: 500 }}>Pastikan kondisi barang sudah sesuai sebelum konfirmasi penerimaan.</p>
               </div>
               <button onClick={confirmDelivery} style={{ background: '#10B981', color: 'white', fontWeight: 800, padding: '12px 24px', borderRadius: '16px', border: 'none', cursor: 'pointer', whiteSpace: 'nowrap', boxShadow: '0 8px 16px rgba(16,185,129,0.2)' }} className="hover:scale-105 transition-transform w-full sm:w-auto">
                 ✅ Ya, Barang Diterima
               </button>
             </div>
          )}

          {order.status === 'completed' && order.reviews?.length === 0 && (
             <div style={{ background: 'linear-gradient(135deg, #EFF6FF, #DBEAFE)', borderRadius: '24px', padding: '24px 32px', display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: '16px', border: '1px solid #BFDBFE' }}>
               <div>
                 <h3 style={{ fontSize: '16px', fontWeight: 900, color: '#2563EB', margin: '0 0 4px 0' }}>Beri Ulasan Produk</h3>
                 <p style={{ fontSize: '13px', color: '#1D4ED8', margin: 0, fontWeight: 500 }}>Bantu penjual dan pembeli lain dengan memberikan ulasan terbaikmu!</p>
               </div>
               <Link href={`/review/${order.id}`} style={{ background: '#3B82F6', color: 'white', fontWeight: 800, padding: '12px 24px', borderRadius: '16px', textDecoration: 'none', whiteSpace: 'nowrap', boxShadow: '0 8px 16px rgba(59,130,246,0.2)' }} className="hover:scale-105 transition-transform w-full sm:w-auto text-center">
                 ⭐ Beri Ulasan
               </Link>
             </div>
          )}

          {/* Product Items */}
          <div style={{
            background: 'rgba(255,255,255,0.85)', backdropFilter: 'blur(24px)', WebkitBackdropFilter: 'blur(24px)',
            borderRadius: '24px', border: '1px solid rgba(255,255,255,0.9)',
            boxShadow: '0 4px 20px rgba(124,58,237,0.03)', overflow: 'hidden'
          }}>
            {/* Store Header */}
            <div style={{ padding: '20px 24px', borderBottom: '1px solid rgba(0,0,0,0.04)', display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: '12px', background: 'rgba(249,250,251,0.5)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <Store size={18} color="#8B5CF6" />
                <span style={{ fontSize: '15px', fontWeight: 900, color: '#374151' }}>{order.store?.name}</span>
              </div>
              <button style={{ display: 'flex', alignItems: 'center', gap: '6px', background: 'white', border: '1px solid #E5E7EB', padding: '6px 14px', borderRadius: '999px', fontSize: '13px', fontWeight: 800, color: '#6B7280', cursor: 'pointer', boxShadow: '0 2px 4px rgba(0,0,0,0.02)' }} className="hover:border-purple-300 hover:text-purple-600 transition-colors">
                <MessageCircle size={14} /> Chat Penjual
              </button>
            </div>

            <div style={{ padding: '8px 24px' }}>
              {order.items?.map((item: any, idx: number) => {
                const img = item.product_snapshot?.images?.find((i:any) => i.is_primary)?.image_url ?? item.product?.images?.[0]?.image_url ?? item.product_snapshot?.images?.[0]?.image_url;
                return (
                  <div key={item.id} style={{ display: 'flex', flexWrap: 'wrap', gap: '16px', padding: '16px 0', borderBottom: idx !== order.items.length - 1 ? '1px dashed rgba(0,0,0,0.06)' : 'none' }}>
                    <div style={{ width: '80px', height: '80px', borderRadius: '16px', background: '#F3F4F6', overflow: 'hidden', flexShrink: 0, border: '1px solid rgba(0,0,0,0.05)' }}>
                      {img ? <img src={img} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '24px' }}>📦</div>}
                    </div>
                    <div style={{ flex: 1, minWidth: '200px', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                      <Link href={`/products/${item.product_id}`} style={{ textDecoration: 'none' }} className="hover:underline hover:text-purple-600 decoration-purple-600">
                        <h4 style={{ fontWeight: 800, color: '#1F2937', fontSize: '15px', margin: '0 0 4px 0', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                          {item.product_snapshot?.title || item.product?.title}
                        </h4>
                      </Link>
                      <p style={{ fontSize: '13px', color: '#6B7280', margin: 0, fontWeight: 600 }}>{item.quantity} x {formatPrice(item.price)}</p>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', width: '100%', sm: {width: 'auto'}, justifyContent: 'flex-end' }} className="sm:w-auto w-full">
                      <p style={{ fontWeight: 900, color: '#7C3AED', fontSize: '16px', margin: 0 }}>{formatPrice(item.price * item.quantity)}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Info Pengiriman */}
            <div style={{
              background: 'rgba(255,255,255,0.85)', backdropFilter: 'blur(24px)', WebkitBackdropFilter: 'blur(24px)',
              borderRadius: '24px', border: '1px solid rgba(255,255,255,0.9)',
              boxShadow: '0 4px 20px rgba(124,58,237,0.03)', padding: '24px'
            }}>
              <h3 style={{ fontSize: '15px', fontWeight: 900, color: '#111827', margin: '0 0 20px 0', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <MapPin size={18} color="#8B5CF6" /> Info Pengiriman
              </h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <div>
                  <p style={{ fontSize: '12px', color: '#9CA3AF', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.05em', margin: '0 0 4px 0' }}>Kurir Pengiriman</p>
                  <p style={{ fontSize: '14px', fontWeight: 800, color: '#374151', margin: 0 }}>{order.shipping_courier} - Reguler</p>
                </div>
                <div>
                  <p style={{ fontSize: '12px', color: '#9CA3AF', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.05em', margin: '0 0 6px 0' }}>Alamat Tujuan</p>
                  <div style={{ background: 'rgba(249,250,251,0.6)', padding: '12px 16px', borderRadius: '16px', border: '1px solid rgba(0,0,0,0.03)' }}>
                    <p style={{ fontSize: '14px', fontWeight: 900, color: '#111827', margin: '0 0 2px 0' }}>{order.address_snapshot?.name || order.address_snapshot?.recipient_name}</p>
                    <p style={{ fontSize: '13px', color: '#6B7280', margin: '0 0 8px 0', fontWeight: 600 }}>{order.address_snapshot?.phone}</p>
                    <p style={{ fontSize: '13px', color: '#4B5563', margin: '0 0 4px 0', lineHeight: 1.5 }}>{order.address_snapshot?.address || order.address_snapshot?.detail}</p>
                    <p style={{ fontSize: '13px', color: '#6B7280', margin: 0 }}>{order.address_snapshot?.city}, {order.address_snapshot?.province}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Rincian Pembayaran */}
            <div style={{
              background: 'rgba(255,255,255,0.85)', backdropFilter: 'blur(24px)', WebkitBackdropFilter: 'blur(24px)',
              borderRadius: '24px', border: '1px solid rgba(255,255,255,0.9)',
              boxShadow: '0 4px 20px rgba(124,58,237,0.03)', padding: '24px', display: 'flex', flexDirection: 'column'
            }}>
              <h3 style={{ fontSize: '15px', fontWeight: 900, color: '#111827', margin: '0 0 20px 0', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <CreditCard size={18} color="#8B5CF6" /> Rincian Pembayaran
              </h3>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', flex: 1 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '13px', color: '#6B7280', fontWeight: 600 }}>Metode Pembayaran</span>
                  <span style={{ fontSize: '13px', fontWeight: 800, color: '#374151', padding: '4px 10px', background: '#F3F4F6', borderRadius: '8px' }}>
                    {order.payment_bank || order.payment_method?.replace('_', ' ')}
                  </span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '13px', color: '#6B7280', fontWeight: 600 }}>Total Harga ({order.items?.length} barang)</span>
                  <span style={{ fontSize: '14px', fontWeight: 800, color: '#374151' }}>{formatPrice(order.subtotal)}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '13px', color: '#6B7280', fontWeight: 600 }}>Ongkos Kirim</span>
                  <span style={{ fontSize: '14px', fontWeight: 800, color: '#374151' }}>{formatPrice(order.shipping_cost)}</span>
                </div>
              </div>
              
              <div style={{ paddingTop: '16px', marginTop: '16px', borderTop: '2px dashed rgba(0,0,0,0.06)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '14px', fontWeight: 900, color: '#111827' }}>Total Belanja</span>
                <span style={{ fontSize: '20px', fontWeight: 900, background: 'linear-gradient(135deg, #7C3AED, #DB2777)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>{formatPrice(order.total)}</span>
              </div>
            </div>
          </div>
          
        </div>
      </div>
    </div>
  );
}
