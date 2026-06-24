'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/lib/supabase';
import { formatPrice, formatDate, ORDER_STATUS } from '@/lib/utils';
import { ArrowLeft, MapPin, User, CreditCard, Clock, Truck } from 'lucide-react';
import Link from 'next/link';

export default function SellerOrderDetailPage() {
  const { user, profile, loading } = useAuth();
  const router = useRouter();
  const { id } = useParams<{ id: string }>();
  
  const [order, setOrder] = useState<any>(null);
  const [fetching, setFetching] = useState(true);

  useEffect(() => {
    if (!loading && !user) router.push('/auth/login');
  }, [user, loading]);

  useEffect(() => {
    if (user && id && profile?.store) fetchOrder(profile.store.id || profile.store[0]?.id);
  }, [user, id, profile]);

  const fetchOrder = async (storeId: string) => {
    const { data } = await supabase
      .from('orders')
      .select('*, buyer:profiles(full_name, phone), items:order_items(*, product:products(id,title,images:product_images(image_url)))')
      .eq('id', id)
      .eq('store_id', storeId)
      .single();
    
    setOrder(data);
    setFetching(false);
  };

  if (loading || fetching) return (
    <div style={{ minHeight: '100vh', background: 'radial-gradient(ellipse at top left, #EDE9FE 0%, #F5F3FF 40%, #EFF6FF 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ width: '48px', height: '48px', border: '4px solid rgba(139,92,246,0.2)', borderTop: '4px solid #8B5CF6', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  );

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
      <div className="absolute top-0 left-0 w-full h-[500px] overflow-hidden pointer-events-none">
        <div className="absolute -top-[20%] -left-[10%] w-[50%] h-[80%] rounded-full blur-[120px] bg-purple-300/40 mix-blend-multiply" />
        <div className="absolute top-[10%] -right-[10%] w-[40%] h-[60%] rounded-full blur-[100px] bg-emerald-200/40 mix-blend-multiply" />
      </div>

      <div style={{ maxWidth: '800px', margin: '0 auto', position: 'relative', zIndex: 10, padding: '0 16px' }}>
        
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '32px' }}>
          <button onClick={() => router.back()} style={{
            width: '44px', height: '44px', borderRadius: '16px', background: 'rgba(255,255,255,0.8)', backdropFilter: 'blur(10px)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid rgba(0,0,0,0.05)', boxShadow: '0 4px 12px rgba(0,0,0,0.05)', flexShrink: 0, cursor: 'pointer'
          }} className="hover:bg-white hover:scale-105 transition-all">
            <ArrowLeft size={20} color="#374151" />
          </button>
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
                <p style={{ fontSize: '13px', color: '#4B5563', margin: '12px 0 0 0', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Truck size={14} color="#0E7490" /> Resi: <span style={{ fontWeight: 800, color: '#0E7490' }}>{order.tracking_number}</span>
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

          {/* Product Items */}
          <div style={{
            background: 'rgba(255,255,255,0.85)', backdropFilter: 'blur(24px)', WebkitBackdropFilter: 'blur(24px)',
            borderRadius: '24px', border: '1px solid rgba(255,255,255,0.9)',
            boxShadow: '0 4px 20px rgba(124,58,237,0.03)', overflow: 'hidden'
          }}>
            <div style={{ padding: '20px 24px', borderBottom: '1px solid rgba(0,0,0,0.04)', display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '10px', background: 'rgba(249,250,251,0.5)' }}>
              <User size={18} color="#8B5CF6" />
              <span style={{ fontSize: '15px', fontWeight: 900, color: '#374151' }}>Pembeli: {order.buyer?.full_name}</span>
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
                      <h4 style={{ fontWeight: 800, color: '#1F2937', fontSize: '15px', margin: '0 0 4px 0', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                        {item.product_snapshot?.title || item.product?.title}
                      </h4>
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
                  <p style={{ fontSize: '12px', color: '#9CA3AF', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.05em', margin: '0 0 4px 0' }}>Kurir Pilihan Pembeli</p>
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
                <CreditCard size={18} color="#8B5CF6" /> Rincian Transaksi
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
                  <span style={{ fontSize: '13px', color: '#6B7280', fontWeight: 600 }}>Ongkos Kirim Diterima</span>
                  <span style={{ fontSize: '14px', fontWeight: 800, color: '#374151' }}>{formatPrice(order.shipping_cost)}</span>
                </div>
              </div>
              
              <div style={{ paddingTop: '16px', marginTop: '16px', borderTop: '2px dashed rgba(0,0,0,0.06)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '14px', fontWeight: 900, color: '#111827' }}>Total Pendapatan</span>
                <span style={{ fontSize: '20px', fontWeight: 900, background: 'linear-gradient(135deg, #7C3AED, #DB2777)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>{formatPrice(order.total)}</span>
              </div>
            </div>
          </div>
          
        </div>
      </div>
    </div>
  );
}
