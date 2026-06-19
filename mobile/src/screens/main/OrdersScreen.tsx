import React, { useEffect, useState } from 'react';
import {
  View, Text, ScrollView, StyleSheet, TouchableOpacity,
  Image, ActivityIndicator, RefreshControl,
} from 'react-native';
import { supabase } from '../../lib/supabase';
import { useAuthStore } from '../../stores/authStore';
import { Order } from '../../types/database';
import { colors, spacing, fontSizes, fontWeights, borderRadius, shadows } from '../../constants/theme';
import { formatPrice, formatDateShort } from '../../utils/format';

const STATUS_CONFIG: Record<string, { label: string; color: string; emoji: string }> = {
  waiting_payment: { label: 'Menunggu Pembayaran', color: colors.warning, emoji: '⏳' },
  pending:         { label: 'Menunggu Konfirmasi', color: colors.info,    emoji: '📋' },
  confirmed:       { label: 'Dikonfirmasi',         color: colors.primary, emoji: '✅' },
  packed:          { label: 'Dikemas',               color: colors.primary, emoji: '📦' },
  shipped:         { label: 'Dikirim',               color: colors.info,    emoji: '🚚' },
  delivered:       { label: 'Tiba di Tujuan',        color: colors.success, emoji: '📬' },
  completed:       { label: 'Selesai',               color: colors.success, emoji: '🎉' },
  cancelled:       { label: 'Dibatalkan',            color: colors.error,   emoji: '❌' },
};

const TABS = ['Semua', 'Bayar', 'Proses', 'Dikirim', 'Selesai'];
const TAB_STATUS: Record<string, string[]> = {
  'Semua': [],
  'Bayar': ['waiting_payment', 'pending'],
  'Proses': ['confirmed', 'packed'],
  'Dikirim': ['shipped', 'delivered'],
  'Selesai': ['completed', 'cancelled'],
};

