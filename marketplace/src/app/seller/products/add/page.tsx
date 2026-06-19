'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/lib/supabase';
import { CONDITIONS } from '@/lib/utils';
import { ArrowLeft, Save, UploadCloud, X, Loader2 } from 'lucide-react';
import Link from 'next/link';
import toast from 'react-hot-toast';

export default function SellerAddProductPage() {
  const { user, profile, loading } = useAuth();
  const router = useRouter();
  const fileRef = useRef<HTMLInputElement>(null);

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
  
  const [images, setImages] = useState<{file?: File, url: string, isNew: boolean}[]>([]);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!loading && !user) router.push('/auth/login');
    if (!loading && user && !profile?.store) router.push('/seller/open-store');
  }, [user, loading, profile]);

  useEffect(() => {
    const fetchCategories = async () => {
      const { data } = await supabase.from('categories').select('*').order('sort_order');
      setCategories(data ?? []);
      if (data && data.length > 0) {
        setForm(f => ({ ...f, category_id: data[0].id }));
      }
    };
    fetchCategories();
  }, []);

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (images.length + files.length > 5) {
      toast.error('Maksimal 5 gambar diperbolehkan');
      return;
    }
    
    const newImages = files.map(file => ({
      file,
      url: URL.createObjectURL(file),
      isNew: true
    }));
    
    setImages(prev => [...prev, ...newImages]);
  };

  const removeImage = (index: number) => {
    setImages(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !profile?.store) return;
    if (images.length === 0) {
      toast.error('Minimal 1 foto produk diperlukan');
      return;
    }

    setSaving(true);
    try {
      // 1. Insert Product
      const { data: product, error: productError } = await supabase.from('products').insert({
        store_id: profile.store.id,
        title: form.title,
        description: form.description,
        price: parseInt(form.price),
        original_price: form.original_price ? parseInt(form.original_price) : null,
        condition: form.condition,
        category_id: form.category_id,
        stock: parseInt(form.stock),
        weight_gram: parseInt(form.weight_gram),
      }).select().single();

      if (productError) throw productError;

      // 2. Upload Images & Insert to product_images
      for (let i = 0; i < images.length; i++) {
        const img = images[i];
        if (img.file) {
          const ext = img.file.name.split('.').pop();
          const fileName = `${product.id}/${Date.now()}_${i}.${ext}`;
          
          const { error: uploadError } = await supabase.storage
            .from('prelove-public')
            .upload(`products/${fileName}`, img.file);
            
          if (uploadError) throw uploadError;
          
          const { data: { publicUrl } } = supabase.storage
            .from('prelove-public')
            .getPublicUrl(`products/${fileName}`);
            
          await supabase.from('product_images').insert({
            product_id: product.id,
            image_url: publicUrl,
            is_primary: i === 0,
            sort_order: i
          });
        }
      }

      toast.success('Produk berhasil ditambahkan! ✨');
      router.push('/seller/products');
    } catch (err: any) {
      toast.error(err.message ?? 'Terjadi kesalahan saat menyimpan produk');
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  if (loading) return null;

  return (
    <div className="min-h-screen" style={{ background: 'var(--bg)' }}>
      <div className="max-w-3xl mx-auto py-8 px-4">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <Link href="/seller/products" className="p-2 rounded-xl hover:bg-white border border-transparent hover:border-gray-200 transition-all">
            <ArrowLeft className="w-5 h-5 text-gray-600" />
          </Link>
          <div>
            <h1 className="section-title">Tambah Produk</h1>
            <p className="text-sm" style={{ color: 'var(--text-muted)' }}>Jual barang preloved kamu</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Photos */}
          <div className="card p-6">
            <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
              <UploadCloud className="w-5 h-5 text-violet-600" /> Foto Produk <span className="text-red-500">*</span>
            </h3>
            <p className="text-sm text-gray-500 mb-4">Format gambar .jpg .jpeg .png dan ukuran minimum 300 x 300px (Untuk gambar optimal gunakan ukuran minimum 700 x 700 px). Maksimal 5 foto.</p>
            
            <div className="flex flex-wrap gap-4">
              {images.map((img, i) => (
                <div key={i} className="relative w-28 h-28 rounded-xl border border-gray-200 overflow-hidden group">
                  <img src={img.url} alt="" className="w-full h-full object-cover" />
                  <button 
                    type="button"
                    onClick={() => removeImage(i)}
                    className="absolute top-1 right-1 w-6 h-6 bg-white rounded-full flex items-center justify-center shadow-sm opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <X className="w-4 h-4 text-red-500" />
                  </button>
                  {i === 0 && (
                    <div className="absolute bottom-0 inset-x-0 bg-violet-600 text-white text-[10px] font-bold text-center py-0.5">
                      Utama
                    </div>
                  )}
                </div>
              ))}
              
              {images.length < 5 && (
                <button
                  type="button"
                  onClick={() => fileRef.current?.click()}
                  className="w-28 h-28 rounded-xl border-2 border-dashed border-gray-300 flex flex-col items-center justify-center text-gray-400 hover:bg-gray-50 hover:border-violet-300 hover:text-violet-500 transition-colors"
                >
                  <Plus className="w-6 h-6 mb-1" />
                  <span className="text-xs font-semibold">Tambah</span>
                </button>
              )}
              <input ref={fileRef} type="file" accept="image/*" multiple className="hidden" onChange={handleImageSelect} />
            </div>
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
                placeholder="Contoh: Sepatu Sneakers Converse Size 42"
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
                placeholder="Jelaskan kondisi barang secara detail, minus (jika ada), kelengkapan, dll..."
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
                    placeholder="0"
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
                    placeholder="0"
                  />
                </div>
                <p className="text-xs text-gray-400 mt-1">Isi agar pembeli tahu harga aslinya</p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div>
                <label className="block text-sm font-bold mb-2">Stok <span className="text-red-500">*</span></label>
                <input
                  type="number"
                  required
                  min="1"
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
              {saving ? 'Menyimpan...' : 'Simpan & Tampilkan'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
