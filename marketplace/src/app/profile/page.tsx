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
    <div className="min-h-screen bg-[#F8F9FA] pt-[80px] pb-12">
      <div className="max-w-5xl mx-auto px-4 sm:px-6">
        
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <button onClick={() => router.back()} className="p-2.5 bg-white rounded-full shadow-sm border border-gray-200 hover:bg-gray-50 transition-all">
            <ArrowLeft className="w-5 h-5 text-gray-700" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Profil Saya</h1>
            <p className="text-[14px] text-gray-500 mt-0.5">Atur informasi data diri dan akunmu</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 md:gap-8">
          
          {/* Left Column: Avatar & Quick Links */}
          <div className="lg:col-span-4 space-y-6">
            
            {/* Avatar Card */}
            <div className="bg-white rounded-[24px] shadow-sm border border-gray-100 p-8 flex flex-col items-center text-center relative overflow-hidden">
              <div className="absolute top-0 inset-x-0 h-24 bg-gradient-to-b from-violet-50 to-white pointer-events-none" />
              
              <div className="relative z-10 mb-5">
                <div className="w-28 h-28 rounded-full overflow-hidden bg-gradient-to-tr from-violet-500 to-fuchsia-500 flex items-center justify-center border-4 border-white shadow-md">
                  {avatarUrl ? (
                     <img src={avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
                   ) : (
                     <span className="text-4xl font-bold text-white">
                       {(form.full_name || profile?.email || 'U')[0].toUpperCase()}
                     </span>
                   )}
                </div>
                <button
                   onClick={() => fileRef.current?.click()}
                   disabled={uploading}
                   className="absolute bottom-0 right-0 w-9 h-9 rounded-full bg-white text-violet-600 flex items-center justify-center shadow-md border border-gray-100 hover:scale-105 active:scale-95 transition-all"
                 >
                   {uploading ? (
                     <div className="w-4 h-4 border-2 border-violet-600 border-t-transparent rounded-full animate-spin" />
                   ) : (
                     <Camera className="w-4 h-4" />
                   )}
                 </button>
                 <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleAvatarUpload} />
              </div>

              <h2 className="text-[18px] font-bold text-gray-900 z-10">{form.full_name || 'Nama Kamu'}</h2>
              <p className="text-[14px] text-gray-500 z-10">@{form.username || 'username'}</p>
              
              <div className="mt-4 z-10 inline-flex items-center gap-1.5 px-3 py-1.5 bg-violet-50 rounded-lg border border-violet-100 text-violet-700">
                <span className="text-[11px] font-bold uppercase tracking-wider">
                  {profile?.role === 'seller' ? '🏪 Penjual Terverifikasi' : '👤 Customer'}
                </span>
              </div>
            </div>

            {/* Quick Menu */}
            <div className="bg-white rounded-[24px] shadow-sm border border-gray-100 p-4 space-y-1">
              <p className="text-[11px] font-bold text-gray-400 px-4 py-2 uppercase tracking-widest">Akses Cepat</p>
              
              <Link href="/orders" className="flex items-center gap-3 px-4 py-3 rounded-2xl hover:bg-gray-50 text-gray-700 hover:text-violet-700 font-semibold text-[15px] transition-colors group">
                <div className="w-8 h-8 rounded-full bg-gray-100 group-hover:bg-violet-100 flex items-center justify-center transition-colors">
                  <Package className="w-4 h-4" />
                </div>
                Pesanan Saya
              </Link>

              {profile?.store ? (
                <Link href="/seller/dashboard" className="flex items-center gap-3 px-4 py-3 rounded-2xl hover:bg-gray-50 text-gray-700 hover:text-emerald-600 font-semibold text-[15px] transition-colors group">
                  <div className="w-8 h-8 rounded-full bg-gray-100 group-hover:bg-emerald-100 flex items-center justify-center transition-colors">
                    <Store className="w-4 h-4" />
                  </div>
                  Toko Saya
                </Link>
              ) : (
                <Link href="/seller/open-store" className="flex items-center gap-3 px-4 py-3 rounded-2xl hover:bg-gray-50 text-gray-700 hover:text-blue-600 font-semibold text-[15px] transition-colors group">
                  <div className="w-8 h-8 rounded-full bg-gray-100 group-hover:bg-blue-100 flex items-center justify-center transition-colors">
                    <Store className="w-4 h-4" />
                  </div>
                  Buka Toko
                </Link>
              )}
            </div>
          </div>

          {/* Right Column: Form */}
          <div className="lg:col-span-8">
            <div className="bg-white rounded-[24px] shadow-sm border border-gray-100 p-6 md:p-8">
              <h3 className="text-xl font-bold text-gray-900 mb-8 flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-violet-100 flex items-center justify-center">
                  <User className="w-5 h-5 text-violet-600" />
                </div>
                Detail Informasi
              </h3>

              <div className="space-y-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  {/* Nama Lengkap */}
                  <div className="space-y-2">
                    <label className="block text-[13px] font-bold text-gray-700 ml-1">Nama Lengkap</label>
                    <input
                      type="text"
                      value={form.full_name}
                      onChange={e => setForm(f => ({ ...f, full_name: e.target.value }))}
                      placeholder="Nama lengkap kamu"
                      className="w-full bg-gray-50 border border-gray-200 rounded-[16px] px-4 py-3.5 text-[15px] font-medium text-gray-900 focus:bg-white focus:outline-none focus:ring-4 focus:ring-violet-500/10 focus:border-violet-400 transition-all"
                    />
                  </div>
                  {/* Username */}
                  <div className="space-y-2">
                    <label className="block text-[13px] font-bold text-gray-700 ml-1">Username</label>
                    <div className="relative flex items-center">
                      <div className="absolute left-4 text-gray-400 font-bold text-[15px] pointer-events-none">@</div>
                      <input
                        type="text"
                        value={form.username}
                        onChange={e => setForm(f => ({ ...f, username: e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, '') }))}
                        placeholder="username_kamu"
                        className="w-full bg-gray-50 border border-gray-200 rounded-[16px] pl-[34px] pr-4 py-3.5 text-[15px] font-medium text-gray-900 focus:bg-white focus:outline-none focus:ring-4 focus:ring-violet-500/10 focus:border-violet-400 transition-all"
                      />
                    </div>
                  </div>
                </div>

                {/* Email */}
                <div className="space-y-2">
                  <label className="block text-[13px] font-bold text-gray-700 ml-1">Email (Akun)</label>
                  <input
                    type="email"
                    value={user?.email ?? ''}
                    disabled
                    className="w-full bg-gray-100 border border-transparent rounded-[16px] px-4 py-3.5 text-[15px] font-medium text-gray-500 cursor-not-allowed"
                  />
                  <p className="text-[12px] font-medium text-gray-400 ml-1">Email tertaut dengan login dan tidak bisa diubah.</p>
                </div>

                {/* No Telepon */}
                <div className="space-y-2">
                  <label className="block text-[13px] font-bold text-gray-700 ml-1">No. Telepon / WhatsApp</label>
                  <input
                    type="tel"
                    value={form.phone}
                    onChange={e => setForm(f => ({ ...f, phone: e.target.value }))}
                    placeholder="Contoh: 08123456789"
                    className="w-full bg-gray-50 border border-gray-200 rounded-[16px] px-4 py-3.5 text-[15px] font-medium text-gray-900 focus:bg-white focus:outline-none focus:ring-4 focus:ring-violet-500/10 focus:border-violet-400 transition-all"
                  />
                </div>

                {/* Bio */}
                <div className="space-y-2">
                  <label className="block text-[13px] font-bold text-gray-700 ml-1">Bio / Deskripsi</label>
                  <textarea
                    value={form.bio}
                    onChange={e => setForm(f => ({ ...f, bio: e.target.value }))}
                    placeholder="Ceritakan sedikit tentang dirimu atau tokomu..."
                    rows={4}
                    className="w-full bg-gray-50 border border-gray-200 rounded-[16px] px-4 py-3.5 text-[15px] font-medium text-gray-900 focus:bg-white focus:outline-none focus:ring-4 focus:ring-violet-500/10 focus:border-violet-400 transition-all resize-none"
                  />
                  <p className="text-[12px] font-medium text-gray-400 text-right mr-1">{form.bio.length}/200 karakter</p>
                </div>

                {/* Submit Button */}
                <div className="pt-6">
                  <button
                    onClick={handleSave}
                    disabled={saving}
                    className="w-full flex items-center justify-center gap-2 bg-gradient-to-tr from-violet-600 to-fuchsia-500 text-white rounded-[16px] px-6 py-4 font-bold text-[16px] shadow-[0_8px_20px_rgba(139,92,246,0.3)] hover:shadow-[0_12px_25px_rgba(139,92,246,0.4)] hover:scale-[1.02] active:scale-95 transition-all duration-300"
                  >
                    {saving ? (
                      <><div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" /> Menyimpan...</>
                    ) : (
                      <><Save className="w-5 h-5" /> Simpan Perubahan</>
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
