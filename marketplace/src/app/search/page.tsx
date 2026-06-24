'use client';

import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { formatPrice, CONDITIONS } from '@/lib/utils';
import { Search, Star, Store, SlidersHorizontal, ChevronDown, X, Package } from 'lucide-react';
import Link from 'next/link';

const BG = 'radial-gradient(ellipse at top left, #EDE9FE 0%, #F5F3FF 40%, #EFF6FF 100%)';

const glass = {
  background: 'rgba(255,255,255,0.82)',
  backdropFilter: 'blur(24px)',
  WebkitBackdropFilter: 'blur(24px)',
  border: '1px solid rgba(255,255,255,0.9)',
  borderRadius: '24px',
  boxShadow: '0 8px 32px rgba(124,58,237,0.06)',
} as React.CSSProperties;

export default function SearchPage() {
  const searchParams = useSearchParams();
  const query = searchParams.get('q') || '';

  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [categories, setCategories] = useState<any[]>([]);
  const [filters, setFilters] = useState({ category: '', condition: '', minPrice: '', maxPrice: '' });

  useEffect(() => { fetchCategories(); }, []);
  useEffect(() => { fetchResults(); }, [query, filters]);

  const fetchCategories = async () => {
    const { data } = await supabase.from('categories').select('*').order('sort_order');
    setCategories(data ?? []);
  };

  const fetchResults = async () => {
    setLoading(true);
    if (query) {
      const { data: rpcData, error: rpcError } = await supabase.rpc('search_products', {
        search_query: query,
        category_filter: filters.category || null,
        condition_filter: filters.condition || null,
        min_price: filters.minPrice ? parseInt(filters.minPrice) : null,
        max_price: filters.maxPrice ? parseInt(filters.maxPrice) : null,
      });
      if (!rpcError && rpcData) {
        setProducts(rpcData.map((p: any) => ({
          ...p,
          store: { id: p.store_id, name: p.store_name, is_verified: p.store_is_verified },
          images: [{ image_url: p.image_url, is_primary: true }],
        })));
        setLoading(false);
        return;
      }
    }
    let q = supabase
      .from('products')
      .select('*, store:stores(name,slug,rating,is_verified), images:product_images(*), category:categories(name,slug)')
      .eq('is_active', true).gt('stock', 0);
    if (query) q = q.ilike('title', `%${query}%`);
    if (filters.category) q = q.eq('category_id', filters.category);
    if (filters.condition) q = q.eq('condition', filters.condition);
    if (filters.minPrice) q = q.gte('price', parseInt(filters.minPrice));
    if (filters.maxPrice) q = q.lte('price', parseInt(filters.maxPrice));
    const { data } = await q.order('created_at', { ascending: false });
    setProducts(data ?? []);
    setLoading(false);
  };

  const hasFilter = filters.category || filters.condition || filters.minPrice || filters.maxPrice;
  const resetFilters = () => setFilters({ category: '', condition: '', minPrice: '', maxPrice: '' });

  const selectStyle: React.CSSProperties = {
    width: '100%', appearance: 'none', background: 'rgba(249,250,251,0.8)',
    border: '1.5px solid rgba(139,92,246,0.1)', borderRadius: '14px',
    padding: '10px 36px 10px 14px', fontSize: '14px', fontWeight: 600,
    color: '#374151', outline: 'none', cursor: 'pointer',
    transition: 'all 0.2s',
  };

  const labelStyle: React.CSSProperties = {
    fontSize: '11px', fontWeight: 800, color: '#9CA3AF',
    letterSpacing: '0.08em', textTransform: 'uppercase',
    display: 'block', marginBottom: '8px',
  };

  return (
    <div style={{ minHeight: '100vh', background: BG, paddingTop: '96px', paddingBottom: '80px', position: 'relative' }}>
      {/* Aurora blobs */}
      <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '500px', overflow: 'hidden', pointerEvents: 'none', zIndex: 0 }}>
        <div style={{ position: 'absolute', top: '-20%', left: '-10%', width: '50%', height: '80%', borderRadius: '50%', filter: 'blur(120px)', background: 'rgba(216,180,254,0.35)', mixBlendMode: 'multiply' }} />
        <div style={{ position: 'absolute', top: '10%', right: '-10%', width: '40%', height: '60%', borderRadius: '50%', filter: 'blur(100px)', background: 'rgba(167,243,208,0.3)', mixBlendMode: 'multiply' }} />
      </div>

      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 20px', position: 'relative', zIndex: 10 }}>

        {/* ── Page Header ── */}
        <div style={{ marginBottom: '28px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px', marginBottom: '6px' }}>
            <div style={{
              width: '44px', height: '44px', borderRadius: '14px',
              background: 'linear-gradient(135deg, #7C3AED, #9333EA)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              boxShadow: '0 8px 16px rgba(124,58,237,0.25)',
            }}>
              <Search size={20} color="white" />
            </div>
            <div>
              <h1 style={{ fontSize: '22px', fontWeight: 900, color: '#111827', margin: 0, letterSpacing: '-0.02em' }}>
                {query ? `Hasil: "${query}"` : 'Eksplorasi Produk'}
              </h1>
              <p style={{ fontSize: '13px', color: '#9CA3AF', margin: 0, fontWeight: 500 }}>
                {loading ? 'Mencari...' : `${products.length} barang preloved ditemukan`}
              </p>
            </div>
          </div>

          {/* Active filter chips */}
          {hasFilter && (
            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginTop: '12px' }}>
              {filters.category && categories.find(c => c.id === filters.category) && (
                <span style={{ display: 'flex', alignItems: 'center', gap: '6px', background: 'rgba(124,58,237,0.1)', color: '#7C3AED', padding: '4px 12px', borderRadius: '999px', fontSize: '12px', fontWeight: 700, border: '1px solid rgba(124,58,237,0.15)' }}>
                  {categories.find(c => c.id === filters.category)?.name}
                  <button onClick={() => setFilters(f => ({ ...f, category: '' }))} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0, lineHeight: 1 }}><X size={12} color="#7C3AED" /></button>
                </span>
              )}
              {filters.condition && (
                <span style={{ display: 'flex', alignItems: 'center', gap: '6px', background: 'rgba(124,58,237,0.1)', color: '#7C3AED', padding: '4px 12px', borderRadius: '999px', fontSize: '12px', fontWeight: 700, border: '1px solid rgba(124,58,237,0.15)' }}>
                  {CONDITIONS[filters.condition]?.label}
                  <button onClick={() => setFilters(f => ({ ...f, condition: '' }))} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0, lineHeight: 1 }}><X size={12} color="#7C3AED" /></button>
                </span>
              )}
              <button onClick={resetFilters} style={{ fontSize: '12px', fontWeight: 700, color: '#EF4444', background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.15)', borderRadius: '999px', padding: '4px 12px', cursor: 'pointer' }}>
                Reset Semua
              </button>
            </div>
          )}
        </div>

        <div style={{ display: 'flex', gap: '24px', alignItems: 'flex-start' }}>

          {/* ── Sidebar Filter ── */}
          <div style={{ width: '260px', flexShrink: 0, position: 'sticky', top: '100px' }}>
            <div style={{ ...glass, padding: '24px' }}>
              {/* Header */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px', paddingBottom: '16px', borderBottom: '1px solid rgba(124,58,237,0.08)' }}>
                <div style={{ width: '32px', height: '32px', borderRadius: '10px', background: 'linear-gradient(135deg, #EDE9FE, #F3E8FF)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <SlidersHorizontal size={16} color="#7C3AED" />
                </div>
                <span style={{ fontWeight: 900, fontSize: '15px', color: '#111827' }}>Filter</span>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
                {/* Kategori */}
                <div>
                  <label style={labelStyle}>Kategori</label>
                  <div style={{ position: 'relative' }}>
                    <select value={filters.category} onChange={e => setFilters(f => ({ ...f, category: e.target.value }))} style={selectStyle}>
                      <option value="">Semua Kategori</option>
                      {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                    </select>
                    <ChevronDown size={14} color="#9CA3AF" style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }} />
                  </div>
                </div>

                {/* Kondisi */}
                <div>
                  <label style={labelStyle}>Kondisi Barang</label>
                  <div style={{ position: 'relative' }}>
                    <select value={filters.condition} onChange={e => setFilters(f => ({ ...f, condition: e.target.value }))} style={selectStyle}>
                      <option value="">Semua Kondisi</option>
                      {Object.entries(CONDITIONS).map(([key, val]) => (
                        <option key={key} value={key}>{val.label}</option>
                      ))}
                    </select>
                    <ChevronDown size={14} color="#9CA3AF" style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }} />
                  </div>
                </div>

                {/* Harga */}
                <div>
                  <label style={labelStyle}>Harga (Rp)</label>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <input type="number" placeholder="Min" value={filters.minPrice}
                      onChange={e => setFilters(f => ({ ...f, minPrice: e.target.value }))}
                      style={{ ...selectStyle, width: '100%', padding: '10px 12px' }} />
                    <span style={{ color: '#D1D5DB', fontWeight: 700, flexShrink: 0 }}>—</span>
                    <input type="number" placeholder="Max" value={filters.maxPrice}
                      onChange={e => setFilters(f => ({ ...f, maxPrice: e.target.value }))}
                      style={{ ...selectStyle, width: '100%', padding: '10px 12px' }} />
                  </div>
                </div>

                {/* Reset */}
                {hasFilter && (
                  <button onClick={resetFilters} style={{
                    width: '100%', padding: '10px', borderRadius: '14px',
                    background: 'rgba(239,68,68,0.06)', border: '1px solid rgba(239,68,68,0.15)',
                    color: '#EF4444', fontSize: '13px', fontWeight: 800, cursor: 'pointer',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px',
                    transition: 'all 0.2s',
                  }}>
                    <X size={14} /> Reset Filter
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* ── Results ── */}
          <div style={{ flex: 1, minWidth: 0 }}>
            {loading ? (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: '16px' }}>
                {[...Array(8)].map((_, i) => (
                  <div key={i} style={{ ...glass, overflow: 'hidden', padding: 0 }}>
                    <div style={{ height: '180px', background: 'rgba(229,231,235,0.6)', animation: 'pulse 1.5s ease-in-out infinite' }} />
                    <div style={{ padding: '14px' }}>
                      <div style={{ height: '12px', background: 'rgba(229,231,235,0.8)', borderRadius: '6px', marginBottom: '8px', animation: 'pulse 1.5s ease-in-out infinite' }} />
                      <div style={{ height: '12px', width: '60%', background: 'rgba(229,231,235,0.8)', borderRadius: '6px', animation: 'pulse 1.5s ease-in-out infinite' }} />
                    </div>
                  </div>
                ))}
              </div>
            ) : products.length === 0 ? (
              <div style={{ ...glass, padding: '64px 32px', textAlign: 'center' }}>
                <div style={{
                  width: '80px', height: '80px', borderRadius: '24px',
                  background: 'linear-gradient(135deg, #EDE9FE, #F3E8FF)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  margin: '0 auto 20px',
                  boxShadow: '0 8px 24px rgba(124,58,237,0.12)',
                }}>
                  <Package size={36} color="#8B5CF6" />
                </div>
                <h3 style={{ fontSize: '20px', fontWeight: 900, color: '#111827', margin: '0 0 8px' }}>
                  Barang tidak ditemukan
                </h3>
                <p style={{ fontSize: '14px', color: '#9CA3AF', margin: '0 0 24px', lineHeight: 1.6 }}>
                  Coba ubah filter atau kata kunci pencarian kamu.
                </p>
                {hasFilter && (
                  <button onClick={resetFilters} style={{
                    padding: '12px 28px', background: 'linear-gradient(135deg, #7C3AED, #9333EA)',
                    color: 'white', fontWeight: 800, fontSize: '14px', border: 'none',
                    borderRadius: '14px', cursor: 'pointer', marginBottom: '32px',
                    boxShadow: '0 8px 20px rgba(124,58,237,0.3)',
                  }}>
                    Reset Filter
                  </button>
                )}

                {/* Rekomendasi */}
                <div style={{ ...glass, padding: '20px', textAlign: 'left', background: 'rgba(237,233,254,0.5)' }}>
                  <p style={{ fontSize: '13px', fontWeight: 800, color: '#7C3AED', margin: '0 0 12px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    💡 Coba cari dengan kata lain:
                  </p>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                    {['Baju', 'Sepatu', 'Tas', 'Hijab', 'Gadget', 'Buku'].map(tag => (
                      <Link key={tag} href={`/search?q=${tag}`} style={{
                        padding: '6px 14px', background: 'white',
                        borderRadius: '999px', fontSize: '13px', fontWeight: 700,
                        color: '#7C3AED', border: '1px solid rgba(124,58,237,0.15)',
                        textDecoration: 'none', transition: 'all 0.2s',
                      }}>
                        {tag}
                      </Link>
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: '16px' }}>
                {products.map(product => {
                  const img = product.images?.find((i: any) => i.is_primary)?.image_url ?? product.images?.[0]?.image_url;
                  const cond = CONDITIONS[product.condition];
                  return (
                    <Link key={product.id} href={`/products/${product.id}`} style={{ textDecoration: 'none' }}>
                      <div style={{
                        ...glass, overflow: 'hidden', padding: 0,
                        transition: 'all 0.25s ease', cursor: 'pointer',
                      }}
                        onMouseEnter={e => {
                          (e.currentTarget as HTMLElement).style.transform = 'translateY(-4px)';
                          (e.currentTarget as HTMLElement).style.boxShadow = '0 16px 40px rgba(124,58,237,0.14)';
                        }}
                        onMouseLeave={e => {
                          (e.currentTarget as HTMLElement).style.transform = 'none';
                          (e.currentTarget as HTMLElement).style.boxShadow = '0 8px 32px rgba(124,58,237,0.06)';
                        }}
                      >
                        {/* Image */}
                        <div style={{ position: 'relative', aspectRatio: '1/1', overflow: 'hidden', background: '#F9FAFB' }}>
                          {img
                            ? <img src={img} alt={product.title} style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block', transition: 'transform 0.4s ease' }} />
                            : <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '36px' }}>📦</div>
                          }
                          {/* Condition badge */}
                          {cond && (
                            <span style={{
                              position: 'absolute', top: '8px', left: '8px',
                              background: cond.color === 'green' ? 'rgba(16,185,129,0.9)'
                                : cond.color === 'blue' ? 'rgba(59,130,246,0.9)' : 'rgba(245,158,11,0.9)',
                              color: 'white', fontSize: '10px', fontWeight: 800,
                              padding: '3px 8px', borderRadius: '6px',
                              backdropFilter: 'blur(8px)',
                            }}>
                              {cond.label}
                            </span>
                          )}
                        </div>

                        {/* Info */}
                        <div style={{ padding: '12px 14px 14px' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '4px', marginBottom: '4px' }}>
                            <Store size={10} color="#9CA3AF" />
                            <span style={{ fontSize: '11px', color: '#9CA3AF', fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                              {product.store?.name ?? 'Toko'}
                            </span>
                            {product.store?.is_verified && (
                              <div style={{ width: '12px', height: '12px', borderRadius: '50%', background: '#3B82F6', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                                <svg width="7" height="7" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3"><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
                              </div>
                            )}
                          </div>
                          <h3 style={{ fontSize: '13px', fontWeight: 700, color: '#1F2937', margin: '0 0 8px', lineHeight: 1.4, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                            {product.title}
                          </h3>
                          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                            <span style={{ fontSize: '14px', fontWeight: 900, background: 'linear-gradient(135deg,#7C3AED,#DB2777)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                              {formatPrice(product.price)}
                            </span>
                            {product.rating > 0 && (
                              <div style={{ display: 'flex', alignItems: 'center', gap: '3px' }}>
                                <Star size={10} fill="#FBBF24" color="#FBBF24" />
                                <span style={{ fontSize: '11px', fontWeight: 700, color: '#6B7280' }}>{product.rating.toFixed(1)}</span>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </Link>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
