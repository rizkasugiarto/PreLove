'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/context/AuthContext';
import toast from 'react-hot-toast';
import LogoLoader from '@/components/LogoLoader';
import BackButton from '@/components/BackButton';
import { Upload, Store, ArrowRight, MapPin, Building, Phone, ShoppingBag, FileText, ChevronLeft, Save } from 'lucide-react';
export default function StoreSettingsPage() {
  const { user, profile, refreshProfile } = useAuth();
  const router = useRouter();
  const [storeId, setStoreId] = useState<string | null>(null);
  const [form, setForm] = useState({ name: '', description: '', phone: '', address: '', city: '', province: '', district: '', subdistrict: '' });
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!user) { router.push('/auth/login'); return; }
    if (profile && (!profile.store || (Array.isArray(profile.store) && profile.store.length === 0))) { router.push('/seller/open-store'); return; }
    
    const storeData = Array.isArray(profile?.store) ? profile.store[0] : profile?.store;
    if (storeData) {
      setStoreId(storeData.id);
      let parsedAddress = { detail: storeData.address || '', district: '', subdistrict: '' };
      try {
        const json = JSON.parse(storeData.address);
        if (json.detail !== undefined) parsedAddress = json;
      } catch (e) {}

      setForm({
        name: storeData.name || '',
        description: storeData.description || '',
        phone: storeData.phone || '',
        address: parsedAddress.detail,
        city: storeData.city || '',
        province: storeData.province || '',
        district: parsedAddress.district || '',
        subdistrict: parsedAddress.subdistrict || ''
      });
      if (storeData.logo_url) setLogoPreview(storeData.logo_url);
    }
    setLoading(false);
  }, [user, profile]);

  const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setLogoFile(file);
    setLogoPreview(URL.createObjectURL(file));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim() || !form.city.trim() || !form.province.trim() || !form.address.trim()) { 
      toast.error('Lengkapi semua data yang wajib diisi!'); 
      return; 
    }
    setSaving(true);
    try {
      let logoUrl: string | null = null;
      if (logoFile) {
        const fileName = `store_logos/${user!.id}_${Date.now()}`;
        await supabase.storage.from('prelove-images').upload(fileName, logoFile, { contentType: logoFile.type });
        const { data } = supabase.storage.from('prelove-images').getPublicUrl(fileName);
        logoUrl = data.publicUrl;
      }

      const updateData: any = {
        name: form.name.trim(),
        description: form.description.trim(),
        address: JSON.stringify({ detail: form.address.trim(), district: form.district.trim(), subdistrict: form.subdistrict.trim() }),
        city: form.city.trim(),
        province: form.province.trim(),
        phone: form.phone.trim(),
      };
      if (logoUrl) updateData.logo_url = logoUrl;

      const { error } = await supabase.from('stores').update(updateData).eq('id', storeId);
      if (error) throw error;
      
      await refreshProfile();
      toast.success('Pengaturan toko berhasil disimpan! 🎉');
      router.push('/seller/dashboard');
    } catch (err: any) {
      toast.error(err.message ?? 'Gagal menyimpan pengaturan toko');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <LogoLoader text="Memuat Pengaturan..." />;

  const inputStyle: React.CSSProperties = {
    width: '100%', height: '48px',
    paddingLeft: '46px', paddingRight: '16px',
    borderRadius: '14px', border: '1.5px solid #E5E7EB',
    background: '#FAFAFA', fontSize: '14px', fontWeight: 500,
    color: '#111827', outline: 'none', transition: 'all .2s ease',
    boxSizing: 'border-box',
  };

  const iconStyle: React.CSSProperties = {
    position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)',
    color: '#9CA3AF', pointerEvents: 'none', width: '18px', height: '18px',
  };

  const labelStyle: React.CSSProperties = {
    fontSize: '12px', fontWeight: 700, color: '#6B7280', letterSpacing: '0.07em',
    textTransform: 'uppercase', display: 'block', marginBottom: '6px', marginLeft: '4px'
  };

  const onFocus = (e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    e.target.style.borderColor = '#7C3AED';
    e.target.style.background = '#fff';
    e.target.style.boxShadow = '0 0 0 4px rgba(124,58,237,0.08)';
  };
  const onBlur = (e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    e.target.style.borderColor = '#E5E7EB';
    e.target.style.background = '#FAFAFA';
    e.target.style.boxShadow = 'none';
  };

  return (
    <div style={{
      minHeight: '100vh', padding: '32px 16px', paddingBottom: '128px',
      background: 'radial-gradient(ellipse at top left, #EDE9FE 0%, #F5F3FF 40%, #EFF6FF 100%)',
    }}>
      <div style={{ width: '100%', maxWidth: '800px', margin: '0 auto' }}>
        
        <BackButton href="/seller/dashboard" />

        <div style={{
          background: 'rgba(255,255,255,0.85)', backdropFilter: 'blur(24px)', WebkitBackdropFilter: 'blur(24px)',
          borderRadius: '32px', border: '1px solid rgba(255,255,255,1)',
          boxShadow: '0 24px 64px rgba(124,58,237,0.08), 0 8px 24px rgba(0,0,0,0.02)',
          overflow: 'hidden',
        }}>
          <div style={{ height: '5px', background: 'linear-gradient(90deg, #7C3AED, #A855F7, #EC4899)' }} />

          <div style={{ padding: '40px 48px' }}>
            <h1 style={{ fontSize: '28px', fontWeight: 900, color: '#111827', margin: '0 0 8px 0', letterSpacing: '-0.02em', display: 'flex', alignItems: 'center', gap: '12px' }}>
               <div style={{ width: '48px', height: '48px', borderRadius: '14px', background: '#F3E8FF', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#8B5CF6' }}>
                  <Store size={24} />
               </div>
               Pengaturan Toko
            </h1>
            <p style={{ fontSize: '15px', color: '#6B7280', margin: '0 0 32px 0', fontWeight: 500 }}>
              Perbarui profil, detail kontak, dan alamat toko kamu agar ongkos kirim ke pembeli dapat dihitung otomatis dengan akurat! 🚀
            </p>

            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
              
              {/* Section 1: Profil Toko */}
              <div>
                <h3 style={{ fontSize: '16px', fontWeight: 800, color: '#111827', marginBottom: '20px', borderBottom: '2px solid #F3F4F6', paddingBottom: '12px' }}>Profil Toko</h3>
                <div style={{ display: 'flex', gap: '32px', flexWrap: 'wrap' }}>
                  
                  {/* Logo Upload */}
                  <div style={{ flexShrink: 0 }}>
                    <label style={labelStyle}>Logo Toko</label>
                    <div style={{ position: 'relative', marginTop: '8px', cursor: 'pointer' }}>
                      <input id="logo-upload" type="file" accept="image/*" onChange={handleLogoChange} style={{ opacity: 0, position: 'absolute', inset: 0, width: '100%', height: '100%', cursor: 'pointer', zIndex: 10 }} />
                      <div style={{
                        width: '100px', height: '100px', borderRadius: '24px',
                        background: logoPreview ? 'transparent' : '#F5F3FF',
                        border: logoPreview ? '3px solid #7C3AED' : '2px dashed #C4B5FD',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        overflow: 'hidden', transition: 'all .2s',
                        boxShadow: logoPreview ? '0 8px 24px rgba(124,58,237,0.2)' : 'none',
                        position: 'relative', pointerEvents: 'none'
                      }}>
                        {logoPreview
                          ? <img src={logoPreview} alt="Logo" style={{ width: '100%', height: '100%', objectFit: 'cover' }} onError={(e) => { e.currentTarget.style.display = 'none'; e.currentTarget.parentElement!.innerHTML = '<div style="color:#A78BFA;display:flex;align-items:center;justify-content:center;height:100%;width:100%;">⚠️</div>'; }} />
                          : <Upload size={28} color="#A78BFA" />
                        }
                      </div>
                    </div>
                  </div>

                  {/* Name & Phone */}
                  <div style={{ flex: 1, minWidth: '280px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
                    <div>
                      <label style={labelStyle}>Nama Toko <span style={{ color: '#EF4444' }}>*</span></label>
                      <div style={{ position: 'relative' }}>
                        <Store style={iconStyle} size={18} />
                        <input type="text" placeholder="Nama tokomu" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} required style={inputStyle} className="focus:bg-white focus:ring-4 focus:ring-purple-500/10 focus:border-purple-400" />
                      </div>
                    </div>
                    <div>
                      <label style={labelStyle}>Nomor WhatsApp</label>
                      <div style={{ position: 'relative' }}>
                        <Phone style={iconStyle} size={18} />
                        <input type="tel" placeholder="08123456789" value={form.phone} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))} style={inputStyle} className="focus:bg-white focus:ring-4 focus:ring-purple-500/10 focus:border-purple-400" />
                      </div>
                    </div>
                  </div>
                </div>

                <div style={{ marginTop: '16px' }}>
                  <label style={labelStyle}>Deskripsi Toko</label>
                  <div style={{ position: 'relative' }}>
                    <FileText style={{ ...iconStyle, top: '16px', transform: 'none' }} size={18} />
                    <textarea placeholder="Ceritakan tentang tokomu..." value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} rows={4} style={{ ...inputStyle, height: 'auto', padding: '16px 16px 16px 46px', resize: 'vertical' }} className="focus:bg-white focus:ring-4 focus:ring-purple-500/10 focus:border-purple-400" />
                  </div>
                </div>
              </div>

              {/* Section 2: Alamat Pengiriman */}
              <div>
                <h3 style={{ fontSize: '16px', fontWeight: 800, color: '#111827', marginBottom: '20px', borderBottom: '2px solid #F3F4F6', paddingBottom: '12px' }}>Lokasi Pengiriman</h3>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '16px' }}>
                  
                  {/* Province */}
                  <div>
                    <label style={labelStyle}>Provinsi <span style={{ color: '#EF4444' }}>*</span></label>
                    <div style={{ position: 'relative' }}>
                      <MapPin style={iconStyle} size={18} />
                      <input required type="text" placeholder="Jawa Barat" value={form.province} onChange={e => setForm(f => ({ ...f, province: e.target.value }))} style={inputStyle} onFocus={onFocus} onBlur={onBlur} />
                    </div>
                  </div>

                  {/* City */}
                  <div>
                    <label style={labelStyle}>Kota/Kabupaten <span style={{ color: '#EF4444' }}>*</span></label>
                    <div style={{ position: 'relative' }}>
                      <Building style={iconStyle} size={18} />
                      <input required type="text" placeholder="Kota Bandung" value={form.city} onChange={e => setForm(f => ({ ...f, city: e.target.value }))} style={inputStyle} onFocus={onFocus} onBlur={onBlur} />
                    </div>
                  </div>

                  {/* Subdistrict (Kelurahan) */}
                  <div>
                    <label style={labelStyle}>Kelurahan <span style={{ color: '#EF4444' }}>*</span></label>
                    <div style={{ position: 'relative' }}>
                      <MapPin style={iconStyle} size={18} />
                      <input required type="text" placeholder="Pasteur" value={form.subdistrict} onChange={e => setForm(f => ({ ...f, subdistrict: e.target.value }))} style={inputStyle} onFocus={onFocus} onBlur={onBlur} />
                    </div>
                  </div>

                  {/* District (Kecamatan) */}
                  <div>
                    <label style={labelStyle}>Kecamatan <span style={{ color: '#EF4444' }}>*</span></label>
                    <div style={{ position: 'relative' }}>
                      <MapPin style={iconStyle} size={18} />
                      <input required type="text" placeholder="Sukajadi" value={form.district} onChange={e => setForm(f => ({ ...f, district: e.target.value }))} style={inputStyle} onFocus={onFocus} onBlur={onBlur} />
                    </div>
                  </div>
                </div>

                <div style={{ marginTop: '16px' }}>
                  <label style={labelStyle}>Alamat Lengkap <span style={{ color: '#EF4444' }}>*</span></label>
                  <div style={{ position: 'relative' }}>
                    <MapPin style={{ ...iconStyle, top: '16px', transform: 'none' }} size={18} />
                    <textarea placeholder="Nama Jalan, Gedung, No. Rumah..." value={form.address} onChange={e => setForm(f => ({ ...f, address: e.target.value }))} required rows={3} style={{ ...inputStyle, height: 'auto', padding: '16px 16px 16px 46px', resize: 'vertical' }} className="focus:bg-white focus:ring-4 focus:ring-purple-500/10 focus:border-purple-400" />
                  </div>
                </div>
              </div>

              {/* Submit */}
              <div style={{ display: 'flex', justifyContent: 'flex-end', paddingTop: '16px', borderTop: '2px solid #F3F4F6' }}>
                <button type="submit" disabled={saving} style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '16px 32px', background: 'linear-gradient(135deg, #7C3AED 0%, #9333EA 100%)', color: '#fff', fontSize: '15px', fontWeight: 800, border: 'none', borderRadius: '16px', cursor: saving ? 'not-allowed' : 'pointer', boxShadow: '0 8px 24px rgba(124,58,237,0.3)', transition: 'transform 0.2s' }} className="hover:-translate-y-1">
                  {saving ? <span className="animate-spin w-5 h-5 border-2 border-white/40 border-t-white rounded-full" /> : <><Save size={20} /> Simpan Perubahan</>}
                </button>
              </div>

            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
