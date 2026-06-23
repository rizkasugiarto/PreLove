'use client';
import { useEffect, useState, useRef } from 'react';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';
import { formatPrice, CONDITIONS } from '@/lib/utils';
import {
  Search, ShoppingBag, Heart, Bell, Store, Star, ChevronRight,
  Flame, Shield, Zap, TrendingUp, ArrowRight, Users, Award,
} from 'lucide-react';

/* ── Static Data ──────────────────────────────────────── */
const CATEGORIES = [
  { label: 'Fashion', emoji: '👗', color: '#8B5CF6', bg: 'linear-gradient(135deg,#EDE9FE,#DDD6FE)' },
  { label: 'Gadget',  emoji: '📱', color: '#3B82F6', bg: 'linear-gradient(135deg,#DBEAFE,#BFDBFE)' },
  { label: 'Buku',    emoji: '📚', color: '#F59E0B', bg: 'linear-gradient(135deg,#FEF3C7,#FDE68A)' },
  { label: 'Tas',     emoji: '👜', color: '#EC4899', bg: 'linear-gradient(135deg,#FCE7F3,#FBCFE8)' },
  { label: 'Sepatu',  emoji: '👟', color: '#EF4444', bg: 'linear-gradient(135deg,#FEE2E2,#FECACA)' },
  { label: 'Olahraga',emoji: '⚽', color: '#10B981', bg: 'linear-gradient(135deg,#D1FAE5,#A7F3D0)' },
  { label: 'Beauty',  emoji: '💄', color: '#F43F5E', bg: 'linear-gradient(135deg,#FFE4E6,#FECDD3)' },
  { label: 'Furnitur',emoji: '🪑', color: '#6366F1', bg: 'linear-gradient(135deg,#E0E7FF,#C7D2FE)' },
  { label: 'Mainan',  emoji: '🧸', color: '#D97706', bg: 'linear-gradient(135deg,#FEF3C7,#FCD34D)' },
  { label: 'Lainnya', emoji: '✨', color: '#7C3AED', bg: 'linear-gradient(135deg,#F3E8FF,#EDE9FE)' },
];

const FEATURES = [
  { icon: <Shield size={28} color="#7C3AED" />, iconBg: 'linear-gradient(135deg,#EDE9FE,#DDD6FE)', title: 'Transaksi 100% Aman', desc: 'Sistem escrow & verifikasi identitas penjual aktif setiap saat.' },
  { icon: <Zap size={28} color="#3B82F6" />, iconBg: 'linear-gradient(135deg,#DBEAFE,#BFDBFE)', title: 'Pengiriman Kilat', desc: 'Terintegrasi JNE, SiCepat, AnterAja, dan layanan COD kampus.' },
  { icon: <Heart size={28} color="#EC4899" fill="#EC4899" />, iconBg: 'linear-gradient(135deg,#FCE7F3,#FBCFE8)', title: 'Barang Berkualitas', desc: 'Setiap produk diverifikasi kondisinya oleh komunitas kami.' },
  { icon: <TrendingUp size={28} color="#10B981" />, iconBg: 'linear-gradient(135deg,#D1FAE5,#A7F3D0)', title: 'Harga Terbaik', desc: 'Nego langsung & temukan penawaran terbaik dari sesama mahasiswa.' },
];

const STATS = [
  { emoji: '🎓', value: 12400, suffix: '+', label: 'Mahasiswa Aktif' },
  { emoji: '📦', value: 8500, suffix: '+', label: 'Produk Terjual' },
  { emoji: '🏪', value: 1200, suffix: '+', label: 'Toko Terdaftar' },
  { emoji: '⭐', value: 98, suffix: '%', label: 'Kepuasan Pembeli' },
];

