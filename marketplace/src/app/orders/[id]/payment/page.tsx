'use client';

import { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/context/AuthContext';
import { formatPrice } from '@/lib/utils';
import toast from 'react-hot-toast';
import { Upload, Clock, CreditCard, Copy, CheckCircle, AlertCircle, ArrowRight, ShieldCheck, Banknote } from 'lucide-react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import LogoLoader from '@/components/LogoLoader';

export default function PaymentPage() {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const router = useRouter();
  const fileRef = useRef<HTMLInputElement>(null);

  const [order, setOrder] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [timeLeft, setTimeLeft] = useState<number | null>(null);
  const [isExpired, setIsExpired] = useState(false);
  const [proofFile, setProofFile] = useState<File | null>(null);
  const [proofPreview, setProofPreview] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!user) { router.push('/auth/login'); return; }
    fetchOrder();
  }, [user]);

  useEffect(() => {
    if (timeLeft === null || isExpired) return;
    if (timeLeft <= 0) { setIsExpired(true); return; }
    const timer = setInterval(() => {
      setTimeLeft(prev => (prev !== null && prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(timer);
  }, [timeLeft, isExpired]);

  const fetchOrder = async () => {
    const { data } = await supabase.from('orders')
      .select('*, store:stores(name)')
      .eq('id', id)
      .single();

    if (!data) {
      toast.error('Pesanan tidak ditemukan');
      router.push('/orders');
      return;
    }
    setOrder(data);

    if (data.status === 'waiting_payment' && data.payment_due_at) {
      const diffSeconds = Math.floor((new Date(data.payment_due_at).getTime() - Date.now()) / 1000);
      if (diffSeconds > 0) setTimeLeft(diffSeconds);
      else { setIsExpired(true); supabase.rpc('cleanup_expired_orders').then(); }
    }
    setLoading(false);
  };

  const handleCopy = () => {
    if (order?.payment_account_number) {
      navigator.clipboard.writeText(order.payment_account_number);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
      toast.success('Nomor rekening disalin!');
    }
  };

  const handleProofChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setProofFile(file);
    setProofPreview(URL.createObjectURL(file));
  };

  const submitPayment = async () => {
    if (!proofFile) { toast.error('Pilih foto bukti transfer dulu ya!'); return; }
    if (isExpired) { toast.error('Waktu pembayaran sudah habis!'); return; }
    setUploading(true);
    try {
      const fileName = `payment_proofs/${user!.id}_${Date.now()}.jpg`;
      const { error: uploadError } = await supabase.storage.from('prelove-images').upload(fileName, proofFile, { contentType: proofFile.type });
      if (uploadError) throw uploadError;
      const { data } = supabase.storage.from('prelove-images').getPublicUrl(fileName);
      const { error: updateError } = await supabase.from('orders').update({
        status: 'pending',
        payment_status: 'pending_verification',
        payment_proof_url: data.publicUrl
      }).eq('id', order.id);
      if (updateError) throw updateError;
      toast.success('Pembayaran berhasil dikirim! Menunggu konfirmasi penjual 🚀');
      router.push('/orders');
    } catch (err: any) {
      toast.error(err.message || 'Gagal mengirim pembayaran');
    } finally {
      setUploading(false);
    }
  };

  const formatTime = (s: number) => `${Math.floor(s / 60).toString().padStart(2, '0')}:${(s % 60).toString().padStart(2, '0')}`;

  const urgency = timeLeft !== null && timeLeft < 180; // < 3 menit = urgent

  /* ── Loading ── */
  if (loading) return <LogoLoader text="Memuat Rincian Pembayaran..." />;

  /* ── Already processed ── */
  if (order.status !== 'waiting_payment' && !isExpired) return (
    <div style={{ minHeight: '100vh', background: 'radial-gradient(ellipse at top left, #EDE9FE 0%, #F5F3FF 40%, #EFF6FF 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '32px 16px' }}>
      <div style={{ background: 'rgba(255,255,255,0.85)', backdropFilter: 'blur(24px)', WebkitBackdropFilter: 'blur(24px)', borderRadius: '32px', border: '1px solid rgba(255,255,255,0.9)', boxShadow: '0 20px 60px rgba(16,185,129,0.1)', padding: '48px 40px', maxWidth: '440px', width: '100%', textAlign: 'center' }}>
        <div style={{ width: '88px', height: '88px', borderRadius: '50%', background: 'linear-gradient(135deg, #D1FAE5, #A7F3D0)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 24px', boxShadow: '0 12px 30px rgba(16,185,129,0.2)' }}>
          <CheckCircle size={44} color="#059669" />
        </div>
        <h1 style={{ fontSize: '24px', fontWeight: 900, color: '#111827', marginBottom: '12px' }}>Pembayaran Sudah Diproses</h1>
        <p style={{ color: '#6B7280', fontSize: '15px', lineHeight: 1.6, marginBottom: '32px' }}>Pesanan ini tidak lagi menunggu pembayaran. Cek halaman pesanan untuk status terbaru.</p>
        <Link href="/orders" style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', background: 'linear-gradient(135deg, #8B5CF6, #6D28D9)', color: 'white', fontWeight: 800, fontSize: '15px', padding: '14px 32px', borderRadius: '16px', textDecoration: 'none', boxShadow: '0 8px 20px rgba(109,40,217,0.3)' }}>
          Lihat Pesanan Saya <ArrowRight size={18} />
        </Link>
      </div>
    </div>
  );

  return (
    <div style={{ minHeight: '100vh', background: 'radial-gradient(ellipse at top left, #EDE9FE 0%, #F5F3FF 40%, #EFF6FF 100%)', paddingTop: '112px', paddingBottom: '80px', position: 'relative' }}>

      {/* Aurora Blobs */}
      <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '500px', overflow: 'hidden', pointerEvents: 'none' }}>
        <div style={{ position: 'absolute', top: '-20%', left: '-10%', width: '50%', height: '80%', borderRadius: '50%', filter: 'blur(120px)', background: 'rgba(167,139,250,0.35)', mixBlendMode: 'multiply' }} />
        <div style={{ position: 'absolute', top: '10%', right: '-10%', width: '40%', height: '60%', borderRadius: '50%', filter: 'blur(100px)', background: 'rgba(196,181,253,0.3)', mixBlendMode: 'multiply' }} />
        <div style={{ position: 'absolute', bottom: '0', left: '30%', width: '35%', height: '50%', borderRadius: '50%', filter: 'blur(100px)', background: 'rgba(244,114,182,0.15)', mixBlendMode: 'multiply' }} />
      </div>

      <div style={{ maxWidth: '640px', margin: '0 auto', padding: '0 16px', position: 'relative', zIndex: 10 }}>

        {/* Breadcrumb */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '32px', fontSize: '14px', fontWeight: 600 }}>
          <Link href="/orders" style={{ color: '#8B5CF6', textDecoration: 'none' }}>Pesanan Saya</Link>
          <span style={{ color: '#D1D5DB' }}>/</span>
          <span style={{ color: '#111827' }}>Pembayaran</span>
        </div>

        {/* Page Title */}
        <h1 style={{ fontSize: '32px', fontWeight: 900, color: '#111827', marginBottom: '32px', display: 'flex', alignItems: 'center', gap: '16px', letterSpacing: '-0.02em' }}>
          <div style={{ width: '52px', height: '52px', borderRadius: '16px', background: 'rgba(255,255,255,0.7)', backdropFilter: 'blur(10px)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '26px', border: '1px solid rgba(255,255,255,0.9)', boxShadow: '0 8px 16px rgba(124,58,237,0.06)' }}>💳</div>
          Selesaikan Pembayaran
        </h1>

        {isExpired ? (
          /* ── EXPIRED STATE ── */
          <div style={{ background: 'rgba(255,255,255,0.85)', backdropFilter: 'blur(24px)', WebkitBackdropFilter: 'blur(24px)', borderRadius: '32px', border: '1px solid rgba(254,202,202,0.6)', boxShadow: '0 20px 60px rgba(239,68,68,0.08)', padding: '48px 40px', textAlign: 'center', position: 'relative', overflow: 'hidden' }}>
            <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '4px', background: 'linear-gradient(90deg, #EF4444, #F87171)' }} />
            <div style={{ width: '88px', height: '88px', borderRadius: '50%', background: 'linear-gradient(135deg, #FEE2E2, #FECACA)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 24px', boxShadow: '0 12px 30px rgba(239,68,68,0.15)' }}>
              <AlertCircle size={44} color="#EF4444" />
            </div>
            <h2 style={{ fontSize: '24px', fontWeight: 900, color: '#111827', marginBottom: '12px' }}>Waktu Pembayaran Habis</h2>
            <p style={{ color: '#6B7280', fontSize: '15px', lineHeight: 1.7, marginBottom: '32px' }}>Pesanan ini telah otomatis dibatalkan karena melewati batas waktu 15 menit. Stok barang telah dikembalikan ke penjual.</p>
            <Link href="/" style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', background: 'linear-gradient(135deg, #111827, #374151)', color: 'white', fontWeight: 800, fontSize: '15px', padding: '14px 32px', borderRadius: '16px', textDecoration: 'none', boxShadow: '0 8px 20px rgba(0,0,0,0.15)' }}>
              Belanja Lagi <ArrowRight size={18} />
            </Link>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>

            {/* ── Timer Card ── */}
            <div style={{
              background: urgency ? 'rgba(254,226,226,0.8)' : 'rgba(255,255,255,0.85)',
              backdropFilter: 'blur(24px)', WebkitBackdropFilter: 'blur(24px)',
              borderRadius: '28px',
              border: urgency ? '1px solid rgba(254,202,202,0.8)' : '1px solid rgba(255,255,255,0.9)',
              boxShadow: urgency ? '0 12px 40px rgba(239,68,68,0.10)' : '0 12px 40px rgba(124,58,237,0.06)',
              padding: '28px 32px', textAlign: 'center', position: 'relative', overflow: 'hidden'
            }}>
              <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '4px', background: urgency ? 'linear-gradient(90deg, #EF4444, #F97316)' : 'linear-gradient(90deg, #F59E0B, #F97316)' }} />
              <p style={{ fontSize: '12px', fontWeight: 900, color: urgency ? '#EF4444' : '#D97706', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}>
                <Clock size={14} /> Sisa Waktu Pembayaran
              </p>
              <div style={{ fontSize: '64px', fontWeight: 900, color: urgency ? '#EF4444' : '#111827', letterSpacing: '-0.04em', lineHeight: 1, fontVariantNumeric: 'tabular-nums' }}>
                {timeLeft !== null ? formatTime(timeLeft) : '--:--'}
              </div>
              <p style={{ fontSize: '13px', color: '#9CA3AF', fontWeight: 600, marginTop: '10px' }}>
                {urgency ? '⚠️ Segera selesaikan sebelum pesanan dibatalkan!' : 'Bayar sebelum batas waktu habis'}
              </p>
            </div>

            {/* ── Total & Rekening ── */}
            <div style={{ background: 'rgba(255,255,255,0.85)', backdropFilter: 'blur(24px)', WebkitBackdropFilter: 'blur(24px)', borderRadius: '28px', border: '1px solid rgba(255,255,255,0.9)', boxShadow: '0 12px 40px rgba(124,58,237,0.06)', padding: '32px' }}>

              <p style={{ fontSize: '13px', fontWeight: 700, color: '#9CA3AF', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '6px' }}>Total Pembayaran</p>
              <p style={{ fontSize: '40px', fontWeight: 900, background: 'linear-gradient(135deg, #7C3AED, #DB2777)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', letterSpacing: '-0.03em', lineHeight: 1, marginBottom: '28px' }}>
                {formatPrice(order.total)}
              </p>

              {/* Rekening Box */}
              <div style={{ background: 'rgba(139,92,246,0.04)', borderRadius: '20px', border: '1px solid rgba(139,92,246,0.12)', padding: '20px 24px', display: 'flex', alignItems: 'center', gap: '16px' }}>
                <div style={{ width: '52px', height: '52px', borderRadius: '16px', background: 'linear-gradient(135deg, #EDE9FE, #DDD6FE)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  {order.payment_bank === 'COD'
                    ? <Banknote size={24} color="#7C3AED" />
                    : <CreditCard size={24} color="#7C3AED" />}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p style={{ fontSize: '12px', fontWeight: 800, color: '#9CA3AF', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '4px' }}>
                    {order.payment_bank === 'COD' ? 'Bayar di Tempat (COD)' : `Transfer ke ${order.payment_bank}`}
                  </p>
                  <p style={{ fontSize: '22px', fontWeight: 900, color: '#111827', letterSpacing: '0.06em', margin: '0 0 2px' }}>
                    {order.payment_account_number || '—'}
                  </p>
                  <p style={{ fontSize: '12px', color: '#6B7280', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                    a.n. {order.payment_account_name || '—'}
                  </p>
                </div>
                {order.payment_bank !== 'COD' && (
                  <button onClick={handleCopy} title="Salin Rekening"
                    style={{ width: '44px', height: '44px', borderRadius: '14px', background: copied ? '#D1FAE5' : 'rgba(255,255,255,0.9)', border: copied ? '1px solid #6EE7B7' : '1px solid rgba(0,0,0,0.08)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', transition: 'all 0.2s', flexShrink: 0 }}>
                    {copied ? <CheckCircle size={20} color="#059669" /> : <Copy size={20} color="#8B5CF6" />}
                  </button>
                )}
              </div>
            </div>

            {/* ── Upload Bukti ── */}
            {order.payment_bank !== 'COD' && (
              <div style={{ background: 'rgba(255,255,255,0.85)', backdropFilter: 'blur(24px)', WebkitBackdropFilter: 'blur(24px)', borderRadius: '28px', border: '1px solid rgba(255,255,255,0.9)', boxShadow: '0 12px 40px rgba(124,58,237,0.06)', padding: '32px' }}>
                <h2 style={{ fontSize: '18px', fontWeight: 900, color: '#111827', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <span style={{ width: '36px', height: '36px', borderRadius: '10px', background: 'rgba(139,92,246,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#8B5CF6' }}><Upload size={18} /></span>
                  Upload Bukti Transfer
                </h2>

                <input ref={fileRef} type="file" accept="image/*" onChange={handleProofChange} style={{ display: 'none' }} />
                <button onClick={() => fileRef.current?.click()}
                  style={{
                    width: '100%', borderRadius: '20px', border: proofPreview ? '2px solid #A78BFA' : '2px dashed rgba(0,0,0,0.12)',
                    padding: '36px 24px', background: proofPreview ? 'rgba(237,233,254,0.4)' : 'rgba(255,255,255,0.4)',
                    cursor: 'pointer', transition: 'all 0.2s', textAlign: 'center', marginBottom: '20px',
                    display: 'block'
                  }}>
                  {proofPreview ? (
                    <div>
                      <img src={proofPreview} alt="Bukti Transfer" style={{ maxHeight: '200px', margin: '0 auto 16px', borderRadius: '16px', objectFit: 'contain', boxShadow: '0 8px 24px rgba(0,0,0,0.12)', display: 'block' }} />
                      <p style={{ fontSize: '14px', fontWeight: 800, color: '#7C3AED' }}>✅ Bukti terupload — klik untuk ganti</p>
                    </div>
                  ) : (
                    <div>
                      <div style={{ width: '64px', height: '64px', borderRadius: '20px', background: 'linear-gradient(135deg, #EDE9FE, #DDD6FE)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
                        <Upload size={28} color="#8B5CF6" />
                      </div>
                      <p style={{ fontSize: '16px', fontWeight: 900, color: '#374151', marginBottom: '6px' }}>Klik untuk Pilih Foto</p>
                      <p style={{ fontSize: '13px', color: '#9CA3AF', fontWeight: 600 }}>Format PNG, JPG (maks. 5MB)</p>
                    </div>
                  )}
                </button>

                <button onClick={submitPayment} disabled={uploading || !proofFile}
                  style={{
                    width: '100%', padding: '18px', border: 'none', borderRadius: '20px', cursor: proofFile ? 'pointer' : 'not-allowed',
                    background: proofFile ? 'linear-gradient(135deg, #111827, #374151)' : 'rgba(0,0,0,0.08)',
                    color: proofFile ? 'white' : '#9CA3AF', fontWeight: 900, fontSize: '16px',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px',
                    boxShadow: proofFile ? '0 10px 28px rgba(0,0,0,0.18)' : 'none',
                    transition: 'all 0.2s'
                  }}
                  className={proofFile ? 'hover:-translate-y-0.5' : ''}>
                  {uploading
                    ? <span style={{ width: '20px', height: '20px', border: '3px solid rgba(255,255,255,0.3)', borderTop: '3px solid white', borderRadius: '50%', animation: 'spin 0.8s linear infinite', display: 'block' }} />
                    : '🚀 Kirim Bukti Pembayaran'}
                  <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
                </button>
              </div>
            )}

            {/* COD — tidak perlu upload, langsung konfirm */}
            {order.payment_bank === 'COD' && (
              <div style={{ background: 'rgba(255,255,255,0.85)', backdropFilter: 'blur(24px)', WebkitBackdropFilter: 'blur(24px)', borderRadius: '28px', border: '1px solid rgba(255,255,255,0.9)', boxShadow: '0 12px 40px rgba(124,58,237,0.06)', padding: '32px' }}>
                <p style={{ fontSize: '15px', color: '#4B5563', fontWeight: 600, lineHeight: 1.7, marginBottom: '24px' }}>
                  Pesanan COD kamu sudah berhasil dibuat! Penjual akan segera memproses dan mengirimkan barang. Bayar ke kurir saat barang tiba. 📦
                </p>
                <Link href="/orders"
                  style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px', background: 'linear-gradient(135deg, #8B5CF6, #6D28D9)', color: 'white', fontWeight: 900, fontSize: '16px', padding: '18px', borderRadius: '20px', textDecoration: 'none', boxShadow: '0 10px 28px rgba(109,40,217,0.25)' }}>
                  Lihat Pesanan Saya <ArrowRight size={18} />
                </Link>
              </div>
            )}

            {/* ── Escrow Banner ── */}
            <div style={{ background: 'rgba(243,232,255,0.6)', backdropFilter: 'blur(10px)', WebkitBackdropFilter: 'blur(10px)', borderRadius: '24px', border: '1px solid rgba(216,180,254,0.5)', padding: '20px 24px', display: 'flex', alignItems: 'flex-start', gap: '16px' }}>
              <div style={{ width: '44px', height: '44px', borderRadius: '14px', background: '#E9D5FF', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#7C3AED', flexShrink: 0 }}>
                <ShieldCheck size={22} />
              </div>
              <div>
                <h3 style={{ fontWeight: 900, color: '#111827', fontSize: '15px', marginBottom: '4px' }}>Transaksi Aman Terlindungi</h3>
                <p style={{ fontSize: '13px', color: '#4B5563', fontWeight: 500, lineHeight: 1.6, margin: 0 }}>
                  Dana ditahan oleh sistem Escrow PreLove dan baru diteruskan ke penjual setelah kamu konfirmasi pesanan diterima.
                </p>
              </div>
            </div>

          </div>
        )}
      </div>
    </div>
  );
}
