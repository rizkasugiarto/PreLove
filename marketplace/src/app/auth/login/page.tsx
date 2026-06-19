'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import toast from 'react-hot-toast';
import { Eye, EyeOff, Mail, Lock, ArrowRight, Heart, ShoppingBag } from 'lucide-react';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) throw error;
      toast.success('Berhasil masuk! 👋');
      router.push('/');
    } catch (err: any) {
      toast.error(err.message === 'Invalid login credentials' ? 'Email atau password salah' : err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '24px',
      background: 'radial-gradient(ellipse at top left, #EDE9FE 0%, #F5F3FF 40%, #EFF6FF 80%, #F8F7FF 100%)',
    }}>
      {/* Decorative blobs */}
      <div style={{ position: 'fixed', top: '-10%', right: '-5%', width: '400px', height: '400px', background: 'radial-gradient(circle, rgba(139,92,246,0.15), transparent 70%)', borderRadius: '50%', pointerEvents: 'none' }} />
      <div style={{ position: 'fixed', bottom: '-10%', left: '-5%', width: '350px', height: '350px', background: 'radial-gradient(circle, rgba(196,181,253,0.2), transparent 70%)', borderRadius: '50%', pointerEvents: 'none' }} />

      <div style={{
        width: '100%',
        maxWidth: '420px',
        background: 'rgba(255,255,255,0.9)',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        borderRadius: '24px',
        border: '1px solid rgba(237,233,254,0.8)',
        boxShadow: '0 20px 60px rgba(139,92,246,0.12), 0 4px 16px rgba(0,0,0,0.06)',
        overflow: 'hidden',
      }}>
        {/* Accent top bar */}
        <div style={{ height: '4px', background: 'linear-gradient(90deg, #8B5CF6, #7C3AED, #A855F7)' }} />

        <div style={{ padding: '40px 36px' }}>
          {/* Logo */}
          <div style={{ textAlign: 'center', marginBottom: '32px' }}>
            <div style={{
              width: '64px', height: '64px',
              background: 'linear-gradient(135deg, #D946EF, #A855F7)',
              border: '3px solid #111827',
              borderRadius: '50%',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              margin: '0 auto 16px',
              transform: 'rotate(-8deg)',
              boxShadow: '5px 5px 0 #111827',
            }}>
              <ShoppingBag size={28} color="white" strokeWidth={2.5} />
            </div>
            <h1 style={{ fontSize: '24px', fontWeight: 900, color: '#1E1B4B', letterSpacing: '-0.03em', marginBottom: '6px' }}>
              Selamat Datang!
            </h1>
            <p style={{ fontSize: '14px', color: '#8B83B8', fontWeight: 500 }}>
              Masuk ke akun <span style={{ color: '#7C3AED', fontWeight: 700 }}>PreLove</span> kamu
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            {/* Email */}
            <div className="pl-field">
              <label className="pl-label">Email</label>
              <div className="pl-input-wrap">
                <Mail className="pl-input-icon" size={18} />
                <input
                  type="email"
                  placeholder="nama@email.com"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  required
                  className="pl-input has-icon-left"
                />
              </div>
            </div>

            {/* Password */}
            <div className="pl-field">
              <label className="pl-label">Password</label>
              <div className="pl-input-wrap">
                <Lock className="pl-input-icon" size={18} />
                <input
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Masukkan password"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  required
                  className="pl-input has-icon-left has-icon-right"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="pl-input-icon-right"
                  style={{ color: '#9CA3AF', border: 'none', background: 'transparent', cursor: 'pointer' }}
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              style={{
                width: '100%',
                marginTop: '8px',
                background: loading ? '#C4B5FD' : 'linear-gradient(135deg, #8B5CF6, #7C3AED)',
                color: '#fff',
                fontWeight: 800,
                fontSize: '15px',
                height: '52px',
                borderRadius: '14px',
                border: 'none',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                cursor: loading ? 'not-allowed' : 'pointer',
                boxShadow: loading ? 'none' : '0 4px 20px rgba(124,58,237,0.35)',
                transition: 'all 0.2s',
              }}
            >
              {loading
                ? <span style={{ width: '20px', height: '20px', border: '2px solid rgba(255,255,255,0.4)', borderTopColor: 'white', borderRadius: '50%', animation: 'spin 0.8s linear infinite', display: 'inline-block' }} />
                : <><span>Masuk</span><ArrowRight size={18} /></>
              }
            </button>
          </form>

          <p style={{ textAlign: 'center', fontSize: '14px', color: '#8B83B8', marginTop: '28px', fontWeight: 500 }}>
            Belum punya akun?{' '}
            <Link href="/auth/register" style={{ color: '#7C3AED', fontWeight: 800, textDecoration: 'none' }}>
              Daftar gratis
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