/* ── Animated Counter ─────────────────────────────────── */
function Counter({ value, suffix }: { value: number; suffix: string }) {
  const [count, setCount] = useState(0);
  const ref = useRef<HTMLSpanElement>(null);
  useEffect(() => {
    const obs = new IntersectionObserver(([e]) => {
      if (e.isIntersecting) {
        let start = 0;
        const step = value / 60;
        const t = setInterval(() => {
          start += step;
          if (start >= value) { setCount(value); clearInterval(t); }
          else setCount(Math.floor(start));
        }, 16);
        obs.disconnect();
      }
    }, { threshold: 0.5 });
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, [value]);
  return <span ref={ref}>{count.toLocaleString('id-ID')}{suffix}</span>;
}

/* ── Main Page ────────────────────────────────────────── */
export default function HomePage() {
  const [products, setProducts] = useState<any[]>([]);
  const [flashProducts, setFlashProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [time, setTime] = useState({ h: 5, m: 47, s: 33 });

  useEffect(() => {
    const t = setInterval(() => setTime(p => {
      if (p.s > 0) return { ...p, s: p.s - 1 };
      if (p.m > 0) return { ...p, m: p.m - 1, s: 59 };
      if (p.h > 0) return { h: p.h - 1, m: 59, s: 59 };
      return p;
    }), 1000);
    return () => clearInterval(t);
  }, []);

  useEffect(() => { fetchProducts(); fetchFlashProducts(); }, [activeCategory]);

  const fetchProducts = async () => {
    setLoading(true);
    let q = supabase
      .from('products')
      .select('*, store:stores(name,slug,rating), images:product_images(*), category:categories(name,slug)')
      .eq('is_active', true).gt('stock', 0)
      .order('created_at', { ascending: false }).limit(10);
    if (activeCategory) {
      const { data: cat } = await supabase.from('categories').select('id').eq('name', activeCategory).single();
      if (cat) q = q.eq('category_id', cat.id);
    }
    const { data } = await q;
    setProducts(data ?? []);
    setLoading(false);
  };

  const fetchFlashProducts = async () => {
    const { data } = await supabase
      .from('products')
      .select('*, store:stores(name), images:product_images(*)')
      .eq('is_active', true).gt('stock', 0)
      .not('original_price', 'is', null)
      .order('created_at', { ascending: false }).limit(6);
    setFlashProducts(data ?? []);
  };

  const fmt = (n: number) => n.toString().padStart(2, '0');

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)', fontFamily: 'var(--font-sans)' }}>

      {/* ═══════════════ HERO ═══════════════ */}
      <section className="pl-hero">
        <div className="pl-orb pl-orb-1" />
        <div className="pl-orb pl-orb-2" />
        <div className="pl-orb pl-orb-3" />

        <div className="pl-container">
          <div className="pl-hero-inner">

            {/* LEFT: Text content */}
            <div className="pl-hero-left">
              <div className="pl-hero-badge animate-fade-in">
                <span>✨</span>
                <span>Platform Preloved Mahasiswa #1</span>
              </div>

              <h1 className="pl-hero-title animate-slide-up stagger-1">
                Temukan Barang{' '}
                <span className="pl-hero-highlight">Preloved</span>
                <span className="pl-hero-sub-title"> Impianmu</span>
              </h1>

              <p className="pl-hero-desc animate-slide-up stagger-2">
                Beli dan jual barang bekas berkualitas dari sesama mahasiswa. Aman, terjangkau, dan ramah lingkungan.
              </p>

              <div className="pl-hero-cta animate-slide-up stagger-3">
                <Link href="/search" className="pl-btn-hero-primary">
                  <ShoppingBag size={18} /> Mulai Belanja
                </Link>
                <Link href="/seller/open-store" className="pl-btn-hero-secondary">
                  Buka Toko Gratis <ArrowRight size={16} />
                </Link>
              </div>

              <div className="pl-hero-trust animate-fade-in stagger-4">
                {['✅ 12.400+ Pengguna', '🛡️ 100% Aman', '⚡ Pengiriman Cepat', '💜 Ramah Mahasiswa'].map(t => (
                  <span key={t} className="pl-trust-chip">{t}</span>
                ))}
              </div>
            </div>

            {/* RIGHT: Floating illustration */}
            <div className="pl-hero-right">
              <div className="pl-hero-illustration">
                <div className="pl-illustration-ring pl-ring-1" />
                <div className="pl-illustration-ring pl-ring-2" />
                <div className="pl-hero-center-icon">🛍️</div>

                {/* Floating cards */}
                <div className="pl-float-card pl-fc-1">
                  <span className="pl-fc-emoji">👗</span>
                  <div><div className="pl-fc-name">Dress Vintage</div><div className="pl-fc-price">Rp 85.000</div></div>
                </div>
                <div className="pl-float-card pl-fc-2">
                  <span className="pl-fc-emoji">📱</span>
                  <div><div className="pl-fc-name">iPhone 12</div><div className="pl-fc-price">Rp 4.500.000</div></div>
                </div>
                <div className="pl-float-card pl-fc-3">
                  <span className="pl-fc-emoji">👟</span>
                  <div><div className="pl-fc-name">Nike Air Max</div><div className="pl-fc-price">Rp 350.000</div></div>
                </div>

                <div className="pl-float-badge">
                  <span>🔥</span>
                  <div><div className="pl-fb-title">Flash Sale!</div><div className="pl-fb-sub">Hemat s/d 70%</div></div>
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* ═══════════════ CATEGORIES ═══════════════ */}
      <section className="pl-section">
        <div className="pl-container">
          <div className="pl-section-head">
            <div>
              <h2 className="pl-section-title">🗂️ Kategori Pilihan</h2>
              <p className="pl-section-sub">Temukan barang incaranmu di sini</p>
            </div>
            <Link href="/search" className="pl-see-all">
              Lihat Semua <ChevronRight size={14} />
            </Link>
          </div>

          <div className="pl-cat-grid">
            {CATEGORIES.map((cat) => (
              <button
                key={cat.label}
                onClick={() => setActiveCategory(activeCategory === cat.label ? null : cat.label)}
                className={`pl-cat-card${activeCategory === cat.label ? ' pl-cat-active' : ''}`}
              >
                <div className="pl-cat-icon" style={{ background: cat.bg }}>
                  <span className="pl-cat-emoji">{cat.emoji}</span>
                </div>
                <span className="pl-cat-label" style={{ color: activeCategory === cat.label ? cat.color : undefined }}>
                  {cat.label}
                </span>
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════ FLASH SALE ═══════════════ */}
      <section className="pl-section pl-section-white" style={{ padding: '0 0 80px' }}>
        <div className="pl-container">
          <div className="pl-flash-wrap">
            <div className="pl-flash-header">
              <div className="pl-flash-left">
                <span className="pl-flash-badge"><Flame size={14} fill="white" color="white" /> FLASH SALE</span>
                <div className="pl-flash-timer">
                  <span className="pl-ft-label">Berakhir dalam:</span>
                  <div className="pl-ft-group">
                    <span className="pl-ft-box">{fmt(time.h)}</span>
                    <span className="pl-ft-sep">:</span>
                    <span className="pl-ft-box">{fmt(time.m)}</span>
                    <span className="pl-ft-sep">:</span>
                    <span className="pl-ft-box">{fmt(time.s)}</span>
                  </div>
                </div>
              </div>
              <Link href="/search" className="pl-see-all-white">Lihat Semua <ChevronRight size={14} /></Link>
            </div>

            <div className="pl-flash-body">
              {flashProducts.length === 0 ? (
                <div className="pl-flash-empty">
                  <span style={{ fontSize: '40px' }}>✨</span>
                  <p style={{ color: 'rgba(255,255,255,0.7)', fontWeight: 700 }}>Promo sedang disiapkan!</p>
                </div>
              ) : (
                flashProducts.map(product => {
                  const img = product.images?.find((i: any) => i.is_primary)?.image_url ?? product.images?.[0]?.image_url;
                  const disc = product.original_price ? Math.round((1 - product.price / product.original_price) * 100) : 0;
                  return (
                    <Link key={product.id} href={`/products/${product.id}`} className="pl-flash-card">
                      <div className="pl-flash-img-wrap">
                        {img
                          ? <img src={img} alt={product.title} className="pl-flash-img" />
                          : <div className="pl-flash-img-ph">📦</div>
                        }
                        {disc > 0 && <span className="pl-disc-badge">-{disc}%</span>}
                      </div>
                      <div className="pl-flash-name">{product.title}</div>
                      <div className="pl-flash-price">{formatPrice(product.price)}</div>
                      {product.original_price && <div className="pl-flash-orig">{formatPrice(product.original_price)}</div>}
                      <div className="pl-flash-bar"><div className="pl-flash-bar-fill" style={{ width: '65%' }} /></div>
                    </Link>
                  );
                })
              )}
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════════ MAIN PRODUCTS GRID ═══════════════ */}
      <section className="pl-section">
        <div className="pl-container">
          <div className="pl-section-head">
            <div>
              <h2 className="pl-section-title">
                {activeCategory ? `📦 Koleksi ${activeCategory}` : '🌟 Rekomendasi Terbaru'}
              </h2>
              <p className="pl-section-sub">Penemuan terbaik hari ini untukmu</p>
            </div>
            <Link href="/search" className="pl-see-all">
              Eksplor Semua <ChevronRight size={14} />
            </Link>
          </div>

          {loading ? (
            <div className="pl-product-grid">
              {[...Array(10)].map((_, i) => (
                <div key={i} className="pl-product-skeleton">
                  <div className="pl-skel-img-big" />
                  <div className="pl-skel-content">
                    <div className="pl-skel-line" />
                    <div className="pl-skel-line pl-skel-short" />
                    <div className="pl-skel-price" />
                  </div>
                </div>
              ))}
            </div>
          ) : products.length === 0 ? (
            <div className="pl-empty-state">
              <div className="pl-empty-icon">🔍</div>
              <h3 className="pl-empty-title">Belum ada produk</h3>
              <p className="pl-empty-sub">Jadilah yang pertama berjualan di kategori ini!</p>
              <Link href="/seller/open-store" className="pl-btn-primary">
                <Store size={18} /> Buka Toko Sekarang
              </Link>
            </div>
          ) : (
            <div className="pl-product-grid">
              {products.map(product => <ProductCard key={product.id} product={product} />)}
            </div>
          )}
        </div>
      </section>

      {/* ═══════════════ FEATURES ═══════════════ */}
      <section className="pl-section pl-section-gradient">
        <div className="pl-container">
          <div className="pl-section-head pl-section-head-center">
            <div>
              <h2 className="pl-section-title" style={{ justifyContent: 'center' }}>💎 Kenapa Pilih PreLove?</h2>
              <p className="pl-section-sub">Marketplace pilihan mahasiswa nomor 1 di Indonesia</p>
            </div>
          </div>

          <div className="pl-features-grid">
            {FEATURES.map((f, i) => (
              <div key={i} className="pl-feature-card">
                <div className="pl-feature-icon" style={{ background: f.iconBg }}>
                  {f.icon}
                </div>
                <h3 className="pl-feature-title">{f.title}</h3>
                <p className="pl-feature-desc">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════ STATS ═══════════════ */}
      <section className="pl-section pl-section-dark">
        <div className="pl-container">
          <div className="pl-stats-grid">
            {STATS.map((s, i) => (
              <div key={i} className="pl-stat-item">
                <div className="pl-stat-emoji">{s.emoji}</div>
                <div className="pl-stat-value"><Counter value={s.value} suffix={s.suffix} /></div>
                <div className="pl-stat-label">{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════ COMMUNITY CTA ═══════════════ */}
      <section className="pl-section pl-section-gradient">
        <div className="pl-container">
          <div className="pl-community-wrap">
            <div className="pl-comm-bg-orb pl-comm-orb-1" />
            <div className="pl-comm-bg-orb pl-comm-orb-2" />
            <div className="pl-comm-content">
              <div className="pl-comm-badge"><Users size={14} /> Komunitas PreLove</div>
              <h2 className="pl-comm-title">Bergabung Bersama<br />12.000+ Mahasiswa</h2>
              <p className="pl-comm-sub">
                Ubah barang bekasmu menjadi uang saku tambahan. Temukan harta karun dengan harga miring. Mari bersama wujudkan kampus ramah lingkungan!
              </p>
              <div className="pl-comm-cta">
                <Link href="/auth/register" className="pl-btn-white">
                  <Award size={18} /> Daftar Gratis Sekarang
                </Link>
                <Link href="/seller/open-store" className="pl-btn-outline-white">
                  Buka Toko Pertamamu <ArrowRight size={16} />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

    </div>
  );
}

/* ── Product Card Component ────────────────────────── */
function ProductCard({ product }: { product: any }) {
  const img = product.images?.find((i: any) => i.is_primary)?.image_url ?? product.images?.[0]?.image_url;
  const cond = CONDITIONS[product.condition];

  return (
    <Link href={`/products/${product.id}`} className="pl-product-card">
      <div className="pl-product-img-wrap">
        {img
          ? <img src={img} alt={product.title} className="pl-product-img" />
          : <div className="pl-product-img-ph">📦</div>
        }
        {product.original_price && (
          <span className="pl-product-disc">
            -{Math.round((1 - product.price / product.original_price) * 100)}%
          </span>
        )}
        {cond && (
          <span className="pl-product-cond" style={{
            background: cond.color === 'green' ? 'rgba(16,185,129,0.15)' :
              cond.color === 'blue' ? 'rgba(59,130,246,0.15)' : 'rgba(245,158,11,0.15)',
            color: cond.color === 'green' ? '#059669' :
              cond.color === 'blue' ? '#2563EB' : '#D97706',
          }}>
            {cond.label}
          </span>
        )}

      </div>
      <div className="pl-product-info">
        <div className="pl-product-store">
          <Store size={10} />
          <span>{product.store?.name ?? 'Toko'}</span>
        </div>
        <h3 className="pl-product-title">{product.title}</h3>
        <div className="pl-product-footer">
          <div>
            <div className="pl-product-price">{formatPrice(product.price)}</div>
            {product.original_price && (
              <div className="pl-product-orig">{formatPrice(product.original_price)}</div>
            )}
          </div>
          {product.store?.rating && (
            <div className="pl-product-rating">
              <Star size={10} className="star-filled" fill="#FBBF24" color="#FBBF24" />
              {product.store.rating.toFixed(1)}
            </div>
          )}
        </div>
      </div>
    </Link>
  );
}
