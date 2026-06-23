'use client';

import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { formatPrice, CONDITIONS } from '@/lib/utils';
import { Search, Star, Filter, Heart, Store, SlidersHorizontal, ChevronDown } from 'lucide-react';
import Link from 'next/link';

export default function SearchPage() {
  const searchParams = useSearchParams();
  const query = searchParams.get('q') || '';
  
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [categories, setCategories] = useState<any[]>([]);
  const [filters, setFilters] = useState({
    category: '',
    condition: '',
    minPrice: '',
    maxPrice: '',
  });

  useEffect(() => {
    fetchCategories();
  }, []);

  useEffect(() => {
    fetchResults();
  }, [query, filters]);

  const fetchCategories = async () => {
    const { data } = await supabase.from('categories').select('*').order('sort_order');
    setCategories(data ?? []);
  };

  const fetchResults = async () => {
    setLoading(true);

    if (query) {
      // 1. Try Smart Search (FTS RPC) First
      const { data: rpcData, error: rpcError } = await supabase.rpc('search_products', {
        search_query: query,
        category_filter: filters.category || null,
        condition_filter: filters.condition || null,
        min_price: filters.minPrice ? parseInt(filters.minPrice) : null,
        max_price: filters.maxPrice ? parseInt(filters.maxPrice) : null
      });

      if (!rpcError && rpcData) {
        const formattedData = rpcData.map((p: any) => ({
          ...p,
          store: { id: p.store_id, name: p.store_name, is_verified: p.store_is_verified },
          images: [{ image_url: p.image_url, is_primary: true }]
        }));
        setProducts(formattedData);
        setLoading(false);
        return;
      }
    }

    // 2. Fallback to basic search if RPC fails or query is empty
    let q = supabase
      .from('products')
      .select('*, store:stores(name,slug,rating,is_verified), images:product_images(*), category:categories(name,slug)')
      .eq('is_active', true)
      .gt('stock', 0);

    if (query) q = q.ilike('title', `%${query}%`);
    if (filters.category) q = q.eq('category_id', filters.category);
    if (filters.condition) q = q.eq('condition', filters.condition);
    if (filters.minPrice) q = q.gte('price', parseInt(filters.minPrice));
    if (filters.maxPrice) q = q.lte('price', parseInt(filters.maxPrice));

    const { data } = await q.order('created_at', { ascending: false });
    setProducts(data ?? []);
    setLoading(false);
  };

  return (
    <div className="pl-root">
      {/* Header Area */}
      <div style={{ background: 'white', borderBottom: '1px solid #EDE9FE', padding: '32px 0 24px' }}>
        <div className="pl-container flex items-end justify-between gap-4 flex-wrap">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <div style={{ width: '40px', height: '40px', borderRadius: '12px', background: '#F5F3FF', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#7C3AED' }}>
                <Search className="w-5 h-5" />
              </div>
              <h1 className="text-2xl font-black text-indigo-950">
                {query ? `Hasil pencarian: "${query}"` : 'Eksplorasi Produk'}
              </h1>
            </div>
            <p className="text-sm font-medium" style={{ color: '#8B83B8' }}>
              Menampilkan {products.length} barang preloved terbaik
            </p>
          </div>
        </div>
      </div>

      <div className="pl-container py-8">
        <div className="flex flex-col md:flex-row gap-8">
          {/* Sidebar Filters */}
          <div className="w-full md:w-[320px] flex-shrink-0">
            <div className="sticky top-24 bg-white/70 backdrop-blur-xl rounded-3xl p-6 border border-white/60 shadow-[0_8px_32px_rgba(139,92,246,0.06)]">
              <div className="flex items-center gap-3 font-black text-lg border-b border-violet-100/50 pb-4 mb-6 text-[#1E1B4B]">
                <div className="w-8 h-8 rounded-full bg-violet-100 flex items-center justify-center text-violet-600">
                  <SlidersHorizontal className="w-4 h-4" />
                </div>
                Filter Pencarian
              </div>
              
              <div className="space-y-6">
                {/* Kategori - Dropdown */}
                <div>
                  <label className="font-bold text-[12px] uppercase tracking-wider text-[#8B83B8] block mb-3">Kategori</label>
                  <div className="relative">
                    <select
                      value={filters.category}
                      onChange={e => setFilters(f => ({ ...f, category: e.target.value }))}
                      className="w-full appearance-none bg-[#FAFAFF] border border-[#E8E5F0] text-[#1E1B4B] text-[13px] font-bold rounded-xl px-4 py-3 focus:outline-none focus:border-violet-500 focus:bg-white transition-all shadow-sm cursor-pointer"
                    >
                      <option value="">Semua Kategori</option>
                      {categories.map(c => (
                        <option key={c.id} value={c.id}>{c.name}</option>
                      ))}
                    </select>
                    <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#8B83B8] pointer-events-none" />
                  </div>
                </div>

                {/* Kondisi - Dropdown */}
                <div>
                  <label className="font-bold text-[12px] uppercase tracking-wider text-[#8B83B8] block mb-3">Kondisi Barang</label>
                  <div className="relative">
                    <select
                      value={filters.condition}
                      onChange={e => setFilters(f => ({ ...f, condition: e.target.value }))}
                      className="w-full appearance-none bg-[#FAFAFF] border border-[#E8E5F0] text-[#1E1B4B] text-[13px] font-bold rounded-xl px-4 py-3 focus:outline-none focus:border-indigo-500 focus:bg-white transition-all shadow-sm cursor-pointer"
                    >
                      <option value="">Semua Kondisi</option>
                      {Object.entries(CONDITIONS).map(([key, val]) => (
                        <option key={key} value={key}>{val.label.split(' ').slice(1).join(' ')}</option>
                      ))}
                    </select>
                    <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#8B83B8] pointer-events-none" />
                  </div>
                </div>

                {/* Harga */}
                <div>
                  <label className="font-bold text-[12px] uppercase tracking-wider text-[#8B83B8] block mb-3">Harga (Rp)</label>
                  <div className="flex items-center gap-2">
                    <input 
                      type="number" 
                      placeholder="Min" 
                      value={filters.minPrice} 
                      onChange={e => setFilters(f => ({ ...f, minPrice: e.target.value }))} 
                      className="w-full bg-[#FAFAFF] border border-[#E8E5F0] text-[#1E1B4B] text-[13px] font-bold rounded-xl px-4 py-3 focus:outline-none focus:border-violet-500 focus:bg-white transition-all shadow-sm"
                    />
                    <span className="text-[#8B83B8] font-bold">-</span>
                    <input 
                      type="number" 
                      placeholder="Max" 
                      value={filters.maxPrice} 
                      onChange={e => setFilters(f => ({ ...f, maxPrice: e.target.value }))} 
                      className="w-full bg-[#FAFAFF] border border-[#E8E5F0] text-[#1E1B4B] text-[13px] font-bold rounded-xl px-4 py-3 focus:outline-none focus:border-violet-500 focus:bg-white transition-all shadow-sm"
                    />
                  </div>
                </div>

                {/* Reset Button */}
                {(filters.category || filters.condition || filters.minPrice || filters.maxPrice) && (
                  <button
                    onClick={() => setFilters({ category: '', condition: '', minPrice: '', maxPrice: '' })}
                    className="w-full py-3 mt-2 bg-white border border-[#E8E5F0] text-[#8B83B8] hover:text-violet-600 hover:border-violet-200 hover:bg-violet-50 text-[13px] font-bold rounded-xl transition-all"
                  >
                    Reset Filter
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Results Grid */}
          <div className="flex-1">
            {loading ? (
              <div className="pl-product-grid">
                {[...Array(8)].map((_, i) => (
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
              <div className="pl-empty-state w-full">
                <div className="pl-empty-icon text-7xl mb-4 inline-block">🔍</div>
                <h3 className="pl-empty-title text-xl font-black mb-2 text-indigo-950">Oops, barang tidak ditemukan</h3>
                <p className="pl-empty-sub text-gray-500 mb-6">Coba ubah filter atau kata kunci pencarian kamu.</p>
                <button onClick={() => setFilters({ category: '', condition: '', minPrice: '', maxPrice: '' })} className="pl-btn-primary mb-10">
                  Reset Filter
                </button>
                
                {/* Rekomendasi Cerdas */}
                <div className="text-left p-6 bg-purple-50 rounded-3xl border border-purple-100 max-w-lg mx-auto">
                  <h4 className="font-black text-lg text-slate-900 mb-2 flex items-center gap-2">💡 Rekomendasi Cerdas AI</h4>
                  <p className="text-sm text-slate-600 font-medium mb-4 leading-relaxed">Sistem Smart Search kami tidak menemukan kecocokan yang persis dengan pencarianmu. Coba gunakan kata kunci yang lebih umum.</p>
                  <div className="flex flex-wrap gap-2">
                    {['Baju', 'Sepatu', 'Tas', 'Hijab'].map(tag => (
                      <Link key={tag} href={`/search?q=${tag}`} className="px-4 py-2 bg-white rounded-xl text-sm font-bold text-purple-600 border border-purple-100 hover:border-purple-300 transition-colors shadow-sm">
                        Cari "{tag}"
                      </Link>
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              <div className="pl-product-grid">
                {products.map(product => {
                  const img = product.images?.find((i: any) => i.is_primary)?.image_url ?? product.images?.[0]?.image_url;
                  const cond = CONDITIONS[product.condition];
                  const disc = product.original_price ? Math.round((1 - product.price / product.original_price) * 100) : null;
                  return (
                    <Link key={product.id} href={`/products/${product.id}`} className="pl-product-card group">
                      <div className="pl-product-img-wrap">
                        {img
                          ? <img src={img} alt={product.title} className="pl-product-img group-hover:scale-105 transition-transform duration-500" />
                          : <div className="pl-product-img-ph">📦</div>}
                        {disc && <span className="pl-product-disc">-{disc}%</span>}
                        <span className={`pl-product-cond ${cond?.color ?? 'bg-gray-100 text-gray-600'}`}>
                          {cond?.label?.split(' ').slice(1).join(' ') ?? product.condition}
                        </span>

                      </div>
                      <div className="pl-product-info">
                        <div className="pl-product-store flex items-center gap-1.5">
                          <Store className="w-3 h-3" />
                          <span>{product.store?.name ?? 'Toko'}</span>
                          {product.store?.is_verified && (
                            <div className="w-3.5 h-3.5 rounded-full bg-blue-500 flex items-center justify-center" title="Verified Seller">
                              <svg className="w-2 h-2 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                              </svg>
                            </div>
                          )}
                        </div>
                        <h3 className="pl-product-title">{product.title}</h3>
                        <div className="pl-product-footer">
                          <div>
                            <p className="pl-product-price">{formatPrice(product.price)}</p>
                            {product.original_price && <p className="pl-product-orig">{formatPrice(product.original_price)}</p>}
                          </div>
                          {product.rating > 0 && (
                            <div className="pl-product-rating">
                              <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                              <span>{product.rating.toFixed(1)}</span>
                            </div>
                          )}
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
