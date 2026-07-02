'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/context/AuthContext';
import { useEffect } from 'react';
import toast from 'react-hot-toast';
import { Upload, Store, ArrowRight, MapPin, Building, Phone, ShoppingBag, FileText } from 'lucide-react';

export default function OpenStorePage() {
  const { user, profile, refreshProfile } = useAuth();
  const router = useRouter();
  const [form, setForm] = useState({ 
    name: '', description: '', phone: '', 
    address: '', city: '', province: '',
    kecamatan: '', kelurahan: '', rt: '', rw: ''
  });
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState(1); // 2-step form

  useEffect(() => {
    if (profile?.store && (Array.isArray(profile.store) ? profile.store.length > 0 : true)) {
      router.replace('/seller/dashboard');
    }
  }, [profile, router]);

  const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setLogoFile(file);
    setLogoPreview(URL.createObjectURL(file));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim() || !form.city.trim()) { toast.error('Nama toko dan kota wajib diisi!'); return; }
    setLoading(true);
    try {
      let logoUrl: string | null = null;
      if (logoFile) {
        const fileName = `store_logos/${user!.id}_${Date.now()}`;
        await supabase.storage.from('prelove-images').upload(fileName, logoFile, { contentType: logoFile.type });
        const { data } = supabase.storage.from('prelove-images').getPublicUrl(fileName);
        logoUrl = data.publicUrl;
      }
      const slug = form.name.toLowerCase().replace(/[^a-z0-9]+/g, '-') + '-' + Date.now().toString(36);
      const { error } = await supabase.from('stores').insert({
        owner_id: user!.id, name: form.name.trim(), slug,
        logo_url: logoUrl, description: form.description.trim(),
        address: form.address.trim(), city: form.city.trim(),
        province: form.province.trim(), phone: form.phone.trim(),
        kecamatan: form.kecamatan.trim(), kelurahan: form.kelurahan.trim(),
        rt_rw: `${form.rt.trim()}/${form.rw.trim()}`
      });
      if (error) throw error;
      await supabase.from('profiles').update({ role: 'seller' }).eq('id', user!.id);
      await refreshProfile();
      toast.success('Toko berhasil dibuat! 🎉');
      router.push('/seller/dashboard');
    } catch (err: any) {
      toast.error(err.message ?? 'Gagal membuat toko');
    } finally {
      setLoading(false);
    }
  };

  const inputStyle: React.CSSProperties = {
    width: '100%', height: '50px',
    paddingLeft: '46px', paddingRight: '16px',
    borderRadius: '16px',
    border: '1.5px solid #EDE9FE',
    background: 'rgba(245,243,255,0.6)',
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

  const onFocus = (e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    e.target.style.borderColor = '#7C3AED';
    e.target.style.background = '#fff';
    e.target.style.boxShadow = '0 0 0 4px rgba(124,58,237,0.10)';
  };
  const onBlur = (e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    e.target.style.borderColor = '#EDE9FE';
    e.target.style.background = 'rgba(245,243,255,0.6)';
    e.target.style.boxShadow = 'none';
  };

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      padding: '32px 16px',
      background: 'radial-gradient(ellipse at top left, #EDE9FE 0%, #F5F3FF 40%, #EFF6FF 100%)',
    }}>
      <div style={{ width: '100%', maxWidth: '480px' }}>

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
              {/* Logo upload circle */}
              <label htmlFor="logo-upload" style={{ cursor: 'pointer', display: 'inline-block', marginBottom: '20px' }}>
                <div style={{
                  width: '72px', height: '72px', borderRadius: '50%',
                  background: logoPreview ? 'transparent' : 'linear-gradient(135deg, #EDE9FE, #F3E8FF)',
                  border: logoPreview ? '3px solid #7C3AED' : '2px dashed #C4B5FD',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  margin: '0 auto',
                  overflow: 'hidden',
                  transition: 'all .2s',
                  boxShadow: logoPreview ? '0 4px 16px rgba(124,58,237,0.25)' : 'none',
                }}>
                  {logoPreview
                    ? <img src={logoPreview} alt="Logo" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    : <Upload size={24} color="#A78BFA" />
                  }
                </div>
                <p style={{ fontSize: '12px', color: '#9CA3AF', marginTop: '8px', fontWeight: 500 }}>
                  {logoPreview ? 'Klik untuk ganti' : 'Upload logo toko'}
                </p>
              </label>
              <input id="logo-upload" type="file" accept="image/*" onChange={handleLogoChange} style={{ display: 'none' }} />

              <h1 style={{ fontSize: '22px', fontWeight: 900, color: '#111827', margin: 0, letterSpacing: '-0.02em' }}>
                Buka Toko PreLove
              </h1>
              <p style={{ fontSize: '14px', color: '#9CA3AF', marginTop: '6px' }}>
                Mulai jual barang preloved kamu secara <span style={{ color: '#7C3AED', fontWeight: 700 }}>gratis</span>
              </p>

              {/* Step indicator */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', marginTop: '20px' }}>
                {[1, 2].map(s => (
                  <div key={s} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <div style={{
                      width: '28px', height: '28px', borderRadius: '50%',
                      background: step >= s ? 'linear-gradient(135deg, #7C3AED, #A855F7)' : '#F3F4F6',
                      color: step >= s ? '#fff' : '#9CA3AF',
                      fontSize: '12px', fontWeight: 800,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      boxShadow: step >= s ? '0 4px 12px rgba(124,58,237,0.3)' : 'none',
                      transition: 'all .3s',
                    }}>{s}</div>
                    {s < 2 && <div style={{ width: '32px', height: '2px', background: step > 1 ? '#A78BFA' : '#E5E7EB', borderRadius: '999px', transition: 'all .3s' }} />}
                  </div>
                ))}
              </div>
            </div>

            <form onSubmit={handleSubmit}>
              {/* Step 1 — Info Toko */}
              {step === 1 && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  <div>
                    <label style={labelStyle}>Nama Toko <span style={{ color: '#EF4444' }}>*</span></label>
                    <div style={{ position: 'relative' }}>
                      <Store style={iconStyle} size={18} />
                      <input type="text" placeholder="Second Style By Rini"
                        value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                        required style={inputStyle} onFocus={onFocus} onBlur={onBlur} />
                    </div>
                  </div>

                  <div>
                    <label style={labelStyle}>Deskripsi Toko</label>
                    <div style={{ position: 'relative' }}>
                      <FileText style={{ ...iconStyle, top: '16px', transform: 'none' }} size={18} />
                      <textarea
                        placeholder="Ceritakan tentang toko kamu..."
                        value={form.description}
                        onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
                        rows={3}
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

                  <div>
                    <label style={labelStyle}>Nomor WhatsApp</label>
                    <div style={{ position: 'relative' }}>
                      <Phone style={iconStyle} size={18} />
                      <input type="tel" placeholder="08123456789"
                        value={form.phone} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))}
                        style={inputStyle} onFocus={onFocus} onBlur={onBlur} />
                    </div>
                  </div>

                  <button type="button"
                    onClick={() => {
                      if (!form.name.trim()) { toast.error('Nama toko wajib diisi!'); return; }
                      setStep(2);
                    }}
                    style={{
                      width: '100%', height: '48px', marginTop: '8px',
                      background: 'linear-gradient(135deg, #7C3AED 0%, #9333EA 100%)',
                      color: '#fff', fontWeight: 700, fontSize: '15px',
                      border: 'none', borderRadius: '14px', cursor: 'pointer',
                      display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
                      boxShadow: '0 8px 24px rgba(124,58,237,0.30)',
                      transition: 'all 0.2s',
                    }}
                  >
                    Lanjut <ArrowRight size={18} />
                  </button>
                </div>
              )}

              {/* Step 2 — Lokasi */}
              {step === 2 && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                    <div>
                      <label style={labelStyle}>Provinsi <span style={{ color: '#EF4444' }}>*</span></label>
                      <div style={{ position: 'relative' }}>
                        <MapPin style={iconStyle} size={18} />
                        <input type="text" placeholder="Jawa Barat"
                          value={form.province} onChange={e => setForm(f => ({ ...f, province: e.target.value }))}
                          required style={inputStyle} onFocus={onFocus} onBlur={onBlur} />
                      </div>
                    </div>
                    <div>
                      <label style={labelStyle}>Kota / Kabupaten <span style={{ color: '#EF4444' }}>*</span></label>
                      <div style={{ position: 'relative' }}>
                        <Building style={iconStyle} size={18} />
                        <input type="text" placeholder="Bandung"
                          value={form.city} onChange={e => setForm(f => ({ ...f, city: e.target.value }))}
                          required style={inputStyle} onFocus={onFocus} onBlur={onBlur} />
                      </div>
                    </div>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                    <div>
                      <label style={labelStyle}>Kelurahan <span style={{ color: '#EF4444' }}>*</span></label>
                      <div style={{ position: 'relative' }}>
                        <MapPin style={iconStyle} size={18} />
                        <input type="text" placeholder="Pasteur"
                          value={form.kelurahan} onChange={e => setForm(f => ({ ...f, kelurahan: e.target.value }))}
                          required style={inputStyle} onFocus={onFocus} onBlur={onBlur} />
                      </div>
                    </div>
                    <div>
                      <label style={labelStyle}>Kecamatan <span style={{ color: '#EF4444' }}>*</span></label>
                      <div style={{ position: 'relative' }}>
                        <MapPin style={iconStyle} size={18} />
                        <input type="text" placeholder="Sukajadi"
                          value={form.kecamatan} onChange={e => setForm(f => ({ ...f, kecamatan: e.target.value }))}
                          required style={inputStyle} onFocus={onFocus} onBlur={onBlur} />
                      </div>
                    </div>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                    <div>
                      <label style={labelStyle}>RT <span style={{ color: '#EF4444' }}>*</span></label>
                      <div style={{ position: 'relative' }}>
                        <MapPin style={iconStyle} size={18} />
                        <input type="text" placeholder="001"
                          value={form.rt} onChange={e => setForm(f => ({ ...f, rt: e.target.value }))}
                          required style={inputStyle} onFocus={onFocus} onBlur={onBlur} />
                      </div>
                    </div>
                    <div>
                      <label style={labelStyle}>RW <span style={{ color: '#EF4444' }}>*</span></label>
                      <div style={{ position: 'relative' }}>
                        <MapPin style={iconStyle} size={18} />
                        <input type="text" placeholder="002"
                          value={form.rw} onChange={e => setForm(f => ({ ...f, rw: e.target.value }))}
                          required style={inputStyle} onFocus={onFocus} onBlur={onBlur} />
                      </div>
                    </div>
                  </div>

                  <div>
                    <label style={labelStyle}>Alamat Detail <span style={{ color: '#EF4444' }}>*</span></label>
                    <div style={{ position: 'relative' }}>
                      <MapPin style={iconStyle} size={18} />
                      <input type="text" placeholder="Jl. Cemara No 12, Pagar Hitam"
                        value={form.address} onChange={e => setForm(f => ({ ...f, address: e.target.value }))}
                        required style={inputStyle} onFocus={onFocus} onBlur={onBlur} />
                    </div>
                  </div>

                  <div style={{ display: 'flex', gap: '10px', marginTop: '8px' }}>
                    <button type="button" onClick={() => setStep(1)}
                      style={{
                        flex: 1, height: '48px',
                        background: 'transparent', color: '#6B7280',
                        fontWeight: 600, fontSize: '14px',
                        border: '1.5px solid #E5E7EB', borderRadius: '14px',
                        cursor: 'pointer', transition: 'all .2s',
                      }}>
                      ← Kembali
                    </button>
                    <button type="submit" disabled={loading}
                      style={{
                        flex: 2, height: '48px',
                        background: loading ? '#A78BFA' : 'linear-gradient(135deg, #7C3AED 0%, #9333EA 100%)',
                        color: '#fff', fontWeight: 700, fontSize: '15px',
                        border: 'none', borderRadius: '14px',
                        cursor: loading ? 'not-allowed' : 'pointer',
                        display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
                        boxShadow: '0 8px 24px rgba(124,58,237,0.30)',
                        transition: 'all .2s',
                      }}>
                      {loading
                        ? <span style={{ width: '20px', height: '20px', border: '2px solid rgba(255,255,255,0.4)', borderTopColor: '#fff', borderRadius: '50%', animation: 'spin 0.7s linear infinite', display: 'inline-block' }} />
                        : <><span>Buat Toko 🎉</span></>
                      }
                    </button>
                  </div>
                </div>
              )}
            </form>

            {/* Footer note */}
            <p style={{ textAlign: 'center', fontSize: '11px', color: '#9CA3AF', marginTop: '20px', lineHeight: 1.6 }}>
              Dengan mendaftar, kamu menyetujui{' '}
              <Link href="/terms" target="_blank" style={{ color: '#7C3AED', fontWeight: 700, textDecoration: 'none' }}>Syarat & Ketentuan</Link>
              {' '}Seller PreLove.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
