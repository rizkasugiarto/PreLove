'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/context/AuthContext';
import { formatPrice, CONDITIONS, formatRelativeTime } from '@/lib/utils';
import toast from 'react-hot-toast';
import { ShoppingCart, MessageCircle, Star, Store, ChevronLeft, ChevronRight, Shield, Package, ShieldCheck } from 'lucide-react';
import BackButton from '@/components/BackButton';
import LogoLoader from '@/components/LogoLoader';

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

  if (loading) return <LogoLoader text="Memuat Produk..." />;

  if (!product) return <div className="text-center py-20 text-gray-500">Produk tidak ditemukan</div>;

  const images = product.images ?? [];
  const cond = CONDITIONS[product.condition];

  return (
    <div style={{ minHeight: '100vh', background: 'radial-gradient(ellipse at top left, #EDE9FE 0%, #F5F3FF 40%, #EFF6FF 100%)', color: '#111827', paddingBottom: '128px', paddingTop: '112px' }}>
      {/* Aurora Blobs */}
      <div className="absolute top-0 left-0 w-full h-[500px] overflow-hidden pointer-events-none">
        <div className="absolute -top-[20%] -left-[10%] w-[50%] h-[80%] rounded-full blur-[120px] bg-purple-300/40 mix-blend-multiply" />
        <div className="absolute top-[10%] -right-[10%] w-[40%] h-[60%] rounded-full blur-[100px] bg-emerald-200/40 mix-blend-multiply" />
      </div>

      <div style={{ width: '100%', maxWidth: '1024px', margin: '0 auto' }} className="px-8 lg:px-12 relative z-10">
        <BackButton />

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-16 items-start relative">
          
          {/* LEFT COLUMN: Images, Description, Reviews */}
          <div className="flex flex-col gap-8">
            
            {/* Images Card */}
            <div className="flex flex-col gap-3">
              <div style={{
                background: 'rgba(255,255,255,0.6)', backdropFilter: 'blur(24px)', WebkitBackdropFilter: 'blur(24px)',
                borderRadius: '24px', border: '1px solid rgba(255,255,255,0.8)',
                boxShadow: '0 20px 40px rgba(124,58,237,0.05)', overflow: 'hidden',
                width: '100%',
                aspectRatio: '1 / 1',
                maxHeight: '480px',
                position: 'relative',
              }}>
                {images.length > 0 ? (
                  <img src={images[activeImg]?.image_url} alt={product.title} style={{ width: '100%', height: '100%', objectFit: 'cover', transition: 'transform 0.7s ease', display: 'block' }} className="hover:scale-105" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-8xl">📦</div>
                )}
              </div>
              
              {images.length > 1 && (
                <div style={{ display: 'flex', gap: '10px', overflowX: 'auto', paddingBottom: '4px', paddingLeft: '2px', paddingRight: '2px' }} className="scrollbar-hide">
                  {images.map((img: any, idx: number) => (
                    <button key={idx} onClick={() => setActiveImg(idx)}
                      style={{
                        width: '72px', height: '72px', flexShrink: 0, borderRadius: '16px', overflow: 'hidden',
                        border: activeImg === idx ? '2.5px solid #8B5CF6' : '2.5px solid transparent',
                        boxShadow: activeImg === idx ? '0 4px 12px rgba(139,92,246,0.25)' : '0 2px 8px rgba(0,0,0,0.06)',
                        transition: 'all 0.25s ease', opacity: activeImg === idx ? 1 : 0.6,
                        background: 'none', cursor: 'pointer', padding: 0,
                      }}
                      className="hover:opacity-100">
                      <img src={img.image_url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Description */}
            {product.description && (
              <div style={{
                background: 'rgba(255,255,255,0.7)', backdropFilter: 'blur(24px)', WebkitBackdropFilter: 'blur(24px)',
                borderRadius: '32px', border: '1px solid rgba(255,255,255,0.9)',
                padding: '32px', boxShadow: '0 12px 32px rgba(124,58,237,0.03)'
              }}>
                <h2 style={{ fontSize: '18px', fontWeight: 900, color: '#111827', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: '#F3E8FF', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '18px' }}>📝</div>
                  Deskripsi Produk
                </h2>
                <p style={{ color: '#4B5563', lineHeight: 1.8, fontSize: '14px', fontWeight: 500, whiteSpace: 'pre-line' }}>
                  {product.description}
                </p>
              </div>
            )}

            {/* Reviews */}
            {reviews.length > 0 && (
              <div style={{
                background: 'rgba(255,255,255,0.7)', backdropFilter: 'blur(24px)', WebkitBackdropFilter: 'blur(24px)',
                borderRadius: '32px', border: '1px solid rgba(255,255,255,0.9)',
                padding: '32px', boxShadow: '0 12px 32px rgba(124,58,237,0.03)'
              }}>
                <h2 style={{ fontSize: '18px', fontWeight: 900, color: '#111827', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: '#FEF3C7', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '18px' }}>⭐</div>
                  Ulasan Pembeli
                </h2>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  {reviews.map((r) => (
                    <div key={r.id} style={{ padding: '20px', background: 'rgba(255,255,255,0.6)', borderRadius: '20px', border: '1px solid rgba(255,255,255,0.8)' }}>
                      <div style={{ display: 'flex', gap: '16px' }}>
                        <div style={{ width: '40px', height: '40px', borderRadius: '12px', background: 'linear-gradient(135deg, #E0E7FF, #C7D2FE)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#4338CA', fontWeight: 900, fontSize: '16px', flexShrink: 0 }}>
                          {(r.reviewer?.full_name ?? 'U')[0].toUpperCase()}
                        </div>
                        <div style={{ flex: 1 }}>
                          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '4px' }}>
                            <p style={{ fontWeight: 900, color: '#111827', margin: 0, fontSize: '14px' }}>{r.reviewer?.full_name ?? 'Pembeli'}</p>
                            <span style={{ fontSize: '10px', color: '#9CA3AF', fontWeight: 800, textTransform: 'uppercase' }}>{formatRelativeTime(r.created_at)}</span>
                          </div>
                          <div style={{ display: 'flex', marginBottom: '8px', gap: '2px' }}>
                            {[...Array(5)].map((_, i) => (
                              <Star key={i} size={12} color={i < r.rating ? '#F59E0B' : '#E5E7EB'} fill={i < r.rating ? '#F59E0B' : '#E5E7EB'} />
                            ))}
                          </div>
                          <p style={{ fontSize: '13px', color: '#4B5563', lineHeight: 1.6, fontWeight: 500, margin: 0 }}>{r.comment}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* RIGHT COLUMN: Info Card (Sticky) */}
          <div className="sticky top-28 h-fit">
            <div style={{
              background: 'rgba(255,255,255,0.85)', backdropFilter: 'blur(24px)', WebkitBackdropFilter: 'blur(24px)',
              borderRadius: '32px', border: '1px solid rgba(255,255,255,0.9)',
              boxShadow: '0 12px 32px rgba(124,58,237,0.06), 0 4px 12px rgba(0,0,0,0.02)',
              padding: '32px', display: 'flex', flexDirection: 'column', gap: '24px'
            }}>
              
              {/* Title & Price Area */}
              <div>
                <div className="flex items-center gap-2 flex-wrap mb-4">
                  {product.category && <span style={{ background: 'linear-gradient(135deg, #F3E8FF, #E0E7FF)', color: '#6D28D9', padding: '6px 14px', borderRadius: '999px', fontSize: '11px', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.05em' }}>{product.category.name}</span>}
                  <span className={cond?.color} style={{ padding: '6px 14px', borderRadius: '999px', fontSize: '11px', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.05em' }}>{cond?.label}</span>
                </div>

                <h1 style={{ fontSize: '32px', fontWeight: 900, color: '#111827', lineHeight: 1.2, letterSpacing: '-0.02em', marginBottom: '16px' }}>{product.title}</h1>

                <div className="flex flex-col">
                  <p style={{ fontSize: '42px', fontWeight: 900, background: 'linear-gradient(135deg, #7C3AED, #DB2777)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', letterSpacing: '-0.03em', lineHeight: 1.1 }}>
                    {formatPrice(product.price)}
                  </p>
                  {product.original_price && (
                    <div className="flex items-center gap-3 mt-2">
                      <p style={{ color: '#9CA3AF', textDecoration: 'line-through', fontSize: '15px', fontWeight: 700 }}>{formatPrice(product.original_price)}</p>
                      <span style={{ background: '#FEE2E2', color: '#E11D48', padding: '4px 8px', borderRadius: '8px', fontSize: '11px', fontWeight: 900 }}>
                        -{Math.round((1 - product.price / product.original_price) * 100)}%
                      </span>
                    </div>
                  )}
                </div>
              </div>

              {/* Rating & Stock */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '16px', flexWrap: 'wrap' }}>
                {product.rating_avg > 0 && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', background: 'rgba(254,243,199,0.5)', padding: '10px 16px', borderRadius: '16px', border: '1px solid rgba(253,230,138,0.5)' }}>
                    <Star size={20} color="#F59E0B" fill="#F59E0B" />
                    <span style={{ fontSize: '16px', fontWeight: 900, color: '#1F2937' }}>{product.rating_avg?.toFixed(1)}</span>
                    <span style={{ fontSize: '14px', color: '#6B7280', fontWeight: 600 }}>({product.rating_count} ulasan)</span>
                  </div>
                )}
                
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', background: 'rgba(243,244,246,0.6)', padding: '8px 16px', borderRadius: '16px', border: '1px solid rgba(229,231,235,0.6)' }}>
                  <span style={{ fontSize: '13px', color: '#4B5563', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <Package size={16} color="#8B5CF6" /> Tersisa {product.stock} stok
                  </span>
                  <div style={{ width: '1px', height: '24px', background: '#D1D5DB' }} />
                  <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <button onClick={() => setQty(q => Math.max(1, q - 1))} style={{ width: '28px', height: '28px', borderRadius: '8px', background: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 900, fontSize: '16px', color: '#374151', border: '1px solid #E5E7EB', cursor: 'pointer' }}>-</button>
                    <span style={{ minWidth: '28px', textAlign: 'center', fontWeight: 900, color: '#111827', fontSize: '14px' }}>{qty}</span>
                    <button onClick={() => setQty(q => Math.min(product.stock, q + 1))} style={{ width: '28px', height: '28px', borderRadius: '8px', background: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 900, fontSize: '16px', color: '#374151', border: '1px solid #E5E7EB', cursor: 'pointer' }}>+</button>
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <div style={{ display: 'flex', gap: '12px' }}>
                  <button onClick={handleAddToCart} disabled={addingCart || product.stock === 0}
                    style={{ flex: 1, padding: '16px', borderRadius: '20px', background: 'rgba(139,92,246,0.1)', color: '#7C3AED', border: '2px solid rgba(139,92,246,0.2)', fontWeight: 900, fontSize: '15px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', cursor: 'pointer', transition: 'all 0.2s' }}
                    className="hover:bg-purple-100 hover:border-purple-300 disabled:opacity-50">
                    <ShoppingCart size={18} /> Keranjang
                  </button>
                  <button onClick={handleBuyNow} disabled={product.stock === 0}
                    style={{ flex: 1, padding: '16px', borderRadius: '20px', background: 'linear-gradient(135deg, #111827, #374151)', color: 'white', border: 'none', fontWeight: 900, fontSize: '15px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', boxShadow: '0 10px 25px rgba(0,0,0,0.15)', transition: 'transform 0.2s' }}
                    className="hover:-translate-y-1 disabled:opacity-50">
                    Beli Sekarang
                  </button>
                </div>
                <button onClick={handleChat}
                  style={{ width: '100%', padding: '14px', borderRadius: '20px', background: 'white', color: '#4B5563', border: '1px solid #E5E7EB', fontWeight: 800, fontSize: '14px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', cursor: 'pointer', transition: 'all 0.2s' }}
                  className="hover:bg-gray-50 hover:text-purple-600">
                  <MessageCircle size={18} /> Chat Penjual
                </button>
              </div>

              {/* Store & Safety */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <div onClick={() => router.push(`/store/${product.store?.slug}`)}
                  style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px', background: 'rgba(255,255,255,0.5)', borderRadius: '24px', border: '1px solid rgba(255,255,255,0.8)', cursor: 'pointer', transition: 'all 0.2s' }}
                  className="hover:bg-white hover:shadow-md group">
                  <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                    <div style={{ width: '56px', height: '56px', borderRadius: '18px', background: 'white', border: '1px solid #F3F4F6', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden', boxShadow: '0 4px 12px rgba(0,0,0,0.03)' }}>
                      {product.store?.logo_url ? <img src={product.store.logo_url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : <Store size={24} color="#A855F7" />}
                    </div>
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '2px' }}>
                        <p style={{ fontWeight: 900, fontSize: '16px', color: '#111827', margin: 0 }} className="group-hover:text-purple-600 transition-colors">{product.store?.name}</p>
                        {product.store?.is_verified && (
                          <div style={{ width: '18px', height: '18px', borderRadius: '50%', background: '#3B82F6', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white' }}>
                            <svg width="10" height="10" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
                          </div>
                        )}
                      </div>
                      <p style={{ fontSize: '11px', fontWeight: 800, color: '#6B7280', textTransform: 'uppercase', letterSpacing: '0.05em', margin: 0 }}>
                        ⭐ {product.store?.rating?.toFixed(1)} <span style={{ opacity: 0.5, margin: '0 6px' }}>•</span> {product.store?.total_sales} Terjual
                      </p>
                    </div>
                  </div>
                  <div style={{ width: '36px', height: '36px', borderRadius: '50%', background: '#F3F4F6', display: 'flex', alignItems: 'center', justifyContent: 'center' }} className="group-hover:bg-purple-100 group-hover:text-purple-600 transition-colors">
                    <ChevronRight size={18} />
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '16px', padding: '16px', background: 'rgba(237,233,254,0.4)', borderRadius: '24px', border: '1px solid rgba(221,214,254,0.6)' }}>
                  <div style={{ width: '36px', height: '36px', borderRadius: '50%', background: '#DDD6FE', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <ShieldCheck size={18} color="#6D28D9" />
                  </div>
                  <p style={{ fontSize: '12px', color: '#5B21B6', fontWeight: 600, lineHeight: 1.5, margin: 0, paddingTop: '2px' }}>
                    <span style={{ fontWeight: 900 }}>Transaksi Aman 100%.</span> Dana ditahan oleh sistem Escrow PreLove dan baru diteruskan ke penjual saat barang kamu terima.
                  </p>
                </div>
              </div>

            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
