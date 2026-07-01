'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';
import { formatPrice } from '@/lib/utils';
import { Store, Star, Package, ShieldCheck, MapPin, ChevronRight } from 'lucide-react';
import LogoLoader from '@/components/LogoLoader';
import BackButton from '@/components/BackButton';

export default function StorePage() {
  const { slug } = useParams();
  const router = useRouter();
  const [store, setStore] = useState<any>(null);
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (slug) fetchStore();
  }, [slug]);

  const fetchStore = async () => {
    const slugStr = slug as string;
    
    // Cek apakah ini UUID (id langsung)
    const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(slugStr);
    
    let storeData = null;
    
    if (isUUID) {
      // Cari by ID
      const { data } = await supabase.from('stores').select('*, owner:profiles(full_name, avatar_url)').eq('id', slugStr).maybeSingle();
      storeData = data;
    } else {
      // Cari by slug dulu
      const { data: bySlug } = await supabase.from('stores').select('*, owner:profiles(full_name, avatar_url)').eq('slug', slugStr).maybeSingle();
      storeData = bySlug;
      
      if (!storeData) {
        // Fallback: cari by name
        const { data: byName } = await supabase.from('stores').select('*, owner:profiles(full_name, avatar_url)').ilike('name', slugStr).maybeSingle();
        storeData = byName;
      }
    }
    
    if (!storeData) { setLoading(false); return; }
    setStore(storeData);
    fetchProducts(storeData.id);
  };

  const fetchProducts = async (storeId: string) => {
    const { data } = await supabase
      .from('products')
      .select('*, images:product_images(*), category:categories(name)')
      .eq('store_id', storeId)
      .eq('is_active', true)
      .order('created_at', { ascending: false });
    setProducts(data ?? []);
    setLoading(false);
  };

  if (loading) return <LogoLoader text="Memuat Toko..." />;

  if (!store) return (
    <div style={{ minHeight: '100vh', background: 'radial-gradient(ellipse at top left, #EDE9FE 0%, #F5F3FF 40%, #EFF6FF 100%)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '16px' }}>
      <div style={{ fontSize: '80px' }}>🏪</div>
      <h2 style={{ fontSize: '24px', fontWeight: 900, color: '#111827' }}>Toko Tidak Ditemukan</h2>
      <p style={{ color: '#6B7280', fontWeight: 500 }}>Toko yang kamu cari mungkin sudah tidak aktif.</p>
      <button onClick={() => router.push('/')} style={{ padding: '12px 24px', background: '#7C3AED', color: '#fff', border: 'none', borderRadius: '12px', fontWeight: 700, cursor: 'pointer' }}>
        Kembali ke Beranda
      </button>
    </div>
  );

  return (
    <div style={{ minHeight: '100vh', background: 'radial-gradient(ellipse at top left, #EDE9FE 0%, #F5F3FF 40%, #EFF6FF 100%)', color: '#111827', paddingBottom: '80px', paddingTop: '96px' }}>
      {/* Aurora blobs */}
      <div className="absolute top-0 left-0 w-full h-[400px] overflow-hidden pointer-events-none">
        <div className="absolute -top-[20%] -left-[10%] w-[50%] h-[80%] rounded-full blur-[120px] bg-purple-300/40 mix-blend-multiply" />
        <div className="absolute top-[10%] -right-[10%] w-[40%] h-[60%] rounded-full blur-[100px] bg-pink-200/30 mix-blend-multiply" />
      </div>

      <div style={{ maxWidth: '1100px', margin: '0 auto', padding: '0 16px' }} className="relative z-10">
        <BackButton />

        {/* Store Header Card */}
        <div style={{
          background: 'rgba(255,255,255,0.85)', backdropFilter: 'blur(24px)', WebkitBackdropFilter: 'blur(24px)',
          borderRadius: '32px', border: '1px solid rgba(255,255,255,0.9)',
          boxShadow: '0 12px 32px rgba(124,58,237,0.08)',
          padding: '32px', marginBottom: '32px',
          display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '28px',
        }}>
          {/* Store Avatar */}
          <div style={{
            width: '96px', height: '96px', borderRadius: '28px',
            background: 'linear-gradient(135deg, #F3E8FF, #EDE9FE)',
            border: '2px solid rgba(196,181,253,0.5)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            overflow: 'hidden', flexShrink: 0,
            boxShadow: '0 8px 20px rgba(124,58,237,0.12)',
          }}>
            {store.logo_url
              ? <img src={store.logo_url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              : <Store size={40} color="#A78BFA" />
            }
          </div>

          {/* Store Info */}
          <div style={{ flex: 1 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px', flexWrap: 'wrap' }}>
              <h1 style={{ fontSize: '28px', fontWeight: 900, color: '#111827', margin: 0, letterSpacing: '-0.02em' }}>{store.name}</h1>
              {store.is_verified && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '4px', padding: '4px 10px', background: 'linear-gradient(135deg, #DBEAFE, #EFF6FF)', border: '1px solid #BFDBFE', borderRadius: '99px' }}>
                  <ShieldCheck size={13} color="#2563EB" />
                  <span style={{ fontSize: '11px', fontWeight: 800, color: '#2563EB' }}>TERVERIFIKASI</span>
                </div>
              )}
            </div>
            {store.description && (
              <p style={{ fontSize: '14px', color: '#6B7280', fontWeight: 500, margin: '0 0 12px 0', lineHeight: 1.6 }}>{store.description}</p>
            )}
            <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Star size={15} color="#F59E0B" fill="#F59E0B" />
                <span style={{ fontSize: '13px', fontWeight: 800, color: '#111827' }}>{store.rating?.toFixed(1) ?? '0.0'}</span>
                <span style={{ fontSize: '12px', color: '#9CA3AF', fontWeight: 600 }}>Rating</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Package size={15} color="#8B5CF6" />
                <span style={{ fontSize: '13px', fontWeight: 800, color: '#111827' }}>{store.total_sales ?? 0}</span>
                <span style={{ fontSize: '12px', color: '#9CA3AF', fontWeight: 600 }}>Terjual</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Package size={15} color="#10B981" />
                <span style={{ fontSize: '13px', fontWeight: 800, color: '#111827' }}>{products.length}</span>
                <span style={{ fontSize: '12px', color: '#9CA3AF', fontWeight: 600 }}>Produk Aktif</span>
              </div>
            </div>
          </div>
        </div>

        {/* Products Grid */}
        <h2 style={{ fontSize: '20px', fontWeight: 900, color: '#111827', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{ width: '32px', height: '32px', borderRadius: '10px', background: '#F3E8FF', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Package size={16} color="#7C3AED" />
          </div>
          Produk Toko ({products.length})
        </h2>

        {products.length === 0 ? (
          <div style={{
            background: 'rgba(255,255,255,0.7)', backdropFilter: 'blur(24px)', borderRadius: '32px',
            border: '1px solid rgba(255,255,255,0.9)', padding: '64px 24px', textAlign: 'center'
          }}>
            <div style={{ fontSize: '60px', marginBottom: '16px' }}>📦</div>
            <h3 style={{ fontSize: '20px', fontWeight: 800, marginBottom: '8px' }}>Belum Ada Produk</h3>
            <p style={{ color: '#9CA3AF', fontWeight: 500 }}>Toko ini belum memiliki produk aktif.</p>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '20px' }}>
            {products.map((p) => {
              const img = p.images?.find((i: any) => i.is_primary)?.image_url ?? p.images?.[0]?.image_url;
              return (
                <Link key={p.id} href={`/products/${p.id}`} style={{ textDecoration: 'none' }}>
                  <div style={{
                    background: 'rgba(255,255,255,0.85)', backdropFilter: 'blur(20px)',
                    borderRadius: '24px', border: '1px solid rgba(255,255,255,0.9)',
                    boxShadow: '0 4px 20px rgba(124,58,237,0.04)',
                    overflow: 'hidden', transition: 'all 0.2s', cursor: 'pointer',
                  }}
                    className="hover:-translate-y-1 hover:shadow-lg"
                  >
                    <div style={{ height: '200px', background: '#F3F4F6', position: 'relative', overflow: 'hidden' }}>
                      {img
                        ? <img src={img} alt={p.title} style={{ width: '100%', height: '100%', objectFit: 'cover', transition: 'transform 0.5s' }} className="hover:scale-105" />
                        : <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '40px' }}>📦</div>
                      }
                    </div>
                    <div style={{ padding: '16px' }}>
                      <p style={{ fontWeight: 700, fontSize: '14px', color: '#111827', lineHeight: 1.4, margin: '0 0 8px 0', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>{p.title}</p>
                      <p style={{ fontSize: '18px', fontWeight: 900, background: 'linear-gradient(135deg, #7C3AED, #DB2777)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', margin: 0 }}>{formatPrice(p.price)}</p>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
