'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/lib/supabase';
import { formatPrice, CONDITIONS } from '@/lib/utils';
import { Plus, Search, Edit, Trash2, Eye, Package, ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import toast from 'react-hot-toast';

export default function SellerProductsPage() {
  const { user, profile, loading } = useAuth();
  const router = useRouter();
  const [products, setProducts] = useState<any[]>([]);
  const [fetching, setFetching] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    if (!loading && !user) router.push('/auth/login');
    if (!loading && user && !profile?.store) router.push('/seller/open-store');
  }, [user, loading, profile]);

  useEffect(() => {
    if (profile?.store) fetchProducts();
  }, [profile]);

  const fetchProducts = async () => {
    const { data } = await supabase
      .from('products')
      .select('*, images:product_images(*), category:categories(name)')
      .eq('store_id', profile!.store.id)
      .order('created_at', { ascending: false });
    setProducts(data ?? []);
    setFetching(false);
  };

  const toggleStatus = async (id: string, currentStatus: boolean) => {
    const { error } = await supabase.from('products').update({ is_active: !currentStatus }).eq('id', id);
    if (error) {
      toast.error('Gagal ubah status');
    } else {
      toast.success(currentStatus ? 'Produk dinonaktifkan' : 'Produk diaktifkan');
      setProducts(prev => prev.map(p => p.id === id ? { ...p, is_active: !currentStatus } : p));
    }
  };

  const deleteProduct = async (id: string) => {
    if (!confirm('Yakin ingin menghapus produk ini?')) return;
    const { error } = await supabase.from('products').delete().eq('id', id);
    if (error) {
      console.error("Delete product error:", error);
      toast.error(error.message || error.details || 'Gagal menghapus produk');
    } else {
      toast.success('Produk berhasil dihapus');
      setProducts(prev => prev.filter(p => p.id !== id));
    }
  };

  const filtered = products.filter(p => p.title.toLowerCase().includes(search.toLowerCase()));

  if (loading || fetching) return (
    <div className="min-h-screen flex items-center justify-center" style={{ background: 'var(--bg)' }}>
      <div className="w-12 h-12 rounded-full border-4 border-violet-200 border-t-violet-600 animate-spin" />
    </div>
  );

  return (
    <div className="min-h-screen" style={{ background: 'var(--bg)' }}>
      <div className="page-container py-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div className="flex items-center gap-3">
             <Link href="/seller/dashboard" className="p-2 rounded-xl hover:bg-white border border-transparent hover:border-gray-200 transition-all">
                <ArrowLeft className="w-5 h-5 text-gray-600" />
            </Link>
            <div>
              <h1 className="section-title flex items-center gap-2">
                <Package className="w-6 h-6 text-violet-600" /> Produk Saya
              </h1>
              <p className="text-sm mt-1" style={{ color: 'var(--text-muted)' }}>
                Kelola inventaris toko kamu
              </p>
            </div>
          </div>
          <Link href="/seller/products/add" className="btn-primary">
            <Plus className="w-4 h-4" /> Tambah Produk
          </Link>
        </div>

        {/* Toolbar */}
        <div className="card p-4 mb-6 flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Cari produk berdasarkan nama..."
              className="input-field pl-11"
            />
          </div>
        </div>

        {/* Product List */}
        {products.length === 0 ? (
          <div className="text-center py-20 card">
            <div className="w-20 h-20 rounded-full bg-violet-50 flex items-center justify-center mx-auto mb-4">
              <Package className="w-10 h-10 text-violet-300" />
            </div>
            <h3 className="text-xl font-black mb-2" style={{ color: 'var(--text)' }}>Belum Ada Produk</h3>
            <p style={{ color: 'var(--text-muted)' }} className="mb-6">Mulai jual barang preloved pertamamu sekarang!</p>
            <Link href="/seller/products/add" className="btn-primary">
              <Plus className="w-4 h-4" /> Tambah Produk Pertama
            </Link>
          </div>
        ) : filtered.length === 0 ? (
           <div className="text-center py-20 card">
               <p style={{ color: 'var(--text-muted)' }}>Produk tidak ditemukan.</p>
           </div>
        ) : (
          <div className="card overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm whitespace-nowrap">
                <thead className="bg-gray-50 border-b border-gray-100">
                  <tr>
                    <th className="px-6 py-4 font-bold text-gray-600">Produk Info</th>
                    <th className="px-6 py-4 font-bold text-gray-600">Harga</th>
                    <th className="px-6 py-4 font-bold text-gray-600">Stok</th>
                    <th className="px-6 py-4 font-bold text-gray-600">Status</th>
                    <th className="px-6 py-4 font-bold text-gray-600 text-right">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {filtered.map(product => {
                    const img = product.images?.find((i: any) => i.is_primary)?.image_url ?? product.images?.[0]?.image_url;
                    return (
                      <tr key={product.id} className="hover:bg-gray-50/50 transition-colors">
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className="w-12 h-12 rounded-xl overflow-hidden bg-gray-100 flex-shrink-0">
                              {img ? (
                                <img src={img} alt={product.title} className="w-full h-full object-cover" />
                              ) : (
                                <div className="w-full h-full flex items-center justify-center">📦</div>
                              )}
                            </div>
                            <div>
                              <p className="font-bold text-gray-900 line-clamp-1">{product.title}</p>
                              <div className="flex items-center gap-2 mt-1">
                                <span className="text-xs text-gray-500">{product.category?.name}</span>
                                <span className="w-1 h-1 rounded-full bg-gray-300" />
                                <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${CONDITIONS[product.condition]?.color}`}>
                                  {CONDITIONS[product.condition]?.label?.split(' ')[0]}
                                </span>
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <p className="font-bold text-violet-600">{formatPrice(product.price)}</p>
                        </td>
                        <td className="px-6 py-4">
                          <span className={`font-medium ${product.stock > 0 ? 'text-gray-900' : 'text-red-500'}`}>
                            {product.stock}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <button
                            onClick={() => toggleStatus(product.id, product.is_active)}
                            className={`badge ${product.is_active ? 'badge-success' : 'badge-danger'} hover:opacity-80 transition-opacity`}
                          >
                            {product.is_active ? 'Aktif' : 'Nonaktif'}
                          </button>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <Link href={`/products/${product.id}`} className="p-2 text-gray-400 hover:text-blue-500 hover:bg-blue-50 rounded-xl transition-colors">
                              <Eye className="w-4 h-4" />
                            </Link>
                            <Link href={`/seller/products/${product.id}/edit`} className="p-2 text-gray-400 hover:text-amber-500 hover:bg-amber-50 rounded-xl transition-colors">
                              <Edit className="w-4 h-4" />
                            </Link>
                            <button onClick={() => deleteProduct(product.id)} className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-colors">
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
