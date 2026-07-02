'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/lib/supabase';
import { CONDITIONS } from '@/lib/utils';
import { ArrowLeft, Save, UploadCloud, X, Loader2, Info, Box, Tag, FileText, DollarSign, Archive, Weight } from 'lucide-react';
import Link from 'next/link';
import toast from 'react-hot-toast';
import LogoLoader from '@/components/LogoLoader';

export default function SellerEditProductPage() {
  const { user, profile, loading } = useAuth();
  const router = useRouter();
  const { id } = useParams<{ id: string }>();

  const [categories, setCategories] = useState<any[]>([]);
  const [form, setForm] = useState({
    title: '',
    description: '',
    price: '',
    condition: 'good',
    category_id: '',
    stock: '1',
    weight_gram: '500',
  });
  
  const [existingImages, setExistingImages] = useState<any[]>([]);
  const [imagesToDelete, setImagesToDelete] = useState<any[]>([]);
  const [newImageFiles, setNewImageFiles] = useState<File[]>([]);
  const [newImagePreviews, setNewImagePreviews] = useState<string[]>([]);
  const [saving, setSaving] = useState(false);
  const [fetching, setFetching] = useState(true);

  useEffect(() => {
    if (!loading && !user) router.push('/auth/login');
    if (!loading && user && (!profile?.store || (Array.isArray(profile.store) && profile.store.length === 0))) router.push('/seller/open-store');
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
      router.push('/seller/dashboard');
      return;
    }
    
    const storeId = Array.isArray(profile?.store) ? profile.store[0]?.id : profile?.store?.id;
    if (storeId !== data.store_id) {
       router.push('/seller/dashboard');
       return;
    }

    setForm({
      title: data.title,
      description: data.description || '',
      price: data.price.toString(),
      condition: data.condition,
      category_id: data.category_id,
      stock: data.stock.toString(),
      weight_gram: data.weight_gram.toString(),
    });
    
    setExistingImages(data.images?.sort((a: any, b: any) => a.sort_order - b.sort_order) || []);
    setFetching(false);
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;
    
    const currentTotal = existingImages.length + newImageFiles.length;
    if (currentTotal + files.length > 5) {
      toast.error('Maksimal 5 foto produk');
      return;
    }

    setNewImageFiles(prev => [...prev, ...files]);
    const previews = files.map(file => URL.createObjectURL(file));
    setNewImagePreviews(prev => [...prev, ...previews]);
  };

  const removeExistingImage = (index: number) => {
    const imgToRemove = existingImages[index];
    setImagesToDelete(prev => [...prev, imgToRemove]);
    setExistingImages(prev => prev.filter((_, i) => i !== index));
  };

  const removeNewImage = (index: number) => {
    setNewImageFiles(prev => prev.filter((_, i) => i !== index));
    setNewImagePreviews(prev => {
      URL.revokeObjectURL(prev[index]);
      return prev.filter((_, i) => i !== index);
    });
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
        condition: form.condition,
        category_id: form.category_id,
        stock: parseInt(form.stock),
        weight_gram: parseInt(form.weight_gram),
      }).eq('id', id);

      if (productError) throw productError;

      // Handle Image Deletions
      if (imagesToDelete.length > 0) {
        const idsToDelete = imagesToDelete.map(img => img.id);
        await supabase.from('product_images').delete().in('id', idsToDelete);
      }

      // Handle New Image Uploads
      if (newImageFiles.length > 0) {
        const maxSortOrder = existingImages.reduce((max, img) => Math.max(max, img.sort_order || 0), 0);
        
        for (let i = 0; i < newImageFiles.length; i++) {
          const file = newImageFiles[i];
          const fileName = `products/${user.id}_${Date.now()}_${i}`;
          
          const { error: uploadError } = await supabase.storage
            .from('prelove-images')
            .upload(fileName, file, { contentType: file.type });
            
          if (uploadError) throw uploadError;
          
          const { data: urlData } = supabase.storage
            .from('prelove-images')
            .getPublicUrl(fileName);
            
          await supabase.from('product_images').insert({
            product_id: id,
            image_url: urlData.publicUrl,
            is_primary: existingImages.length === 0 && i === 0,
            sort_order: maxSortOrder + i + 1,
          });
        }
      }

      // Ensure there is a primary image
      const { data: finalImages } = await supabase.from('product_images').select('*').eq('product_id', id).order('sort_order');
      if (finalImages && finalImages.length > 0) {
        const hasPrimary = finalImages.some(img => img.is_primary);
        if (!hasPrimary) {
          await supabase.from('product_images').update({ is_primary: true }).eq('id', finalImages[0].id);
        }
      }

      toast.success('Produk berhasil diperbarui! ✨');
      router.push('/seller/dashboard');
    } catch (err: any) {
      toast.error(err.message ?? 'Terjadi kesalahan saat menyimpan produk');
    } finally {
      setSaving(false);
    }
  };

  if (loading || fetching) return <LogoLoader text="Memuat Data Produk..." />;

  // 100% Matching Styles with Open Store Page
  const inputStyle: React.CSSProperties = {
    width: '100%', height: '48px',
    paddingLeft: '46px', paddingRight: '16px',
    borderRadius: '14px',
    border: '1.5px solid #E5E7EB',
    background: '#FAFAFA',
    fontSize: '14px', fontWeight: 500,
    color: '#111827', outline: 'none',
    transition: 'border-color .2s ease, box-shadow .2s ease, background .2s ease',
    fontFamily: 'inherit',
    boxSizing: 'border-box',
  };

  const iconStyle: React.CSSProperties = {
    position: 'absolute', left: '16px', top: '50%',
    transform: 'translateY(-50%)',
    color: '#9CA3AF', pointerEvents: 'none',
    width: '18px', height: '18px',
    transition: 'color .2s',
  };

  const labelStyle: React.CSSProperties = {
    fontSize: '12px', fontWeight: 700,
    color: '#6B7280', letterSpacing: '0.07em',
    textTransform: 'uppercase', display: 'block',
    marginBottom: '6px',
  };

  const onFocus = (e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    e.target.style.borderColor = '#7C3AED';
    e.target.style.background = '#fff';
    e.target.style.boxShadow = '0 0 0 4px rgba(124,58,237,0.08)';
  };
  const onBlur = (e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    e.target.style.borderColor = '#E5E7EB';
    e.target.style.background = '#FAFAFA';
    e.target.style.boxShadow = 'none';
  };

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex', alignItems: 'flex-start', justifyContent: 'center',
      padding: '32px 16px',
      background: 'radial-gradient(ellipse at top left, #EDE9FE 0%, #F5F3FF 40%, #EFF6FF 100%)',
    }}>
      <div style={{ width: '100%', maxWidth: '640px' }}>

        <Link 
          href="/seller/dashboard" 
          style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', color: '#7C3AED', fontWeight: 700, textDecoration: 'none', marginBottom: '24px' }}
        >
          <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 2px 8px rgba(0,0,0,0.05)' }}>
            <ArrowLeft size={18} />
          </div>
          Kembali ke Dashboard
        </Link>

        {/* Card */}
        <div style={{
          background: 'rgba(255,255,255,0.88)',
          backdropFilter: 'blur(24px)',
          WebkitBackdropFilter: 'blur(24px)',
          borderRadius: '24px',
          border: '1px solid rgba(255,255,255,0.9)',
          boxShadow: '0 32px 64px rgba(124,58,237,0.10), 0 8px 24px rgba(0,0,0,0.04)',
          overflow: 'hidden',
        }}>
          {/* Top gradient bar */}
          <div style={{ height: '4px', background: 'linear-gradient(90deg, #7C3AED, #A855F7, #EC4899)' }} />

          <div style={{ padding: '36px 36px 32px' }}>
            {/* Header */}
            <div style={{ textAlign: 'center', marginBottom: '32px' }}>
              <div style={{
                width: '72px', height: '72px', borderRadius: '50%',
                background: 'linear-gradient(135deg, #EDE9FE, #F3E8FF)',
                border: '2px dashed #C4B5FD',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                margin: '0 auto 16px',
              }}>
                <Box size={24} color="#A78BFA" />
              </div>
              <h1 style={{ fontSize: '22px', fontWeight: 900, color: '#111827', margin: 0, letterSpacing: '-0.02em' }}>
                Edit Produk
              </h1>
              <p style={{ fontSize: '14px', color: '#9CA3AF', marginTop: '6px' }}>
                Perbarui informasi barang preloved Anda
              </p>
            </div>

            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              
              {/* Media Produk */}
              <div>
                <label style={labelStyle}>Foto Produk (Max 5)</label>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px' }}>
                  {existingImages.map((img, i) => (
                    <div key={`existing-${i}`} style={{ position: 'relative', width: '80px', height: '80px', borderRadius: '14px', border: '1px solid #E5E7EB', overflow: 'hidden' }}>
                      <img src={img.image_url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      <button type="button" onClick={() => removeExistingImage(i)} style={{ position: 'absolute', top: 4, right: 4, background: 'rgba(0,0,0,0.6)', color: '#fff', border: 'none', borderRadius: '50%', width: '20px', height: '20px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
                        <X size={12} />
                      </button>
                      {i === 0 && (
                        <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, background: '#7C3AED', color: '#fff', fontSize: '9px', fontWeight: 700, textAlign: 'center', padding: '2px 0' }}>
                          Utama
                        </div>
                      )}
                    </div>
                  ))}
                  
                  {newImagePreviews.map((preview, i) => (
                    <div key={`new-${i}`} style={{ position: 'relative', width: '80px', height: '80px', borderRadius: '14px', border: '1px solid #E5E7EB', overflow: 'hidden' }}>
                      <img src={preview} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      <button type="button" onClick={() => removeNewImage(i)} style={{ position: 'absolute', top: 4, right: 4, background: 'rgba(0,0,0,0.6)', color: '#fff', border: 'none', borderRadius: '50%', width: '20px', height: '20px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
                        <X size={12} />
                      </button>
                      {existingImages.length === 0 && i === 0 && (
                        <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, background: '#7C3AED', color: '#fff', fontSize: '9px', fontWeight: 700, textAlign: 'center', padding: '2px 0' }}>
                          Utama
                        </div>
                      )}
                    </div>
                  ))}

                  {(existingImages.length + newImageFiles.length) < 5 && (
                    <label style={{ 
                      width: '80px', height: '80px', borderRadius: '14px', 
                      border: '2px dashed #C4B5FD', background: '#F5F3FF',
                      display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                      cursor: 'pointer', color: '#7C3AED', transition: 'all 0.2s'
                    }}>
                      <UploadCloud size={24} style={{ marginBottom: '4px' }} />
                      <span style={{ fontSize: '10px', fontWeight: 600 }}>Tambah</span>
                      <input type="file" multiple accept="image/*" onChange={handleImageChange} style={{ display: 'none' }} />
                    </label>
                  )}
                </div>
              </div>

              {/* Nama Produk */}
              <div>
                <label style={labelStyle}>Nama Produk <span style={{ color: '#EF4444' }}>*</span></label>
                <div style={{ position: 'relative' }}>
                  <Tag style={iconStyle} size={18} />
                  <input type="text" placeholder="Sepatu Converse Size 42"
                    value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
                    required style={inputStyle} onFocus={onFocus} onBlur={onBlur} />
                </div>
              </div>

              {/* Kategori & Kondisi */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={labelStyle}>Kategori <span style={{ color: '#EF4444' }}>*</span></label>
                  <div style={{ position: 'relative' }}>
                    <Box style={iconStyle} size={18} />
                    <select
                      required
                      value={form.category_id}
                      onChange={e => setForm(f => ({ ...f, category_id: e.target.value }))}
                      style={{ ...inputStyle, paddingRight: '36px', appearance: 'none', WebkitAppearance: 'none' }}
                      onFocus={onFocus} onBlur={onBlur}
                    >
                      {categories.map(c => (
                        <option key={c.id} value={c.id}>{c.name}</option>
                      ))}
                    </select>
                    {/* Select arrow */}
                    <svg style={{ position: 'absolute', right: '16px', top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none', width: '16px', height: '16px', color: '#9CA3AF' }} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </div>
                </div>
                <div>
                  <label style={labelStyle}>Kondisi <span style={{ color: '#EF4444' }}>*</span></label>
                  <div style={{ position: 'relative' }}>
                    <Info style={iconStyle} size={18} />
                    <select
                      required
                      value={form.condition}
                      onChange={e => setForm(f => ({ ...f, condition: e.target.value }))}
                      style={{ ...inputStyle, paddingRight: '36px', appearance: 'none', WebkitAppearance: 'none' }}
                      onFocus={onFocus} onBlur={onBlur}
                    >
                      {Object.entries(CONDITIONS).map(([key, val]) => (
                        <option key={key} value={key}>{val.label}</option>
                      ))}
                    </select>
                    {/* Select arrow */}
                    <svg style={{ position: 'absolute', right: '16px', top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none', width: '16px', height: '16px', color: '#9CA3AF' }} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </div>
                </div>
              </div>

              {/* Deskripsi */}
              <div>
                <label style={labelStyle}>Deskripsi Produk</label>
                <div style={{ position: 'relative' }}>
                  <FileText style={{ ...iconStyle, top: '16px', transform: 'none' }} size={18} />
                  <textarea
                    placeholder="Ceritakan detail produk..."
                    value={form.description}
                    onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
                    rows={4}
                    style={{
                      width: '100%', padding: '12px 16px 12px 46px',
                      borderRadius: '14px', border: '1.5px solid #E5E7EB',
                      background: '#FAFAFA', fontSize: '14px', fontWeight: 500,
                      color: '#111827', outline: 'none', resize: 'vertical',
                      fontFamily: 'inherit', transition: 'all .2s', boxSizing: 'border-box',
                    }}
                    onFocus={onFocus} onBlur={onBlur}
                  />
                </div>
              </div>

              {/* Harga Jual */}
              <div>
                <label style={labelStyle}>Harga Jual <span style={{ color: '#EF4444' }}>*</span></label>
                <div style={{ position: 'relative' }}>
                  <DollarSign style={iconStyle} size={18} />
                  <input type="number" placeholder="50000" min="1000"
                    value={form.price} onChange={e => setForm(f => ({ ...f, price: e.target.value }))}
                    required style={inputStyle} onFocus={onFocus} onBlur={onBlur} />
                </div>
              </div>

              {/* Stok & Berat */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={labelStyle}>Stok Barang <span style={{ color: '#EF4444' }}>*</span></label>
                  <div style={{ position: 'relative' }}>
                    <Archive style={iconStyle} size={18} />
                    <input type="number" placeholder="1" min="1"
                      value={form.stock} onChange={e => setForm(f => ({ ...f, stock: e.target.value }))}
                      required style={inputStyle} onFocus={onFocus} onBlur={onBlur} />
                  </div>
                </div>
                <div>
                  <label style={labelStyle}>Berat (Gram) <span style={{ color: '#EF4444' }}>*</span></label>
                  <div style={{ position: 'relative' }}>
                    <Weight style={iconStyle} size={18} />
                    <input type="number" placeholder="500" min="1"
                      value={form.weight_gram} onChange={e => setForm(f => ({ ...f, weight_gram: e.target.value }))}
                      required style={inputStyle} onFocus={onFocus} onBlur={onBlur} />
                  </div>
                </div>
              </div>

              <div style={{ display: 'flex', gap: '10px', marginTop: '8px' }}>
                <button type="button" onClick={() => router.push('/seller/dashboard')}
                  style={{
                    flex: 1, height: '48px',
                    background: 'transparent', color: '#6B7280',
                    fontWeight: 600, fontSize: '14px',
                    border: '1.5px solid #E5E7EB', borderRadius: '14px',
                    cursor: 'pointer', transition: 'all .2s',
                  }}>
                  Batal
                </button>
                <button type="submit" disabled={saving}
                  style={{
                    flex: 2, height: '48px',
                    background: saving ? '#A78BFA' : 'linear-gradient(135deg, #7C3AED 0%, #9333EA 100%)',
                    color: '#fff', fontWeight: 700, fontSize: '15px',
                    border: 'none', borderRadius: '14px',
                    cursor: saving ? 'not-allowed' : 'pointer',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
                    boxShadow: '0 8px 24px rgba(124,58,237,0.30)',
                    transition: 'all .2s',
                  }}>
                  {saving
                    ? <span style={{ width: '20px', height: '20px', border: '2px solid rgba(255,255,255,0.4)', borderTopColor: '#fff', borderRadius: '50%', animation: 'spin 0.7s linear infinite', display: 'inline-block' }} />
                    : <><span>Simpan Perubahan</span> <Save size={18} /></>
                  }
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
