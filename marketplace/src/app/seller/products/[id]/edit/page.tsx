'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/lib/supabase';
import { CONDITIONS } from '@/lib/utils';
import { ArrowLeft, Save, UploadCloud, X, Loader2 } from 'lucide-react';
import Link from 'next/link';
import toast from 'react-hot-toast';

export default function SellerEditProductPage() {
  const { user, profile, loading } = useAuth();
  const router = useRouter();
  const { id } = useParams<{ id: string }>();

  const [categories, setCategories] = useState<any[]>([]);
  const [form, setForm] = useState({
    title: '',
    description: '',
    price: '',
    original_price: '',
    condition: 'good',
    category_id: '',
    stock: '1',
    weight_gram: '500',
  });
  
  const [existingImages, setExistingImages] = useState<any[]>([]);
  const [saving, setSaving] = useState(false);
  const [fetching, setFetching] = useState(true);

  useEffect(() => {
    if (!loading && !user) router.push('/auth/login');
    if (!loading && user && !profile?.store) router.push('/seller/open-store');
  }, [user, loading, profile]);

  useEffect(() => {
    fetchCategories();
    if (id) fetchProduct();
  }, [id]);

  const fetchCategories = async () => {
    const { data } = await supabase.from('categories').select('*').order('sort_order');
    setCategories(data ?? []);
  };

  const fetchProduct = async () => {
    const { data, error } = await supabase
      .from('products')
      .select('*, images:product_images(*)')
      .eq('id', id)
      .single();
      
    if (error || !data) {
      toast.error('Produk tidak ditemukan');
      router.push('/seller/products');
      return;
    }
    
    // Authorization check
    if (profile?.store?.id !== data.store_id) {
       router.push('/seller/products');
       return;
    }

    setForm({
      title: data.title,
      description: data.description || '',
      price: data.price.toString(),
      original_price: data.original_price ? data.original_price.toString() : '',
      condition: data.condition,
      category_id: data.category_id,
      stock: data.stock.toString(),
      weight_gram: data.weight_gram.toString(),
    });
    
    setExistingImages(data.images?.sort((a: any, b: any) => a.sort_order - b.sort_order) || []);
    setFetching(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !profile?.store) return;

    setSaving(true);
    try {
      const { error: productError } = await supabase.from('products').update({
        title: form.title,
        description: form.description,
        price: parseInt(form.price),
        original_price: form.original_price ? parseInt(form.original_price) : null,
        condition: form.condition,
        category_id: form.category_id,
        stock: parseInt(form.stock),
        weight_gram: parseInt(form.weight_gram),
      }).eq('id', id);

      if (productError) throw productError;

      toast.success('Produk berhasil diperbarui! ✨');
      router.push('/seller/products');
    } catch (err: any) {
      toast.error(err.message ?? 'Terjadi kesalahan saat menyimpan produk');
    } finally {
      setSaving(false);
    }
  };

  if (loading || fetching) return (
     <div className="min-h-screen flex items-center justify-center" style={{ background: 'var(--bg)' }}>
        <div className="w-12 h-12 rounded-full border-4 border-violet-200 border-t-violet-600 animate-spin" />
     </div>
  );

  return (
    <div className="min-h-screen" style={{ background: 'var(--bg)' }}>
      <div className="max-w-3xl mx-auto py-8 px-4">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <Link href="/seller/products" className="p-2 rounded-xl hover:bg-white border border-transparent hover:border-gray-200 transition-all">
            <ArrowLeft className="w-5 h-5 text-gray-600" />
          </Link>
          <div>
            <h1 className="section-title">Edit Produk</h1>
            <p className="text-sm" style={{ color: 'var(--text-muted)' }}>Perbarui informasi produk jualanmu</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
           {/* Photos Display (Read-only for simplicity in this demo, real app would allow add/remove) */}
          <div className="card p-6">
            <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
              <UploadCloud className="w-5 h-5 text-violet-600" /> Foto Produk 
            </h3>
            
            <div className="flex flex-wrap gap-4">
              {existingImages.map((img, i) => (
                <div key={i} className="relative w-28 h-28 rounded-xl border border-gray-200 overflow-hidden">
                  <img src={img.image_url} alt="" className="w-full h-full object-cover" />
                  {i === 0 && (
                    <div className="absolute bottom-0 inset-x-0 bg-violet-600 text-white text-[10px] font-bold text-center py-0.5">
                      Utama
                    </div>
                  )}
                </div>
              ))}
            </div>
            <p className="text-xs text-gray-400 mt-3">*Untuk mengganti foto produk, silahkan hapus produk dan buat baru (untuk versi demo ini).</p>
          </div>

          {/* Info */}
          <div className="card p-6 space-y-5">
            <h3 className="font-bold text-lg mb-2">Informasi Produk</h3>
            
            <div>
              <label className="block text-sm font-bold mb-2">Nama Produk <span className="text-red-500">*</span></label>
              <input
                type="text"
                required
                value={form.title}
                onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
                className="input-field"
              />
            </div>

            <div>
              <label className="block text-sm font-bold mb-2">Kategori <span className="text-red-500">*</span></label>
              <select
                required
                value={form.category_id}
                onChange={e => setForm(f => ({ ...f, category_id: e.target.value }))}
                className="input-field bg-white"
              >
                {categories.map(c => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-bold mb-2">Kondisi Barang <span className="text-red-500">*</span></label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {Object.entries(CONDITIONS).map(([key, val]) => (
                  <label key={key} className={`
                    border-2 rounded-xl p-3 text-center cursor-pointer transition-all
                    ${form.condition === key ? 'border-violet-600 bg-violet-50' : 'border-gray-200 hover:border-violet-300'}
                  `}>
                    <input type="radio" name="condition" value={key} checked={form.condition === key} onChange={e => setForm(f => ({ ...f, condition: e.target.value }))} className="hidden" />
                    <span className="text-sm font-bold block">{val.label.split(' ')[1] || val.label}</span>
                  </label>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-bold mb-2">Deskripsi Produk</label>
              <textarea
                value={form.description}
                onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
                rows={5}
                className="input-field resize-none"
              />
            </div>
          </div>

          {/* Pricing & Stock */}
          <div className="card p-6 space-y-5">
            <h3 className="font-bold text-lg mb-2">Harga & Stok</h3>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div>
                <label className="block text-sm font-bold mb-2">Harga Jual <span className="text-red-500">*</span></label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 font-bold">Rp</span>
                  <input
                    type="number"
                    required
                    min="1000"
                    value={form.price}
                    onChange={e => setForm(f => ({ ...f, price: e.target.value }))}
                    className="input-field pl-12"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-bold mb-2">Harga Beli Awal (Opsional)</label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 font-bold">Rp</span>
                  <input
                    type="number"
                    min="0"
                    value={form.original_price}
                    onChange={e => setForm(f => ({ ...f, original_price: e.target.value }))}
                    className="input-field pl-12"
                  />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div>
                <label className="block text-sm font-bold mb-2">Stok <span className="text-red-500">*</span></label>
                <input
                  type="number"
                  required
                  min="0"
                  value={form.stock}
                  onChange={e => setForm(f => ({ ...f, stock: e.target.value }))}
                  className="input-field"
                />
              </div>
              <div>
                <label className="block text-sm font-bold mb-2">Berat (Gram) <span className="text-red-500">*</span></label>
                <div className="relative">
                  <input
                    type="number"
                    required
                    min="1"
                    value={form.weight_gram}
                    onChange={e => setForm(f => ({ ...f, weight_gram: e.target.value }))}
                    className="input-field pr-12"
                  />
                  <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 font-bold">gr</span>
                </div>
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <Link href="/seller/products" className="btn-secondary">
              Batal
            </Link>
            <button type="submit" disabled={saving} className="btn-primary">
              {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
              {saving ? 'Menyimpan...' : 'Simpan Perubahan'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
