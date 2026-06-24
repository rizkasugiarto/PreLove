'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/context/AuthContext';
import { formatPrice } from '@/lib/utils';
import toast from 'react-hot-toast';
import { Trash2, ShoppingBag, ArrowRight, Minus, Plus, Store } from 'lucide-react';

export default function CartPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [items, setItems] = useState<any[]>([]);
  const [selectedItems, setSelectedItems] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { if (user) fetchCart(); else setLoading(false); }, [user]);

  const fetchCart = async () => {
    setLoading(true);
    const { data } = await supabase
      .from('cart_items')
      .select('*, product:products(*, images:product_images(*), store:stores(id,name))')
      .eq('user_id', user!.id);
    setItems(data ?? []);
    setLoading(false);
  };

  const updateQty = async (id: string, qty: number, maxStock: number) => {
    if (qty < 1) return;
    if (qty > maxStock) { toast.error('Melebihi stok!'); return; }
    await supabase.from('cart_items').update({ quantity: qty }).eq('id', id);
    setItems(prev => prev.map(i => i.id === id ? { ...i, quantity: qty } : i));
  };

  const removeItem = async (id: string) => {
    await supabase.from('cart_items').delete().eq('id', id);
    setItems(prev => prev.filter(i => i.id !== id));
    setSelectedItems(prev => prev.filter(selectedId => selectedId !== id));
    toast.success('Item dihapus dari keranjang');
  };

  const handleSelectItem = (id: string) => {
    setSelectedItems(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]);
  };

  const handleSelectStore = (storeId: string, storeItems: any[]) => {
    const itemIds = storeItems.map(i => i.id);
    const allSelected = itemIds.every(id => selectedItems.includes(id));
    
    if (allSelected) {
      setSelectedItems(prev => prev.filter(id => !itemIds.includes(id)));
    } else {
      setSelectedItems(prev => [...new Set([...prev, ...itemIds])]);
    }
  };

  const selectedCartItems = items.filter(i => selectedItems.includes(i.id));
  const subtotal = selectedCartItems.reduce((sum, i) => sum + (i.product?.price ?? 0) * i.quantity, 0);

  const groupedItems = items.reduce((acc: any, item: any) => {
    const storeId = item.product?.store?.id;
    if (!acc[storeId]) {
      acc[storeId] = { storeName: item.product?.store?.name, items: [] };
    }
    acc[storeId].items.push(item);
    return acc;
  }, {});

  if (!user) return (
    <div className="min-h-screen bg-[#F8F7FF] pt-32 pb-32 flex items-center justify-center relative">
      <div className="absolute inset-0 bg-aurora opacity-30 pointer-events-none" />
      <div className="absolute inset-0 bg-white/40 backdrop-blur-3xl pointer-events-none" />
      <div className="bento-card bg-white p-12 max-w-lg w-full text-center relative z-10 shadow-[0_8px_30px_rgba(0,0,0,0.04)] mx-4">
        <div className="w-24 h-24 bg-purple-50 rounded-full flex items-center justify-center text-5xl mx-auto mb-6">🛒</div>
        <h2 className="text-2xl font-black text-slate-900 mb-2">Keranjang Kosong</h2>
        <p className="text-slate-500 mb-8 font-medium">Login dulu untuk melihat keranjang belanjaanmu</p>
        <Link href="/auth/login" className="inline-flex items-center justify-center gap-2 w-full py-4 bg-slate-900 text-white font-black rounded-2xl hover:bg-slate-800 transition-all shadow-[0_8px_20px_rgba(0,0,0,0.15)] hover:-translate-y-0.5">
          Masuk Sekarang
        </Link>
      </div>
    </div>
  );

  return (
    <div style={{ minHeight: '100vh', background: 'radial-gradient(ellipse at top left, #EDE9FE 0%, #F5F3FF 40%, #EFF6FF 100%)', color: '#111827', paddingBottom: '128px', paddingTop: '112px' }}>
      {/* Aurora Blobs */}
      <div className="absolute top-0 left-0 w-full h-[500px] overflow-hidden pointer-events-none">
        <div className="absolute -top-[20%] -left-[10%] w-[50%] h-[80%] rounded-full blur-[120px] bg-purple-300/40 mix-blend-multiply" />
        <div className="absolute top-[10%] -right-[10%] w-[40%] h-[60%] rounded-full blur-[100px] bg-emerald-200/40 mix-blend-multiply" />
      </div>

      <div style={{ width: '100%', maxWidth: '1200px', margin: '0 auto' }} className="px-4 lg:px-8 relative z-10">
        <h1 style={{ fontSize: '36px', fontWeight: 900, color: '#111827', marginBottom: '40px', display: 'flex', alignItems: 'center', gap: '16px', letterSpacing: '-0.02em' }}>
          <div style={{ width: '56px', height: '56px', borderRadius: '16px', background: 'rgba(255,255,255,0.6)', backdropFilter: 'blur(10px)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '28px', border: '1px solid rgba(255,255,255,0.8)', boxShadow: '0 8px 16px rgba(124,58,237,0.05)' }}>🛒</div>
          Keranjang Belanja
        </h1>

        {loading ? (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            <div className="lg:col-span-8 space-y-6">
              {[...Array(2)].map((_, i) => (
                <div key={i} style={{ background: 'rgba(255,255,255,0.5)', borderRadius: '32px', padding: '32px', border: '1px solid rgba(255,255,255,0.8)' }} className="animate-pulse flex gap-6">
                  <div className="w-28 h-28 bg-white/60 rounded-2xl flex-shrink-0" />
                  <div className="flex-1 space-y-4 pt-2">
                    <div className="h-5 bg-white/60 rounded w-3/4" />
                    <div className="h-5 bg-white/60 rounded w-1/2" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : items.length === 0 ? (
          <div style={{
            background: 'rgba(255,255,255,0.7)', backdropFilter: 'blur(24px)', WebkitBackdropFilter: 'blur(24px)',
            borderRadius: '40px', border: '1px solid rgba(255,255,255,0.9)',
            boxShadow: '0 12px 32px rgba(124,58,237,0.04)', padding: '80px 24px', textAlign: 'center'
          }}>
            <div style={{ width: '120px', height: '120px', background: '#F3E8FF', borderRadius: '40px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '64px', margin: '0 auto 32px' }}>🛒</div>
            <h2 style={{ fontSize: '32px', fontWeight: 900, color: '#111827', marginBottom: '12px' }}>Keranjang Masih Kosong</h2>
            <p style={{ color: '#4B5563', fontSize: '16px', fontWeight: 500, marginBottom: '32px', maxWidth: '400px', margin: '0 auto 40px' }}>Yuk cari barang preloved keren di marketplace untuk memenuhinya!</p>
            <Link href="/" style={{
              display: 'inline-flex', alignItems: 'center', gap: '12px', padding: '20px 40px', background: 'linear-gradient(135deg, #8B5CF6, #6D28D9)',
              color: 'white', borderRadius: '24px', fontWeight: 900, fontSize: '16px', boxShadow: '0 12px 24px rgba(124,58,237,0.25)', transition: 'transform 0.2s'
            }} className="hover:-translate-y-1">
              <ShoppingBag size={20} /> Mulai Belanja
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start relative">
            {/* Cart Items */}
            <div className="lg:col-span-8 space-y-6">
              {Object.entries(groupedItems).map(([storeId, group]: [string, any]) => {
                const storeItemIds = group.items.map((i: any) => i.id);
                const isStoreSelected = storeItemIds.every((id: string) => selectedItems.includes(id));

                return (
                  <div key={storeId} style={{
                    background: 'rgba(255,255,255,0.7)', backdropFilter: 'blur(24px)', WebkitBackdropFilter: 'blur(24px)',
                    borderRadius: '32px', border: '1px solid rgba(255,255,255,0.9)',
                    boxShadow: '0 12px 32px rgba(124,58,237,0.03)', padding: '32px', display: 'flex', flexDirection: 'column', gap: '24px'
                  }}>
                    {/* Store Header */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '16px', paddingBottom: '20px', borderBottom: '1px solid rgba(0,0,0,0.05)' }}>
                      <label style={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }}>
                        <input type="checkbox" checked={isStoreSelected} onChange={() => handleSelectStore(storeId, group.items)} 
                          style={{ width: '22px', height: '22px', borderRadius: '6px', cursor: 'pointer' }} className="text-purple-600 focus:ring-purple-500" />
                      </label>
                      <h3 style={{ fontWeight: 900, fontSize: '18px', color: '#111827', display: 'flex', alignItems: 'center', gap: '8px', margin: 0 }}>
                        <Store size={20} color="#8B5CF6" /> {group.storeName}
                      </h3>
                    </div>

                    {/* Items */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                      {group.items.map((item: any) => {
                        const img = item.product?.images?.find((i: any) => i.is_primary)?.image_url ?? item.product?.images?.[0]?.image_url;
                        const isSelected = selectedItems.includes(item.id);
                        
                        return (
                          <div key={item.id} style={{ display: 'flex', gap: '20px', alignItems: 'flex-start' }} className="group/item">
                            {/* Checkbox */}
                            <div style={{ paddingTop: '32px' }}>
                              <input type="checkbox" checked={isSelected} onChange={() => handleSelectItem(item.id)} 
                                style={{ width: '22px', height: '22px', borderRadius: '6px', cursor: 'pointer' }} className="text-purple-600 focus:ring-purple-500" />
                            </div>
                            
                            {/* Product Image */}
                            <Link href={`/products/${item.product_id}`} style={{ flexShrink: 0 }}>
                              <div style={{ width: '100px', height: '100px', borderRadius: '24px', background: 'rgba(255,255,255,0.5)', border: '1px solid rgba(255,255,255,0.8)', overflow: 'hidden', position: 'relative' }} className="group-hover/item:shadow-md transition-shadow">
                                {img ? <img src={img} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} className="group-hover/item:scale-105 transition-transform duration-500" /> : <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '32px' }}>📦</div>}
                              </div>
                            </Link>

                            {/* Info */}
                            <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', paddingTop: '4px' }}>
                              <Link href={`/products/${item.product_id}`}>
                                <h4 style={{ fontWeight: 800, fontSize: '16px', color: '#111827', lineHeight: 1.4, margin: '0 0 8px 0' }} className="line-clamp-2 hover:text-purple-600 transition-colors">{item.product?.title}</h4>
                              </Link>
                              <p style={{ fontSize: '18px', fontWeight: 900, background: 'linear-gradient(135deg, #7C3AED, #DB2777)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', margin: 'auto 0 0 0' }}>{formatPrice(item.product?.price ?? 0)}</p>
                            </div>

                            {/* Actions */}
                            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', justifyContent: 'space-between', height: '100px', paddingTop: '4px' }}>
                              <button onClick={() => removeItem(item.id)} style={{ width: '36px', height: '36px', borderRadius: '12px', background: 'rgba(255,255,255,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid rgba(0,0,0,0.05)', cursor: 'pointer', transition: 'all 0.2s' }} className="text-slate-400 hover:text-rose-500 hover:bg-rose-50">
                                <Trash2 size={16} />
                              </button>
                              
                              <div style={{ display: 'flex', alignItems: 'center', gap: '4px', background: 'rgba(255,255,255,0.8)', border: '1px solid rgba(0,0,0,0.05)', borderRadius: '12px', padding: '4px' }}>
                                <button onClick={() => updateQty(item.id, item.quantity - 1, item.product?.stock)} style={{ width: '28px', height: '28px', borderRadius: '8px', background: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 900, fontSize: '14px', color: '#374151', cursor: 'pointer' }} className="hover:bg-slate-100"><Minus size={14} /></button>
                                <span style={{ width: '32px', textAlign: 'center', fontSize: '14px', fontWeight: 900, color: '#111827' }}>{item.quantity}</span>
                                <button onClick={() => updateQty(item.id, item.quantity + 1, item.product?.stock)} style={{ width: '28px', height: '28px', borderRadius: '8px', background: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 900, fontSize: '14px', color: '#374151', cursor: 'pointer' }} className="hover:bg-slate-100"><Plus size={14} /></button>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Order Summary (Sticky) */}
            <div className="lg:col-span-4 sticky top-28 h-fit">
              <div style={{
                background: 'rgba(255,255,255,0.85)', backdropFilter: 'blur(24px)', WebkitBackdropFilter: 'blur(24px)',
                borderRadius: '32px', border: '1px solid rgba(255,255,255,0.9)',
                boxShadow: '0 12px 32px rgba(124,58,237,0.06), 0 4px 12px rgba(0,0,0,0.02)',
                padding: '32px', display: 'flex', flexDirection: 'column', gap: '24px'
              }}>
                <h2 style={{ fontSize: '20px', fontWeight: 900, color: '#111827', margin: 0, display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: '#D1FAE5', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '16px' }}>🧾</div>
                  Ringkasan Pesanan
                </h2>
                
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: '14px', fontWeight: 600, color: '#6B7280' }}>Subtotal ({selectedItems.length} item)</span>
                    <span style={{ fontSize: '15px', fontWeight: 800, color: '#111827' }}>{formatPrice(subtotal)}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: '14px', fontWeight: 600, color: '#6B7280' }}>Ongkos Kirim</span>
                    <span style={{ fontSize: '12px', fontWeight: 800, color: '#10B981', background: '#D1FAE5', padding: '4px 10px', borderRadius: '8px' }}>Dihitung saat checkout</span>
                  </div>
                </div>
                
                <div style={{ paddingTop: '20px', borderTop: '2px dashed rgba(0,0,0,0.06)', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
                  <span style={{ fontSize: '16px', fontWeight: 900, color: '#111827' }}>Total</span>
                  <span style={{ fontSize: '28px', fontWeight: 900, background: 'linear-gradient(135deg, #7C3AED, #DB2777)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', lineHeight: 1 }}>{formatPrice(subtotal)}</span>
                </div>
                
                <button
                  onClick={() => {
                    if (selectedItems.length === 0) { toast.error('Pilih barang yang mau dicheckout!'); return; }
                    router.push(`/checkout?items=${selectedItems.join(',')}`);
                  }}
                  disabled={selectedItems.length === 0}
                  style={{
                    width: '100%', padding: '18px', background: 'linear-gradient(135deg, #111827, #374151)', color: 'white', border: 'none',
                    borderRadius: '20px', fontWeight: 900, fontSize: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', cursor: 'pointer', boxShadow: '0 10px 25px rgba(0,0,0,0.15)', transition: 'transform 0.2s', marginTop: '8px'
                  }}
                  className="hover:-translate-y-1 disabled:opacity-50 disabled:hover:translate-y-0"
                >
                  Checkout Sekarang <ArrowRight size={20} />
                </button>
                
                <Link href="/" style={{ display: 'block', textAlign: 'center', fontSize: '14px', fontWeight: 800, color: '#6B7280', textDecoration: 'none', transition: 'color 0.2s' }} className="hover:text-purple-600">
                  ← Lanjut Belanja
                </Link>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
