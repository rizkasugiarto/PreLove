'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/lib/supabase';
import toast from 'react-hot-toast';
import LogoLoader from '@/components/LogoLoader';
import BackButton from '@/components/BackButton';
import { User, Camera, Save, ArrowLeft, Store, Package, Heart } from 'lucide-react';
import Link from 'next/link';

export default function ProfilePage() {
  const { user, profile, refreshProfile, loading } = useAuth();
  const router = useRouter();
  const fileRef = useRef<HTMLInputElement>(null);

  const [form, setForm] = useState({
    full_name: '',
    username: '',
    phone: '',
    bio: '',
  });
  const [avatarUrl, setAvatarUrl] = useState('');
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!loading && !user) router.push('/auth/login');
  }, [user, loading]);

  useEffect(() => {
    if (profile) {
      setForm({
        full_name: profile.full_name ?? '',
        username: profile.username ?? '',
        phone: profile.phone ?? '',
        bio: profile.bio ?? '',
      });
      setAvatarUrl(profile.avatar_url ?? '');
    }
  }, [profile]);

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;
    setUploading(true);
    try {
      const ext = file.name.split('.').pop();
      const path = `avatars/${user.id}.${ext}`;
      const { error } = await supabase.storage.from('prelove-images').upload(path, file, { upsert: true });
      if (error) throw error;
      const { data: { publicUrl } } = supabase.storage.from('prelove-images').getPublicUrl(path);
      setAvatarUrl(publicUrl + `?v=${Date.now()}`);
      toast.success('Foto berhasil diunggah!');
    } catch (err: any) {
      toast.error(err.message ?? 'Gagal unggah foto');
    } finally {
      setUploading(false);
    }
  };

  const handleSave = async () => {
    if (!user) return;
    setSaving(true);
    try {
      const { error } = await supabase.from('profiles').update({
        ...form,
        avatar_url: avatarUrl,
        updated_at: new Date().toISOString(),
      }).eq('id', user.id);
      if (error) throw error;
      await refreshProfile();
      toast.success('Profil berhasil diperbarui! ✨');
    } catch (err: any) {
      toast.error(err.message ?? 'Gagal simpan profil');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <LogoLoader text="Memuat Profil..." />;

  return (
    <div style={{ minHeight: '100vh', background: 'radial-gradient(ellipse at top left, #EDE9FE 0%, #F5F3FF 40%, #EFF6FF 100%)', color: '#111827', paddingBottom: '128px', paddingTop: '112px', position: 'relative' }}>
      {/* Aurora Blobs */}
      <div className="absolute top-0 left-0 w-full h-[500px] overflow-hidden pointer-events-none">
        <div className="absolute -top-[20%] -left-[10%] w-[50%] h-[80%] rounded-full blur-[120px] bg-purple-300/40 mix-blend-multiply" />
        <div className="absolute top-[10%] -right-[10%] w-[40%] h-[60%] rounded-full blur-[100px] bg-emerald-200/40 mix-blend-multiply" />
      </div>

      <div style={{ maxWidth: '1024px', margin: '0 auto', position: 'relative', zIndex: 10, padding: '0 16px' }}>
        
        {/* Header Glass Card */}
        <div style={{
          background: 'rgba(255,255,255,0.88)', backdropFilter: 'blur(24px)', WebkitBackdropFilter: 'blur(24px)',
          borderRadius: '24px', border: '1px solid rgba(255,255,255,0.9)',
          boxShadow: '0 12px 32px rgba(124,58,237,0.06), 0 4px 12px rgba(0,0,0,0.02)',
          padding: '24px', marginBottom: '32px',
          display: 'flex', alignItems: 'center', gap: '20px'
        }}>
          <BackButton />
          <div>
            <h1 style={{ fontSize: '24px', fontWeight: 900, margin: '0 0 4px 0', letterSpacing: '-0.5px' }}>Profil Saya</h1>
            <p style={{ fontSize: '14px', color: '#6B7280', margin: 0 }}>Atur informasi data diri dan akunmu</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Left Column: Avatar & Quick Links */}
          <div className="lg:col-span-4 space-y-6">
            
            {/* Avatar Card */}
            <div style={{
              background: 'rgba(255,255,255,0.85)', backdropFilter: 'blur(24px)',
              borderRadius: '24px', border: '1px solid rgba(255,255,255,1)',
              boxShadow: '0 4px 12px rgba(124,58,237,0.03)', overflow: 'hidden', padding: '32px',
              display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', position: 'relative'
            }}>
              <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '96px', background: 'linear-gradient(180deg, rgba(139,92,246,0.1) 0%, rgba(255,255,255,0) 100%)', pointerEvents: 'none' }} />
              
              <div style={{ position: 'relative', zIndex: 10, marginBottom: '20px' }}>
                <div style={{
                  width: '112px', height: '112px', borderRadius: '50%', overflow: 'hidden',
                  background: 'linear-gradient(135deg, #8B5CF6, #D946EF)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  border: '4px solid white', boxShadow: '0 8px 24px rgba(139,92,246,0.25)'
                }}>
                  {avatarUrl ? (
                     <img src={avatarUrl} alt="Avatar" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                   ) : (
                     <span style={{ fontSize: '40px', fontWeight: 'bold', color: 'white' }}>
                       {(form.full_name || profile?.email || 'U')[0].toUpperCase()}
                     </span>
                   )}
                </div>
                <button
                   onClick={() => fileRef.current?.click()}
                   disabled={uploading}
                   style={{
                     position: 'absolute', bottom: 0, right: 0, width: '36px', height: '36px',
                     borderRadius: '50%', background: 'white', color: '#8B5CF6',
                     display: 'flex', alignItems: 'center', justifyContent: 'center',
                     boxShadow: '0 4px 10px rgba(0,0,0,0.1)', border: '1px solid rgba(0,0,0,0.05)',
                     cursor: uploading ? 'not-allowed' : 'pointer', transition: 'transform 0.2s'
                   }}
                   onMouseOver={(e) => { if (!uploading) e.currentTarget.style.transform = 'scale(1.05)' }}
                   onMouseOut={(e) => { if (!uploading) e.currentTarget.style.transform = 'scale(1)' }}
                 >
                   {uploading ? (
                     <div className="w-4 h-4 border-2 border-purple-600 border-t-transparent rounded-full animate-spin" />
                   ) : (
                     <Camera size={16} />
                   )}
                 </button>
                 <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleAvatarUpload} />
              </div>

              <h2 style={{ fontSize: '18px', fontWeight: 900, color: '#1F2937', margin: '0 0 4px 0', zIndex: 10 }}>{form.full_name || 'Nama Kamu'}</h2>
              <p style={{ fontSize: '14px', color: '#6B7280', margin: '0 0 16px 0', zIndex: 10 }}>@{form.username || 'username'}</p>
              
              <div style={{
                display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '6px 12px',
                background: 'rgba(139,92,246,0.1)', borderRadius: '8px', border: '1px solid rgba(139,92,246,0.2)',
                color: '#7C3AED', zIndex: 10
              }}>
                <span style={{ fontSize: '11px', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  {profile?.role === 'seller' ? '🏪 Penjual Terverifikasi' : '👤 Customer'}
                </span>
              </div>
            </div>

            {/* Quick Menu */}
            <div style={{
              background: 'rgba(255,255,255,0.85)', backdropFilter: 'blur(24px)',
              borderRadius: '24px', border: '1px solid rgba(255,255,255,1)',
              boxShadow: '0 4px 12px rgba(124,58,237,0.03)', overflow: 'hidden', padding: '16px'
            }}>
              <p style={{ fontSize: '11px', fontWeight: 800, color: '#9CA3AF', padding: '8px 16px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Akses Cepat</p>
              
              <Link href="/orders" style={{
                display: 'flex', alignItems: 'center', gap: '12px', padding: '12px 16px', borderRadius: '16px',
                color: '#374151', textDecoration: 'none', fontWeight: 600, fontSize: '15px', transition: 'all 0.2s'
              }} className="hover:bg-purple-50 hover:text-purple-700 group">
                <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: '#F3F4F6', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.2s' }} className="group-hover:bg-purple-100">
                  <Package size={16} />
                </div>
                Pesanan Saya
              </Link>

              {profile?.store ? (
                <Link href="/seller/dashboard" style={{
                  display: 'flex', alignItems: 'center', gap: '12px', padding: '12px 16px', borderRadius: '16px',
                  color: '#374151', textDecoration: 'none', fontWeight: 600, fontSize: '15px', transition: 'all 0.2s'
                }} className="hover:bg-emerald-50 hover:text-emerald-700 group">
                  <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: '#F3F4F6', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.2s' }} className="group-hover:bg-emerald-100">
                    <Store size={16} />
                  </div>
                  Toko Saya
                </Link>
              ) : (
                <Link href="/seller/open-store" style={{
                  display: 'flex', alignItems: 'center', gap: '12px', padding: '12px 16px', borderRadius: '16px',
                  color: '#374151', textDecoration: 'none', fontWeight: 600, fontSize: '15px', transition: 'all 0.2s'
                }} className="hover:bg-blue-50 hover:text-blue-700 group">
                  <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: '#F3F4F6', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.2s' }} className="group-hover:bg-blue-100">
                    <Store size={16} />
                  </div>
                  Buka Toko
                </Link>
              )}
            </div>
          </div>

          {/* Right Column: Form */}
          <div className="lg:col-span-8">
            <div style={{
              background: 'rgba(255,255,255,0.85)', backdropFilter: 'blur(24px)',
              borderRadius: '24px', border: '1px solid rgba(255,255,255,1)',
              boxShadow: '0 4px 12px rgba(124,58,237,0.03)', padding: '32px'
            }}>
              <h3 style={{ fontSize: '20px', fontWeight: 900, color: '#1F2937', marginBottom: '32px', display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: 'rgba(139,92,246,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <User size={20} color="#8B5CF6" />
                </div>
                Detail Informasi
              </h3>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  {/* Nama Lengkap */}
                  <div>
                    <label style={{ display: 'block', fontSize: '13px', fontWeight: 800, color: '#374151', marginBottom: '8px', marginLeft: '4px' }}>Nama Lengkap</label>
                    <input
                      type="text"
                      value={form.full_name}
                      onChange={e => setForm(f => ({ ...f, full_name: e.target.value }))}
                      placeholder="Nama lengkap kamu"
                      className="focus:bg-white focus:ring-4 focus:ring-purple-500/10 focus:border-purple-400"
                      style={{
                        width: '100%', background: 'rgba(249,250,251,0.5)', border: '1px solid rgba(229,231,235,1)',
                        borderRadius: '16px', padding: '14px 16px', fontSize: '15px', fontWeight: 500, color: '#111827',
                        outline: 'none', transition: 'all 0.2s'
                      }}
                    />
                  </div>
                  {/* Username */}
                  <div>
                    <label style={{ display: 'block', fontSize: '13px', fontWeight: 800, color: '#374151', marginBottom: '8px', marginLeft: '4px' }}>Username</label>
                    <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                      <div style={{ position: 'absolute', left: '16px', color: '#9CA3AF', fontWeight: 800, fontSize: '15px', pointerEvents: 'none' }}>@</div>
                      <input
                        type="text"
                        value={form.username}
                        onChange={e => setForm(f => ({ ...f, username: e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, '') }))}
                        placeholder="username_kamu"
                        className="focus:bg-white focus:ring-4 focus:ring-purple-500/10 focus:border-purple-400"
                        style={{
                          width: '100%', background: 'rgba(249,250,251,0.5)', border: '1px solid rgba(229,231,235,1)',
                          borderRadius: '16px', padding: '14px 16px 14px 34px', fontSize: '15px', fontWeight: 500, color: '#111827',
                          outline: 'none', transition: 'all 0.2s'
                        }}
                      />
                    </div>
                  </div>
                </div>

                {/* Email */}
                <div>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: 800, color: '#374151', marginBottom: '8px', marginLeft: '4px' }}>Email (Akun)</label>
                  <input
                    type="email"
                    value={user?.email ?? ''}
                    disabled
                    style={{
                      width: '100%', background: '#F3F4F6', border: '1px solid transparent',
                      borderRadius: '16px', padding: '14px 16px', fontSize: '15px', fontWeight: 500, color: '#6B7280',
                      cursor: 'not-allowed'
                    }}
                  />
                  <p style={{ fontSize: '12px', fontWeight: 500, color: '#9CA3AF', marginLeft: '4px', marginTop: '6px' }}>Email tertaut dengan login dan tidak bisa diubah.</p>
                </div>

                {/* No Telepon */}
                <div>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: 800, color: '#374151', marginBottom: '8px', marginLeft: '4px' }}>No. Telepon / WhatsApp</label>
                  <input
                    type="tel"
                    value={form.phone}
                    onChange={e => setForm(f => ({ ...f, phone: e.target.value }))}
                    placeholder="Contoh: 08123456789"
                    className="focus:bg-white focus:ring-4 focus:ring-purple-500/10 focus:border-purple-400"
                    style={{
                      width: '100%', background: 'rgba(249,250,251,0.5)', border: '1px solid rgba(229,231,235,1)',
                      borderRadius: '16px', padding: '14px 16px', fontSize: '15px', fontWeight: 500, color: '#111827',
                      outline: 'none', transition: 'all 0.2s'
                    }}
                  />
                </div>

                {/* Bio */}
                <div>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: 800, color: '#374151', marginBottom: '8px', marginLeft: '4px' }}>Bio / Deskripsi</label>
                  <textarea
                    value={form.bio}
                    onChange={e => setForm(f => ({ ...f, bio: e.target.value }))}
                    placeholder="Ceritakan sedikit tentang dirimu atau tokomu..."
                    rows={4}
                    className="focus:bg-white focus:ring-4 focus:ring-purple-500/10 focus:border-purple-400"
                    style={{
                      width: '100%', background: 'rgba(249,250,251,0.5)', border: '1px solid rgba(229,231,235,1)',
                      borderRadius: '16px', padding: '14px 16px', fontSize: '15px', fontWeight: 500, color: '#111827',
                      outline: 'none', transition: 'all 0.2s', resize: 'none'
                    }}
                  />
                  <p style={{ fontSize: '12px', fontWeight: 500, color: '#9CA3AF', textAlign: 'right', marginRight: '4px', marginTop: '6px' }}>{form.bio.length}/200 karakter</p>
                </div>

                {/* Submit Button */}
                <div style={{ paddingTop: '8px' }}>
                  <button
                    onClick={handleSave}
                    disabled={saving}
                    style={{
                      width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
                      background: 'linear-gradient(135deg, #8B5CF6, #D946EF)', color: 'white',
                      borderRadius: '16px', padding: '16px 24px', fontWeight: 800, fontSize: '16px',
                      boxShadow: '0 8px 24px rgba(139,92,246,0.3)', border: 'none', cursor: saving ? 'not-allowed' : 'pointer',
                      transition: 'all 0.3s', opacity: saving ? 0.7 : 1
                    }}
                    onMouseOver={(e) => { if (!saving) { e.currentTarget.style.transform = 'scale(1.02)'; e.currentTarget.style.boxShadow = '0 12px 32px rgba(139,92,246,0.4)'; } }}
                    onMouseOut={(e) => { if (!saving) { e.currentTarget.style.transform = 'scale(1)'; e.currentTarget.style.boxShadow = '0 8px 24px rgba(139,92,246,0.3)'; } }}
                    onMouseDown={(e) => { if (!saving) { e.currentTarget.style.transform = 'scale(0.98)'; } }}
                  >
                    {saving ? (
                      <><div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" /> Menyimpan...</>
                    ) : (
                      <><Save size={20} /> Simpan Perubahan</>
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
