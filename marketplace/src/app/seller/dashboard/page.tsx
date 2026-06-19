'use client';

import { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/context/AuthContext';
import { formatPrice } from '@/lib/utils';
import toast from 'react-hot-toast';
import { Plus, Package, ShoppingBag, Star, ToggleLeft, Pencil, Trash2, Check, X, Truck } from 'lucide-react';

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
  const [activeSection, setActiveSection] = useState<'products' | 'orders'>('products');
  const [orderTab, setOrderTab] = useState('Semua');
  const [loading, setLoading] = useState(true);
  const [resiModal, setResiModal] = useState<{ orderId: string; open: boolean }>({ orderId: '', open: false });
  const [resiInput, setResiInput] = useState('');

  useEffect(() => {
    if (!user) { router.push('/auth/login'); return; }
    if (profile && !profile.store) { router.push('/seller/open-store'); return; }
    if (profile?.store) { fetchStore(profile.store.id); fetchProducts(profile.store.id); }
  }, [user, profile]);

  useEffect(() => {
    if (store) fetchOrders(store.id);
  }, [store, orderTab]);

  const fetchStore = async (storeId: string) => { const { data } = await supabase.from('stores').select('*').eq('id', storeId).single(); setStore(data); setLoading(false); };
  const fetchProducts = async (storeId: string) => { const { data } = await supabase.from('products').select('*, images:product_images(*)').eq('store_id', storeId).order('created_at', { ascending: false }); setProducts(data ?? []); };
  const fetchOrders = async (storeId: string) => {
    let q = supabase.from('orders').select('*, buyer:profiles(full_name), items:order_items(product_snapshot)').eq('store_id', storeId).order('created_at', { ascending: false });
    const statuses = TAB_STATUS[orderTab];
    if (statuses.length > 0) q = q.in('status', statuses);
    const { data } = await q;
    setOrders(data ?? []);
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
    fetchOrders(store.id);
  };

  const submitResi = async () => {
    if (!resiInput.trim()) return;
    await supabase.from('orders').update({ tracking_number: resiInput.trim(), status: 'shipped' }).eq('id', resiModal.orderId);
    setResiModal({ orderId: '', open: false });
    setResiInput('');
    toast.success('Nomor resi disimpan! 🚚');
    fetchOrders(store.id);
  };

  if (loading) return <div className="flex items-center justify-center h-64"><div className="animate-spin w-10 h-10 border-4 border-violet-600 border-t-transparent rounded-full" /></div>;

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      {/* Store Header */}
      <div className="bg-gradient-to-r from-violet-600 to-purple-700 text-white rounded-3xl p-6 mb-6 flex items-center gap-5 shadow-xl shadow-violet-500/20">
        <div className="w-16 h-16 rounded-2xl bg-white/20 flex items-center justify-center overflow-hidden flex-shrink-0">
          {store?.logo_url ? <img src={store.logo_url} alt="" className="w-full h-full object-cover" /> : <span className="text-3xl">🏪</span>}
        </div>
        <div className="flex-1">
          <h1 className="text-2xl font-black">{store?.name}</h1>
          <div className="flex items-center gap-4 mt-1 text-white/80 text-sm">
            <span>⭐ {store?.rating?.toFixed(1)}</span>
            <span>📦 {products.length} produk</span>
            <span>🛒 {store?.total_sales} terjual</span>
          </div>
        </div>
      </div>

      {/* Toggle */}
      <div className="flex gap-2 mb-6">
        <button onClick={() => setActiveSection('products')} className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-sm transition-all ${activeSection === 'products' ? 'bg-violet-600 text-white shadow-lg shadow-violet-500/20' : 'bg-white text-gray-600 border border-gray-200 hover:border-violet-300'}`}>
          <Package className="w-4 h-4" /> Produk ({products.length})
        </button>
        <button onClick={() => setActiveSection('orders')} className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-sm transition-all ${activeSection === 'orders' ? 'bg-violet-600 text-white shadow-lg shadow-violet-500/20' : 'bg-white text-gray-600 border border-gray-200 hover:border-violet-300'}`}>
          <ShoppingBag className="w-4 h-4" /> Pesanan
        </button>
      </div>

      {activeSection === 'products' ? (
        <div>
          <button onClick={() => router.push('/seller/add-product')} className="w-full py-3.5 border-2 border-dashed border-violet-300 rounded-2xl text-violet-600 font-bold hover:bg-violet-50 transition-colors flex items-center justify-center gap-2 mb-4">
            <Plus className="w-5 h-5" /> Tambah Produk Baru
          </button>
          <div className="space-y-3">
            {products.map(p => {
              const img = p.images?.find((i: any) => i.is_primary)?.image_url ?? p.images?.[0]?.image_url;
              return (
                <div key={p.id} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 flex items-center gap-4">
                  <div className="w-16 h-16 rounded-xl bg-gray-100 flex-shrink-0 overflow-hidden">
                    {img ? <img src={img} alt="" className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center text-2xl">📦</div>}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-gray-900 text-sm line-clamp-1">{p.title}</p>
                    <p className="text-violet-600 font-black text-sm">{formatPrice(p.price)}</p>
                    <p className="text-xs text-gray-400">Stok: {p.stock}</p>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <button onClick={() => toggleActive(p.id, p.is_active)} className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-colors ${p.is_active ? 'bg-emerald-100 text-emerald-700 hover:bg-emerald-200' : 'bg-gray-100 text-gray-500 hover:bg-gray-200'}`}>
                      {p.is_active ? '✅ Aktif' : '⏸️ Nonaktif'}
                    </button>
                    <button onClick={() => router.push(`/seller/add-product?id=${p.id}`)} className="p-2 text-gray-400 hover:text-violet-600 hover:bg-violet-50 rounded-xl transition-colors">
                      <Pencil className="w-4 h-4" />
                    </button>
                    <button onClick={() => deleteProduct(p.id)} className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-colors">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ) : (
        <div>
          <div className="flex gap-2 overflow-x-auto pb-2 mb-4 scrollbar-hide">
            {ORDER_TABS.map(tab => (
              <button key={tab} onClick={() => setOrderTab(tab)} className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${orderTab === tab ? 'bg-violet-600 text-white' : 'bg-white text-gray-600 border border-gray-200 hover:border-violet-300'}`}>
                {tab}
              </button>
            ))}
          </div>
          <div className="space-y-3">
            {orders.length === 0 ? (
              <div className="text-center py-12 text-gray-400">
                <div className="text-4xl mb-2">📭</div>
                <p className="font-semibold">Belum ada pesanan di tab ini</p>
              </div>
            ) : orders.map(order => (
              <div key={order.id} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-xs font-bold text-violet-600">{order.order_number}</p>
                  <p className="text-xs text-gray-400">👤 {order.buyer?.full_name}</p>
                </div>
                <p className="text-sm font-semibold text-gray-900 mb-1 line-clamp-1">{order.items?.[0]?.product_snapshot?.title}{order.items?.length > 1 && ` +${order.items.length - 1} lainnya`}</p>
                <p className="text-violet-600 font-black text-sm mb-3">{formatPrice(order.total)}</p>
                {order.tracking_number && <p className="text-xs text-gray-500 mb-2">🚚 Resi: <span className="font-bold text-violet-600">{order.tracking_number}</span></p>}
                <div className="flex gap-2 flex-wrap">
                  {order.status === 'pending' && <>
                    <ActionBtn color="emerald" icon={<Check className="w-3 h-3" />} label="Konfirmasi" onClick={() => updateOrderStatus(order.id, 'confirmed')} />
                    <ActionBtn color="red" icon={<X className="w-3 h-3" />} label="Tolak" onClick={() => updateOrderStatus(order.id, 'cancelled')} />
                  </>}
                  {order.status === 'confirmed' && <ActionBtn color="blue" icon={<Package className="w-3 h-3" />} label="Tandai Dikemas" onClick={() => updateOrderStatus(order.id, 'packed')} />}
                  {order.status === 'packed' && <ActionBtn color="violet" icon={<Truck className="w-3 h-3" />} label="Input Nomor Resi" onClick={() => { setResiModal({ orderId: order.id, open: true }); setResiInput(''); }} />}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Resi Modal */}
      {resiModal.open && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-sm shadow-2xl">
            <h3 className="font-black text-gray-900 mb-4 text-lg">🚚 Input Nomor Resi</h3>
            <input type="text" value={resiInput} onChange={e => setResiInput(e.target.value)} placeholder="Contoh: JNE1234567890" className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500 mb-4" />
            <div className="flex gap-3">
              <button onClick={() => setResiModal({ orderId: '', open: false })} className="flex-1 py-2.5 border border-gray-200 rounded-xl font-bold text-gray-600 text-sm hover:bg-gray-50">Batal</button>
              <button onClick={submitResi} className="flex-1 py-2.5 bg-violet-600 hover:bg-violet-700 text-white rounded-xl font-bold text-sm transition-colors">Simpan</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function ActionBtn({ color, icon, label, onClick }: { color: string; icon: React.ReactNode; label: string; onClick: () => void }) {
  const colors: Record<string, string> = { emerald: 'bg-emerald-100 text-emerald-700 hover:bg-emerald-200', red: 'bg-red-100 text-red-600 hover:bg-red-200', blue: 'bg-blue-100 text-blue-700 hover:bg-blue-200', violet: 'bg-violet-100 text-violet-700 hover:bg-violet-200' };
  return <button onClick={onClick} className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-colors ${colors[color]}`}>{icon} {label}</button>;
}
