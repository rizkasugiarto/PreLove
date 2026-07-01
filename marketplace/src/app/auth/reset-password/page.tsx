'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import toast from 'react-hot-toast';
import { Eye, EyeOff, Lock, CheckCircle, ShoppingBag } from 'lucide-react';

export default function ResetPasswordPage() {
  const router = useRouter();
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const [validSession, setValidSession] = useState(false);
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    // Supabase otomatis handle token dari URL hash
    supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === 'PASSWORD_RECOVERY') {
        setValidSession(true);
      }
      setChecking(false);
    });

    // Fallback: cek session yang ada
    supabase.auth.getSession().then(({ data }) => {
      if (data.session) setValidSession(true);
      setChecking(false);
    });
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password.length < 6) { toast.error('Password minimal 6 karakter'); return; }
    if (password !== confirmPassword) { toast.error('Konfirmasi password tidak cocok'); return; }

    setLoading(true);
    try {
      const { error } = await supabase.auth.updateUser({ password });
      if (error) throw error;
      setDone(true);
      toast.success('Password berhasil diperbarui! 🎉');
      setTimeout(() => router.push('/auth/login'), 2500);
    } catch (err: any) {
      toast.error(err.message || 'Gagal memperbarui password. Coba lagi!');
    } finally {
      setLoading(false);
    }
  };

  const strength = password.length === 0 ? 0 : password.length < 6 ? 1 : password.length < 10 ? 2 : 3;
  const strengthLabel = ['', 'Lemah', 'Sedang', 'Kuat'];
  const strengthColor = ['', '#EF4444', '#F59E0B', '#10B981'];

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
          <div style={{ textAlign: 'center', marginBottom: '32px' }}>
            <div style={{
              width: '64px', height: '64px',
              background: done ? 'linear-gradient(135deg, #10B981, #059669)' : 'linear-gradient(135deg, #D946EF, #A855F7)',
              border: '3px solid #111827',
              borderRadius: '50%',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              margin: '0 auto 16px',
              transform: 'rotate(-8deg)',
              boxShadow: '5px 5px 0 #111827',
              transition: 'all 0.4s',
            }}>
              {done ? <CheckCircle size={28} color="white" strokeWidth={2.5} /> : <ShoppingBag size={28} color="white" strokeWidth={2.5} />}
            </div>
            <h1 style={{ fontSize: '22px', fontWeight: 900, color: '#1E1B4B', letterSpacing: '-0.03em', marginBottom: '6px' }}>
              {done ? 'Password Diperbarui!' : 'Buat Password Baru'}
            </h1>
            <p style={{ fontSize: '14px', color: '#8B83B8', fontWeight: 500, lineHeight: 1.6 }}>
              {done
                ? 'Kamu akan diarahkan ke halaman login...'
                : 'Pastikan password baru kamu kuat dan mudah diingat'}
            </p>
          </div>

          {checking ? (
            <div style={{ textAlign: 'center', padding: '24px 0' }}>
              <span style={{ width: '32px', height: '32px', border: '3px solid #EDE9FE', borderTopColor: '#8B5CF6', borderRadius: '50%', animation: 'spin 0.8s linear infinite', display: 'inline-block' }} />
            </div>
          ) : done ? (
            <div style={{ textAlign: 'center', padding: '16px 0' }}>
              <div style={{ fontSize: '48px', marginBottom: '16px' }}>🎉</div>
              <p style={{ color: '#6B7280', fontWeight: 600, fontSize: '14px' }}>
                Password berhasil diperbarui! Mengalihkan ke login...
              </p>
            </div>
          ) : !validSession ? (
            <div style={{ textAlign: 'center', padding: '16px 0' }}>
              <div style={{ fontSize: '48px', marginBottom: '16px' }}>⚠️</div>
              <p style={{ color: '#EF4444', fontWeight: 700, fontSize: '15px', marginBottom: '8px' }}>Link tidak valid atau sudah kadaluarsa</p>
              <p style={{ color: '#6B7280', fontWeight: 500, fontSize: '13px', marginBottom: '24px' }}>
                Silakan minta link reset password baru
              </p>
              <a href="/auth/forgot-password" style={{
                display: 'inline-block', background: 'linear-gradient(135deg, #8B5CF6, #7C3AED)',
                color: 'white', fontWeight: 800, fontSize: '14px', padding: '12px 24px',
                borderRadius: '12px', textDecoration: 'none',
              }}>
                Minta Link Baru
              </a>
            </div>
          ) : (
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              {/* Password Baru */}
              <div className="pl-field">
                <label className="pl-label">Password Baru</label>
                <div className="pl-input-wrap">
                  <Lock className="pl-input-icon" size={18} />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Minimal 6 karakter"
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    required
                    className="pl-input has-icon-left has-icon-right"
                  />
                  <button type="button" onClick={() => setShowPassword(!showPassword)}
                    className="pl-input-icon-right"
                    style={{ color: '#9CA3AF', border: 'none', background: 'transparent', cursor: 'pointer' }}>
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
                {/* Strength bar */}
                {password.length > 0 && (
                  <div style={{ marginTop: '8px' }}>
                    <div style={{ display: 'flex', gap: '4px', marginBottom: '4px' }}>
                      {[1,2,3].map(i => (
                        <div key={i} style={{
                          flex: 1, height: '4px', borderRadius: '2px',
                          background: i <= strength ? strengthColor[strength] : '#E5E7EB',
                          transition: 'all 0.3s',
                        }} />
                      ))}
                    </div>
                    <p style={{ fontSize: '12px', fontWeight: 700, color: strengthColor[strength] }}>
                      Kekuatan: {strengthLabel[strength]}
                    </p>
                  </div>
                )}
              </div>

              {/* Konfirmasi Password */}
              <div className="pl-field">
                <label className="pl-label">Konfirmasi Password</label>
                <div className="pl-input-wrap">
                  <Lock className="pl-input-icon" size={18} />
                  <input
                    type={showConfirm ? 'text' : 'password'}
                    placeholder="Ulangi password baru"
                    value={confirmPassword}
                    onChange={e => setConfirmPassword(e.target.value)}
                    required
                    className="pl-input has-icon-left has-icon-right"
                    style={{ borderColor: confirmPassword && confirmPassword !== password ? '#EF4444' : undefined }}
                  />
                  <button type="button" onClick={() => setShowConfirm(!showConfirm)}
                    className="pl-input-icon-right"
                    style={{ color: '#9CA3AF', border: 'none', background: 'transparent', cursor: 'pointer' }}>
                    {showConfirm ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
                {confirmPassword && confirmPassword !== password && (
                  <p style={{ fontSize: '12px', color: '#EF4444', fontWeight: 600, marginTop: '4px' }}>
                    Password tidak cocok
                  </p>
                )}
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
                  : <><CheckCircle size={18} /><span>Simpan Password Baru</span></>
                }
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
