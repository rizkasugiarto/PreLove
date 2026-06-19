'use client';

import { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/context/AuthContext';
import { formatPrice } from '@/lib/utils';
import toast from 'react-hot-toast';
import { Upload, X, MapPin, Truck, CreditCard, CheckCircle } from 'lucide-react';

const COURIERS = ['JNE', 'JNT', 'SiCepat', 'AnterAja', 'COD'];

export default function CheckoutPage() {
  const { user } = useAuth();
  const router = useRouter();
  const fileRef = useRef<HTMLInputElement>(null);
  const [cartItems, setCartItems] = useState<any[]>([]);
  const [bankAccounts, setBankAccounts] = useState<any[]>([]);
  const [selectedBank, setSelectedBank] = useState<any>(null);
  const [selectedCourier, setSelectedCourier] = useState('JNE');
  const [proofFile, setProofFile] = useState<File | null>(null);
  const [proofPreview, setProofPreview] = useState<string | null>(null);
  const [address, setAddress] = useState({ name: '', phone: '', detail: '', city: '', province: '' });
  const [notes, setNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!user) { router.push('/auth/login'); return; }
    fetchData();
  }, [user]);

  const fetchData = async () => {
    const [{ data: cart }, { data: banks }] = await Promise.all([
      supabase.from('cart_items').select('*, product:products(*, images:product_images(*), store:stores(*))').eq('user_id', user!.id),
      supabase.from('bank_accounts').select('*').eq('is_active', true).order('sort_order'),
    ]);
    if (cart) setCartItems(cart);
    if (banks && banks.length > 0) { setBankAccounts(banks); setSelectedBank(banks[0]); }
  };

  const handleProofChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setProofFile(file);
    setProofPreview(URL.createObjectURL(file));
  };

  const uploadProof = async (): Promise<string | null> => {
    if (!proofFile) return null;
    const fileName = `payment_proofs/${user!.id}_${Date.now()}.jpg`;
    const { error } = await supabase.storage.from('prelove-images').upload(fileName, proofFile, { contentType: proofFile.type });
    if (error) return null;
    const { data } = supabase.storage.from('prelove-images').getPublicUrl(fileName);
    return data.publicUrl;
  };

  const subtotal = cartItems.reduce((sum, i) => sum + (i.product?.price ?? 0) * i.quantity, 0);
  const shippingCost = selectedCourier === 'COD' ? 0 : 15000;
  const total = subtotal + shippingCost;

  const handleOrder = async () => {
    if (!address.name || !address.phone || !address.detail || !address.city) { toast.error('Lengkapi alamat pengiriman!'); return; }
    if (!selectedBank) { toast.error('Pilih rekening tujuan transfer!'); return; }
    if (!proofFile) { toast.error('Upload bukti transfer dulu ya! 📸'); return; }
    setSubmitting(true);
    try {
      const proofUrl = await uploadProof();
      const byStore: Record<string, any[]> = {};
      cartItems.forEach(ci => {
        const sid = ci.product?.store_id;
        if (!byStore[sid]) byStore[sid] = [];
        byStore[sid].push(ci);
      });

      for (const [storeId, storeItems] of Object.entries(byStore)) {
        const storeSub = storeItems.reduce((s, i) => s + i.product.price * i.quantity, 0);
        const { data: order, error } = await supabase.from('orders').insert({
          buyer_id: user!.id, store_id: storeId,
          address_snapshot: address,
          shipping_courier: selectedCourier, shipping_cost: shippingCost,
          subtotal: storeSub, total: storeSub + shippingCost,
          payment_status: 'pending_verification', payment_proof_url: proofUrl,
          payment_bank: selectedBank.bank_name,
          payment_account_number: selectedBank.account_number,
          payment_account_name: selectedBank.account_name,
          status: 'pending', notes,
        }).select().single();
        if (error) throw error;
        await supabase.from('order_items').insert(
          storeItems.map(ci => ({ order_id: order.id, product_id: ci.product_id, quantity: ci.quantity, price: ci.product.price, product_snapshot: ci.product }))
        );
      }
      await supabase.from('cart_items').delete().eq('user_id', user!.id);
      toast.success('Pesanan berhasil dibuat! 🎉');
      router.push('/orders');
    } catch { toast.error('Gagal membuat pesanan. Coba lagi!'); }
    finally { setSubmitting(false); }
  };

  return (
    <div className="min-h-screen bg-[#F8F7FF] pt-32 pb-32 relative selection:bg-purple-200">
      {/* Background Aurora */}
      <div className="absolute top-0 inset-x-0 h-[400px] bg-aurora opacity-30 pointer-events-none" />
      <div className="absolute top-0 inset-x-0 h-[400px] bg-gradient-to-b from-transparent to-[#F8F7FF] pointer-events-none" />

      <div className="max-w-[1200px] mx-auto px-4 lg:px-8 relative z-10">
        <h1 className="text-3xl font-black text-slate-900 mb-8 flex items-center gap-3">
          <span className="w-12 h-12 rounded-xl bg-purple-100 flex items-center justify-center text-2xl shadow-inner">📦</span>
          Checkout
        </h1>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          <div className="lg:col-span-8 space-y-6">

            {/* Address Section */}
            <Section icon={<MapPin />} title="Alamat Pengiriman">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Input placeholder="Nama Penerima *" value={address.name} onChange={v => setAddress(a => ({ ...a, name: v }))} />
                <Input placeholder="Nomor HP *" value={address.phone} onChange={v => setAddress(a => ({ ...a, phone: v }))} />
                <div className="sm:col-span-2">
                  <Input placeholder="Alamat Lengkap *" value={address.detail} onChange={v => setAddress(a => ({ ...a, detail: v }))} />
                </div>
                <Input placeholder="Kota *" value={address.city} onChange={v => setAddress(a => ({ ...a, city: v }))} />
                <Input placeholder="Provinsi" value={address.province} onChange={v => setAddress(a => ({ ...a, province: v }))} />
              </div>
            </Section>

            {/* Courier */}
            <Section icon={<Truck />} title="Pilih Kurir">
              <div className="flex flex-wrap gap-3">
                {COURIERS.map(c => (
                  <button key={c} onClick={() => setSelectedCourier(c)}
                    className={`px-5 py-3 rounded-2xl font-bold text-sm border-2 transition-all ${selectedCourier === c ? 'bg-purple-600 border-purple-600 text-white shadow-[0_8px_20px_rgba(147,51,234,0.3)]' : 'border-slate-200 text-slate-600 hover:border-purple-300 bg-white'}`}>
                    {c} {c === 'COD' && <span className="text-amber-300 font-black ml-1">GRATIS</span>}
                  </button>
                ))}
              </div>
            </Section>

            {/* Payment */}
            <Section icon={<CreditCard />} title="Transfer Manual">
              <p className="text-sm text-slate-500 mb-4 font-medium">Transfer ke salah satu rekening, lalu upload bukti transfernya 📸</p>
              <div className="space-y-3 mb-6">
                {bankAccounts.map(bank => (
                  <button key={bank.id} onClick={() => setSelectedBank(bank)}
                    className={`w-full text-left flex items-center gap-4 p-4 rounded-2xl border-2 transition-all ${selectedBank?.id === bank.id ? 'border-purple-500 bg-purple-50' : 'border-slate-200 hover:border-purple-200 bg-white'}`}>
                    <div className={`w-5 h-5 rounded-full border-2 flex-shrink-0 ${selectedBank?.id === bank.id ? 'border-purple-600 bg-purple-600' : 'border-slate-300 bg-slate-50'}`} />
                    <div>
                      <p className="font-black text-slate-900 text-base">{bank.bank_name}</p>
                      <p className="text-purple-600 font-black text-lg">{bank.account_number}</p>
                      <p className="text-xs text-slate-500 font-bold tracking-wide mt-1 uppercase">a.n. {bank.account_name}</p>
                    </div>
                  </button>
                ))}
              </div>

              {/* Proof Upload */}
              <input ref={fileRef} type="file" accept="image/*" onChange={handleProofChange} className="hidden" />
              <button onClick={() => fileRef.current?.click()}
                className={`w-full border-2 border-dashed rounded-[2rem] p-8 transition-all hover:border-purple-400 ${proofPreview ? 'border-purple-300 bg-purple-50' : 'border-slate-200 hover:bg-slate-50 bg-white'}`}>
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
                    <p className="font-black text-slate-700 text-base">Upload Bukti Transfer</p>
                    <p className="text-sm text-slate-400 mt-2 font-medium">PNG, JPG, JPEG (max 5MB)</p>
                  </div>
                )}
              </button>
            </Section>

            {/* Notes */}
            <Section icon={<CheckCircle />} title="Catatan (Opsional)">
              <textarea value={notes} onChange={e => setNotes(e.target.value)} placeholder="Catatan untuk penjual..." rows={3}
                className="w-full px-5 py-4 rounded-2xl border-2 border-slate-100 text-sm focus:outline-none focus:border-purple-400 bg-slate-50 resize-none transition-colors font-medium text-slate-700 placeholder:text-slate-400" />
            </Section>
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-4">
            <div className="bento-card bg-white p-8 border border-slate-100 shadow-[0_8px_30px_rgba(0,0,0,0.04)] sticky top-28 space-y-6">
              <h2 className="font-black text-slate-900 text-xl flex items-center gap-2">
                <span className="w-8 h-8 rounded-lg bg-emerald-50 flex items-center justify-center text-sm">🧾</span>
                Ringkasan Pesanan
              </h2>
              
              <div className="space-y-4 max-h-[40vh] overflow-y-auto pr-2 scrollbar-hide">
                {cartItems.map(ci => {
                  const img = ci.product?.images?.find((i: any) => i.is_primary)?.image_url ?? ci.product?.images?.[0]?.image_url;
                  return (
                    <div key={ci.id} className="flex items-center gap-4 p-3 bg-slate-50 rounded-2xl border border-slate-100">
                      <div className="w-14 h-14 rounded-xl bg-white border border-slate-100 flex-shrink-0 overflow-hidden shadow-sm">
                        {img ? <img src={img} alt="" className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center">📦</div>}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-bold text-slate-800 line-clamp-1 mb-1">{ci.product?.title}</p>
                        <p className="text-xs font-bold text-slate-500">{ci.quantity}x · <span className="text-purple-600">{formatPrice(ci.product?.price ?? 0)}</span></p>
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="border-t-2 border-dashed border-slate-100 pt-5 space-y-3 text-sm font-medium">
                <div className="flex justify-between"><span className="text-slate-500">Subtotal</span><span className="font-bold text-slate-900">{formatPrice(subtotal)}</span></div>
                <div className="flex justify-between"><span className="text-slate-500">Ongkir ({selectedCourier})</span><span className="font-bold text-emerald-500 bg-emerald-50 px-2 py-0.5 rounded-md">{selectedCourier === 'COD' ? 'GRATIS' : formatPrice(shippingCost)}</span></div>
                <div className="flex justify-between font-black text-lg pt-3 mt-3 border-t-2 border-dashed border-slate-100 items-end">
                  <span className="text-slate-900">Total</span><span className="text-purple-600 text-2xl leading-none">{formatPrice(total)}</span>
                </div>
              </div>
              
              <button onClick={handleOrder} disabled={submitting}
                className="w-full py-4 bg-slate-900 hover:bg-slate-800 disabled:bg-slate-300 text-white font-black rounded-2xl shadow-[0_8px_20px_rgba(0,0,0,0.15)] flex items-center justify-center gap-2 transition-all hover:-translate-y-0.5 mt-2">
                {submitting ? <span className="animate-spin w-5 h-5 border-2 border-white/40 border-t-white rounded-full" /> : '🚀 Buat Pesanan Sekarang'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function Section({ icon, title, children }: { icon: React.ReactNode; title: string; children: React.ReactNode }) {
  return (
    <div className="bento-card bg-white p-6 lg:p-8 border border-slate-100 shadow-[0_4px_20px_rgba(0,0,0,0.03)]">
      <h2 className="flex items-center gap-3 font-black text-slate-900 mb-6 text-lg">
        <span className="text-purple-500 w-10 h-10 rounded-xl bg-purple-50 flex items-center justify-center">{icon}</span> {title}
      </h2>
      {children}
    </div>
  );
}

function Input({ placeholder, value, onChange }: { placeholder: string; value: string; onChange: (v: string) => void }) {
  return (
    <input type="text" placeholder={placeholder} value={value} onChange={e => onChange(e.target.value)}
      className="w-full px-5 py-4 rounded-2xl border-2 border-slate-100 text-sm focus:outline-none focus:border-purple-400 bg-slate-50 transition-colors font-medium text-slate-700 placeholder:text-slate-400" />
  );
}
