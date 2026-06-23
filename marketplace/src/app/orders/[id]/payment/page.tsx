'use client';

import { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/context/AuthContext';
import { formatPrice } from '@/lib/utils';
import toast from 'react-hot-toast';
import { Upload, Clock, CreditCard, Copy, CheckCircle, AlertCircle, ArrowRight } from 'lucide-react';
import Link from 'next/link';
import { useParams } from 'next/navigation';

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

    if (timeLeft <= 0) {
      setIsExpired(true);
      return;
    }

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
      const dueTime = new Date(data.payment_due_at).getTime();
      const now = new Date().getTime();
      const diffSeconds = Math.floor((dueTime - now) / 1000);

      if (diffSeconds > 0) {
        setTimeLeft(diffSeconds);
      } else {
        setIsExpired(true);
        // Call cleanup in background
        supabase.rpc('cleanup_expired_orders').then();
      }
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

  const formatTime = (totalSeconds: number) => {
    const m = Math.floor(totalSeconds / 60);
    const s = totalSeconds % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  if (loading) {
    return <div className="min-h-screen bg-[#F8F7FF] flex items-center justify-center">
      <div className="w-12 h-12 border-4 border-purple-200 border-t-purple-600 rounded-full animate-spin" />
    </div>;
  }

  if (order.status !== 'waiting_payment' && !isExpired) {
    return (
      <div className="min-h-screen bg-[#F8F7FF] pt-32 pb-20 px-4 flex flex-col items-center justify-center text-center">
        <div className="w-24 h-24 bg-emerald-100 text-emerald-500 rounded-full flex items-center justify-center mb-6">
          <CheckCircle size={48} />
        </div>
        <h1 className="text-2xl font-black text-slate-900 mb-2">Pembayaran Sudah Diterima / Diproses</h1>
        <p className="text-slate-500 mb-8 max-w-md">Pesanan kamu tidak lagi menunggu pembayaran. Silakan cek halaman pesanan untuk melacak status terbarunya.</p>
        <Link href="/orders" className="px-6 py-3 bg-purple-600 text-white font-bold rounded-xl shadow-lg shadow-purple-500/30">
          Kembali ke Pesanan Saya
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F8F7FF] pt-28 pb-32 relative selection:bg-purple-200">
      <div className="absolute top-0 inset-x-0 h-[300px] bg-aurora opacity-20 pointer-events-none" />
      
      <div className="max-w-[600px] mx-auto px-4 relative z-10">
        <div className="flex items-center gap-3 mb-6">
          <Link href="/orders" className="text-slate-500 hover:text-purple-600 transition-colors">Pesanan Saya</Link>
          <span className="text-slate-300">/</span>
          <span className="font-bold text-slate-900">Pembayaran</span>
        </div>

        {isExpired ? (
          <div className="bento-card bg-white p-8 border border-red-100 shadow-[0_8px_30px_rgba(239,68,68,0.08)] text-center relative overflow-hidden">
            <div className="absolute top-0 inset-x-0 h-1.5 bg-red-500" />
            <div className="w-20 h-20 bg-red-50 text-red-500 rounded-full flex items-center justify-center mx-auto mb-6">
              <AlertCircle size={40} />
            </div>
            <h1 className="text-2xl font-black text-slate-900 mb-3">Waktu Pembayaran Habis</h1>
            <p className="text-slate-500 mb-8">Maaf, pesanan ini telah otomatis dibatalkan karena melewati batas waktu 15 menit. Stok barang telah dikembalikan.</p>
            <Link href="/" className="px-8 py-3 bg-slate-900 text-white font-bold rounded-2xl shadow-lg inline-flex items-center gap-2 hover:-translate-y-0.5 transition-transform">
              Belanja Lagi <ArrowRight size={18} />
            </Link>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Timer Card */}
            <div className="bento-card bg-white p-6 border border-slate-100 shadow-[0_8px_30px_rgba(0,0,0,0.04)] text-center relative overflow-hidden">
              <div className="absolute top-0 inset-x-0 h-1.5 bg-gradient-to-r from-amber-400 to-orange-500" />
              <p className="text-sm font-bold text-slate-500 mb-2 uppercase tracking-widest flex items-center justify-center gap-2">
                <Clock size={16} className="text-amber-500" /> Sisa Waktu Pembayaran
              </p>
              <div className="text-5xl font-black text-slate-900 tracking-tight tabular-nums drop-shadow-sm">
                {timeLeft !== null ? formatTime(timeLeft) : '00:00'}
              </div>
            </div>

            {/* Total & Rekening Card */}
            <div className="bento-card bg-white p-6 border border-slate-100 shadow-[0_8px_30px_rgba(0,0,0,0.04)]">
              <p className="text-sm font-bold text-slate-500 mb-1">Total Pembayaran</p>
              <p className="text-3xl font-black text-purple-600 mb-6">{formatPrice(order.total)}</p>

              <div className="bg-slate-50 rounded-2xl p-5 border border-slate-100 flex items-start gap-4">
                <div className="w-12 h-12 bg-white rounded-xl border border-slate-200 flex items-center justify-center text-purple-600 flex-shrink-0">
                  <CreditCard size={24} />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-bold text-slate-500 mb-1">Transfer ke Bank {order.payment_bank}</p>
                  <div className="flex items-center justify-between gap-4">
                    <p className="text-xl font-black text-slate-900 tracking-wider">{order.payment_account_number}</p>
                    <button onClick={handleCopy} className="text-purple-600 hover:text-purple-700 bg-purple-50 hover:bg-purple-100 p-2 rounded-lg transition-colors" title="Salin Rekening">
                      {copied ? <CheckCircle size={18} /> : <Copy size={18} />}
                    </button>
                  </div>
                  <p className="text-sm text-slate-500 mt-1 uppercase">a.n. {order.payment_account_name}</p>
                </div>
              </div>
            </div>

            {/* Upload Proof Card */}
            <div className="bento-card bg-white p-6 border border-slate-100 shadow-[0_8px_30px_rgba(0,0,0,0.04)]">
              <h2 className="text-lg font-black text-slate-900 mb-4">Upload Bukti Transfer</h2>
              
              <input ref={fileRef} type="file" accept="image/*" onChange={handleProofChange} className="hidden" />
              <button onClick={() => fileRef.current?.click()}
                className={`w-full border-2 border-dashed rounded-3xl p-8 transition-all hover:border-purple-400 mb-6 ${proofPreview ? 'border-purple-300 bg-purple-50' : 'border-slate-200 hover:bg-slate-50 bg-white'}`}>
                {proofPreview ? (
                  <div className="relative">
                    <img src={proofPreview} alt="Bukti Transfer" className="max-h-48 mx-auto rounded-2xl object-contain shadow-md" />
                    <p className="text-sm text-purple-600 font-bold mt-4">✅ Bukti transfer terupload, klik untuk ganti</p>
                  </div>
                ) : (
                  <div className="text-center">
                    <div className="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center mx-auto mb-4">
                      <Upload className="w-8 h-8 text-slate-400" />
                    </div>
                    <p className="font-black text-slate-700 text-base">Klik untuk Pilih Foto</p>
                    <p className="text-sm text-slate-400 mt-2 font-medium">Format PNG, JPG (max 5MB)</p>
                  </div>
                )}
              </button>

              <button onClick={submitPayment} disabled={uploading || !proofFile}
                className="w-full py-4 bg-slate-900 hover:bg-slate-800 disabled:bg-slate-300 disabled:cursor-not-allowed text-white font-black rounded-2xl shadow-[0_8px_20px_rgba(0,0,0,0.15)] flex items-center justify-center gap-2 transition-all hover:-translate-y-0.5">
                {uploading ? <span className="animate-spin w-5 h-5 border-2 border-white/40 border-t-white rounded-full" /> : 'Kirim Bukti Pembayaran'}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