export default function OrdersScreen({ navigation }: any) {
  const { user } = useAuthStore();
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState('Semua');

  useEffect(() => { if (user) fetchOrders(); }, [user, activeTab]);

  const fetchOrders = async () => {
    setIsLoading(true);
    let q = supabase
      .from('orders')
      .select('*, store:stores(name, logo_url), items:order_items(*, product_snapshot)')
      .eq('buyer_id', user!.id)
      .order('created_at', { ascending: false });

    const statuses = TAB_STATUS[activeTab];
    if (statuses.length > 0) q = q.in('status', statuses);

    const { data } = await q;
    if (data) setOrders(data as Order[]);
    setIsLoading(false);
  };

  const onRefresh = async () => { setRefreshing(true); await fetchOrders(); setRefreshing(false); };

  const handleConfirmReceived = async (orderId: string) => {
    await supabase.from('orders').update({ status: 'delivered' }).eq('id', orderId);
    fetchOrders();
  };

  if (!user) {
    return (
      <View style={styles.center}>
        <Text style={styles.centerEmoji}>📦</Text>
        <Text style={styles.centerTitle}>Login dulu, yuk!</Text>
        <TouchableOpacity style={styles.loginBtn} onPress={() => navigation.navigate('Login')}>
          <Text style={styles.loginBtnText}>Masuk</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>📦 Pesanan Saya</Text>
      </View>

      {/* Tabs */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.tabBar} contentContainerStyle={styles.tabContent}>
        {TABS.map((tab) => (
          <TouchableOpacity
            key={tab}
            style={[styles.tab, activeTab === tab && styles.tabActive]}
            onPress={() => setActiveTab(tab)}
          >
            <Text style={[styles.tabText, activeTab === tab && styles.tabTextActive]}>{tab}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {isLoading ? (
        <View style={styles.center}><ActivityIndicator size="large" color={colors.primary} /></View>
      ) : orders.length === 0 ? (
        <View style={styles.center}>
          <Text style={styles.centerEmoji}>🛍️</Text>
          <Text style={styles.centerTitle}>Belum ada pesanan</Text>
          <TouchableOpacity style={styles.shopBtn} onPress={() => navigation.navigate('Home')}>
            <Text style={styles.shopBtnText}>Mulai Belanja</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <ScrollView
          showsVerticalScrollIndicator={false}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} />}
        >
          {orders.map((order) => {
            const status = STATUS_CONFIG[order.status] ?? STATUS_CONFIG.pending;
            const firstItem = order.items?.[0];
            const snapshot = firstItem?.product_snapshot as any;
            const thumbUrl = snapshot?.images?.find((i: any) => i.is_primary)?.image_url ?? snapshot?.images?.[0]?.image_url;

            return (
              <TouchableOpacity
                key={order.id}
                style={styles.orderCard}
                onPress={() => navigation.navigate('OrderDetail', { orderId: order.id })}
              >
                {/* Store Info */}
                <View style={styles.storeRow}>
                  <Text style={styles.storeName}>🏪 {(order as any).store?.name ?? 'Toko'}</Text>
                  <View style={[styles.statusBadge, { backgroundColor: status.color + '20' }]}>
                    <Text style={[styles.statusText, { color: status.color }]}>{status.emoji} {status.label}</Text>
                  </View>
                </View>

                {/* Product preview */}
                <View style={styles.productRow}>
                  {thumbUrl ? (
                    <Image source={{ uri: thumbUrl }} style={styles.productThumb} />
                  ) : (
                    <View style={styles.productThumbPlaceholder}><Text>📦</Text></View>
                  )}
                  <View style={styles.flex1}>
                    <Text style={styles.productTitle} numberOfLines={1}>{snapshot?.title ?? 'Produk'}</Text>
                    {order.items && order.items.length > 1 && (
                      <Text style={styles.moreItems}>+{order.items.length - 1} produk lainnya</Text>
                    )}
                    <Text style={styles.orderDate}>{formatDateShort(order.created_at)}</Text>
                  </View>
                </View>

                {/* Total */}
                <View style={styles.totalRow}>
                  <Text style={styles.totalLabel}>Total: <Text style={styles.totalValue}>{formatPrice(order.total)}</Text></Text>
                  {order.status === 'delivered' && (
                    <TouchableOpacity
                      style={styles.reviewBtn}
                      onPress={() => navigation.navigate('WriteReview', { orderId: order.id })}
                    >
                      <Text style={styles.reviewBtnText}>⭐ Beri Ulasan</Text>
                    </TouchableOpacity>
                  )}
                  {order.status === 'shipped' && (
                    <TouchableOpacity
                      style={styles.receivedBtn}
                      onPress={() => handleConfirmReceived(order.id)}
                    >
                      <Text style={styles.receivedBtnText}>✅ Terima Barang</Text>
                    </TouchableOpacity>
                  )}
                </View>

                {order.tracking_number && (
                  <View style={styles.trackingRow}>
                    <Text style={styles.trackingLabel}>🚚 Resi: </Text>
                    <Text style={styles.trackingValue}>{order.tracking_number}</Text>
                  </View>
                )}
              </TouchableOpacity>
            );
          })}
          <View style={{ height: spacing['3xl'] }} />
        </ScrollView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: spacing['2xl'] },
  centerEmoji: { fontSize: 64, marginBottom: spacing.md },
  centerTitle: { fontSize: fontSizes.lg, fontWeight: fontWeights.bold, color: colors.textPrimary, marginBottom: spacing.md },
  loginBtn: { backgroundColor: colors.primary, borderRadius: borderRadius.lg, paddingHorizontal: spacing['2xl'], paddingVertical: spacing.md },
  loginBtnText: { color: colors.white, fontWeight: fontWeights.bold },
  shopBtn: { backgroundColor: colors.primary, borderRadius: borderRadius.lg, paddingHorizontal: spacing['2xl'], paddingVertical: spacing.md },
  shopBtnText: { color: colors.white, fontWeight: fontWeights.bold },
  header: { padding: spacing.base, paddingTop: spacing['2xl'], backgroundColor: colors.white },
  headerTitle: { fontSize: fontSizes.xl, fontWeight: fontWeights.bold, color: colors.textPrimary },
  tabBar: { backgroundColor: colors.white, borderBottomWidth: 1, borderBottomColor: colors.border },
  tabContent: { paddingHorizontal: spacing.base, paddingBottom: spacing.sm },
  tab: { paddingHorizontal: spacing.md, paddingVertical: spacing.sm, marginRight: spacing.sm, borderBottomWidth: 2, borderBottomColor: 'transparent' },
  tabActive: { borderBottomColor: colors.primary },
  tabText: { fontSize: fontSizes.sm, color: colors.textSecondary, fontWeight: fontWeights.medium },
  tabTextActive: { color: colors.primary, fontWeight: fontWeights.bold },
  orderCard: { backgroundColor: colors.white, margin: spacing.base, marginBottom: 0, borderRadius: borderRadius.xl, padding: spacing.base, ...shadows.sm },
  storeRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: spacing.md },
  storeName: { fontSize: fontSizes.sm, fontWeight: fontWeights.bold, color: colors.textPrimary },
  statusBadge: { borderRadius: borderRadius.full, paddingHorizontal: spacing.sm, paddingVertical: 4 },
  statusText: { fontSize: fontSizes.xs, fontWeight: fontWeights.bold },
  productRow: { flexDirection: 'row', gap: spacing.md, marginBottom: spacing.md },
  productThumb: { width: 60, height: 60, borderRadius: borderRadius.lg, resizeMode: 'cover' },
  productThumbPlaceholder: { width: 60, height: 60, borderRadius: borderRadius.lg, backgroundColor: colors.gray100, alignItems: 'center', justifyContent: 'center' },
  flex1: { flex: 1 },
  productTitle: { fontSize: fontSizes.base, fontWeight: fontWeights.medium, color: colors.textPrimary },
  moreItems: { fontSize: fontSizes.xs, color: colors.textSecondary, marginTop: 2 },
  orderDate: { fontSize: fontSizes.xs, color: colors.textSecondary, marginTop: spacing.xs },
  totalRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  totalLabel: { fontSize: fontSizes.sm, color: colors.textSecondary },
  totalValue: { fontWeight: fontWeights.extrabold, color: colors.primary, fontSize: fontSizes.base },
  reviewBtn: { backgroundColor: colors.primarySurface, borderRadius: borderRadius.lg, paddingHorizontal: spacing.md, paddingVertical: spacing.sm },
  reviewBtnText: { color: colors.primary, fontSize: fontSizes.sm, fontWeight: fontWeights.bold },
  receivedBtn: { backgroundColor: colors.successSurface, borderRadius: borderRadius.lg, paddingHorizontal: spacing.md, paddingVertical: spacing.sm },
  receivedBtnText: { color: colors.success, fontSize: fontSizes.sm, fontWeight: fontWeights.bold },
  trackingRow: { flexDirection: 'row', marginTop: spacing.sm, paddingTop: spacing.sm, borderTopWidth: 1, borderTopColor: colors.border },
  trackingLabel: { fontSize: fontSizes.sm, color: colors.textSecondary },
  trackingValue: { fontSize: fontSizes.sm, color: colors.primary, fontWeight: fontWeights.semibold },
});
