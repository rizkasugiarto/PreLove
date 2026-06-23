'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/lib/supabase';
import toast from 'react-hot-toast';
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
      const { error } = await supabase.storage.from('prelove-public').upload(path, file, { upsert: true });
      if (error) throw error;
      const { data: { publicUrl } } = supabase.storage.from('prelove-public').getPublicUrl(path);
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

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="w-12 h-12 rounded-full border-4 border-violet-200 border-t-violet-600 animate-spin" />
    </div>
  );

  return (
    <div className="min-h-screen" style={{ background: 'var(--bg)' }}>
      <div className="page-container py-8">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <button onClick={() => router.back()} className="p-2 rounded-xl hover:bg-white border border-transparent hover:border-gray-200 transition-all">
            <ArrowLeft className="w-5 h-5 text-gray-600" />
          </button>
          <div>
            <h1 className="text-2xl font-black" style={{ color: 'var(--text)' }}>Edit Profil</h1>
            <p className="text-sm" style={{ color: 'var(--text-muted)' }}>Kelola informasi akun kamu</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left: Avatar + Quick Stats */}
          <div className="space-y-4">
            {/* Avatar */}
            <div className="card p-6 text-center">
              <div className="relative inline-block mb-4">
                <div className="w-28 h-28 rounded-full overflow-hidden bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center mx-auto border-4 border-white shadow-lg">
                  {avatarUrl ? (
                    <img src={avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
                  ) : (
                    <span className="text-4xl font-black text-white">
                      {(form.full_name || profile?.email || 'U')[0].toUpperCase()}
                    </span>
                  )}
                </div>
                <button
                  onClick={() => fileRef.current?.click()}
                  disabled={uploading}
                  className="absolute bottom-0 right-0 w-9 h-9 rounded-full bg-violet-600 text-white flex items-center justify-center shadow-lg hover:bg-violet-700 transition-colors"
                >
                  {uploading ? (
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <Camera className="w-4 h-4" />
                  )}
                </button>
                <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleAvatarUpload} />
              </div>
              <h2 className="font-black text-lg" style={{ color: 'var(--text)' }}>{form.full_name || 'Nama Kamu'}</h2>
              <p className="text-sm" style={{ color: 'var(--text-muted)' }}>@{form.username || 'username'}</p>
              <div className="mt-3">
                <span className="badge badge-primary">{profile?.role === 'seller' ? '🏪 Seller' : '👤 Customer'}</span>
              </div>
            </div>

            {/* Quick Links */}
            <div className="card p-4 space-y-1">
              <p className="text-xs font-bold text-gray-400 px-3 mb-2 uppercase tracking-wider">Menu Cepat</p>
              <Link href="/orders" className="sidebar-link">
                <Package className="w-4 h-4" /> Pesanan Saya
              </Link>

              {profile?.store ? (
                <Link href="/seller/dashboard" className="sidebar-link">
                  <Store className="w-4 h-4" /> Toko Saya
                </Link>
              ) : (
                <Link href="/seller/open-store" className="sidebar-link">
                  <Store className="w-4 h-4" /> Buka Toko
                </Link>
              )}
            </div>
          </div>

          {/* Right: Form */}
          <div className="lg:col-span-2">
            <div className="card p-6">
              <h3 className="font-bold text-lg mb-6 flex items-center gap-2">
                <User className="w-5 h-5 text-violet-600" /> Informasi Pribadi
              </h3>

              <div className="space-y-5">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <div>
                    <label className="block text-sm font-bold mb-2" style={{ color: 'var(--text)' }}>Nama Lengkap</label>
                    <input
                      type="text"
                      value={form.full_name}
                      onChange={e => setForm(f => ({ ...f, full_name: e.target.value }))}
                      placeholder="Nama lengkap kamu"
                      className="input-field"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-bold mb-2" style={{ color: 'var(--text)' }}>Username</label>
                    <div className="relative">
                      <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 font-bold text-sm">@</span>
                      <input
                        type="text"
                        value={form.username}
                        onChange={e => setForm(f => ({ ...f, username: e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, '') }))}
                        placeholder="username_kamu"
                        className="input-field pl-9"
                      />
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-bold mb-2" style={{ color: 'var(--text)' }}>Email</label>
                  <input
                    type="email"
                    value={user?.email ?? ''}
                    disabled
                    className="input-field opacity-60 cursor-not-allowed"
                  />
                  <p className="text-xs text-gray-400 mt-1">Email tidak bisa diubah</p>
                </div>

                <div>
                  <label className="block text-sm font-bold mb-2" style={{ color: 'var(--text)' }}>No. Telepon / WhatsApp</label>
                  <input
                    type="tel"
                    value={form.phone}
                    onChange={e => setForm(f => ({ ...f, phone: e.target.value }))}
                    placeholder="08xxxxxxxxxx"
                    className="input-field"
                  />
                </div>

                <div>
                  <label className="block text-sm font-bold mb-2" style={{ color: 'var(--text)' }}>Bio / Deskripsi</label>
                  <textarea
                    value={form.bio}
                    onChange={e => setForm(f => ({ ...f, bio: e.target.value }))}
                    placeholder="Ceritakan sedikit tentang dirimu..."
                    rows={4}
                    className="input-field resize-none"
                  />
                  <p className="text-xs text-gray-400 mt-1">{form.bio.length}/200 karakter</p>
                </div>

                <button
                  onClick={handleSave}
                  disabled={saving}
                  className="btn-primary w-full justify-center"
                  style={{ padding: '14px 24px', borderRadius: '12px', fontSize: '15px' }}
                >
                  {saving ? (
                    <><div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> Menyimpan...</>
                  ) : (
                    <><Save className="w-4 h-4" /> Simpan Perubahan</>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
