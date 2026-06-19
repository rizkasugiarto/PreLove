import React, { useEffect } from 'react';
import {
  View, Text, ScrollView, StyleSheet, TouchableOpacity,
  Image, ActivityIndicator, Alert, Dimensions, StatusBar,
} from 'react-native';
import { useAuthStore } from '../../stores/authStore';
import { useCartStore } from '../../stores/cartStore';
import { colors, spacing, fontSizes, fontWeights, borderRadius, shadows } from '../../constants/theme';
import { formatPrice } from '../../utils/format';

export default function CartScreen({ navigation }: any) {
  const { user } = useAuthStore();
  const { items, isLoading, fetchCart, removeFromCart, updateQuantity, getTotalPrice, getTotalItems } = useCartStore();

  useEffect(() => {
    if (user) fetchCart(user.id);
  }, [user]);

  if (!user) {
    return (
      <View style={styles.emptyContainer}>
        <StatusBar barStyle="light-content" />
        <View style={styles.emptyIconWrap}>
          <Text style={styles.emptyEmoji}>🛒</Text>
        </View>
        <Text style={styles.emptyTitle}>Masuk dulu, yuk!</Text>
        <Text style={styles.emptySubtitle}>Login untuk melihat keranjang belanjamu</Text>
        <TouchableOpacity style={styles.primaryBtn} onPress={() => navigation.navigate('Login')}>
          <Text style={styles.primaryBtnText}>Masuk Sekarang</Text>
        </TouchableOpacity>
      </View>
    );
  }

  if (isLoading) {
    return (
      <View style={styles.emptyContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={styles.loadingText}>Memuat keranjang...</Text>
      </View>
    );
  }

  if (items.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <View style={styles.emptyIconWrap}>
          <Text style={styles.emptyEmoji}>🛒</Text>
        </View>
        <Text style={styles.emptyTitle}>Keranjang kosong</Text>
        <Text style={styles.emptySubtitle}>Yuk, cari barang preloved keren dan tambahkan ke keranjang!</Text>
        <TouchableOpacity
          style={styles.primaryBtn}
          onPress={() => navigation.navigate('Home')}
        >
          <Text style={styles.primaryBtnText}>Mulai Belanja</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const handleRemove = (itemId: string) => {
    Alert.alert(
      'Hapus Produk',
      'Yakin mau hapus produk ini dari keranjang?',
      [
        { text: 'Batal', style: 'cancel' },
        { text: 'Hapus', style: 'destructive', onPress: () => removeFromCart(itemId) },
      ]
    );
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={colors.primaryDark} />

      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Keranjang</Text>
        <View style={styles.headerBadge}>
          <Text style={styles.headerBadgeText}>{getTotalItems()} item</Text>
        </View>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} style={styles.list}>
        {/* Promo Banner */}
        <View style={styles.promoBanner}>
          <Text style={styles.promoIcon}>🎉</Text>
          <Text style={styles.promoText}>Gratis ongkir min. pembelian Rp 100.000!</Text>
        </View>

        {items.map((item) => {
          const product = item.product;
          const primaryImg =
            product?.images?.find((i) => i.is_primary)?.image_url ?? product?.images?.[0]?.image_url;
          return (
            <View key={item.id} style={styles.cartItem}>
              {/* Checkbox */}
              <View style={styles.checkbox}>
                <View style={styles.checkboxInner} />
              </View>

              {/* Image */}
              {primaryImg ? (
                <Image source={{ uri: primaryImg }} style={styles.itemImage} />
              ) : (
                <View style={styles.itemImagePlaceholder}>
                  <Text style={{ fontSize: 28 }}>📦</Text>
                </View>
              )}

              <View style={styles.itemInfo}>
                <Text style={styles.itemTitle} numberOfLines={2}>{product?.title}</Text>
                <Text style={styles.itemPrice}>{formatPrice(product?.price ?? 0)}</Text>

                <View style={styles.itemActions}>
                  <View style={styles.qtyRow}>
                    <TouchableOpacity
                      style={[styles.qtyBtn, item.quantity <= 1 && styles.qtyBtnDisabled]}
                      onPress={() => item.quantity > 1 && updateQuantity(item.id, item.quantity - 1)}
                    >
                      <Text style={[styles.qtyBtnText, item.quantity <= 1 && styles.qtyBtnTextDisabled]}>−</Text>
                    </TouchableOpacity>
                    <Text style={styles.qtyValue}>{item.quantity}</Text>
                    <TouchableOpacity
                      style={styles.qtyBtn}
                      onPress={() => updateQuantity(item.id, item.quantity + 1)}
                    >
                      <Text style={styles.qtyBtnText}>+</Text>
                    </TouchableOpacity>
                  </View>
                  <TouchableOpacity
                    style={styles.deleteBtn}
                    onPress={() => handleRemove(item.id)}
                  >
                    <Text style={styles.deleteBtnText}>🗑️</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          );
        })}
        <View style={{ height: 140 }} />
      </ScrollView>

      {/* Checkout Bar */}
      <View style={styles.checkoutBar}>
        <View style={styles.checkoutBarTop}>
          <View>
            <Text style={styles.totalLabel}>Total Pembayaran</Text>
            <Text style={styles.totalPrice}>{formatPrice(getTotalPrice())}</Text>
          </View>
          <Text style={styles.totalSaved}>Hemat belanja preloved! 💜</Text>
        </View>
        <TouchableOpacity
          style={styles.checkoutBtn}
          onPress={() => navigation.navigate('Checkout', { fromCart: true })}
          activeOpacity={0.85}
        >
          <Text style={styles.checkoutBtnText}>Checkout ({getTotalItems()} item) →</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },

  // Empty / Loading states
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing['2xl'],
    backgroundColor: colors.background,
  },
  emptyIconWrap: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: colors.primarySurface,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.xl,
  },
  emptyEmoji: { fontSize: 56 },
  emptyTitle: {
    fontSize: fontSizes['2xl'],
    fontWeight: fontWeights.extrabold,
    color: colors.textPrimary,
    marginBottom: spacing.sm,
    textAlign: 'center',
  },
  emptySubtitle: {
    fontSize: fontSizes.base,
    color: colors.textSecondary,
    textAlign: 'center',
    marginBottom: spacing.xl,
    lineHeight: 22,
  },
  primaryBtn: {
    backgroundColor: colors.primary,
    borderRadius: borderRadius.full,
    paddingHorizontal: spacing['2xl'],
    paddingVertical: spacing.md,
    ...shadows.lg,
  },
  primaryBtnText: { color: colors.white, fontWeight: fontWeights.bold, fontSize: fontSizes.base },
  loadingText: { color: colors.textSecondary, marginTop: spacing.md, fontSize: fontSizes.base },

  // Header
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    padding: spacing.base,
    paddingTop: 52,
    paddingBottom: spacing.md,
    backgroundColor: colors.primary,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
  },
  headerTitle: {
    fontSize: fontSizes['2xl'],
    fontWeight: fontWeights.extrabold,
    color: colors.white,
    flex: 1,
  },
  headerBadge: {
    backgroundColor: 'rgba(255,255,255,0.25)',
    borderRadius: borderRadius.full,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
  },
  headerBadgeText: {
    color: colors.white,
    fontSize: fontSizes.sm,
    fontWeight: fontWeights.bold,
  },

  // Promo banner
  promoBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    margin: spacing.base,
    marginBottom: 0,
    backgroundColor: colors.primarySurface,
    borderRadius: borderRadius.xl,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.primaryLighter,
  },
  promoIcon: { fontSize: 20 },
  promoText: {
    fontSize: fontSizes.sm,
    color: colors.primary,
    fontWeight: fontWeights.semibold,
    flex: 1,
  },

  // List
  list: { flex: 1 },
  cartItem: {
    flexDirection: 'row',
    backgroundColor: colors.white,
    margin: spacing.base,
    marginBottom: spacing.sm,
    borderRadius: borderRadius.xl,
    padding: spacing.md,
    gap: spacing.sm,
    ...shadows.card,
    alignItems: 'flex-start',
  },
  checkbox: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 2,
    borderColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: spacing.xs,
    flexShrink: 0,
  },
  checkboxInner: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: colors.primary,
  },
  itemImage: {
    width: 80,
    height: 80,
    borderRadius: borderRadius.lg,
    resizeMode: 'cover',
    flexShrink: 0,
  },
  itemImagePlaceholder: {
    width: 80,
    height: 80,
    borderRadius: borderRadius.lg,
    backgroundColor: colors.primarySurface2,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  itemInfo: { flex: 1 },
  itemTitle: {
    fontSize: fontSizes.sm,
    fontWeight: fontWeights.medium,
    color: colors.textPrimary,
    lineHeight: 18,
    marginBottom: 4,
  },
  itemPrice: {
    fontSize: fontSizes.md,
    fontWeight: fontWeights.extrabold,
    color: colors.primary,
    marginBottom: spacing.sm,
  },
  itemActions: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  qtyRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  qtyBtn: {
    width: 32,
    height: 32,
    borderRadius: borderRadius.md,
    borderWidth: 1.5,
    borderColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  qtyBtnDisabled: { borderColor: colors.border },
  qtyBtnText: { fontSize: fontSizes.lg, color: colors.primary, lineHeight: 22, fontWeight: fontWeights.bold },
  qtyBtnTextDisabled: { color: colors.gray300 },
  qtyValue: {
    fontSize: fontSizes.base,
    fontWeight: fontWeights.bold,
    color: colors.textPrimary,
    minWidth: 24,
    textAlign: 'center',
  },
  deleteBtn: {
    width: 32,
    height: 32,
    borderRadius: borderRadius.md,
    backgroundColor: colors.errorSurface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  deleteBtnText: { fontSize: 16 },

  // Checkout bar
  checkoutBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: colors.white,
    padding: spacing.base,
    paddingBottom: spacing.xl,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    ...shadows.xl,
  },
  checkoutBarTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  totalLabel: { fontSize: fontSizes.xs, color: colors.textSecondary },
  totalPrice: {
    fontSize: fontSizes['2xl'],
    fontWeight: fontWeights.extrabold,
    color: colors.primary,
  },
  totalSaved: {
    fontSize: fontSizes.xs,
    color: colors.success,
    fontWeight: fontWeights.semibold,
  },
  checkoutBtn: {
    backgroundColor: colors.primary,
    borderRadius: borderRadius.full,
    paddingVertical: spacing.md,
    alignItems: 'center',
    ...shadows.lg,
  },
  checkoutBtnText: {
    color: colors.white,
    fontWeight: fontWeights.extrabold,
    fontSize: fontSizes.base,
    letterSpacing: 0.3,
  },
});
