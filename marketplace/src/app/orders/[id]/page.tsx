'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/lib/supabase';
import { formatPrice, formatDate, ORDER_STATUS } from '@/lib/utils';
import { ArrowLeft, Package, MapPin, CreditCard, ChevronRight, MessageCircle } from 'lucide-react';
import Link from 'next/link';
import toast from 'react-hot-toast';

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
      toast.success('Pesanan selesai!');
      fetchOrder();
    }
  };

  if (loading || fetching) return (
    <div className="min-h-screen flex items-center justify-center" style={{ background: 'var(--bg)' }}>
      <div className="w-12 h-12 rounded-full border-4 border-violet-200 border-t-violet-600 animate-spin" />
    </div>
  );

  if (!order) return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <div className="text-6xl mb-4">🔍</div>
        <h2 className="text-xl font-bold">Pesanan tidak ditemukan</h2>
      </div>
    </div>
  );

  const status = ORDER_STATUS[order.status] || ORDER_STATUS['pending'];

  return (
    <div className="min-h-screen" style={{ background: 'var(--bg)' }}>
      <div className="max-w-3xl mx-auto py-8 px-4">
        
        {/* Header */}
        <div className="flex items-center gap-4 mb-6">
          <Link href="/orders" className="p-2 rounded-xl hover:bg-white border border-transparent hover:border-gray-200 transition-all">
            <ArrowLeft className="w-5 h-5 text-gray-600" />
          </Link>
          <div>
            <h1 className="text-xl font-black">Detail Pesanan</h1>
            <p className="text-sm text-gray-500">{order.order_number}</p>
          </div>
        </div>

        {/* Status Card */}
        <div className="card p-6 mb-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <p className="text-sm text-gray-500 mb-1">Status Pesanan</p>
              <div className="flex items-center gap-2">
                <span className={`badge ${status.color} text-sm px-3 py-1`}>
                  {status.emoji} {status.label}
                </span>
              </div>
              {order.tracking_number && (
                <p className="text-sm mt-3 font-medium">No. Resi: <span className="text-violet-600">{order.tracking_number}</span></p>
              )}
            </div>
            <div className="text-left sm:text-right">
              <p className="text-sm text-gray-500 mb-1">Tanggal Transaksi</p>
              <p className="font-medium text-gray-900">{formatDate(order.created_at)}</p>
            </div>
          </div>
        </div>

        {/* Items */}
        <div className="card p-6 mb-6">
          <div className="flex items-center justify-between mb-4 border-b border-gray-100 pb-4">
            <div className="flex items-center gap-3">
              <Store className="w-5 h-5 text-gray-400" />
              <span className="font-bold">{order.store?.name}</span>
            </div>
            <button className="text-sm font-bold text-violet-600 flex items-center gap-1 hover:text-violet-800 transition-colors">
              <MessageCircle className="w-4 h-4" /> Chat
            </button>
          </div>

          <div className="space-y-4">
            {order.items?.map((item: any) => {
              const img = item.product?.images?.[0]?.image_url;
              return (
                <div key={item.id} className="flex gap-4">
                  <div className="w-20 h-20 rounded-xl bg-gray-100 overflow-hidden flex-shrink-0">
                    {img ? (
                      <img src={img} alt="" className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">📦</div>
                    )}
                  </div>
                  <div className="flex-1">
                    <h4 className="font-bold text-gray-900 line-clamp-2">{item.product_snapshot?.title || item.product?.title}</h4>
                    <p className="text-sm text-gray-500 mt-1">{item.quantity} x {formatPrice(item.price)}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-violet-600">{formatPrice(item.price * item.quantity)}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Shipping & Payment Info */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          {/* Shipping */}
          <div className="card p-6">
            <h3 className="font-bold flex items-center gap-2 mb-4 text-gray-900">
              <MapPin className="w-5 h-5 text-gray-400" /> Info Pengiriman
            </h3>
            <div className="space-y-3 text-sm">
              <div>
                <p className="text-gray-500">Kurir</p>
                <p className="font-medium text-gray-900">{order.shipping_courier} - {order.shipping_service || 'Reguler'}</p>
              </div>
              <div>
                <p className="text-gray-500">Alamat</p>
                <div className="mt-1">
                  <p className="font-bold text-gray-900">{order.address_snapshot?.recipient_name}</p>
                  <p className="text-gray-600">{order.address_snapshot?.phone}</p>
                  <p className="text-gray-600 mt-1">{order.address_snapshot?.address}</p>
                  <p className="text-gray-600">{order.address_snapshot?.city}, {order.address_snapshot?.province}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Payment */}
          <div className="card p-6">
            <h3 className="font-bold flex items-center gap-2 mb-4 text-gray-900">
              <CreditCard className="w-5 h-5 text-gray-400" /> Rincian Pembayaran
            </h3>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between">
                <p className="text-gray-500">Metode</p>
                <p className="font-medium text-gray-900 capitalize">{order.payment_method?.replace('_', ' ')}</p>
              </div>
              <div className="flex justify-between">
                <p className="text-gray-500">Total Harga ({order.items?.length} barang)</p>
                <p className="font-medium text-gray-900">{formatPrice(order.subtotal)}</p>
              </div>
              <div className="flex justify-between">
                <p className="text-gray-500">Ongkos Kirim</p>
                <p className="font-medium text-gray-900">{formatPrice(order.shipping_cost)}</p>
              </div>
              <div className="border-t border-gray-100 pt-3 flex justify-between font-black text-lg">
                <p className="text-gray-900">Total Belanja</p>
                <p className="text-violet-600">{formatPrice(order.total)}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        {order.status === 'waiting_payment' && (
          <div className="flex justify-end gap-3">
             <button className="btn-primary">
                Konfirmasi Pembayaran
             </button>
          </div>
        )}
        
        {order.status === 'shipped' && (
           <div className="card p-6 bg-violet-50 border-violet-100 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div>
                 <h4 className="font-bold text-violet-900">Pesanan Sudah Diterima?</h4>
                 <p className="text-sm text-violet-700">Pastikan barang dalam kondisi baik sebelum konfirmasi.</p>
              </div>
              <button onClick={confirmDelivery} className="btn-primary whitespace-nowrap w-full sm:w-auto">
                 Ya, Barang Diterima
              </button>
           </div>
        )}

        {order.status === 'completed' && order.reviews?.length === 0 && (
           <div className="flex justify-end">
              <button className="btn-primary">
                 Beri Ulasan
              </button>
           </div>
        )}

      </div>
    </div>
  );
}
