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
    <div className="min-h-screen bg-[#F8F7FF] pt-32 pb-32 relative selection:bg-purple-200">
      {/* Background Aurora */}
      <div className="absolute top-0 inset-x-0 h-[400px] bg-aurora opacity-30 pointer-events-none" />
      <div className="absolute top-0 inset-x-0 h-[400px] bg-gradient-to-b from-transparent to-[#F8F7FF] pointer-events-none" />

      <div className="max-w-[1200px] mx-auto px-4 lg:px-8 relative z-10">
        <h1 className="text-3xl font-black text-slate-900 mb-8 flex items-center gap-3">
          <span className="w-12 h-12 rounded-xl bg-purple-100 flex items-center justify-center text-2xl shadow-inner">🛒</span>
          Keranjang Belanja
        </h1>

        {loading ? (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-4">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="bento-card bg-white p-6 animate-pulse flex gap-4 border border-slate-100 shadow-[0_4px_20px_rgba(0,0,0,0.02)]">
                  <div className="w-24 h-24 bg-slate-100 rounded-2xl flex-shrink-0" />
                  <div className="flex-1 space-y-3 pt-2">
                    <div className="h-4 bg-slate-100 rounded w-3/4" />
                    <div className="h-4 bg-slate-100 rounded w-1/2" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : items.length === 0 ? (
          <div className="bento-card bg-white py-24 px-4 text-center border border-slate-100 shadow-[0_8px_30px_rgba(0,0,0,0.04)]">
            <div className="w-32 h-32 bg-purple-50 rounded-[2rem] flex items-center justify-center text-6xl mx-auto mb-8 animate-bounce-subtle">🛒</div>
            <h2 className="text-3xl font-black text-slate-900 mb-3 tracking-tight">Keranjang Masih Kosong</h2>
            <p className="text-slate-500 mb-8 font-medium max-w-sm mx-auto">Yuk cari barang preloved keren di marketplace untuk memenuhinya!</p>
            <Link href="/" className="inline-flex items-center gap-2 px-8 py-4 bg-purple-600 hover:bg-purple-700 text-white font-black rounded-2xl shadow-[0_8px_20px_rgba(147,51,234,0.25)] transition-all hover:-translate-y-0.5">
              <ShoppingBag className="w-5 h-5" /> Mulai Belanja
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            {/* Cart Items */}
            <div className="lg:col-span-8 space-y-6">
              {Object.entries(groupedItems).map(([storeId, group]: [string, any]) => {
                const storeItemIds = group.items.map((i: any) => i.id);
                const isStoreSelected = storeItemIds.every((id: string) => selectedItems.includes(id));

                return (
                  <div key={storeId} className="bento-card bg-white p-5 lg:p-6 border border-slate-100 shadow-[0_4px_20px_rgba(0,0,0,0.03)] hover:border-purple-200 transition-colors">
                    {/* Store Header */}
                    <div className="flex items-center gap-3 mb-4 pb-3 border-b border-slate-100">
                      <label className="flex items-center cursor-pointer">
                        <input type="checkbox" checked={isStoreSelected} onChange={() => handleSelectStore(storeId, group.items)} 
                          className="w-5 h-5 rounded border-slate-300 text-purple-600 focus:ring-purple-500 cursor-pointer" />
                      </label>
                      <h3 className="font-bold text-slate-900 flex items-center gap-2">
                        <Store className="w-4 h-4 text-purple-500" /> {group.storeName}
                      </h3>
                    </div>

                    {/* Items */}
                    <div className="space-y-4">
                      {group.items.map((item: any) => {
                        const img = item.product?.images?.find((i: any) => i.is_primary)?.image_url ?? item.product?.images?.[0]?.image_url;
                        const isSelected = selectedItems.includes(item.id);
                        
                        return (
                          <div key={item.id} className="flex gap-4 group/item relative">
                            {/* Checkbox */}
                            <div className="flex items-center pt-2 md:pt-4">
                              <input type="checkbox" checked={isSelected} onChange={() => handleSelectItem(item.id)} 
                                className="w-5 h-5 rounded border-slate-300 text-purple-600 focus:ring-purple-500 cursor-pointer" />
                            </div>
                            
                            {/* Product Image */}
                            <Link href={`/products/${item.product_id}`} className="flex-shrink-0">
                              <div className="w-20 h-20 md:w-24 md:h-24 rounded-2xl overflow-hidden bg-slate-50 border border-slate-100 relative group-hover/item:shadow-md transition-shadow">
                                {img ? <img src={img} alt="" className="w-full h-full object-cover group-hover/item:scale-105 transition-transform" /> : <div className="w-full h-full flex items-center justify-center text-2xl">📦</div>}
                              </div>
                            </Link>

                            {/* Info */}
                            <div className="flex-1 min-w-0 flex flex-col py-1">
                              <Link href={`/products/${item.product_id}`}>
                                <h4 className="font-bold text-slate-900 text-[15px] leading-snug line-clamp-2 hover:text-purple-600 transition-colors mb-1">{item.product?.title}</h4>
                              </Link>
                              <p className="text-purple-600 font-black text-base mt-auto">{formatPrice(item.product?.price ?? 0)}</p>
                            </div>

                            {/* Actions */}
                            <div className="flex flex-col items-end justify-between py-1">
                              <button onClick={() => removeItem(item.id)} className="w-8 h-8 rounded-full bg-slate-50 flex items-center justify-center text-slate-400 hover:text-rose-500 hover:bg-rose-50 transition-colors">
                                <Trash2 className="w-4 h-4" />
                              </button>
                              <div className="flex items-center gap-1 bg-slate-50 border border-slate-200 rounded-lg overflow-hidden shadow-sm h-8">
                                <button onClick={() => updateQty(item.id, item.quantity - 1, item.product?.stock)} className="w-8 h-full flex items-center justify-center hover:bg-slate-200 transition-colors text-slate-600 font-black">
                                  <Minus className="w-3 h-3" />
                                </button>
                                <span className="w-6 text-center text-[13px] font-black text-slate-900">{item.quantity}</span>
                                <button onClick={() => updateQty(item.id, item.quantity + 1, item.product?.stock)} className="w-8 h-full flex items-center justify-center hover:bg-slate-200 transition-colors text-slate-600 font-black">
                                  <Plus className="w-3 h-3" />
                                </button>
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

            {/* Order Summary */}
            <div className="lg:col-span-4">
              <div className="bento-card bg-white p-8 border border-slate-100 shadow-[0_8px_30px_rgba(0,0,0,0.04)] sticky top-28">
                <h2 className="font-black text-slate-900 text-xl mb-6 flex items-center gap-2">
                  <span className="w-8 h-8 rounded-lg bg-emerald-50 flex items-center justify-center text-sm">🧾</span>
                  Ringkasan Pesanan
                </h2>
                <div className="space-y-4 mb-6">
                  <div className="flex justify-between text-sm font-medium">
                    <span className="text-slate-500">Subtotal ({selectedItems.length} item)</span>
                    <span className="font-bold text-slate-900">{formatPrice(subtotal)}</span>
                  </div>
                  <div className="flex justify-between text-sm font-medium">
                    <span className="text-slate-500">Ongkos Kirim</span>
                    <span className="font-bold text-emerald-500 bg-emerald-50 px-2 py-0.5 rounded-md">Dihitung saat checkout</span>
                  </div>
                </div>
                <div className="border-t-2 border-dashed border-slate-100 pt-5 mb-6">
                  <div className="flex justify-between items-end">
                    <span className="font-black text-slate-900">Total</span>
                    <span className="font-black text-purple-600 text-2xl leading-none">{formatPrice(subtotal)}</span>
                  </div>
                </div>
                <button
                  onClick={() => {
                    if (selectedItems.length === 0) { toast.error('Pilih barang yang mau dicheckout!'); return; }
                    router.push(`/checkout?items=${selectedItems.join(',')}`);
                  }}
                  disabled={selectedItems.length === 0}
                  className="w-full py-4 bg-slate-900 hover:bg-slate-800 disabled:bg-slate-300 text-white font-black rounded-2xl transition-all shadow-[0_8px_20px_rgba(0,0,0,0.15)] hover:-translate-y-0.5 flex items-center justify-center gap-2"
                >
                  Checkout Sekarang <ArrowRight className="w-5 h-5" />
                </button>
                <Link href="/" className="block text-center text-sm text-slate-500 hover:text-purple-600 mt-5 font-bold transition-colors">
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
