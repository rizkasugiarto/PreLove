'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/context/AuthContext';
import { formatPrice } from '@/lib/utils';
import toast from 'react-hot-toast';
import { Plus, Package, ShoppingBag, Star, Pencil, Trash2, Check, X, Truck, TrendingUp, AlertCircle, Edit3, Image as ImageIcon, Store, ExternalLink } from 'lucide-react';

const ORDER_TABS = ['Semua', 'Pending', 'Dikonfirmasi', 'Dikemas', 'Dikirim', 'Selesai'];
const TAB_STATUS: Record<string, string[]> = {
  'Semua': [], 'Pending': ['pending', 'waiting_payment'], 'Dikonfirmasi': ['confirmed'],
  'Dikemas': ['packed'], 'Dikirim': ['shipped'], 'Selesai': ['delivered', 'completed'],
};

export default function SellerDashboardPage() {
  const { user, profile } = useAuth();
  const router = useRouter();
  const [store, setStore] = useState<any>(null);
  const [products, setProducts] = useState<any[]>([]);
  const [orders, setOrders] = useState<any[]>([]);
  const [allOrders, setAllOrders] = useState<any[]>([]);
  const [activeSection, setActiveSection] = useState<'products' | 'orders'>('products');
  const [orderTab, setOrderTab] = useState('Semua');
  const [loading, setLoading] = useState(true);
  const [resiModal, setResiModal] = useState<{ orderId: string; open: boolean }>({ orderId: '', open: false });
  const [resiInput, setResiInput] = useState('');
  const [deleteModal, setDeleteModal] = useState<{ id: string; open: boolean }>({ id: '', open: false });

  useEffect(() => {
    if (!user) { router.push('/auth/login'); return; }
    if (profile && (!profile.store || (Array.isArray(profile.store) && profile.store.length === 0))) { router.push('/seller/open-store'); return; }
    
    const storeData = Array.isArray(profile?.store) ? profile.store[0] : profile?.store;
    if (storeData) { 
      fetchStore(storeData.id); 
      fetchProducts(storeData.id); 
      fetchAllOrders(storeData.id); 
    }
  }, [user, profile]);

  useEffect(() => {
    if (store) filterOrders();
  }, [store, orderTab, allOrders]);

  const fetchStore = async (storeId: string) => { 
    const { data } = await supabase.from('stores').select('*').eq('id', storeId).single(); 
    setStore(data); 
    setLoading(false); 
  };
  
  const fetchProducts = async (storeId: string) => { 
    const { data } = await supabase.from('products').select('*, images:product_images(*)').eq('store_id', storeId).order('created_at', { ascending: false }); 
    setProducts(data ?? []); 
  };
  
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

  const confirmDeleteProduct = async () => {
    const id = deleteModal.id;
    setDeleteModal({ id: '', open: false });
    
    // Check if product exists first to see if RLS blocks it
    const { data: existingProduct, error: fetchError } = await supabase.from('products').select('id').eq('id', id).single();
    if (fetchError) {
      toast.error('Produk tidak ditemukan atau Anda tidak memiliki akses.');
      return;
    }

    const { error, data } = await supabase.from('products').delete().eq('id', id).select();
    
    if (error) {
      console.error("Delete product error:", error);
      toast.error(error.message || error.details || 'Gagal menghapus produk');
      return;
    }
    
    if (!data || data.length === 0) {
      toast.error('Penghapusan diblokir oleh sistem keamanan (RLS).');
      return;
    }
    
    setProducts(prev => prev.filter(p => p.id !== id));
    toast.success('Produk berhasil dihapus');
  };

  const updateOrderStatus = async (orderId: string, status: string) => {
    await supabase.from('orders').update({ status }).eq('id', orderId);
    toast.success(`Status pesanan diperbarui`);
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
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#FAFAFA' }}>
      <div style={{ width: '40px', height: '40px', border: '4px solid #EDE9FE', borderTopColor: '#7C3AED', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
    </div>
  );

  const pendingOrdersCount = allOrders.filter(o => o.status === 'pending' || o.status === 'waiting_payment').length;

  return (
    <div style={{ minHeight: '100vh', background: 'radial-gradient(ellipse at top left, #EDE9FE 0%, #F5F3FF 40%, #EFF6FF 100%)', color: '#111827', padding: '32px 16px' }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
        
        {/* Header Store Profile */}
        <div style={{
          background: 'rgba(255,255,255,0.88)', backdropFilter: 'blur(24px)', WebkitBackdropFilter: 'blur(24px)',
          borderRadius: '24px', border: '1px solid rgba(255,255,255,0.9)',
          boxShadow: '0 12px 32px rgba(124,58,237,0.06), 0 4px 12px rgba(0,0,0,0.02)',
          padding: '24px', marginBottom: '24px',
          display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: '20px'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
            <div style={{ width: '80px', height: '80px', borderRadius: '50%', background: '#F3E8FF', border: '2px solid #C4B5FD', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden', flexShrink: 0 }}>
              {store?.logo_url ? <img src={store.logo_url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : <Store size={32} color="#A78BFA" />}
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                <h1 style={{ fontSize: '24px', fontWeight: 900, margin: 0 }}>{store?.name}</h1>
                <span style={{ padding: '4px 8px', background: '#D1FAE5', color: '#065F46', fontSize: '11px', fontWeight: 700, borderRadius: '8px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <Check size={12} /> Toko Aktif
                </span>
              </div>
              <p style={{ fontSize: '14px', color: '#6B7280', margin: 0 }}>Kelola produk dan pesanan tokomu dengan mudah.</p>
            </div>
          </div>
          <button 
            onClick={() => router.push('/seller/products/add')} 
            style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '12px 24px', background: 'linear-gradient(135deg, #7C3AED 0%, #9333EA 100%)', color: '#fff', fontSize: '14px', fontWeight: 700, border: 'none', borderRadius: '14px', cursor: 'pointer', boxShadow: '0 8px 24px rgba(124,58,237,0.3)', transition: 'all 0.2s' }}
          >
            <Plus size={18} /> Tambah Produk
          </button>
        </div>

        {/* Stats Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '20px', marginBottom: '32px' }}>
          <StatCard icon={<Package color="#2563EB" />} title="Total Produk" value={products.length} bg="#EFF6FF" />
          <StatCard icon={<TrendingUp color="#059669" />} title="Produk Terjual" value={store?.total_sales ?? 0} bg="#ECFDF5" />
          <StatCard icon={<ShoppingBag color="#D97706" />} title="Pesanan Baru" value={pendingOrdersCount} bg="#FFFBEB" highlight={pendingOrdersCount > 0} />
          <StatCard icon={<Star color="#7C3AED" />} title="Rating Toko" value={store?.rating?.toFixed(1) ?? '0.0'} bg="#F5F3FF" />
        </div>

        {/* Main Content Area */}
        <div style={{
          background: 'rgba(255,255,255,0.88)', backdropFilter: 'blur(24px)', WebkitBackdropFilter: 'blur(24px)',
          borderRadius: '24px', border: '1px solid rgba(255,255,255,0.9)',
          boxShadow: '0 12px 32px rgba(124,58,237,0.06), 0 4px 12px rgba(0,0,0,0.02)',
          overflow: 'hidden'
        }}>
          {/* Tabs */}
          <div style={{ display: 'flex', gap: '32px', padding: '0 32px', borderBottom: '1px solid #E5E7EB', background: '#fff' }}>
            <button 
              onClick={() => setActiveSection('products')} 
              style={{ padding: '20px 0', fontSize: '15px', fontWeight: 700, color: activeSection === 'products' ? '#7C3AED' : '#6B7280', background: 'none', border: 'none', borderBottom: activeSection === 'products' ? '3px solid #7C3AED' : '3px solid transparent', cursor: 'pointer', position: 'relative' }}
            >
              Produk Saya ({products.length})
            </button>
            <button 
              onClick={() => setActiveSection('orders')} 
              style={{ padding: '20px 0', fontSize: '15px', fontWeight: 700, color: activeSection === 'orders' ? '#7C3AED' : '#6B7280', background: 'none', border: 'none', borderBottom: activeSection === 'orders' ? '3px solid #7C3AED' : '3px solid transparent', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px' }}
            >
              Pesanan Masuk
              {pendingOrdersCount > 0 && <span style={{ background: '#EF4444', color: '#fff', fontSize: '10px', padding: '2px 8px', borderRadius: '99px' }}>{pendingOrdersCount}</span>}
            </button>
          </div>

          <div style={{ padding: '32px' }}>
            {activeSection === 'products' ? (
              products.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '64px 0' }}>
                  <Package size={64} color="#D1D5DB" style={{ margin: '0 auto 16px' }} />
                  <h3 style={{ fontSize: '18px', fontWeight: 800, marginBottom: '8px' }}>Belum ada produk</h3>
                  <p style={{ color: '#6B7280', fontSize: '14px', marginBottom: '24px' }}>Mulai berjualan dengan menambahkan produk pertamamu.</p>
                  <button onClick={() => router.push('/seller/products/add')} style={{ padding: '12px 24px', background: '#7C3AED', color: '#fff', fontSize: '14px', fontWeight: 700, border: 'none', borderRadius: '12px', cursor: 'pointer' }}>Tambah Produk Sekarang</button>
                </div>
              ) : (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '24px' }}>
                  {products.map(p => {
                    const img = p.images?.find((i: any) => i.is_primary)?.image_url ?? p.images?.[0]?.image_url;
                    return (
                      <div key={p.id} style={{ background: '#fff', borderRadius: '16px', border: '1px solid #E5E7EB', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
                        <div style={{ height: '200px', background: '#F3F4F6', position: 'relative' }}>
                          {img ? <img src={img} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', color: '#9CA3AF' }}><ImageIcon size={40} /></div>}
                          {!p.is_active && <div style={{ position: 'absolute', inset: 0, background: 'rgba(255,255,255,0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, color: '#4B5563', fontSize: '14px' }}>NONAKTIF</div>}
                          <div style={{ position: 'absolute', top: '8px', right: '8px', display: 'flex', gap: '6px' }}>
                            <button onClick={(e) => { e.stopPropagation(); router.push(`/seller/products/${p.id}/edit`); }} style={{ width: '32px', height: '32px', borderRadius: '8px', background: '#fff', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }} title="Edit"><Edit3 size={16} color="#4B5563" /></button>
                            <button onClick={(e) => { e.stopPropagation(); setDeleteModal({ id: p.id, open: true }); }} style={{ width: '32px', height: '32px', borderRadius: '8px', background: '#fff', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }} title="Hapus"><Trash2 size={16} color="#EF4444" /></button>
                          </div>
                        </div>
                        <div style={{ padding: '16px', flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                          <div>
                            <h3 style={{ fontSize: '14px', fontWeight: 600, color: '#111827', marginBottom: '8px', lineHeight: 1.4, height: '40px', overflow: 'hidden' }}>{p.title}</h3>
                            <p style={{ fontSize: '18px', fontWeight: 800, color: '#7C3AED', margin: '0 0 16px 0' }}>{formatPrice(p.price)}</p>
                          </div>
                          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderTop: '1px solid #F3F4F6', paddingTop: '16px' }}>
                            <span style={{ fontSize: '12px', color: '#6B7280', fontWeight: 600 }}>Stok: <span style={{ color: '#111827' }}>{p.stock}</span></span>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                              <span style={{ fontSize: '12px', color: '#9CA3AF', fontWeight: 600 }}>Status</span>
                              <button 
                                onClick={() => toggleActive(p.id, p.is_active)} 
                                style={{ width: '36px', height: '20px', borderRadius: '20px', background: p.is_active ? '#7C3AED' : '#D1D5DB', border: 'none', position: 'relative', cursor: 'pointer', transition: 'all 0.2s' }}
                              >
                                <div style={{ width: '14px', height: '14px', borderRadius: '50%', background: '#fff', position: 'absolute', top: '3px', left: p.is_active ? '19px' : '3px', transition: 'all 0.2s' }} />
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )
            ) : (
              <div>
                <div style={{ display: 'flex', gap: '8px', overflowX: 'auto', paddingBottom: '16px', marginBottom: '16px' }}>
                  {ORDER_TABS.map(tab => (
                    <button 
                      key={tab} 
                      onClick={() => setOrderTab(tab)} 
                      style={{ padding: '8px 16px', borderRadius: '12px', fontSize: '13px', fontWeight: 700, border: orderTab === tab ? '1.5px solid #7C3AED' : '1.5px solid #E5E7EB', background: orderTab === tab ? '#F5F3FF' : '#fff', color: orderTab === tab ? '#7C3AED' : '#6B7280', cursor: 'pointer', whiteSpace: 'nowrap' }}
                    >
                      {tab}
                    </button>
                  ))}
                </div>
                
                {orders.length === 0 ? (
                  <div style={{ textAlign: 'center', padding: '64px 0' }}>
                    <ShoppingBag size={64} color="#D1D5DB" style={{ margin: '0 auto 16px' }} />
                    <h3 style={{ fontSize: '18px', fontWeight: 800, marginBottom: '8px' }}>Tidak ada pesanan</h3>
                    <p style={{ color: '#6B7280', fontSize: '14px' }}>Belum ada pesanan di tab "{orderTab}".</p>
                  </div>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                    {orders.map(order => (
                      <div key={order.id} style={{ background: '#fff', borderRadius: '16px', border: '1px solid #E5E7EB', padding: '24px' }}>
                        <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: '16px', marginBottom: '20px', borderBottom: '1px dashed #E5E7EB', paddingBottom: '16px' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                            <StatusBadge status={order.status} />
                            <span style={{ fontSize: '13px', fontWeight: 700, color: '#6B7280' }}>{order.order_number}</span>
                          </div>
                          {order.tracking_number && (
                            <span style={{ background: '#F3F4F6', padding: '6px 12px', borderRadius: '8px', fontSize: '12px', fontWeight: 700, color: '#4B5563', display: 'flex', alignItems: 'center', gap: '6px' }}>
                              <Truck size={14} /> Resi: {order.tracking_number}
                            </span>
                          )}
                        </div>
                        
                        <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', gap: '24px' }}>
                          <div style={{ display: 'flex', gap: '16px', flex: '1 1 300px' }}>
                            <div style={{ width: '64px', height: '64px', borderRadius: '12px', background: '#F3F4F6', border: '1px solid #E5E7EB', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                               <Package size={24} color="#9CA3AF" />
                            </div>
                            <div>
                              <p style={{ fontSize: '14px', fontWeight: 800, color: '#111827', margin: '0 0 4px 0' }}>{order.items?.[0]?.product_snapshot?.title}</p>
                              <p style={{ fontSize: '12px', color: '#6B7280', margin: '0 0 8px 0' }}>Pembeli: <span style={{ fontWeight: 700, color: '#374151' }}>{order.buyer?.full_name}</span></p>
                              <p style={{ fontSize: '13px', color: '#6B7280', margin: 0 }}>Total Belanja: <span style={{ fontSize: '16px', fontWeight: 900, color: '#7C3AED' }}>{formatPrice(order.total)}</span></p>
                            </div>
                          </div>
                          
                          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                            {(order.status === 'pending' || order.status === 'waiting_payment') && <>
                              <ActionBtn variant="outline" label="Tolak Pesanan" onClick={() => updateOrderStatus(order.id, 'cancelled')} />
                              <ActionBtn variant="primary" label="Terima Pesanan" onClick={() => updateOrderStatus(order.id, 'confirmed')} />
                            </>}
                            {order.status === 'confirmed' && <ActionBtn variant="primary" label="Tandai Dikemas" onClick={() => updateOrderStatus(order.id, 'packed')} />}
                            {order.status === 'packed' && <ActionBtn variant="primary" label="Input Resi" onClick={() => { setResiModal({ orderId: order.id, open: true }); setResiInput(''); }} />}
                            {(order.status === 'shipped' || order.status === 'delivered' || order.status === 'completed' || order.status === 'cancelled') && (
                                <button onClick={() => router.push(`/seller/orders/${order.id}`)} style={{ background: 'none', border: 'none', color: '#7C3AED', fontSize: '14px', fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}>Detail <ExternalLink size={14}/></button>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Resi Modal */}
      {resiModal.open && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(17,24,39,0.6)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 50, padding: '16px' }}>
          <div style={{ background: '#fff', borderRadius: '24px', padding: '32px', width: '100%', maxWidth: '420px', boxShadow: '0 24px 48px rgba(0,0,0,0.2)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '24px' }}>
              <div style={{ width: '48px', height: '48px', background: '#F3E8FF', color: '#7C3AED', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Truck size={24} />
              </div>
              <div>
                <h3 style={{ fontSize: '18px', fontWeight: 900, color: '#111827', margin: '0 0 4px 0' }}>Input Resi</h3>
                <p style={{ fontSize: '13px', color: '#6B7280', margin: 0 }}>Pesanan akan berubah status jadi Dikirim.</p>
              </div>
            </div>
            
            <div style={{ marginBottom: '24px' }}>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#4B5563', marginBottom: '8px', textTransform: 'uppercase' }}>Nomor Resi</label>
              <input type="text" value={resiInput} onChange={e => setResiInput(e.target.value)} placeholder="Contoh: JNT1234567" style={{ width: '100%', padding: '14px 16px', borderRadius: '12px', border: '2px solid #E5E7EB', fontSize: '14px', fontWeight: 600, outline: 'none', boxSizing: 'border-box' }} autoFocus />
            </div>

            <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
              <button onClick={() => setResiModal({ orderId: '', open: false })} style={{ padding: '12px 20px', borderRadius: '12px', fontWeight: 700, color: '#4B5563', background: '#F3F4F6', border: 'none', cursor: 'pointer' }}>Batal</button>
              <button onClick={submitResi} disabled={!resiInput.trim()} style={{ padding: '12px 24px', background: resiInput.trim() ? '#7C3AED' : '#C4B5FD', color: '#fff', borderRadius: '12px', fontWeight: 700, border: 'none', cursor: resiInput.trim() ? 'pointer' : 'not-allowed' }}>Simpan Resi</button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteModal.open && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(17,24,39,0.6)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 50, padding: '16px' }}>
          <div style={{ background: '#fff', borderRadius: '24px', padding: '32px', width: '100%', maxWidth: '400px', boxShadow: '0 24px 48px rgba(0,0,0,0.2)', textAlign: 'center' }}>
            <div style={{ width: '64px', height: '64px', background: '#FEF2F2', color: '#EF4444', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 24px' }}>
              <Trash2 size={32} />
            </div>
            <h3 style={{ fontSize: '20px', fontWeight: 900, color: '#111827', margin: '0 0 8px 0' }}>Hapus Produk?</h3>
            <p style={{ fontSize: '14px', color: '#6B7280', margin: '0 0 24px 0' }}>Produk yang sudah dihapus tidak dapat dikembalikan lagi. Yakin ingin melanjutkan?</p>
            <div style={{ display: 'flex', gap: '12px' }}>
              <button onClick={() => setDeleteModal({ id: '', open: false })} style={{ flex: 1, padding: '12px', borderRadius: '12px', fontWeight: 700, color: '#4B5563', background: '#F3F4F6', border: 'none', cursor: 'pointer' }}>Batal</button>
              <button onClick={confirmDeleteProduct} style={{ flex: 1, padding: '12px', background: '#EF4444', color: '#fff', borderRadius: '12px', fontWeight: 700, border: 'none', cursor: 'pointer' }}>Ya, Hapus</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function StatCard({ icon, title, value, bg, highlight }: { icon: any, title: string, value: any, bg: string, highlight?: boolean }) {
  return (
    <div style={{ background: '#fff', borderRadius: '20px', border: highlight ? '2px solid #FCD34D' : '1px solid #E5E7EB', padding: '24px', display: 'flex', alignItems: 'center', gap: '16px', boxShadow: highlight ? '0 8px 24px rgba(245,158,11,0.15)' : '0 2px 8px rgba(0,0,0,0.02)' }}>
      <div style={{ width: '56px', height: '56px', borderRadius: '16px', background: bg, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        {icon}
      </div>
      <div>
        <p style={{ fontSize: '13px', fontWeight: 600, color: '#6B7280', margin: '0 0 4px 0' }}>{title}</p>
        <p style={{ fontSize: '24px', fontWeight: 900, color: '#111827', margin: 0 }}>{value}</p>
      </div>
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const map: Record<string, { label: string, bg: string, color: string }> = {
    'waiting_payment': { label: 'Menunggu Pembayaran', bg: '#FEF3C7', color: '#B45309' },
    'pending': { label: 'Perlu Konfirmasi', bg: '#FFFBEB', color: '#B45309' },
    'confirmed': { label: 'Perlu Dikemas', bg: '#EFF6FF', color: '#1D4ED8' },
    'packed': { label: 'Siap Kirim', bg: '#F5F3FF', color: '#6D28D9' },
    'shipped': { label: 'Sedang Dikirim', bg: '#ECFEFF', color: '#0E7490' },
    'delivered': { label: 'Pesanan Tiba', bg: '#ECFDF5', color: '#047857' },
    'completed': { label: 'Selesai', bg: '#F3F4F6', color: '#374151' },
    'cancelled': { label: 'Dibatalkan', bg: '#FEF2F2', color: '#B91C1C' },
  };
  const badge = map[status] || { label: status, bg: '#F3F4F6', color: '#374151' };
  return <span style={{ padding: '6px 12px', background: badge.bg, color: badge.color, borderRadius: '8px', fontSize: '12px', fontWeight: 800 }}>{badge.label}</span>;
}

function ActionBtn({ variant, label, onClick }: { variant: 'primary' | 'outline'; label: string; onClick: () => void }) {
  const isPrimary = variant === 'primary';
  return (
    <button 
      onClick={onClick} 
      style={{
        padding: '10px 16px', borderRadius: '10px', fontSize: '13px', fontWeight: 700, cursor: 'pointer',
        background: isPrimary ? '#7C3AED' : '#fff',
        color: isPrimary ? '#fff' : '#4B5563',
        border: isPrimary ? 'none' : '1px solid #D1D5DB',
        boxShadow: isPrimary ? '0 4px 12px rgba(124,58,237,0.2)' : 'none',
      }}
    >
      {label}
    </button>
  );
}
