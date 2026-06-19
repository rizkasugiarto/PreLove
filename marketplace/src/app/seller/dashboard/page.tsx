'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/context/AuthContext';
import { formatPrice } from '@/lib/utils';
import toast from 'react-hot-toast';
import { Plus, Package, ShoppingBag, Star, Pencil, Trash2, Check, X, Truck, TrendingUp, AlertCircle, Edit3, Image as ImageIcon } from 'lucide-react';

const ORDER_TABS = ['Semua', 'Pending', 'Dikonfirmasi', 'Dikemas', 'Dikirim', 'Selesai'];
const TAB_STATUS: Record<string, string[]> = {
  'Semua': [], 'Pending': ['pending'], 'Dikonfirmasi': ['confirmed'],
  'Dikemas': ['packed'], 'Dikirim': ['shipped'], 'Selesai': ['delivered', 'completed'],
};

export default function SellerDashboardPage() {
  const { user, profile } = useAuth();
  const router = useRouter();
  const [store, setStore] = useState<any>(null);
  const [products, setProducts] = useState<any[]>([]);
  const [orders, setOrders] = useState<any[]>([]);
  const [allOrders, setAllOrders] = useState<any[]>([]); // For stats
  const [activeSection, setActiveSection] = useState<'products' | 'orders'>('products');
  const [orderTab, setOrderTab] = useState('Semua');
  const [loading, setLoading] = useState(true);
  const [resiModal, setResiModal] = useState<{ orderId: string; open: boolean }>({ orderId: '', open: false });
  const [resiInput, setResiInput] = useState('');

  useEffect(() => {
    if (!user) { router.push('/auth/login'); return; }
    if (profile && !profile.store) { router.push('/seller/open-store'); return; }
    if (profile?.store) { fetchStore(profile.store.id); fetchProducts(profile.store.id); fetchAllOrders(profile.store.id); }
  }, [user, profile]);

  useEffect(() => {
    if (store) filterOrders();
  }, [store, orderTab, allOrders]);

  const fetchStore = async (storeId: string) => { const { data } = await supabase.from('stores').select('*').eq('id', storeId).single(); setStore(data); setLoading(false); };
  const fetchProducts = async (storeId: string) => { const { data } = await supabase.from('products').select('*, images:product_images(*)').eq('store_id', storeId).order('created_at', { ascending: false }); setProducts(data ?? []); };
  const fetchAllOrders = async (storeId: string) => {
    const { data } = await supabase.from('orders').select('*, buyer:profiles(full_name), items:order_items(product_snapshot)').eq('store_id', storeId).order('created_at', { ascending: false });
    setAllOrders(data ?? []);
  };
  const filterOrders = () => {
    const statuses = TAB_STATUS[orderTab];
    if (statuses.length === 0) setOrders(allOrders);
    else setOrders(allOrders.filter(o => statuses.includes(o.status)));
  };

  const toggleActive = async (id: string, current: boolean) => {
    await supabase.from('products').update({ is_active: !current }).eq('id', id);
    setProducts(prev => prev.map(p => p.id === id ? { ...p, is_active: !current } : p));
  };

  const deleteProduct = async (id: string) => {
    if (!confirm('Hapus produk ini?')) return;
    await supabase.from('products').delete().eq('id', id);
    setProducts(prev => prev.filter(p => p.id !== id));
    toast.success('Produk dihapus');
  };

  const updateOrderStatus = async (orderId: string, status: string) => {
    await supabase.from('orders').update({ status }).eq('id', orderId);
    toast.success(`Status diperbarui ke ${status}`);
    fetchAllOrders(store.id);
  };

  const submitResi = async () => {
    if (!resiInput.trim()) return;
    await supabase.from('orders').update({ tracking_number: resiInput.trim(), status: 'shipped' }).eq('id', resiModal.orderId);
    setResiModal({ orderId: '', open: false });
    setResiInput('');
    toast.success('Nomor resi disimpan! 🚚');
    fetchAllOrders(store.id);
  };

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-[#F8F7FF]">
      <div className="animate-spin w-12 h-12 border-4 border-violet-600 border-t-transparent rounded-full" />
    </div>
  );

  const pendingOrdersCount = allOrders.filter(o => o.status === 'pending').length;

  return (
    <div style={{
      minHeight: '100vh',
      background: 'radial-gradient(ellipse at top left, #EDE9FE 0%, #F5F3FF 40%, #EFF6FF 80%, #F8F7FF 100%)',
      position: 'relative',
      overflow: 'hidden'
    }}>
      {/* Decorative blobs */}
      <div style={{ position: 'absolute', top: '-10%', right: '-5%', width: '400px', height: '400px', background: 'radial-gradient(circle, rgba(139,92,246,0.15), transparent 70%)', borderRadius: '50%', pointerEvents: 'none' }} />
      <div style={{ position: 'absolute', top: '40%', left: '-10%', width: '300px', height: '300px', background: 'radial-gradient(circle, rgba(196,181,253,0.15), transparent 70%)', borderRadius: '50%', pointerEvents: 'none' }} />

      <div className="max-w-6xl mx-auto px-4 py-8 relative z-10">
        
        {/* Welcome Header */}
        <div className="flex flex-col md:flex-row gap-6 mb-8 items-center justify-between">
          <div className="flex items-center gap-5">
            <div className="w-20 h-20 rounded-2xl bg-white shadow-xl shadow-violet-200/50 flex items-center justify-center overflow-hidden border-2 border-white">
              {store?.logo_url ? <img src={store.logo_url} alt="" className="w-full h-full object-cover" /> : <Store size={32} className="text-violet-400" />}
            </div>
            <div>
              <h1 className="text-3xl font-black text-indigo-950 tracking-tight">Halo, {store?.name}! 👋</h1>
              <p className="text-slate-500 font-medium mt-1">Selamat datang di Seller Center Looply.</p>
            </div>
          </div>
          <button onClick={() => router.push('/seller/add-product')} className="group flex items-center gap-2 px-6 py-3.5 bg-gradient-to-r from-violet-600 to-purple-600 text-white rounded-2xl font-bold shadow-lg shadow-violet-500/30 hover:shadow-violet-500/50 hover:-translate-y-1 transition-all">
            <Plus className="w-5 h-5 group-hover:rotate-90 transition-transform" /> Tambah Produk
          </button>
        </div>

        {/* Bento Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <StatCard icon={<Package className="text-blue-500" />} title="Total Produk" value={products.length} bg="bg-blue-50" border="border-blue-100" />
          <StatCard icon={<TrendingUp className="text-emerald-500" />} title="Produk Terjual" value={store?.total_sales ?? 0} bg="bg-emerald-50" border="border-emerald-100" />
          <StatCard icon={<ShoppingBag className="text-violet-500" />} title="Pesanan Baru" value={pendingOrdersCount} bg="bg-violet-50" border="border-violet-100" highlight={pendingOrdersCount > 0} />
          <StatCard icon={<Star className="text-amber-500" fill="currentColor" />} title="Rating Toko" value={store?.rating?.toFixed(1) ?? '0.0'} bg="bg-amber-50" border="border-amber-100" />
        </div>

        {/* Main Content Area (Glassmorphism) */}
        <div className="bg-white/80 backdrop-blur-xl border border-white rounded-3xl shadow-2xl shadow-indigo-100/50 overflow-hidden">
          
          {/* Section Tabs */}
          <div className="flex p-4 gap-2 border-b border-indigo-50/50 bg-white/50">
            <TabBtn active={activeSection === 'products'} onClick={() => setActiveSection('products')} icon={<Package size={18} />} label={`Produk (${products.length})`} />
            <TabBtn active={activeSection === 'orders'} onClick={() => setActiveSection('orders')} icon={<ShoppingBag size={18} />} label={`Pesanan (${allOrders.length})`} badge={pendingOrdersCount > 0 ? pendingOrdersCount : undefined} />
          </div>

          <div className="p-6">
            {activeSection === 'products' ? (
              <div className="space-y-4">
                {products.length === 0 ? (
                  <EmptyState icon={<Package size={48} />} title="Belum ada produk" desc="Ayo mulai berjualan dengan menambahkan produk pertamamu!" action={() => router.push('/seller/add-product')} btnText="Tambah Produk Sekarang" />
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {products.map(p => {
                      const img = p.images?.find((i: any) => i.is_primary)?.image_url ?? p.images?.[0]?.image_url;
                      return (
                        <div key={p.id} className="group bg-white rounded-2xl border border-slate-100 p-4 flex gap-4 hover:border-violet-300 hover:shadow-xl hover:shadow-violet-100/50 transition-all">
                          <div className="w-24 h-24 rounded-xl bg-slate-50 flex-shrink-0 overflow-hidden border border-slate-100 relative">
                            {img ? <img src={img} alt="" className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" /> : <div className="w-full h-full flex items-center justify-center text-slate-300"><ImageIcon size={32} /></div>}
                            {!p.is_active && <div className="absolute inset-0 bg-white/60 backdrop-blur-sm flex items-center justify-center font-bold text-slate-500 text-xs">NONAKTIF</div>}
                          </div>
                          <div className="flex-1 flex flex-col justify-between min-w-0">
                            <div>
                              <div className="flex justify-between items-start mb-1">
                                <h3 className="font-bold text-slate-800 text-sm line-clamp-1 pr-2">{p.title}</h3>
                                <div className="flex gap-1">
                                  <button onClick={() => router.push(`/seller/add-product?id=${p.id}`)} className="text-slate-400 hover:text-violet-600 transition-colors p-1" title="Edit"><Edit3 size={16} /></button>
                                  <button onClick={() => deleteProduct(p.id)} className="text-slate-400 hover:text-red-500 transition-colors p-1" title="Hapus"><Trash2 size={16} /></button>
                                </div>
                              </div>
                              <p className="text-violet-600 font-black text-lg leading-none">{formatPrice(p.price)}</p>
                            </div>
                            <div className="flex items-center justify-between mt-2">
                              <span className="text-xs font-semibold text-slate-500 bg-slate-100 px-2 py-1 rounded-md">Stok: {p.stock}</span>
                              <button onClick={() => toggleActive(p.id, p.is_active)} className={`text-xs font-bold px-3 py-1.5 rounded-lg transition-colors ${p.is_active ? 'bg-emerald-50 text-emerald-600 hover:bg-emerald-100' : 'bg-slate-100 text-slate-500 hover:bg-slate-200'}`}>
                                {p.is_active ? 'Aktif' : 'Aktifkan'}
                              </button>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            ) : (
              <div>
                <div className="flex gap-2 overflow-x-auto pb-4 mb-2 scrollbar-hide">
                  {ORDER_TABS.map(tab => (
                    <button key={tab} onClick={() => setOrderTab(tab)} className={`px-5 py-2.5 rounded-full text-sm font-bold whitespace-nowrap transition-all ${orderTab === tab ? 'bg-indigo-950 text-white shadow-lg shadow-indigo-900/20' : 'bg-white text-slate-500 border border-slate-200 hover:border-indigo-300 hover:text-indigo-600'}`}>
                      {tab}
                    </button>
                  ))}
                </div>
                
                <div className="space-y-4">
                  {orders.length === 0 ? (
                    <EmptyState icon={<ShoppingBag size={48} />} title="Tidak ada pesanan" desc={`Belum ada pesanan di tab "${orderTab}".`} />
                  ) : orders.map(order => (
                    <div key={order.id} className="bg-white rounded-2xl border border-slate-100 p-5 shadow-sm hover:shadow-md transition-shadow">
                      <div className="flex flex-wrap items-center justify-between mb-3 gap-2 border-b border-slate-50 pb-3">
                        <div className="flex items-center gap-3">
                          <span className="text-xs font-black text-indigo-950 bg-indigo-50 px-3 py-1.5 rounded-lg tracking-wide">{order.order_number}</span>
                          <span className="text-xs font-semibold text-slate-500 flex items-center gap-1"><UserAvatar name={order.buyer?.full_name} /> {order.buyer?.full_name}</span>
                        </div>
                        <StatusBadge status={order.status} />
                      </div>
                      
                      <div className="flex flex-col sm:flex-row justify-between gap-4">
                        <div className="flex-1">
                          <p className="text-sm font-bold text-slate-800 mb-1">{order.items?.[0]?.product_snapshot?.title} {order.items?.length > 1 && <span className="text-slate-400 font-medium ml-1">(+{order.items.length - 1} lainnya)</span>}</p>
                          <p className="text-violet-600 font-black text-lg">{formatPrice(order.total)}</p>
                          {order.tracking_number && <p className="text-xs text-slate-500 mt-2 bg-slate-50 inline-block px-2 py-1 rounded-md">🚚 Resi: <span className="font-bold text-slate-700">{order.tracking_number}</span></p>}
                        </div>
                        
                        <div className="flex items-end gap-2">
                          {order.status === 'pending' && <>
                            <ActionBtn color="red" icon={<X size={16} />} label="Tolak" onClick={() => updateOrderStatus(order.id, 'cancelled')} />
                            <ActionBtn color="emerald" icon={<Check size={16} />} label="Terima Pesanan" onClick={() => updateOrderStatus(order.id, 'confirmed')} primary />
                          </>}
                          {order.status === 'confirmed' && <ActionBtn color="blue" icon={<Package size={16} />} label="Tandai Dikemas" onClick={() => updateOrderStatus(order.id, 'packed')} primary />}
                          {order.status === 'packed' && <ActionBtn color="violet" icon={<Truck size={16} />} label="Input Resi" onClick={() => { setResiModal({ orderId: order.id, open: true }); setResiInput(''); }} primary />}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Resi Modal (Glassmorphism) */}
      {resiModal.open && (
        <div className="fixed inset-0 bg-indigo-950/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white/90 backdrop-blur-xl border border-white rounded-3xl p-8 w-full max-w-sm shadow-2xl animate-in zoom-in-95 duration-200">
            <div className="w-12 h-12 bg-violet-100 text-violet-600 rounded-2xl flex items-center justify-center mb-4">
              <Truck size={24} />
            </div>
            <h3 className="font-black text-indigo-950 mb-2 text-xl">Kirim Pesanan</h3>
            <p className="text-slate-500 text-sm mb-6">Masukkan nomor resi pengiriman untuk melacak paket.</p>
            <input type="text" value={resiInput} onChange={e => setResiInput(e.target.value)} placeholder="Contoh: JNE1234567890" className="w-full px-4 py-3.5 rounded-xl border border-slate-200 bg-white/50 text-slate-800 font-bold focus:outline-none focus:border-violet-500 focus:ring-4 focus:ring-violet-500/10 mb-6 transition-all" autoFocus />
            <div className="flex gap-3">
              <button onClick={() => setResiModal({ orderId: '', open: false })} className="flex-1 py-3 border border-slate-200 bg-white rounded-xl font-bold text-slate-600 hover:bg-slate-50 transition-colors">Batal</button>
              <button onClick={submitResi} className="flex-1 py-3 bg-violet-600 hover:bg-violet-700 text-white rounded-xl font-bold shadow-lg shadow-violet-500/30 transition-all hover:-translate-y-0.5">Simpan Resi</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// Subcomponents
function StatCard({ icon, title, value, bg, border, highlight }: { icon: any, title: string, value: any, bg: string, border: string, highlight?: boolean }) {
  return (
    <div className={`bg-white/80 backdrop-blur-md rounded-3xl border ${highlight ? 'border-violet-400 shadow-lg shadow-violet-200' : 'border-white shadow-sm'} p-5 flex flex-col justify-between relative overflow-hidden transition-all hover:shadow-md hover:-translate-y-1`}>
      {highlight && <div className="absolute top-0 right-0 w-16 h-16 bg-violet-400 rounded-bl-full opacity-10" />}
      <div className={`w-10 h-10 rounded-xl ${bg} ${border} border flex items-center justify-center mb-3`}>
        {icon}
      </div>
      <div>
        <p className="text-slate-500 font-semibold text-sm mb-0.5">{title}</p>
        <p className="text-2xl font-black text-indigo-950">{value}</p>
      </div>
    </div>
  );
}

function TabBtn({ active, onClick, icon, label, badge }: { active: boolean, onClick: () => void, icon: any, label: string, badge?: number }) {
  return (
    <button onClick={onClick} className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-2xl font-bold text-sm transition-all ${active ? 'bg-white text-violet-700 shadow-sm' : 'text-slate-500 hover:bg-white/50 hover:text-slate-700'}`}>
      {icon} {label}
      {badge && <span className="bg-red-500 text-white text-[10px] px-1.5 py-0.5 rounded-full">{badge}</span>}
    </button>
  );
}

function EmptyState({ icon, title, desc, action, btnText }: { icon: any, title: string, desc: string, action?: () => void, btnText?: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
      <div className="w-24 h-24 bg-indigo-50 text-indigo-200 rounded-full flex items-center justify-center mb-6">
        {icon}
      </div>
      <h3 className="text-xl font-black text-indigo-950 mb-2">{title}</h3>
      <p className="text-slate-500 max-w-sm mb-8">{desc}</p>
      {action && btnText && (
        <button onClick={action} className="px-6 py-3 bg-violet-600 text-white font-bold rounded-xl shadow-lg shadow-violet-200 hover:-translate-y-0.5 transition-all">
          {btnText}
        </button>
      )}
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const map: Record<string, { label: string, color: string }> = {
    'pending': { label: 'Menunggu Konfirmasi', color: 'bg-amber-100 text-amber-700' },
    'confirmed': { label: 'Perlu Dikemas', color: 'bg-blue-100 text-blue-700' },
    'packed': { label: 'Siap Kirim', color: 'bg-violet-100 text-violet-700' },
    'shipped': { label: 'Dalam Pengiriman', color: 'bg-cyan-100 text-cyan-700' },
    'delivered': { label: 'Tiba di Tujuan', color: 'bg-emerald-100 text-emerald-700' },
    'completed': { label: 'Selesai', color: 'bg-slate-100 text-slate-700' },
    'cancelled': { label: 'Dibatalkan', color: 'bg-red-100 text-red-700' },
  };
  const badge = map[status] || { label: status, color: 'bg-gray-100 text-gray-700' };
  return <span className={`px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider ${badge.color}`}>{badge.label}</span>;
}

function ActionBtn({ color, icon, label, onClick, primary }: { color: string; icon: React.ReactNode; label: string; onClick: () => void, primary?: boolean }) {
  const colors: Record<string, string> = { 
    emerald: primary ? 'bg-emerald-500 text-white hover:bg-emerald-600 shadow-lg shadow-emerald-200' : 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100', 
    red: 'bg-red-50 text-red-600 hover:bg-red-100', 
    blue: primary ? 'bg-blue-500 text-white hover:bg-blue-600 shadow-lg shadow-blue-200' : 'bg-blue-50 text-blue-700 hover:bg-blue-100', 
    violet: primary ? 'bg-violet-600 text-white hover:bg-violet-700 shadow-lg shadow-violet-200' : 'bg-violet-50 text-violet-700 hover:bg-violet-100' 
  };
  return <button onClick={onClick} className={`flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold transition-all hover:-translate-y-0.5 ${colors[color]}`}>{icon} {label}</button>;
}

function UserAvatar({ name }: { name: string }) {
  return <div className="w-5 h-5 rounded-full bg-slate-200 flex items-center justify-center text-[10px] font-bold text-slate-500">{name?.[0]?.toUpperCase() || 'U'}</div>;
}
