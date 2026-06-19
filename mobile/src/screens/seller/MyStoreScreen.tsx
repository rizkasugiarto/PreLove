import React, { useEffect, useState } from 'react';
import {
  View, Text, ScrollView, StyleSheet, TouchableOpacity,
  Image, Alert, RefreshControl, FlatList,
} from 'react-native';
import { supabase } from '../../lib/supabase';
import { useAuthStore } from '../../stores/authStore';
import { Product, Store } from '../../types/database';
import { colors, spacing, fontSizes, fontWeights, borderRadius, shadows } from '../../constants/theme';
import { formatPrice } from '../../utils/format';

const ORDER_TABS = ['Semua', 'Pending', 'Proses', 'Dikirim', 'Selesai'];
const TAB_STATUS: Record<string, string[]> = {
  'Semua': [],
  'Pending': ['pending'],
  'Proses': ['confirmed', 'packed'],
  'Dikirim': ['shipped'],
  'Selesai': ['delivered', 'completed'],
};

export default function MyStoreScreen({ route, navigation }: any) {
  const { storeId } = route.params ?? {};
  const { user } = useAuthStore();
  const [store, setStore] = useState<Store | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [orders, setOrders] = useState<any[]>([]);
  const [orderTab, setOrderTab] = useState('Semua');
  const [activeSection, setActiveSection] = useState<'products' | 'orders'>('products');
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    fetchAll();
  }, [storeId, orderTab]);

  const fetchAll = async () => {
    const [{ data: storeData }, { data: prodData }] = await Promise.all([
      supabase.from('stores').select('*').eq('id', storeId).single(),
      supabase.from('products').select('*, images:product_images(*)').eq('store_id', storeId).order('created_at', { ascending: false }),
    ]);
    if (storeData) setStore(storeData as Store);
    if (prodData) setProducts(prodData as Product[]);
    fetchOrders();
  };

  const fetchOrders = async () => {
    let q = supabase
      .from('orders')
      .select('*, buyer:profiles(full_name), items:order_items(product_snapshot)')
      .eq('store_id', storeId)
      .order('created_at', { ascending: false });
    const statuses = TAB_STATUS[orderTab];
    if (statuses.length > 0) q = q.in('status', statuses);
    const { data } = await q;
    if (data) setOrders(data);
  };

  const onRefresh = async () => { setRefreshing(true); await fetchAll(); setRefreshing(false); };

  const toggleProductActive = async (product: Product) => {
    await supabase.from('products').update({ is_active: !product.is_active }).eq('id', product.id);
    setProducts((prev) => prev.map((p) => p.id === product.id ? { ...p, is_active: !p.is_active } : p));
  };

  const deleteProduct = (productId: string) => {
    Alert.alert('Hapus Produk?', 'Produk yang dihapus tidak bisa dikembalikan', [
      { text: 'Batal', style: 'cancel' },
      {
        text: 'Hapus', style: 'destructive', onPress: async () => {
          await supabase.from('products').delete().eq('id', productId);
          setProducts((prev) => prev.filter((p) => p.id !== productId));
        },
      },
    ]);
  };

  const updateOrderStatus = async (orderId: string, newStatus: string) => {
    await supabase.from('orders').update({ status: newStatus }).eq('id', orderId);
    fetchOrders();
  };

  const handleInputResi = (orderId: string) => {
    Alert.prompt('Input Nomor Resi', 'Masukkan nomor resi pengiriman', async (resi) => {
      if (!resi?.trim()) return;
      await supabase.from('orders').update({ tracking_number: resi.trim(), status: 'shipped' }).eq('id', orderId);
      fetchOrders();
      Alert.alert('Berhasil! 🚚', 'Nomor resi berhasil disimpan');
    });
  };

  return (
    <View style={styles.container}>
      {/* Store Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.backText}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Toko Saya</Text>
        <TouchableOpacity onPress={() => navigation.navigate('EditStore', { store })}>
          <Text style={styles.editText}>✏️</Text>
        </TouchableOpacity>
      </View>

      {/* Store Info */}
      {store && (
        <View style={styles.storeInfo}>
          <View style={styles.storeAvatarWrap}>
            {store.logo_url ? (
              <Image source={{ uri: store.logo_url }} style={styles.storeLogo} />
            ) : (
              <Text style={{ fontSize: 32 }}>🏪</Text>
            )}
          </View>
          <View style={styles.storeText}>
            <Text style={styles.storeName}>{store.name}</Text>
            <Text style={styles.storeStats}>⭐ {store.rating.toFixed(1)} · {store.total_sales} terjual · {products.length} produk</Text>
          </View>
        </View>
      )}

      {/* Stats Cards */}
      <View style={styles.statsRow}>
        <View style={styles.statCard}>
          <Text style={styles.statValue}>{products.length}</Text>
          <Text style={styles.statLabel}>Produk</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statValue}>{store?.total_sales ?? 0}</Text>
          <Text style={styles.statLabel}>Terjual</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statValue}>⭐ {store?.rating.toFixed(1) ?? '0.0'}</Text>
          <Text style={styles.statLabel}>Rating</Text>
        </View>
      </View>

      {/* Section Toggle */}
      <View style={styles.sectionToggle}>
        <TouchableOpacity
          style={[styles.toggleBtn, activeSection === 'products' && styles.toggleBtnActive]}
          onPress={() => setActiveSection('products')}
        >
          <Text style={[styles.toggleText, activeSection === 'products' && styles.toggleTextActive]}>
            📦 Produk
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.toggleBtn, activeSection === 'orders' && styles.toggleBtnActive]}
          onPress={() => setActiveSection('orders')}
        >
          <Text style={[styles.toggleText, activeSection === 'orders' && styles.toggleTextActive]}>
            🛒 Pesanan
          </Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} />}
      >
        {activeSection === 'products' ? (
          <>
            <TouchableOpacity
              style={styles.addProductBtn}
              onPress={() => navigation.navigate('AddProduct', { storeId })}
            >
              <Text style={styles.addProductText}>+ Tambah Produk Baru</Text>
            </TouchableOpacity>
            {products.map((product) => {
              const img = (product as any).images?.find((i: any) => i.is_primary)?.image_url ?? (product as any).images?.[0]?.image_url;
              return (
                <View key={product.id} style={styles.productItem}>
                  {img ? <Image source={{ uri: img }} style={styles.productImg} /> : <View style={styles.productImgPlaceholder}><Text>📦</Text></View>}
                  <View style={styles.productItemInfo}>
                    <Text style={styles.productItemTitle} numberOfLines={1}>{product.title}</Text>
                    <Text style={styles.productItemPrice}>{formatPrice(product.price)}</Text>
                    <Text style={styles.productItemStock}>Stok: {product.stock}</Text>
                    <View style={styles.productActions}>
                      <TouchableOpacity
                        style={[styles.actionBtn, { backgroundColor: product.is_active ? colors.successSurface : colors.gray100 }]}
                        onPress={() => toggleProductActive(product)}
                      >
                        <Text style={[styles.actionBtnText, { color: product.is_active ? colors.success : colors.textSecondary }]}>
                          {product.is_active ? '✅ Aktif' : '⏸️ Nonaktif'}
                        </Text>
                      </TouchableOpacity>
                      <TouchableOpacity
                        style={[styles.actionBtn, { backgroundColor: colors.primarySurface }]}
                        onPress={() => navigation.navigate('AddProduct', { storeId, editProduct: product })}
                      >
                        <Text style={[styles.actionBtnText, { color: colors.primary }]}>✏️ Edit</Text>
                      </TouchableOpacity>
                      <TouchableOpacity
                        style={[styles.actionBtn, { backgroundColor: colors.errorSurface }]}
                        onPress={() => deleteProduct(product.id)}
                      >
                        <Text style={[styles.actionBtnText, { color: colors.error }]}>🗑️ Hapus</Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                </View>
              );
            })}
          </>
        ) : (
          <>
            {/* Order Tabs */}
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.orderTabs} contentContainerStyle={{ paddingHorizontal: spacing.base }}>
              {ORDER_TABS.map((tab) => (
                <TouchableOpacity
                  key={tab}
                  style={[styles.orderTab, orderTab === tab && styles.orderTabActive]}
                  onPress={() => setOrderTab(tab)}
                >
                  <Text style={[styles.orderTabText, orderTab === tab && styles.orderTabTextActive]}>{tab}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>

            {orders.length === 0 ? (
              <View style={styles.emptyOrders}>
                <Text style={styles.emptyEmoji}>📭</Text>
                <Text style={styles.emptyText}>Belum ada pesanan</Text>
              </View>
            ) : orders.map((order) => (
              <View key={order.id} style={styles.orderCard}>
                <View style={styles.orderTopRow}>
                  <Text style={styles.orderNum}>{order.order_number}</Text>
                  <Text style={styles.orderBuyer}>👤 {order.buyer?.full_name ?? 'Pembeli'}</Text>
                </View>
                <Text style={styles.orderProduct} numberOfLines={1}>
                  {order.items?.[0]?.product_snapshot?.title ?? 'Produk'}
                  {order.items?.length > 1 ? ` +${order.items.length - 1} lagi` : ''}
                </Text>
                <Text style={styles.orderTotal}>Total: <Text style={styles.orderTotalValue}>{formatPrice(order.total)}</Text></Text>
                <Text style={styles.orderCourier}>🚚 {order.shipping_courier}</Text>

                {/* Action Buttons per status */}
                <View style={styles.orderActions}>
                  {order.status === 'pending' && (
                    <>
                      <TouchableOpacity style={styles.confirmBtn} onPress={() => updateOrderStatus(order.id, 'confirmed')}>
                        <Text style={styles.confirmBtnText}>✅ Konfirmasi</Text>
                      </TouchableOpacity>
                      <TouchableOpacity style={styles.cancelOrderBtn} onPress={() => updateOrderStatus(order.id, 'cancelled')}>
                        <Text style={styles.cancelOrderBtnText}>❌ Tolak</Text>
                      </TouchableOpacity>
                    </>
                  )}
                  {order.status === 'confirmed' && (
                    <TouchableOpacity style={styles.confirmBtn} onPress={() => updateOrderStatus(order.id, 'packed')}>
                      <Text style={styles.confirmBtnText}>📦 Tandai Dikemas</Text>
                    </TouchableOpacity>
                  )}
                  {order.status === 'packed' && (
                    <TouchableOpacity style={styles.confirmBtn} onPress={() => handleInputResi(order.id)}>
                      <Text style={styles.confirmBtnText}>🚚 Input Nomor Resi</Text>
                    </TouchableOpacity>
                  )}
                  {order.tracking_number && (
                    <Text style={styles.resiText}>Resi: {order.tracking_number}</Text>
                  )}
                </View>
              </View>
            ))}
          </>
        )}
        <View style={{ height: spacing['4xl'] }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: spacing.base, paddingTop: spacing['2xl'], backgroundColor: colors.white },
  backText: { fontSize: 24 }, headerTitle: { fontSize: fontSizes.lg, fontWeight: fontWeights.bold, color: colors.textPrimary }, editText: { fontSize: 22 },
  storeInfo: { flexDirection: 'row', alignItems: 'center', gap: spacing.md, padding: spacing.base, backgroundColor: colors.white },
  storeAvatarWrap: { width: 60, height: 60, borderRadius: 30, backgroundColor: colors.primarySurface, alignItems: 'center', justifyContent: 'center', overflow: 'hidden' },
  storeLogo: { width: 60, height: 60 }, storeText: { flex: 1 },
  storeName: { fontSize: fontSizes.lg, fontWeight: fontWeights.bold, color: colors.textPrimary },
  storeStats: { fontSize: fontSizes.sm, color: colors.textSecondary, marginTop: 2 },
  statsRow: { flexDirection: 'row', padding: spacing.base, gap: spacing.sm, backgroundColor: colors.white, marginBottom: spacing.sm },
  statCard: { flex: 1, backgroundColor: colors.primarySurface, borderRadius: borderRadius.lg, padding: spacing.md, alignItems: 'center' },
  statValue: { fontSize: fontSizes.lg, fontWeight: fontWeights.extrabold, color: colors.primary },
  statLabel: { fontSize: fontSizes.xs, color: colors.textSecondary, marginTop: 2 },
  sectionToggle: { flexDirection: 'row', backgroundColor: colors.white, padding: spacing.sm, gap: spacing.sm, marginBottom: spacing.sm },
  toggleBtn: { flex: 1, padding: spacing.md, borderRadius: borderRadius.lg, alignItems: 'center', backgroundColor: colors.gray100 },
  toggleBtnActive: { backgroundColor: colors.primary },
  toggleText: { fontWeight: fontWeights.semibold, color: colors.textSecondary },
  toggleTextActive: { color: colors.white },
  addProductBtn: { margin: spacing.base, padding: spacing.md, borderRadius: borderRadius.lg, borderWidth: 1.5, borderColor: colors.primary, borderStyle: 'dashed', alignItems: 'center', backgroundColor: colors.primarySurface },
  addProductText: { color: colors.primary, fontWeight: fontWeights.bold },
  productItem: { flexDirection: 'row', backgroundColor: colors.white, margin: spacing.base, marginBottom: 0, borderRadius: borderRadius.xl, padding: spacing.md, gap: spacing.md, ...shadows.sm },
  productImg: { width: 72, height: 72, borderRadius: borderRadius.lg },
  productImgPlaceholder: { width: 72, height: 72, borderRadius: borderRadius.lg, backgroundColor: colors.gray100, alignItems: 'center', justifyContent: 'center' },
  productItemInfo: { flex: 1 },
  productItemTitle: { fontSize: fontSizes.sm, fontWeight: fontWeights.semibold, color: colors.textPrimary },
  productItemPrice: { fontSize: fontSizes.base, fontWeight: fontWeights.extrabold, color: colors.primary, marginTop: 2 },
  productItemStock: { fontSize: fontSizes.xs, color: colors.textSecondary, marginTop: 2 },
  productActions: { flexDirection: 'row', gap: spacing.sm, marginTop: spacing.sm, flexWrap: 'wrap' },
  actionBtn: { paddingHorizontal: spacing.sm, paddingVertical: 4, borderRadius: borderRadius.md },
  actionBtnText: { fontSize: fontSizes.xs, fontWeight: fontWeights.semibold },
  orderTabs: { backgroundColor: colors.white, marginBottom: spacing.sm },
  orderTab: { paddingHorizontal: spacing.md, paddingVertical: spacing.sm, marginRight: spacing.sm, borderBottomWidth: 2, borderBottomColor: 'transparent' },
  orderTabActive: { borderBottomColor: colors.primary },
  orderTabText: { fontSize: fontSizes.sm, color: colors.textSecondary },
  orderTabTextActive: { color: colors.primary, fontWeight: fontWeights.bold },
  emptyOrders: { alignItems: 'center', paddingVertical: spacing['3xl'] },
  emptyEmoji: { fontSize: 48, marginBottom: spacing.md },
  emptyText: { color: colors.textSecondary, fontSize: fontSizes.base },
  orderCard: { backgroundColor: colors.white, margin: spacing.base, marginBottom: 0, borderRadius: borderRadius.xl, padding: spacing.base, ...shadows.sm },
  orderTopRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: spacing.xs },
  orderNum: { fontSize: fontSizes.sm, fontWeight: fontWeights.bold, color: colors.primary },
  orderBuyer: { fontSize: fontSizes.sm, color: colors.textSecondary },
  orderProduct: { fontSize: fontSizes.base, color: colors.textPrimary, fontWeight: fontWeights.medium, marginBottom: spacing.xs },
  orderTotal: { fontSize: fontSizes.sm, color: colors.textSecondary },
  orderTotalValue: { fontWeight: fontWeights.extrabold, color: colors.primary },
  orderCourier: { fontSize: fontSizes.sm, color: colors.textSecondary, marginTop: 2 },
  orderActions: { flexDirection: 'row', gap: spacing.sm, marginTop: spacing.md, flexWrap: 'wrap', alignItems: 'center' },
  confirmBtn: { backgroundColor: colors.primarySurface, borderRadius: borderRadius.lg, paddingHorizontal: spacing.md, paddingVertical: spacing.sm },
  confirmBtnText: { color: colors.primary, fontWeight: fontWeights.bold, fontSize: fontSizes.sm },
  cancelOrderBtn: { backgroundColor: colors.errorSurface, borderRadius: borderRadius.lg, paddingHorizontal: spacing.md, paddingVertical: spacing.sm },
  cancelOrderBtnText: { color: colors.error, fontWeight: fontWeights.bold, fontSize: fontSizes.sm },
  resiText: { fontSize: fontSizes.xs, color: colors.textSecondary, fontStyle: 'italic' },
});
