'use client';

import { useState } from 'react';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';
import toast from 'react-hot-toast';
import { Mail, ArrowLeft, ShoppingBag, SendHorizonal } from 'lucide-react';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/auth/reset-password`,
      });
      if (error) throw error;
      setSent(true);
      toast.success('Link reset password sudah dikirim! Cek emailmu 📧');
    } catch (err: any) {
      toast.error(err.message || 'Gagal mengirim email. Coba lagi!');
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
            <h1 style={{ fontSize: '22px', fontWeight: 900, color: '#1E1B4B', letterSpacing: '-0.03em', marginBottom: '6px' }}>
              Lupa Password?
            </h1>
            <p style={{ fontSize: '14px', color: '#8B83B8', fontWeight: 500, lineHeight: 1.6 }}>
              Masukkan emailmu dan kami akan kirimkan link untuk membuat password baru
            </p>
          </div>

          {!sent ? (
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
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
                  : <><SendHorizonal size={18} /><span>Kirim Link Reset</span></>
                }
              </button>
            </form>
          ) : (
            /* Success State */
            <div style={{ textAlign: 'center', padding: '8px 0' }}>
              <div style={{
                width: '72px', height: '72px', borderRadius: '50%',
                background: 'linear-gradient(135deg, #D1FAE5, #A7F3D0)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                margin: '0 auto 20px', fontSize: '32px',
              }}>📧</div>
              <h2 style={{ fontSize: '18px', fontWeight: 900, color: '#1E1B4B', marginBottom: '10px' }}>Email Terkirim!</h2>
              <p style={{ fontSize: '14px', color: '#6B7280', fontWeight: 500, lineHeight: 1.7, marginBottom: '8px' }}>
                Kami sudah kirim link reset password ke:
              </p>
              <p style={{ fontSize: '15px', fontWeight: 800, color: '#7C3AED', marginBottom: '20px' }}>{email}</p>
              <p style={{ fontSize: '13px', color: '#9CA3AF', fontWeight: 500, lineHeight: 1.6 }}>
                Cek inbox atau folder spam kamu. Link berlaku selama <strong style={{ color: '#374151' }}>1 jam</strong>.
              </p>
              <button
                onClick={() => { setSent(false); setEmail(''); }}
                style={{
                  marginTop: '24px', background: 'transparent', border: '1px solid rgba(139,92,246,0.3)',
                  color: '#7C3AED', fontWeight: 700, fontSize: '13px', padding: '10px 20px',
                  borderRadius: '10px', cursor: 'pointer',
                }}
              >
                Kirim ulang ke email lain
              </button>
            </div>
          )}

          <div style={{ textAlign: 'center', marginTop: '28px' }}>
            <Link href="/auth/login" style={{ fontSize: '13px', color: '#8B83B8', fontWeight: 600, textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
              <ArrowLeft size={14} /> Kembali ke Login
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
