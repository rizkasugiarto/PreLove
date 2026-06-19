'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/lib/supabase';
import { formatPrice } from '@/lib/utils';
import { Heart, ShoppingCart, Trash2, Star } from 'lucide-react';
import Link from 'next/link';
import toast from 'react-hot-toast';

export default function WishlistPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [items, setItems] = useState<any[]>([]);
  const [fetching, setFetching] = useState(true);

  useEffect(() => {
    if (!loading && !user) router.push('/auth/login');
  }, [user, loading]);

  useEffect(() => {
    if (user) fetchWishlist();
  }, [user]);

  const fetchWishlist = async () => {
    const { data } = await supabase
      .from('wishlists')
      .select('*, product:products(*, store:stores(name,slug), images:product_images(*))')
      .eq('user_id', user!.id)
      .order('created_at', { ascending: false });
    setItems(data ?? []);
    setFetching(false);
  };

  const removeFromWishlist = async (wishlistId: string) => {
    await supabase.from('wishlists').delete().eq('id', wishlistId);
    setItems(prev => prev.filter(i => i.id !== wishlistId));
    toast.success('Dihapus dari wishlist');
  };

  const addToCart = async (productId: string) => {
    if (!user) return;
    const { error } = await supabase.from('cart_items').upsert(
      { user_id: user.id, product_id: productId, quantity: 1 },
      { onConflict: 'user_id,product_id' }
    );
    if (error) toast.error('Gagal tambah ke keranjang');
    else toast.success('Ditambahkan ke keranjang! 🛒');
  };

  if (fetching) return (
    <div className="min-h-screen" style={{ background: 'var(--bg)' }}>
      <div className="page-container py-8">
        <div className="h-8 skeleton w-48 mb-6" />
        <div className="products-grid">
          {[...Array(8)].map((_, i) => (
            <div key={i} className="card overflow-hidden">
              <div className="aspect-square skeleton" />
              <div className="p-3 space-y-2">
                <div className="h-3 skeleton w-3/4" />
                <div className="h-4 skeleton w-1/2" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen" style={{ background: 'var(--bg)' }}>
      <div className="page-container py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="section-title flex items-center gap-2">
              <Heart className="w-6 h-6 text-rose-500 fill-rose-500" /> Wishlist Saya
            </h1>
            <p className="text-sm mt-1" style={{ color: 'var(--text-muted)' }}>
              {items.length} produk tersimpan
            </p>
          </div>
        </div>

        {items.length === 0 ? (
          <div className="text-center py-24">
            <div className="w-24 h-24 rounded-full bg-rose-50 flex items-center justify-center mx-auto mb-4">
              <Heart className="w-10 h-10 text-rose-300" />
            </div>
            <h3 className="text-xl font-black mb-2" style={{ color: 'var(--text)' }}>Wishlist masih kosong</h3>
            <p style={{ color: 'var(--text-muted)' }} className="mb-6">Simpan produk yang kamu suka biar gampang dicari nanti!</p>
            <Link href="/" className="btn-primary">Mulai Belanja</Link>
          </div>
        ) : (
          <div className="products-grid">
            {items.map(item => {
              const p = item.product;
              if (!p) return null;
              const img = p.images?.find((i: any) => i.is_primary)?.image_url ?? p.images?.[0]?.image_url;
              const discount = p.original_price ? Math.round((1 - p.price / p.original_price) * 100) : null;
              return (
                <div key={item.id} className="product-card group">
                  {/* Image */}
                  <div className="aspect-square relative overflow-hidden bg-gray-100">
                    <Link href={`/products/${p.id}`}>
                      {img ? (
                        <img src={img} alt={p.title} className="w-full h-full object-cover product-img" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-5xl">📦</div>
                      )}
                    </Link>
                    {discount && (
                      <div className="absolute top-2 left-2 bg-red-500 text-white text-xs font-black px-2 py-0.5 rounded-lg">
                        -{discount}%
                      </div>
                    )}
                    {/* Overlay actions */}
                    <div className="absolute top-2 right-2 flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={() => removeFromWishlist(item.id)}
                        className="w-8 h-8 rounded-full bg-white shadow-lg flex items-center justify-center hover:bg-red-50 transition-colors"
                      >
                        <Trash2 className="w-4 h-4 text-red-500" />
                      </button>
                      <button
                        onClick={() => addToCart(p.id)}
                        className="w-8 h-8 rounded-full bg-white shadow-lg flex items-center justify-center hover:bg-violet-50 transition-colors"
                      >
                        <ShoppingCart className="w-4 h-4 text-violet-600" />
                      </button>
                    </div>
                  </div>

                  {/* Info */}
                  <div className="p-3 space-y-1">
                    <p className="text-xs truncate" style={{ color: 'var(--text-muted)' }}>🏪 {p.store?.name}</p>
                    <Link href={`/products/${p.id}`}>
                      <h3 className="text-sm font-semibold line-clamp-2 leading-snug hover:text-violet-600 transition-colors" style={{ color: 'var(--text)' }}>
                        {p.title}
                      </h3>
                    </Link>
                    <p className="text-base font-black" style={{ color: 'var(--primary)' }}>{formatPrice(p.price)}</p>
                    {p.original_price && (
                      <p className="text-xs line-through" style={{ color: 'var(--text-muted)' }}>{formatPrice(p.original_price)}</p>
                    )}
                    {p.rating > 0 && (
                      <div className="flex items-center gap-1">
                        <Star className="w-3 h-3 star-filled" />
                        <span className="text-xs font-medium" style={{ color: 'var(--text-muted)' }}>{p.rating?.toFixed(1)}</span>
                      </div>
                    )}
                    <button
                      onClick={() => addToCart(p.id)}
                      className="w-full mt-2 py-2 rounded-xl text-xs font-bold text-violet-600 border-2 border-violet-200 hover:bg-violet-600 hover:text-white hover:border-violet-600 transition-all"
                    >
                      + Keranjang
                    </button>
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
