'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/context/AuthContext';
import { formatPrice, CONDITIONS, formatRelativeTime } from '@/lib/utils';
import toast from 'react-hot-toast';
import { ShoppingCart, MessageCircle, Star, Store, ChevronLeft, ChevronRight, Shield, Package } from 'lucide-react';

export default function ProductDetailPage() {
  const { id } = useParams();
  const { user } = useAuth();
  const router = useRouter();
  const [product, setProduct] = useState<any>(null);
  const [reviews, setReviews] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeImg, setActiveImg] = useState(0);
  const [qty, setQty] = useState(1);
  const [addingCart, setAddingCart] = useState(false);

  useEffect(() => {
    if (id) { fetchProduct(); fetchReviews(); }
  }, [id]);

  const fetchProduct = async () => {
    const { data } = await supabase
      .from('products')
      .select('*, store:stores(*, owner:profiles(full_name)), images:product_images(*), category:categories(name)')
      .eq('id', id)
      .single();
    setProduct(data);
    setLoading(false);
  };

  const fetchReviews = async () => {
    const { data } = await supabase
      .from('reviews')
      .select('*, reviewer:profiles(full_name, avatar_url)')
      .eq('product_id', id)
      .order('created_at', { ascending: false })
      .limit(5);
    setReviews(data ?? []);
  };

  const handleAddToCart = async () => {
    if (!user) { toast.error('Login dulu untuk belanja!'); router.push('/auth/login'); return; }
    setAddingCart(true);
    try {
      const { data: existing } = await supabase.from('cart_items').select('id, quantity').eq('user_id', user.id).eq('product_id', id!).maybeSingle();
      if (existing) {
        await supabase.from('cart_items').update({ quantity: existing.quantity + qty }).eq('id', existing.id);
      } else {
        await supabase.from('cart_items').insert({ user_id: user.id, product_id: id, quantity: qty });
      }
      toast.success('Berhasil ditambah ke keranjang! 🛒');
    } catch { toast.error('Gagal menambah ke keranjang'); }
    finally { setAddingCart(false); }
  };

  const handleBuyNow = async () => {
    await handleAddToCart();
    router.push('/cart');
  };

  const handleChat = async () => {
    if (!user) { router.push('/auth/login'); return; }
    router.push(`/chat?storeId=${product.store_id}&productId=${id}`);
  };

  if (loading) return (
    <div className="max-w-6xl mx-auto px-4 py-10">
      <div className="animate-pulse grid grid-cols-1 md:grid-cols-2 gap-10">
        <div className="aspect-square bg-gray-200 rounded-3xl" />
        <div className="space-y-4">
          <div className="h-8 bg-gray-200 rounded-xl w-3/4" />
          <div className="h-6 bg-gray-200 rounded-xl w-1/2" />
          <div className="h-10 bg-gray-200 rounded-xl w-1/3" />
        </div>
      </div>
    </div>
  );

  if (!product) return <div className="text-center py-20 text-gray-500">Produk tidak ditemukan</div>;

  const images = product.images ?? [];
  const cond = CONDITIONS[product.condition];

  return (
    <div className="min-h-screen bg-[#F8F7FF] pt-32 pb-32 relative selection:bg-purple-200">
      {/* Background Aurora Blob */}
      <div className="absolute top-0 inset-x-0 h-[400px] bg-aurora opacity-30 pointer-events-none" />
      <div className="absolute top-0 inset-x-0 h-[400px] bg-gradient-to-b from-transparent to-[#F8F7FF] pointer-events-none" />

      <div className="max-w-[1200px] mx-auto px-4 lg:px-8 relative z-10">
        <button onClick={() => router.back()} className="flex items-center gap-2 text-slate-500 hover:text-purple-600 mb-8 font-bold text-sm transition-colors w-fit bg-white/50 backdrop-blur-md px-4 py-2 rounded-xl border border-white shadow-sm">
          <ChevronLeft className="w-5 h-5" /> Kembali
        </button>

        {/* TOP SECTION: Images & Info */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 mb-8">
          
          {/* Images Card */}
          <div className="lg:col-span-5 bento-card bg-white p-4 border border-slate-100 shadow-[0_8px_30px_rgba(0,0,0,0.04)] h-fit">
            <div className="aspect-square rounded-[1.5rem] overflow-hidden bg-slate-50 border border-slate-100 relative group">
              {images.length > 0 ? (
                <img src={images[activeImg]?.image_url} alt={product.title} className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-500" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-8xl">📦</div>
              )}
            </div>
            {images.length > 1 && (
              <div className="flex gap-3 overflow-x-auto pt-4 pb-2 px-2 scrollbar-hide">
                {images.map((img: any, idx: number) => (
                  <button key={idx} onClick={() => setActiveImg(idx)}
                    className={`flex-shrink-0 w-20 h-20 rounded-2xl overflow-hidden border-2 transition-all ${activeImg === idx ? 'border-purple-500 shadow-md scale-105' : 'border-transparent opacity-60 hover:opacity-100'}`}>
                    <img src={img.image_url} alt="" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Info Card */}
          <div className="lg:col-span-7 bento-card bg-white p-8 lg:p-10 border border-slate-100 shadow-[0_8px_30px_rgba(0,0,0,0.04)] h-fit space-y-8">
            
            <div className="space-y-4">
              {/* Category & Condition */}
              <div className="flex items-center gap-2 flex-wrap">
                {product.category && <span className="px-3 py-1 rounded-full bg-purple-50 text-purple-700 text-[11px] uppercase tracking-wider font-bold">{product.category.name}</span>}
                <span className={`px-3 py-1 rounded-full text-[11px] uppercase tracking-wider font-bold ${cond?.color}`}>{cond?.label}</span>
              </div>

              <h1 className="text-3xl lg:text-4xl font-black text-slate-900 leading-[1.2] tracking-tight">{product.title}</h1>

              {/* Price */}
              <div className="pt-2">
                <p className="text-4xl lg:text-5xl font-black text-purple-600 tracking-tight">{formatPrice(product.price)}</p>
                {product.original_price && (
                  <div className="flex items-center gap-3 mt-2">
                    <p className="text-slate-400 line-through text-sm font-semibold">{formatPrice(product.original_price)}</p>
                    <span className="bg-rose-100 text-rose-600 text-xs font-black px-2 py-0.5 rounded-lg">
                      -{Math.round((1 - product.price / product.original_price) * 100)}%
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* Rating */}
            {product.rating_avg > 0 && (
              <div className="flex items-center gap-2 bg-amber-50/50 w-fit px-4 py-2 rounded-2xl border border-amber-100">
                <Star className="w-5 h-5 text-amber-500 fill-amber-500" />
                <span className="text-base font-black text-slate-800">{product.rating_avg?.toFixed(1)}</span>
                <span className="text-sm text-slate-500 font-semibold">({product.rating_count} ulasan)</span>
              </div>
            )}

            <hr className="border-slate-100" />

            {/* Stock & Qty */}
            <div className="flex items-center justify-between bg-slate-50 p-4 rounded-2xl border border-slate-100">
              <span className="text-sm text-slate-600 font-bold flex items-center gap-2">
                <Package className="w-5 h-5 text-purple-500" /> Tersisa {product.stock} stok
              </span>
              <div className="flex items-center gap-1 bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
                <button onClick={() => setQty(q => Math.max(1, q - 1))} className="px-4 py-2 hover:bg-slate-100 font-black text-lg transition-colors text-slate-600">-</button>
                <span className="px-4 py-2 font-black text-slate-900 min-w-[48px] text-center">{qty}</span>
                <button onClick={() => setQty(q => Math.min(product.stock, q + 1))} className="px-4 py-2 hover:bg-slate-100 font-black text-lg transition-colors text-slate-600">+</button>
              </div>
            </div>

            {/* CTA Buttons */}
            <div className="flex flex-col gap-4 pt-2">
              <div className="flex gap-4">
                <button onClick={handleAddToCart} disabled={addingCart || product.stock === 0}
                  className="flex-1 py-4 border-2 border-purple-600 text-purple-600 hover:bg-purple-50 font-black rounded-2xl transition-all flex items-center justify-center gap-2 disabled:opacity-50 shadow-sm">
                  <ShoppingCart className="w-5 h-5" /> Keranjang
                </button>
                <button onClick={handleBuyNow} disabled={product.stock === 0}
                  className="flex-1 py-4 bg-slate-900 hover:bg-slate-800 text-white font-black rounded-2xl transition-all shadow-[0_8px_20px_rgba(0,0,0,0.15)] disabled:opacity-50">
                  Beli Sekarang
                </button>
              </div>
              <button onClick={handleChat} className="w-full py-4 bg-purple-50 border border-purple-100 rounded-2xl text-purple-700 hover:bg-purple-100 hover:border-purple-200 font-black transition-all flex items-center justify-center gap-2">
                <MessageCircle className="w-5 h-5" /> Chat Penjual
              </button>
            </div>

            {/* Store Card */}
            <div className="mt-6 bg-gradient-to-r from-slate-50 to-white border border-slate-200 rounded-3xl p-5 flex items-center justify-between group cursor-pointer hover:border-purple-200 transition-colors shadow-sm" onClick={() => router.push(`/store/${product.store?.slug}`)}>
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-2xl bg-white shadow-md border border-slate-100 flex items-center justify-center overflow-hidden flex-shrink-0 group-hover:scale-105 transition-transform">
                  {product.store?.logo_url ? <img src={product.store.logo_url} alt="" className="w-full h-full object-cover" /> : <Store className="w-6 h-6 text-purple-500" />}
                </div>
                <div>
                  <p className="font-black text-lg text-slate-900 group-hover:text-purple-700 transition-colors leading-tight mb-1">{product.store?.name}</p>
                  <p className="text-xs text-slate-500 font-bold uppercase tracking-wider">⭐ {product.store?.rating?.toFixed(1)} <span className="mx-1.5 opacity-50">•</span> {product.store?.total_sales} Terjual</p>
                </div>
              </div>
              <div className="w-10 h-10 rounded-full bg-slate-50 flex items-center justify-center group-hover:bg-purple-50 transition-colors">
                <ChevronRight className="w-5 h-5 text-slate-400 group-hover:text-purple-600" />
              </div>
            </div>

            {/* Safety Info */}
            <div className="flex items-start gap-4 p-5 bg-emerald-50/50 border border-emerald-100 rounded-3xl mt-6">
              <div className="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center flex-shrink-0">
                <Shield className="w-5 h-5 text-emerald-600" />
              </div>
              <p className="text-sm text-emerald-800 font-semibold leading-relaxed pt-1.5">
                Pembayaran manual transfer. Upload bukti transfer setelah checkout, dan penjual akan segera mengkonfirmasi pesananmu.
              </p>
            </div>
          </div>
        </div>

        {/* BOTTOM SECTION: Description & Reviews */}
        <div className="space-y-8">
          {/* Description */}
          {product.description && (
            <div className="bento-card bg-white p-8 lg:p-10 border border-slate-100 shadow-[0_8px_30px_rgba(0,0,0,0.04)]">
              <h2 className="text-2xl font-black text-slate-900 mb-8 flex items-center gap-3">
                <span className="w-10 h-10 rounded-xl bg-purple-50 flex items-center justify-center text-xl">📝</span>
                Deskripsi Produk
              </h2>
              <p className="text-slate-600 leading-loose whitespace-pre-line text-base font-medium">
                {product.description}
              </p>
            </div>
          )}

          {/* Reviews */}
          {reviews.length > 0 && (
            <div className="bento-card bg-white p-8 lg:p-10 border border-slate-100 shadow-[0_8px_30px_rgba(0,0,0,0.04)]">
              <h2 className="text-2xl font-black text-slate-900 mb-8 flex items-center gap-3">
                <span className="w-10 h-10 rounded-xl bg-amber-50 flex items-center justify-center text-xl">⭐</span>
                Ulasan Pembeli
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {reviews.map((r) => (
                  <div key={r.id} className="p-6 bg-slate-50 border border-slate-100 rounded-3xl">
                    <div className="flex gap-4">
                      <div className="w-12 h-12 rounded-2xl bg-purple-100 flex items-center justify-center text-purple-600 font-black text-lg flex-shrink-0">
                        {(r.reviewer?.full_name ?? 'U')[0].toUpperCase()}
                      </div>
                      <div>
                        <div className="flex items-center justify-between mb-1">
                          <p className="font-black text-slate-900">{r.reviewer?.full_name ?? 'Pembeli'}</p>
                          <span className="text-[11px] text-slate-400 font-bold uppercase">{formatRelativeTime(r.created_at)}</span>
                        </div>
                        <div className="flex mb-3">
                          {[...Array(5)].map((_, i) => (
                            <Star key={i} className={`w-3.5 h-3.5 ${i < r.rating ? 'text-amber-400 fill-amber-400' : 'text-slate-200 fill-slate-200'}`} />
                          ))}
                        </div>
                        <p className="text-sm text-slate-600 leading-relaxed font-medium">{r.comment}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
