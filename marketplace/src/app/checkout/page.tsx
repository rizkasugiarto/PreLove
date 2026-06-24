'use client';

import { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/context/AuthContext';
import { formatPrice } from '@/lib/utils';
import toast from 'react-hot-toast';
import { Upload, X, MapPin, Truck, CreditCard, CheckCircle, ShieldCheck, Package } from 'lucide-react';

const COURIERS = ['JNE', 'JNT', 'SiCepat', 'AnterAja'];

const REGIONS: Record<string, Record<string, string[]>> = {
  'DKI Jakarta': {
    'Kota Jakarta Selatan': ['Kebayoran Baru', 'Tebet', 'Cilandak', 'Pasar Minggu', 'Pancoran', 'Setiabudi', 'Mampang Prapatan'],
    'Kota Jakarta Pusat': ['Menteng', 'Tanah Abang', 'Sawah Besar', 'Kemayoran'],
    'Kota Jakarta Barat': ['Kebon Jeruk', 'Grogol Petamburan', 'Cengkareng'],
    'Kota Jakarta Timur': ['Jatinegara', 'Duren Sawit', 'Cakung'],
    'Kota Jakarta Utara': ['Kelapa Gading', 'Penjaringan', 'Tanjung Priok'],
  },
  'Jawa Barat': {
    'Kota Bandung': ['Pasteur', 'Dago', 'Cidadap', 'Coblong'],
    'Kab. Bandung': ['Baleendah', 'Dayeuhkolot', 'Bojongsoang', 'Soreang'],
    'Kab. Bandung Barat': ['Lembang', 'Padalarang', 'Cimahi'],
    'Kota Bogor': ['Bogor Tengah', 'Bogor Timur', 'Bogor Utara', 'Bogor Selatan'],
    'Kab. Bogor': ['Cibinong', 'Cileungsi', 'Bojonggede', 'Ciawi'],
    'Kota Depok': ['Margonda', 'Cimanggis', 'Sawangan', 'Beji'],
    'Kota Bekasi': ['Bekasi Barat', 'Bekasi Timur', 'Bekasi Selatan', 'Medan Satria'],
    'Kab. Bekasi': ['Cikarang', 'Tambun', 'Cibitung'],
  },
  'Jawa Tengah': {
    'Kota Semarang': ['Semarang Barat', 'Semarang Timur', 'Semarang Selatan', 'Tembalang'],
    'Kab. Semarang': ['Ungaran', 'Ambarawa', 'Bawen'],
    'Kota Surakarta': ['Laweyan', 'Serengan', 'Pasar Kliwon', 'Jebres'],
    'Kab. Sukoharjo': ['Kartasura', 'Grogol', 'Baki'],
  },
  'Jawa Timur': {
    'Kota Surabaya': ['Gubeng', 'Tegalsari', 'Wiyung', 'Wonokromo', 'Rungkut'],
    'Kota Malang': ['Blimbing', 'Klojen', 'Lowokwaru', 'Sukun'],
    'Kab. Malang': ['Singosari', 'Kepanjen', 'Batu'],
    'Kab. Sidoarjo': ['Waru', 'Taman', 'Gedangan', 'Sidoarjo Kota'],
  },
  'Banten': {
    'Kota Tangerang': ['Batuceper', 'Benda', 'Ciledug', 'Cipondoh'],
    'Kota Tangerang Selatan': ['Serpong', 'Pamulang', 'Ciputat', 'Pondok Aren'],
    'Kab. Tangerang': ['Cikupa', 'Balaraja', 'Kelapa Dua'],
  },
  'DI Yogyakarta': {
    'Kota Yogyakarta': ['Danurejan', 'Gedongtengen', 'Gondokusuman', 'Jetis'],
    'Kab. Sleman': ['Depok', 'Gamping', 'Mlati', 'Ngaglik'],
    'Kab. Bantul': ['Banguntapan', 'Kasihan', 'Sewon', 'Bambanglipuro'],
  },
  'Bali': {
    'Kota Denpasar': ['Denpasar Barat', 'Denpasar Selatan', 'Denpasar Timur', 'Denpasar Utara'],
    'Kab. Badung': ['Kuta', 'Kuta Selatan', 'Kuta Utara', 'Mengwi'],
  }
};

const PROVINCES = Object.keys(REGIONS);
const RTS = Array.from({length: 20}, (_, i) => String(i + 1).padStart(3, '0'));
const RWS = Array.from({length: 20}, (_, i) => String(i + 1).padStart(3, '0'));

export default function CheckoutPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [cartItems, setCartItems] = useState<any[]>([]);
  const [bankAccounts, setBankAccounts] = useState<any[]>([]);
  const [selectedBank, setSelectedBank] = useState<any>(null);
  const [selectedCourier, setSelectedCourier] = useState('JNE');
  const [address, setAddress] = useState({ name: '', phone: '', detail: '', province: '', city: '', subdistrict: '', rt: '', rw: '' });
  const [isDropship, setIsDropship] = useState(false);
  const [dropshipInfo, setDropshipInfo] = useState({ name: '', phone: '' });
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
    if (cart) {
      const searchParams = new URLSearchParams(window.location.search);
      const itemsParam = searchParams.get('items');
      const filteredCart = itemsParam ? cart.filter(c => itemsParam.split(',').includes(c.id)) : cart;
      setCartItems(filteredCart);
    }
    if (banks && banks.length > 0) { 
      // Deduplicate banks by account_number (in case of double seeding)
      const uniqueBanks = banks.filter((b, index, self) => 
        index === self.findIndex((t) => t.account_number === b.account_number)
      );
      setBankAccounts(uniqueBanks); 
      setSelectedBank(uniqueBanks[0]); 
    }
  };

  const subtotal = cartItems.reduce((sum, i) => sum + (i.product?.price ?? 0) * i.quantity, 0);
  
  const byStore: Record<string, any[]> = {};
  cartItems.forEach(ci => {
    const sid = ci.product?.store_id;
    if (!byStore[sid]) byStore[sid] = [];
    byStore[sid].push(ci);
  });
  
  const availableCities = address.province ? Object.keys(REGIONS[address.province] || {}) : [];
  const availableSubdistricts = address.province && address.city ? (REGIONS[address.province]?.[address.city] || []) : [];

  const storeCount = Object.keys(byStore).length || 1;
  const shippingCost = 15000 * storeCount;
  const total = subtotal + shippingCost;

  const handleOrder = async () => {
    if (!address.name || !address.phone || !address.detail || !address.province || !address.city || !address.subdistrict || !address.rt || !address.rw) { toast.error('Lengkapi alamat pengiriman!'); return; }
    if (isDropship && (!dropshipInfo.name || !dropshipInfo.phone)) { toast.error('Lengkapi nama & nomor HP pengirim dropship!'); return; }
    if (!selectedBank) { toast.error('Pilih metode pembayaran!'); return; }
    
    setSubmitting(true);
    try {
      const byStore: Record<string, any[]> = {};
      cartItems.forEach(ci => {
        const sid = ci.product?.store_id;
        if (!byStore[sid]) byStore[sid] = [];
        byStore[sid].push(ci);
      });

      let lastOrderId = '';

      for (const [storeId, storeItems] of Object.entries(byStore)) {
        const storeSub = storeItems.reduce((s, i) => s + i.product.price * i.quantity, 0);
        
        const itemsJson = storeItems.map(ci => ({
          product_id: ci.product_id,
          quantity: ci.quantity,
          price: ci.product.price,
          snapshot: ci.product
        }));

        const { data: orderId, error } = await supabase.rpc('process_checkout_reservation', {
          p_buyer_id: user!.id,
          p_store_id: storeId,
          p_shipping_address: JSON.stringify({ ...address, is_dropship: isDropship, dropshipper_name: dropshipInfo.name, dropshipper_phone: dropshipInfo.phone }),
          p_shipping_method: selectedCourier,
          p_shipping_cost: shippingCost,
          p_total: storeSub + shippingCost,
          p_items: itemsJson
        });

        if (error) {
           throw new Error(error.message || 'Gagal proses checkout (Stok mungkin habis)');
        }
        
        lastOrderId = orderId;
        
        let updateData: any = {
           payment_bank: selectedBank.bank_name,
           payment_account_number: selectedBank.account_number,
           payment_account_name: selectedBank.account_name,
           address_snapshot: address,
           notes: notes
        };
        
        if (selectedBank.bank_name === 'COD') {
           updateData.status = 'pending';
           updateData.payment_status = 'verified'; // or whatever represents cod payment
        }

        await supabase.from('orders').update(updateData).eq('id', orderId);
      }

      await supabase.from('cart_items').delete().in('id', cartItems.map(c => c.id));
      toast.success('Berhasil! Segera selesaikan pembayaran ⏳');
      
      if (Object.keys(byStore).length === 1 && lastOrderId) {
        router.push(`/orders/${lastOrderId}/payment`);
      } else {
        router.push('/orders');
      }
    } catch (err: any) { 
      toast.error(err.message || 'Gagal membuat pesanan. Coba lagi!'); 
    }
    finally { setSubmitting(false); }
  };

  return (
    <div style={{ minHeight: '100vh', background: 'radial-gradient(ellipse at top left, #EDE9FE 0%, #F5F3FF 40%, #EFF6FF 100%)', color: '#111827', paddingBottom: '128px', paddingTop: '112px' }}>
      {/* Aurora Blobs */}
      <div className="absolute top-0 left-0 w-full h-[500px] overflow-hidden pointer-events-none">
        <div className="absolute -top-[20%] -left-[10%] w-[50%] h-[80%] rounded-full blur-[120px] bg-purple-300/40 mix-blend-multiply" />
        <div className="absolute top-[10%] -right-[10%] w-[40%] h-[60%] rounded-full blur-[100px] bg-emerald-200/40 mix-blend-multiply" />
      </div>

      <div className="max-w-[1200px] mx-auto px-4 lg:px-8 relative z-10">
        <h1 style={{ fontSize: '36px', fontWeight: 900, color: '#111827', marginBottom: '40px', display: 'flex', alignItems: 'center', gap: '16px', letterSpacing: '-0.02em' }}>
          <div style={{ width: '56px', height: '56px', borderRadius: '16px', background: 'rgba(255,255,255,0.6)', backdropFilter: 'blur(10px)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '28px', border: '1px solid rgba(255,255,255,0.8)', boxShadow: '0 8px 16px rgba(124,58,237,0.05)' }}>📦</div>
          Checkout
        </h1>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start relative">
          <div className="lg:col-span-8 space-y-6">

            {/* Address Section */}
            <Section icon={<MapPin size={20} />} title="Alamat Pengiriman">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Input placeholder="Nama Penerima *" value={address.name} onChange={v => setAddress(a => ({ ...a, name: v }))} />
                <Input placeholder="Nomor HP *" value={address.phone} onChange={v => setAddress(a => ({ ...a, phone: v }))} />
                <div className="sm:col-span-2">
                  <Input placeholder="Alamat Lengkap (Jalan, No Rumah) *" value={address.detail} onChange={v => setAddress(a => ({ ...a, detail: v }))} />
                </div>
                <Select placeholder="Pilih Provinsi *" value={address.province} options={PROVINCES} onChange={v => setAddress(a => ({ ...a, province: v, city: '', subdistrict: '' }))} />
                <Select placeholder="Pilih Kota/Kabupaten *" value={address.city} options={availableCities} onChange={v => setAddress(a => ({ ...a, city: v, subdistrict: '' }))} />
                <Select placeholder="Pilih Kecamatan/Kelurahan *" value={address.subdistrict} options={availableSubdistricts} onChange={v => setAddress(a => ({ ...a, subdistrict: v }))} />
                <div className="grid grid-cols-2 gap-4">
                  <Select placeholder="RT *" value={address.rt} options={RTS} onChange={v => setAddress(a => ({ ...a, rt: v }))} />
                  <Select placeholder="RW *" value={address.rw} options={RWS} onChange={v => setAddress(a => ({ ...a, rw: v }))} />
                </div>
              </div>

              {/* Dropshipper Toggle */}
              <div style={{ marginTop: '24px', paddingTop: '24px', borderTop: '2px dashed rgba(0,0,0,0.06)' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: '12px', cursor: 'pointer', marginBottom: isDropship ? '16px' : '0' }}>
                  <input type="checkbox" checked={isDropship} onChange={e => setIsDropship(e.target.checked)}
                    style={{ width: '22px', height: '22px', borderRadius: '6px', cursor: 'pointer', accentColor: '#8B5CF6' }} />
                  <span style={{ fontWeight: 800, color: '#374151', fontSize: '15px' }}>Kirim sebagai Dropshipper</span>
                </label>
                
                {isDropship && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <Input placeholder="Nama Pengirim *" value={dropshipInfo.name} onChange={v => setDropshipInfo(i => ({ ...i, name: v }))} />
                    <Input placeholder="Nomor HP Pengirim *" value={dropshipInfo.phone} onChange={v => setDropshipInfo(i => ({ ...i, phone: v }))} />
                  </div>
                )}
              </div>
            </Section>

            {/* Courier */}
            <Section icon={<Truck size={20} />} title="Pilih Kurir">
              <div className="flex flex-wrap gap-3">
                {COURIERS.map(c => (
                  <button key={c} onClick={() => setSelectedCourier(c)}
                    style={{
                      padding: '12px 24px', borderRadius: '16px', fontWeight: 800, fontSize: '14px', transition: 'all 0.2s',
                      background: selectedCourier === c ? 'linear-gradient(135deg, #8B5CF6, #6D28D9)' : 'rgba(255,255,255,0.6)',
                      color: selectedCourier === c ? 'white' : '#4B5563',
                      border: selectedCourier === c ? '1px solid transparent' : '1px solid rgba(0,0,0,0.1)',
                      boxShadow: selectedCourier === c ? '0 8px 16px rgba(124,58,237,0.25)' : 'none'
                    }}
                    className={selectedCourier !== c ? "hover:bg-white hover:border-purple-300" : ""}>
                    {c} {c === 'COD' && <span style={{ color: selectedCourier === c ? '#FDE047' : '#D97706', fontWeight: 900, marginLeft: '4px' }}>GRATIS</span>}
                  </button>
                ))}
              </div>
            </Section>

            {/* Payment */}
            <Section icon={<CreditCard size={20} />} title="Metode Pembayaran">
              <p style={{ fontSize: '14px', color: '#6B7280', marginBottom: '20px', fontWeight: 500 }}>
                Pilih metode pembayaran yang kamu inginkan. Waktu transfer adalah <strong style={{ color: '#7C3AED' }}>15 menit</strong>! ⏳
              </p>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                {/* COD */}
                <div>
                  <h3 style={{ fontSize: '13px', fontWeight: 900, color: '#9CA3AF', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '12px' }}>Bayar di Tempat</h3>
                  <button onClick={() => setSelectedBank({ id: 'COD', bank_name: 'COD', account_number: '-', account_name: '-' })}
                    style={{
                      width: '100%', textAlign: 'left', display: 'flex', alignItems: 'center', gap: '16px', padding: '20px',
                      borderRadius: '20px', transition: 'all 0.2s', cursor: 'pointer',
                      background: selectedBank?.id === 'COD' ? 'rgba(139,92,246,0.05)' : 'rgba(255,255,255,0.6)',
                      border: selectedBank?.id === 'COD' ? '2px solid #8B5CF6' : '1px solid rgba(0,0,0,0.1)'
                    }}
                    className={selectedBank?.id !== 'COD' ? "hover:bg-white hover:border-purple-200" : ""}>
                    <div style={{ width: '24px', height: '24px', borderRadius: '50%', flexShrink: 0, border: selectedBank?.id === 'COD' ? '6px solid #8B5CF6' : '2px solid #D1D5DB', background: 'white' }} />
                    <div>
                      <p style={{ fontWeight: 900, color: '#111827', fontSize: '16px', margin: 0 }}>Cash on Delivery (COD)</p>
                      <p style={{ color: '#6B7280', fontWeight: 600, fontSize: '13px', margin: '2px 0 0' }}>Bayar tunai ke kurir saat paket diterima</p>
                    </div>
                  </button>
                </div>

                {/* Transfer Bank */}
                <div>
                  <h3 style={{ fontSize: '13px', fontWeight: 900, color: '#9CA3AF', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '12px' }}>Transfer Bank</h3>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    {bankAccounts.filter(b => !['GoPay', 'OVO', 'Dana'].includes(b.bank_name)).map(bank => (
                      <button key={bank.id} onClick={() => setSelectedBank(bank)}
                        style={{
                          width: '100%', textAlign: 'left', display: 'flex', alignItems: 'center', gap: '16px', padding: '20px',
                          borderRadius: '20px', transition: 'all 0.2s', cursor: 'pointer',
                          background: selectedBank?.id === bank.id ? 'rgba(139,92,246,0.05)' : 'rgba(255,255,255,0.6)',
                          border: selectedBank?.id === bank.id ? '2px solid #8B5CF6' : '1px solid rgba(0,0,0,0.1)'
                        }}
                        className={selectedBank?.id !== bank.id ? "hover:bg-white hover:border-purple-200" : ""}>
                        <div style={{
                          width: '24px', height: '24px', borderRadius: '50%', flexShrink: 0,
                          border: selectedBank?.id === bank.id ? '6px solid #8B5CF6' : '2px solid #D1D5DB',
                          background: 'white'
                        }} />
                        <div>
                          <p style={{ fontWeight: 900, color: '#111827', fontSize: '16px', margin: 0 }}>{bank.bank_name}</p>
                          <p style={{ color: '#7C3AED', fontWeight: 900, fontSize: '18px', margin: '2px 0' }}>{bank.account_number}</p>
                          <p style={{ fontSize: '11px', color: '#6B7280', fontWeight: 800, letterSpacing: '0.05em', textTransform: 'uppercase', margin: 0 }}>a.n. {bank.account_name}</p>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>

                {/* E-Wallet */}
                <div>
                  <h3 style={{ fontSize: '13px', fontWeight: 900, color: '#9CA3AF', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '12px' }}>E-Wallet</h3>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    {bankAccounts.filter(b => ['GoPay', 'OVO', 'Dana'].includes(b.bank_name)).map(bank => (
                      <button key={bank.id} onClick={() => setSelectedBank(bank)}
                        style={{
                          width: '100%', textAlign: 'left', display: 'flex', alignItems: 'center', gap: '16px', padding: '20px',
                          borderRadius: '20px', transition: 'all 0.2s', cursor: 'pointer',
                          background: selectedBank?.id === bank.id ? 'rgba(139,92,246,0.05)' : 'rgba(255,255,255,0.6)',
                          border: selectedBank?.id === bank.id ? '2px solid #8B5CF6' : '1px solid rgba(0,0,0,0.1)'
                        }}
                        className={selectedBank?.id !== bank.id ? "hover:bg-white hover:border-purple-200" : ""}>
                        <div style={{
                          width: '24px', height: '24px', borderRadius: '50%', flexShrink: 0,
                          border: selectedBank?.id === bank.id ? '6px solid #8B5CF6' : '2px solid #D1D5DB',
                          background: 'white'
                        }} />
                        <div>
                          <p style={{ fontWeight: 900, color: '#111827', fontSize: '16px', margin: 0 }}>{bank.bank_name}</p>
                          <p style={{ color: '#7C3AED', fontWeight: 900, fontSize: '18px', margin: '2px 0' }}>{bank.account_number}</p>
                          <p style={{ fontSize: '11px', color: '#6B7280', fontWeight: 800, letterSpacing: '0.05em', textTransform: 'uppercase', margin: 0 }}>a.n. {bank.account_name}</p>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </Section>

            {/* Notes */}
            <Section icon={<CheckCircle size={20} />} title="Catatan (Opsional)">
              <textarea value={notes} onChange={e => setNotes(e.target.value)} placeholder="Catatan untuk penjual..." rows={3}
                style={{
                  width: '100%', padding: '20px', borderRadius: '20px', border: '1px solid rgba(0,0,0,0.1)',
                  fontSize: '14px', background: 'rgba(255,255,255,0.6)', resize: 'none', fontWeight: 500, color: '#374151',
                  outline: 'none', transition: 'all 0.2s'
                }}
                onFocus={(e) => { e.target.style.background = 'white'; e.target.style.borderColor = '#A855F7'; e.target.style.boxShadow = '0 0 0 4px rgba(168,85,247,0.1)'; }}
                onBlur={(e) => { e.target.style.background = 'rgba(255,255,255,0.6)'; e.target.style.borderColor = 'rgba(0,0,0,0.1)'; e.target.style.boxShadow = 'none'; }}
              />
            </Section>
            
            {/* Escrow Banner */}
            <div style={{
              background: 'rgba(243,232,255,0.6)', backdropFilter: 'blur(10px)',
              borderRadius: '24px', border: '1px solid rgba(216,180,254,0.6)',
              padding: '24px', display: 'flex', alignItems: 'flex-start', gap: '16px'
            }}>
              <div style={{ width: '48px', height: '48px', borderRadius: '16px', background: '#E9D5FF', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#7C3AED', flexShrink: 0 }}>
                <ShieldCheck size={24} />
              </div>
              <div>
                <h3 style={{ fontWeight: 900, color: '#111827', fontSize: '16px', marginBottom: '4px' }}>Transaksi Aman Terlindungi</h3>
                <p style={{ fontSize: '14px', color: '#4B5563', fontWeight: 500, lineHeight: 1.6, margin: 0 }}>
                  Pembayaran Anda dilindungi oleh sistem Escrow PreLove. Dana akan ditahan dengan aman dan baru diteruskan ke penjual setelah Anda mengonfirmasi bahwa pesanan telah diterima dengan baik.
                </p>
              </div>
            </div>
          </div>

          {/* Order Summary (Sticky) */}
          <div className="lg:col-span-4 sticky top-28 h-fit">
            <div style={{
              background: 'rgba(255,255,255,0.85)', backdropFilter: 'blur(24px)', WebkitBackdropFilter: 'blur(24px)',
              borderRadius: '32px', border: '1px solid rgba(255,255,255,0.9)',
              boxShadow: '0 12px 32px rgba(124,58,237,0.06), 0 4px 12px rgba(0,0,0,0.02)',
              padding: '32px', display: 'flex', flexDirection: 'column', gap: '24px'
            }}>
              <h2 style={{ fontSize: '20px', fontWeight: 900, color: '#111827', margin: 0, display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: '#D1FAE5', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '16px' }}>🧾</div>
                Ringkasan Pesanan
              </h2>
              
              <div style={{ maxHeight: '40vh', overflowY: 'auto', paddingRight: '8px', display: 'flex', flexDirection: 'column', gap: '16px' }} className="scrollbar-hide">
                {Object.entries(byStore).map(([storeId, items]) => (
                  <div key={storeId}>
                    <p style={{ fontSize: '11px', fontWeight: 900, color: '#9CA3AF', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                      🏪 {items[0]?.product?.store?.name}
                    </p>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                      {items.map(ci => {
                        const img = ci.product?.images?.find((i: any) => i.is_primary)?.image_url ?? ci.product?.images?.[0]?.image_url;
                        return (
                          <div key={ci.id} style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '12px', background: 'rgba(255,255,255,0.6)', borderRadius: '16px', border: '1px solid rgba(0,0,0,0.05)' }}>
                            <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: 'white', border: '1px solid rgba(0,0,0,0.05)', overflow: 'hidden', flexShrink: 0 }}>
                              {img ? <img src={img} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>📦</div>}
                            </div>
                            <div style={{ flex: 1, minWidth: 0 }}>
                              <p style={{ fontSize: '13px', fontWeight: 800, color: '#111827', margin: '0 0 2px 0', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{ci.product?.title}</p>
                              <p style={{ fontSize: '12px', fontWeight: 800, color: '#6B7280', margin: 0 }}>{ci.quantity}x · <span style={{ color: '#7C3AED' }}>{formatPrice(ci.product?.price ?? 0)}</span></p>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>

              <div style={{ paddingTop: '20px', borderTop: '2px dashed rgba(0,0,0,0.06)', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '14px', fontWeight: 600, color: '#6B7280' }}>Subtotal</span>
                  <span style={{ fontSize: '15px', fontWeight: 800, color: '#111827' }}>{formatPrice(subtotal)}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '14px', fontWeight: 600, color: '#6B7280' }}>Ongkir ({selectedCourier})</span>
                  <span style={{ fontSize: '12px', fontWeight: 800, color: '#10B981', background: '#D1FAE5', padding: '4px 10px', borderRadius: '8px' }}>
                    {selectedCourier === 'COD' ? 'GRATIS' : `${formatPrice(shippingCost)} (${storeCount} Toko)`}
                  </span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', paddingTop: '12px', marginTop: '4px', borderTop: '2px dashed rgba(0,0,0,0.06)' }}>
                  <span style={{ fontSize: '16px', fontWeight: 900, color: '#111827' }}>Total</span>
                  <span style={{ fontSize: '28px', fontWeight: 900, background: 'linear-gradient(135deg, #7C3AED, #DB2777)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', lineHeight: 1 }}>{formatPrice(total)}</span>
                </div>
              </div>
              
              <button onClick={handleOrder} disabled={submitting}
                style={{
                  width: '100%', padding: '18px', background: 'linear-gradient(135deg, #111827, #374151)', color: 'white', border: 'none',
                  borderRadius: '20px', fontWeight: 900, fontSize: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', cursor: 'pointer', boxShadow: '0 10px 25px rgba(0,0,0,0.15)', transition: 'transform 0.2s', marginTop: '8px'
                }}
                className="hover:-translate-y-1 disabled:opacity-50 disabled:hover:translate-y-0"
              >
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
    <div style={{
      background: 'rgba(255,255,255,0.7)', backdropFilter: 'blur(24px)', WebkitBackdropFilter: 'blur(24px)',
      borderRadius: '32px', border: '1px solid rgba(255,255,255,0.9)',
      boxShadow: '0 12px 32px rgba(124,58,237,0.03)', padding: '32px'
    }}>
      <h2 style={{ display: 'flex', alignItems: 'center', gap: '16px', fontWeight: 900, color: '#111827', marginBottom: '24px', fontSize: '18px' }}>
        <span style={{ color: '#8B5CF6', width: '40px', height: '40px', borderRadius: '12px', background: 'rgba(139,92,246,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{icon}</span> {title}
      </h2>
      {children}
    </div>
  );
}

function Input({ placeholder, value, onChange }: { placeholder: string; value: string; onChange: (v: string) => void }) {
  return (
    <input type="text" placeholder={placeholder} value={value} onChange={e => onChange(e.target.value)}
      style={{
        width: '100%', padding: '16px 20px', borderRadius: '16px', border: '1px solid rgba(0,0,0,0.1)',
        fontSize: '14px', background: 'rgba(255,255,255,0.6)', fontWeight: 600, color: '#374151',
        outline: 'none', transition: 'all 0.2s'
      }}
      onFocus={(e) => { e.target.style.background = 'white'; e.target.style.borderColor = '#A855F7'; e.target.style.boxShadow = '0 0 0 4px rgba(168,85,247,0.1)'; }}
      onBlur={(e) => { e.target.style.background = 'rgba(255,255,255,0.6)'; e.target.style.borderColor = 'rgba(0,0,0,0.1)'; e.target.style.boxShadow = 'none'; }}
    />
  );
}

function Select({ placeholder, value, options, onChange }: { placeholder: string; value: string; options: string[]; onChange: (v: string) => void }) {
  return (
    <div className="relative">
      <select value={value} onChange={e => onChange(e.target.value)}
        style={{
          width: '100%', padding: '16px 20px', borderRadius: '16px', border: '1px solid rgba(0,0,0,0.1)',
          fontSize: '14px', background: 'rgba(255,255,255,0.6)', fontWeight: 600, color: value ? '#374151' : '#9CA3AF',
          outline: 'none', transition: 'all 0.2s', appearance: 'none', cursor: 'pointer'
        }}
        onFocus={(e) => { e.target.style.background = 'white'; e.target.style.borderColor = '#A855F7'; e.target.style.boxShadow = '0 0 0 4px rgba(168,85,247,0.1)'; }}
        onBlur={(e) => { e.target.style.background = 'rgba(255,255,255,0.6)'; e.target.style.borderColor = 'rgba(0,0,0,0.1)'; e.target.style.boxShadow = 'none'; }}
      >
        <option value="" disabled>{placeholder}</option>
        {options.map(opt => <option key={opt} value={opt} style={{color: '#111827'}}>{opt}</option>)}
      </select>
      <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
        <svg width="12" height="12" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M2.5 4.5L6 8L9.5 4.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      </div>
    </div>
  );
}
