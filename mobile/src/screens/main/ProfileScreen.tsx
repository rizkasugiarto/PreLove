import React, { useEffect, useState } from 'react';
import {
  View, Text, ScrollView, StyleSheet, TouchableOpacity,
  Image, Alert, ActivityIndicator, StatusBar,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { supabase } from '../../lib/supabase';
import { useAuthStore } from '../../stores/authStore';
import { Store } from '../../types/database';
import { colors, spacing, fontSizes, fontWeights, borderRadius, shadows } from '../../constants/theme';

export default function ProfileScreen({ navigation }: any) {
  const { user, profile, signOut } = useAuthStore();
  const [myStore, setMyStore] = useState<Store | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (user) fetchMyStore();
  }, [user]);

  const fetchMyStore = async () => {
    const { data } = await supabase.from('stores').select('*').eq('owner_id', user!.id).maybeSingle();
    setMyStore(data as Store | null);
    setIsLoading(false);
  };

  const handleSignOut = () => {
    Alert.alert('Keluar', 'Yakin mau keluar dari akun ini?', [
      { text: 'Batal', style: 'cancel' },
      { text: 'Keluar', style: 'destructive', onPress: signOut },
    ]);
  };

  if (!user) {
    return (
      <View style={styles.notLoggedIn}>
        <StatusBar barStyle="light-content" />
        <View style={styles.notLoggedIconWrap}>
          <Text style={styles.notLoggedEmoji}>👤</Text>
        </View>
        <Text style={styles.notLoggedTitle}>Hei, siapa kamu? 👋</Text>
        <Text style={styles.notLoggedSubtitle}>
          Masuk untuk melihat profil, pesanan, dan toko kamu
        </Text>
        <TouchableOpacity style={styles.loginBtn} onPress={() => navigation.navigate('Login')}>
          <Text style={styles.loginBtnText}>Masuk / Daftar</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const menuItems = [
    { icon: '📦', label: 'Pesanan Saya', sublabel: 'Lihat status pesanan', onPress: () => navigation.navigate('Orders'), color: '#EDE9FE' },
    { icon: '❤️', label: 'Wishlist', sublabel: 'Produk yang kamu suka', onPress: () => navigation.navigate('Wishlist'), color: '#FCE7F3' },
    { icon: '💬', label: 'Pesan', sublabel: 'Chat dengan penjual', onPress: () => navigation.navigate('ChatList'), color: '#DBEAFE' },
    { icon: '📍', label: 'Alamat', sublabel: 'Kelola alamat pengiriman', onPress: () => navigation.navigate('Addresses'), color: '#D1FAE5' },
    { icon: '⭐', label: 'Ulasan Saya', sublabel: 'Review produk yang kamu beli', onPress: () => navigation.navigate('MyReviews'), color: '#FEF3C7' },
    { icon: '🔔', label: 'Notifikasi', sublabel: 'Atur notifikasi', onPress: () => navigation.navigate('Notifications'), color: '#FEE2E2' },
    { icon: '⚙️', label: 'Pengaturan', sublabel: 'Akun & privasi', onPress: () => {}, color: '#F3F4F6' },
  ];

  const firstName = profile?.full_name?.split(' ')[0] ?? profile?.username ?? 'Pengguna';
  const initials = (profile?.full_name ?? profile?.username ?? 'U')
    .split(' ')
    .map((w: string) => w[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <StatusBar barStyle="light-content" backgroundColor={colors.primaryDark} />

      {/* Profile Header */}
      <View style={styles.profileHeader}>
        {/* Background decorations */}
        <View style={styles.headerCircle1} />
        <View style={styles.headerCircle2} />

        <View style={styles.avatarRow}>
          <View style={styles.avatarContainer}>
            {profile?.avatar_url ? (
              <Image source={{ uri: profile.avatar_url }} style={styles.avatar} />
            ) : (
              <View style={styles.avatarPlaceholder}>
                <Text style={styles.avatarInitial}>{initials}</Text>
              </View>
            )}
            <TouchableOpacity
              style={styles.editAvatarBtn}
              onPress={() => navigation.navigate('EditProfile')}
            >
              <Text style={styles.editAvatarIcon}>✏️</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.profileStats}>
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>0</Text>
              <Text style={styles.statLabel}>Pesanan</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>0</Text>
              <Text style={styles.statLabel}>Wishlist</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>0</Text>
              <Text style={styles.statLabel}>Review</Text>
            </View>
          </View>
        </View>

        <Text style={styles.userName}>Halo, {firstName}! 👋</Text>
        <Text style={styles.userEmail}>{user.email}</Text>
        {profile?.phone && <Text style={styles.userPhone}>📱 {profile.phone}</Text>}

        <TouchableOpacity
          style={styles.editProfileBtn}
          onPress={() => navigation.navigate('EditProfile')}
        >
          <Text style={styles.editProfileBtnText}>✏️ Edit Profil</Text>
        </TouchableOpacity>
      </View>

      {/* Toko Saya Section */}
      <View style={styles.storeSection}>
        {isLoading ? (
          <View style={styles.storeLoadingCard}>
            <ActivityIndicator color={colors.primary} />
          </View>
        ) : myStore ? (
          <TouchableOpacity
            style={styles.storeCard}
            onPress={() => navigation.navigate('MyStore', { storeId: myStore.id })}
            activeOpacity={0.85}
          >
            <View style={styles.storeCardLeft}>
              <View style={styles.storeIconWrap}>
                {myStore.logo_url ? (
                  <Image source={{ uri: myStore.logo_url }} style={styles.storeLogo} />
                ) : (
                  <Text style={styles.storeDefaultIcon}>🏪</Text>
                )}
              </View>
              <View>
                <Text style={styles.storeCardLabel}>Toko Saya</Text>
                <Text style={styles.storeCardName}>{myStore.name}</Text>
                <View style={styles.storeStats}>
                  <Text style={styles.storeRating}>⭐ {myStore.rating.toFixed(1)}</Text>
                  <View style={styles.storeDot} />
                  <Text style={styles.storeSales}>{myStore.total_sales} terjual</Text>
                </View>
              </View>
            </View>
            <View style={styles.storeArrowWrap}>
              <Text style={styles.storeArrow}>›</Text>
            </View>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity
            style={styles.openStoreCard}
            onPress={() => navigation.navigate('OpenStore')}
            activeOpacity={0.85}
          >
            <View style={styles.openStoreIconWrap}>
              <Text style={styles.openStoreEmoji}>🏪</Text>
            </View>
            <View style={styles.openStoreText}>
              <Text style={styles.openStoreTitle}>Buka Toko Gratis!</Text>
              <Text style={styles.openStoreSubtitle}>Jual barang preloved kamu sekarang</Text>
            </View>
            <View style={styles.openStoreArrowWrap}>
              <Text style={styles.storeArrow}>›</Text>
            </View>
          </TouchableOpacity>
        )}
      </View>

      {/* Menu Items */}
      <View style={styles.menuContainer}>
        <Text style={styles.menuSectionTitle}>Akun Saya</Text>
        {menuItems.map((item, idx) => (
          <TouchableOpacity
            key={idx}
            style={[styles.menuItem, idx === menuItems.length - 1 && styles.menuItemLast]}
            onPress={item.onPress}
            activeOpacity={0.7}
          >
            <View style={[styles.menuIconWrap, { backgroundColor: item.color }]}>
              <Text style={styles.menuIcon}>{item.icon}</Text>
            </View>
            <View style={styles.menuTextWrap}>
              <Text style={styles.menuLabel}>{item.label}</Text>
              <Text style={styles.menuSublabel}>{item.sublabel}</Text>
            </View>
            <Text style={styles.menuArrow}>›</Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Logout */}
      <TouchableOpacity style={styles.logoutBtn} onPress={handleSignOut}>
        <Text style={styles.logoutIcon}>🚪</Text>
        <Text style={styles.logoutText}>Keluar dari Akun</Text>
      </TouchableOpacity>

      <Text style={styles.version}>PreLove v1.0.0 · Made with 💜</Text>
      <View style={{ height: spacing['3xl'] }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },

  // Not Logged In
  notLoggedIn: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing['2xl'],
    backgroundColor: colors.background,
  },
  notLoggedIconWrap: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: colors.primarySurface,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.xl,
  },
  notLoggedEmoji: { fontSize: 56 },
  notLoggedTitle: {
    fontSize: fontSizes['2xl'],
    fontWeight: fontWeights.extrabold,
    color: colors.textPrimary,
    marginBottom: spacing.sm,
    textAlign: 'center',
  },
  notLoggedSubtitle: {
    fontSize: fontSizes.base,
    color: colors.textSecondary,
    textAlign: 'center',
    marginBottom: spacing.xl,
    lineHeight: 22,
  },
  loginBtn: {
    backgroundColor: colors.primary,
    borderRadius: borderRadius.full,
    paddingHorizontal: spacing['2xl'],
    paddingVertical: spacing.md,
    ...shadows.lg,
  },
  loginBtnText: { color: colors.white, fontWeight: fontWeights.bold, fontSize: fontSizes.base },

  // Profile Header
  profileHeader: {
    backgroundColor: colors.primary,
    paddingTop: 52,
    paddingBottom: spacing['2xl'],
    paddingHorizontal: spacing.base,
    borderBottomLeftRadius: 32,
    borderBottomRightRadius: 32,
    overflow: 'hidden',
    position: 'relative',
  },
  headerCircle1: {
    position: 'absolute',
    width: 200,
    height: 200,
    borderRadius: 100,
    backgroundColor: 'rgba(255,255,255,0.06)',
    top: -60,
    right: -40,
  },
  headerCircle2: {
    position: 'absolute',
    width: 140,
    height: 140,
    borderRadius: 70,
    backgroundColor: 'rgba(255,255,255,0.06)',
    bottom: -30,
    left: -20,
  },
  avatarRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.md,
    gap: spacing.lg,
  },
  avatarContainer: { position: 'relative' },
  avatar: { width: 80, height: 80, borderRadius: 40, borderWidth: 3, borderColor: 'rgba(255,255,255,0.4)' },
  avatarPlaceholder: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(255,255,255,0.25)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 3,
    borderColor: 'rgba(255,255,255,0.4)',
  },
  avatarInitial: {
    fontSize: fontSizes['2xl'],
    fontWeight: fontWeights.extrabold,
    color: colors.white,
  },
  editAvatarBtn: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: colors.white,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: colors.primary,
  },
  editAvatarIcon: { fontSize: 12 },
  profileStats: {
    flex: 1,
    flexDirection: 'row',
    backgroundColor: 'rgba(255,255,255,0.15)',
    borderRadius: borderRadius.xl,
    padding: spacing.md,
    alignItems: 'center',
  },
  statItem: { flex: 1, alignItems: 'center' },
  statNumber: { fontSize: fontSizes.xl, fontWeight: fontWeights.extrabold, color: colors.white },
  statLabel: { fontSize: fontSizes.xs, color: 'rgba(255,255,255,0.75)', marginTop: 2 },
  statDivider: { width: 1, height: 30, backgroundColor: 'rgba(255,255,255,0.3)' },
  userName: {
    fontSize: fontSizes.xl,
    fontWeight: fontWeights.extrabold,
    color: colors.white,
    marginBottom: spacing.xs,
  },
  userEmail: { fontSize: fontSizes.sm, color: 'rgba(255,255,255,0.75)' },
  userPhone: { fontSize: fontSizes.sm, color: 'rgba(255,255,255,0.75)', marginTop: spacing.xs },
  editProfileBtn: {
    marginTop: spacing.md,
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: borderRadius.full,
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.sm,
    alignSelf: 'flex-start',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.35)',
  },
  editProfileBtnText: { color: colors.white, fontWeight: fontWeights.semibold, fontSize: fontSizes.sm },

  // Store Section
  storeSection: { margin: spacing.base },
  storeLoadingCard: {
    backgroundColor: colors.white,
    borderRadius: borderRadius.xl,
    padding: spacing.xl,
    alignItems: 'center',
    ...shadows.card,
  },
  storeCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.white,
    borderRadius: borderRadius.xl,
    padding: spacing.base,
    ...shadows.md,
  },
  storeCardLeft: { flexDirection: 'row', alignItems: 'center', gap: spacing.md, flex: 1 },
  storeIconWrap: {
    width: 56,
    height: 56,
    borderRadius: 18,
    backgroundColor: colors.primarySurface,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  storeLogo: { width: 56, height: 56 },
  storeDefaultIcon: { fontSize: 28 },
  storeCardLabel: { fontSize: fontSizes.xs, color: colors.textSecondary, fontWeight: fontWeights.medium },
  storeCardName: { fontSize: fontSizes.base, fontWeight: fontWeights.bold, color: colors.textPrimary, marginBottom: 4 },
  storeStats: { flexDirection: 'row', alignItems: 'center', gap: spacing.xs },
  storeRating: { fontSize: fontSizes.xs, color: colors.accent, fontWeight: fontWeights.semibold },
  storeDot: { width: 4, height: 4, borderRadius: 2, backgroundColor: colors.gray300 },
  storeSales: { fontSize: fontSizes.xs, color: colors.textSecondary },
  storeArrowWrap: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.primarySurface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  storeArrow: { fontSize: 22, color: colors.primary, fontWeight: fontWeights.bold },
  openStoreCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    backgroundColor: colors.primarySurface2,
    borderRadius: borderRadius.xl,
    padding: spacing.base,
    borderWidth: 2,
    borderColor: colors.primaryLighter,
    borderStyle: 'dashed',
  },
  openStoreIconWrap: {
    width: 56,
    height: 56,
    borderRadius: 18,
    backgroundColor: colors.primarySurface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  openStoreEmoji: { fontSize: 28 },
  openStoreText: { flex: 1 },
  openStoreTitle: { fontSize: fontSizes.base, fontWeight: fontWeights.bold, color: colors.primary },
  openStoreSubtitle: { fontSize: fontSizes.sm, color: colors.textSecondary, marginTop: 2 },
  openStoreArrowWrap: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },

  // Menu
  menuContainer: {
    backgroundColor: colors.white,
    marginHorizontal: spacing.base,
    marginBottom: spacing.base,
    borderRadius: borderRadius.xl,
    overflow: 'hidden',
    ...shadows.sm,
  },
  menuSectionTitle: {
    fontSize: fontSizes.sm,
    fontWeight: fontWeights.bold,
    color: colors.textSecondary,
    paddingHorizontal: spacing.base,
    paddingTop: spacing.base,
    paddingBottom: spacing.sm,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.base,
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderLight,
    gap: spacing.md,
  },
  menuItemLast: { borderBottomWidth: 0 },
  menuIconWrap: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  menuIcon: { fontSize: 20 },
  menuTextWrap: { flex: 1 },
  menuLabel: { fontSize: fontSizes.base, color: colors.textPrimary, fontWeight: fontWeights.semibold },
  menuSublabel: { fontSize: fontSizes.xs, color: colors.textSecondary, marginTop: 1 },
  menuArrow: { fontSize: 22, color: colors.gray300, fontWeight: fontWeights.bold },

  // Logout
  logoutBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    margin: spacing.base,
    padding: spacing.base,
    borderRadius: borderRadius.xl,
    backgroundColor: colors.errorSurface,
    borderWidth: 1,
    borderColor: '#FCA5A5',
  },
  logoutIcon: { fontSize: 20 },
  logoutText: { color: colors.error, fontWeight: fontWeights.bold, fontSize: fontSizes.base },
  version: {
    textAlign: 'center',
    color: colors.textDisabled,
    fontSize: fontSizes.xs,
    marginBottom: spacing.md,
  },
});
