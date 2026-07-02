import React, { useEffect, useRef, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  RefreshControl,
  Dimensions,
  Animated,
  Image,
  StatusBar,
  ImageBackground,
} from 'react-native';
import { supabase } from '../../lib/supabase';
import { Product, Category } from '../../types/database';
import { colors, spacing, fontSizes, fontWeights, borderRadius, shadows } from '../../constants/theme';
import { formatPrice } from '../../utils/format';
import { useAuthStore } from '../../stores/authStore';

const { width } = Dimensions.get('window');
const CARD_WIDTH = (width - spacing.base * 2 - spacing.sm) / 2;

// Category icons mapping
const CATEGORY_ICONS: Record<string, string> = {
  'Fashion': '👗',
  'Elektronik': '📱',
  'Buku': '📚',
  'Tas': '👜',
  'Sepatu': '👟',
  'Aksesoris': '💍',
  'Olahraga': '⚽',
  'Furnitur': '🪑',
  'Kecantikan': '💄',
  'Mainan': '🧸',
  'Koleksi': '🎨',
  'Lainnya': '📦',
};

const BANNERS = [
  {
    id: '1',
    title: 'Fashion Preloved',
    subtitle: 'Tampil kece hemat budget!',
    emoji: '👗',
    gradientFrom: '#7C3AED',
    gradientTo: '#A855F7',
    tag: 'Terlaris',
  },
  {
    id: '2',
    title: 'Elektronik Murah',
    subtitle: 'Gadget berkualitas harga miring',
    emoji: '📱',
    gradientFrom: '#5B21B6',
    gradientTo: '#7C3AED',
    tag: 'Hemat',
  },
  {
    id: '3',
    title: 'Buku & Perlengkapan',
    subtitle: 'Koleksi buku pilihan untukmu',
    emoji: '📚',
    gradientFrom: '#6D28D9',
    gradientTo: '#8B5CF6',
    tag: 'Baru',
  },
];

// Flash deal mock data
const FLASH_CATEGORIES = [
  { emoji: '👗', label: 'Fashion', color: '#EDE9FE' },
  { emoji: '📱', label: 'Gadget', color: '#F3E8FF' },
  { emoji: '📚', label: 'Buku', color: '#E0E7FF' },
  { emoji: '👜', label: 'Tas', color: '#FCE7F3' },
  { emoji: '👟', label: 'Sepatu', color: '#FEF3C7' },
  { emoji: '💄', label: 'Beauty', color: '#FFE4E6' },
  { emoji: '🎮', label: 'Gaming', color: '#DBEAFE' },
  { emoji: '🪑', label: 'Furnitur', color: '#D1FAE5' },
];

export default function HomeScreen({ navigation }: any) {
  const { profile } = useAuthStore();
  const [products, setProducts] = React.useState<Product[]>([]);
  const [categories, setCategories] = React.useState<Category[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);
  const [refreshing, setRefreshing] = React.useState(false);
  const [selectedCategory, setSelectedCategory] = React.useState<string | null>(null);
  const [bannerIndex, setBannerIndex] = React.useState(0);
  const bannerRef = useRef<ScrollView>(null);
  const scrollY = useRef(new Animated.Value(0)).current;

  // Auto-scroll banner
  useEffect(() => {
    const timer = setInterval(() => {
      setBannerIndex((prev) => {
        const next = (prev + 1) % BANNERS.length;
        bannerRef.current?.scrollTo({ x: next * (width - spacing.base * 2), animated: true });
        return next;
      });
    }, 3500);
    return () => clearInterval(timer);
  }, []);

  const fetchData = useCallback(async () => {
    setIsLoading(true);
    const [{ data: cats }, { data: prods }] = await Promise.all([
      supabase.from('categories').select('*').order('sort_order'),
      supabase
        .from('products')
        .select('*, store:stores(name, slug), images:product_images(*)')
        .eq('is_active', true)
        .order('created_at', { ascending: false })
        .limit(20),
    ]);
    if (cats) setCategories(cats);
    if (prods) setProducts(prods as Product[]);
    setIsLoading(false);
  }, []);

  const fetchByCategory = useCallback(async (categoryId: string) => {
    const { data } = await supabase
      .from('products')
      .select('*, store:stores(name, slug), images:product_images(*)')
      .eq('is_active', true)
      .eq('category_id', categoryId)
      .order('created_at', { ascending: false })
      .limit(20);
    if (data) setProducts(data as Product[]);
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  useEffect(() => {
    if (selectedCategory) {
      fetchByCategory(selectedCategory);
    } else {
      fetchData();
    }
  }, [selectedCategory]);

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchData();
    setRefreshing(false);
  };

  const primaryImage = (product: Product) =>
    product.images?.find((i) => i.is_primary)?.image_url ?? product.images?.[0]?.image_url;

  const conditionLabel: Record<string, string> = {
    new: 'Baru',
    like_new: 'Seperti Baru',
    good: 'Bagus',
    fair: 'Cukup Baik',
  };

  const conditionColor: Record<string, string> = {
    new: colors.success,
    like_new: '#8B5CF6',
    good: colors.primary,
    fair: colors.warning,
  };

  const firstName = profile?.full_name?.split(' ')[0] ?? profile?.username ?? 'Kamu';

  const renderProduct = ({ item }: { item: Product }) => (
    <TouchableOpacity
      style={styles.productCard}
      activeOpacity={0.9}
      onPress={() => navigation.navigate('ProductDetail', { productId: item.id })}
    >
      <View style={styles.productImageWrap}>
        {primaryImage(item) ? (
          <Image
            source={{ uri: primaryImage(item) }}
            style={styles.productImage}
            resizeMode="cover"
          />
        ) : (
          <View style={styles.productImagePlaceholder}>
            <Text style={styles.placeholderEmoji}>📦</Text>
          </View>
        )}
        {/* Condition badge */}
        <View style={[styles.conditionBadge, { backgroundColor: conditionColor[item.condition] }]}>
          <Text style={styles.conditionText}>{conditionLabel[item.condition]}</Text>
        </View>
        {/* Wishlist button */}
        <TouchableOpacity style={styles.wishlistBtn}>
          <Text style={styles.wishlistIcon}>♡</Text>
        </TouchableOpacity>
      </View>
      <View style={styles.productInfo}>
        <Text style={styles.productTitle} numberOfLines={2}>
          {item.title}
        </Text>
        <Text style={styles.productPrice}>{formatPrice(item.price)}</Text>
        <View style={styles.productMeta}>
          <Text style={styles.storeName} numberOfLines={1}>
            🏪 {(item as any).store?.name ?? 'Toko'}
          </Text>
          {item.rating > 0 && (
            <View style={styles.ratingWrap}>
              <Text style={styles.ratingStar}>★</Text>
              <Text style={styles.ratingText}>{item.rating.toFixed(1)}</Text>
            </View>
          )}
        </View>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={colors.primaryDark} />

      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerTop}>
          <View style={styles.headerLeft}>
            <View style={styles.logoWrap}>
              <Text style={styles.logoEmoji}>👗</Text>
            </View>
            <View>
              <Text style={styles.greeting}>Halo, {firstName}! 👋</Text>
              <Text style={styles.headerTitle}>PreLove</Text>
            </View>
          </View>
          <View style={styles.headerRight}>
            <TouchableOpacity
              style={styles.iconBtn}
              onPress={() => navigation.navigate('ChatList')}
            >
              <Text style={styles.headerIconText}>💬</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.iconBtn}
              onPress={() => navigation.navigate('Notifications')}
            >
              <Text style={styles.headerIconText}>🔔</Text>
              <View style={styles.notifDot} />
            </TouchableOpacity>
          </View>
        </View>

        {/* Search Bar */}
        <TouchableOpacity
          style={styles.searchBar}
          onPress={() => navigation.navigate('Search')}
          activeOpacity={0.85}
        >
          <Text style={styles.searchIconText}>🔍</Text>
          <Text style={styles.searchPlaceholder}>Cari baju, HP, buku...</Text>
          <View style={styles.searchCamera}>
            <Text style={{ fontSize: 16 }}>📷</Text>
          </View>
        </TouchableOpacity>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={colors.primary}
            colors={[colors.primary]}
          />
        }
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { y: scrollY } } }],
          { useNativeDriver: false }
        )}
      >
        {/* Banner Carousel */}
        <View style={styles.bannerContainer}>
          <ScrollView
            ref={bannerRef}
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            onMomentumScrollEnd={(e) => {
              const idx = Math.round(e.nativeEvent.contentOffset.x / (width - spacing.base * 2));
              setBannerIndex(idx);
            }}
          >
            {BANNERS.map((b) => (
              <TouchableOpacity
                key={b.id}
                style={[styles.banner, { width: width - spacing.base * 2, backgroundColor: b.gradientFrom }]}
                activeOpacity={0.9}
              >
                <View style={styles.bannerContent}>
                  <View style={styles.bannerTextWrap}>
                    <View style={styles.bannerTag}>
                      <Text style={styles.bannerTagText}>{b.tag}</Text>
                    </View>
                    <Text style={styles.bannerTitle}>{b.title}</Text>
                    <Text style={styles.bannerSubtitle}>{b.subtitle}</Text>
                    <View style={styles.bannerBtn}>
                      <Text style={styles.bannerBtnText}>Belanja Sekarang →</Text>
                    </View>
                  </View>
                  <View style={styles.bannerEmojiWrap}>
                    <Text style={styles.bannerEmoji}>{b.emoji}</Text>
                  </View>
                </View>
                {/* decorative circles */}
                <View style={styles.bannerCircle1} />
                <View style={styles.bannerCircle2} />
              </TouchableOpacity>
            ))}
          </ScrollView>
          {/* Dots */}
          <View style={styles.bannerDots}>
            {BANNERS.map((_, idx) => (
              <View
                key={idx}
                style={[styles.dot, idx === bannerIndex && styles.dotActive]}
              />
            ))}
          </View>
        </View>

        {/* Quick Category Icons */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Kategori</Text>
            <TouchableOpacity onPress={() => navigation.navigate('Search')}>
              <Text style={styles.seeAll}>Lihat Semua →</Text>
            </TouchableOpacity>
          </View>
          <View style={styles.categoryGrid}>
            {FLASH_CATEGORIES.map((cat, idx) => (
              <TouchableOpacity
                key={idx}
                style={styles.categoryItem}
                onPress={() => navigation.navigate('Search')}
                activeOpacity={0.8}
              >
                <View style={[styles.categoryIcon, { backgroundColor: cat.color }]}>
                  <Text style={styles.categoryEmoji}>{cat.emoji}</Text>
                </View>
                <Text style={styles.categoryLabel}>{cat.label}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Category Filter Chips */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.chipsContainer}
        >
          <TouchableOpacity
            style={[styles.chip, !selectedCategory && styles.chipActive]}
            onPress={() => setSelectedCategory(null)}
          >
            <Text style={[styles.chipText, !selectedCategory && styles.chipTextActive]}>
              🛍️ Semua
            </Text>
          </TouchableOpacity>
          {categories.map((cat) => (
            <TouchableOpacity
              key={cat.id}
              style={[styles.chip, selectedCategory === cat.id && styles.chipActive]}
              onPress={() => setSelectedCategory(cat.id === selectedCategory ? null : cat.id)}
            >
              <Text style={[styles.chipText, selectedCategory === cat.id && styles.chipTextActive]}>
                {CATEGORY_ICONS[cat.name] ?? '📦'} {cat.name}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Products Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <View>
              <Text style={styles.sectionTitle}>Produk Terbaru</Text>
              <Text style={styles.sectionSubtitle}>{products.length} item tersedia</Text>
            </View>
          </View>

          {isLoading ? (
            <View style={styles.productsGrid}>
              {[1, 2, 3, 4].map((i) => (
                <View key={i} style={styles.skeletonCard}>
                  <View style={styles.skeletonImage} />
                  <View style={styles.skeletonLine} />
                  <View style={[styles.skeletonLine, { width: '60%' }]} />
                </View>
              ))}
            </View>
          ) : products.length === 0 ? (
            <View style={styles.emptyState}>
              <Text style={styles.emptyEmoji}>🔍</Text>
              <Text style={styles.emptyTitle}>Belum ada produk</Text>
              <Text style={styles.emptySubtitle}>Coba kategori lain yuk!</Text>
            </View>
          ) : (
            <View style={styles.productsGrid}>
              {products.map((item) => (
                <View key={item.id}>{renderProduct({ item })}</View>
              ))}
            </View>
          )}
        </View>

        <View style={{ height: spacing['3xl'] }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },

  // Header
  header: {
    backgroundColor: colors.primary,
    paddingTop: 48,
    paddingBottom: spacing.md,
    paddingHorizontal: spacing.base,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  headerLeft: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  logoWrap: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoEmoji: { fontSize: 22 },
  greeting: { fontSize: fontSizes.xs, color: 'rgba(255,255,255,0.75)', fontWeight: fontWeights.medium },
  headerTitle: { fontSize: fontSizes.xl, fontWeight: fontWeights.black, color: colors.white, letterSpacing: 0.5 },
  headerRight: { flexDirection: 'row', gap: spacing.sm },
  iconBtn: {
    width: 40,
    height: 40,
    borderRadius: borderRadius.lg,
    backgroundColor: 'rgba(255,255,255,0.18)',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  headerIconText: { fontSize: 18 },
  notifDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.accent,
    position: 'absolute',
    top: 8,
    right: 8,
    borderWidth: 1.5,
    borderColor: colors.primary,
  },

  // Search
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.white,
    borderRadius: borderRadius.full,
    paddingHorizontal: spacing.md,
    height: 46,
    gap: spacing.sm,
  },
  searchIconText: { fontSize: 16 },
  searchPlaceholder: { flex: 1, color: colors.gray400, fontSize: fontSizes.base },
  searchCamera: {
    width: 32,
    height: 32,
    borderRadius: borderRadius.md,
    backgroundColor: colors.primarySurface,
    alignItems: 'center',
    justifyContent: 'center',
  },

  // Banner
  bannerContainer: {
    marginTop: spacing.base,
    paddingHorizontal: spacing.base,
  },
  banner: {
    borderRadius: borderRadius['2xl'],
    padding: spacing.lg,
    height: 150,
    overflow: 'hidden',
    position: 'relative',
  },
  bannerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    zIndex: 2,
  },
  bannerTextWrap: { flex: 1 },
  bannerTag: {
    backgroundColor: 'rgba(255,255,255,0.25)',
    borderRadius: borderRadius.full,
    paddingHorizontal: 10,
    paddingVertical: 3,
    alignSelf: 'flex-start',
    marginBottom: 6,
  },
  bannerTagText: { color: colors.white, fontSize: fontSizes.xs, fontWeight: fontWeights.bold },
  bannerTitle: { fontSize: fontSizes.xl, fontWeight: fontWeights.black, color: colors.white, marginBottom: 4 },
  bannerSubtitle: { fontSize: fontSizes.sm, color: 'rgba(255,255,255,0.8)', marginBottom: 10 },
  bannerBtn: {
    backgroundColor: colors.white,
    borderRadius: borderRadius.full,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    alignSelf: 'flex-start',
  },
  bannerBtnText: { color: colors.primary, fontSize: fontSizes.xs, fontWeight: fontWeights.bold },
  bannerEmojiWrap: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(255,255,255,0.15)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  bannerEmoji: { fontSize: 44 },
  bannerCircle1: {
    position: 'absolute',
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: 'rgba(255,255,255,0.07)',
    bottom: -30,
    right: -20,
  },
  bannerCircle2: {
    position: 'absolute',
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(255,255,255,0.07)',
    top: -20,
    left: '50%',
  },
  bannerDots: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: spacing.sm,
    gap: spacing.xs,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: colors.gray300,
  },
  dotActive: {
    width: 20,
    backgroundColor: colors.primary,
  },

  // Section
  section: { paddingHorizontal: spacing.base, marginTop: spacing.lg },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    marginBottom: spacing.md,
  },
  sectionTitle: { fontSize: fontSizes.lg, fontWeight: fontWeights.bold, color: colors.textPrimary },
  sectionSubtitle: { fontSize: fontSizes.xs, color: colors.textSecondary, marginTop: 2 },
  seeAll: { fontSize: fontSizes.sm, color: colors.primary, fontWeight: fontWeights.semibold },

  // Category Grid
  categoryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 0,
  },
  categoryItem: {
    width: '25%',
    alignItems: 'center',
    paddingVertical: spacing.sm,
  },
  categoryIcon: {
    width: 56,
    height: 56,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.xs,
  },
  categoryEmoji: { fontSize: 26 },
  categoryLabel: {
    fontSize: fontSizes.xs,
    color: colors.textSecondary,
    fontWeight: fontWeights.medium,
    textAlign: 'center',
  },

  // Chips
  chipsContainer: {
    paddingHorizontal: spacing.base,
    paddingVertical: spacing.sm,
    gap: spacing.sm,
  },
  chip: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.full,
    backgroundColor: colors.white,
    borderWidth: 1.5,
    borderColor: colors.border,
    ...shadows.sm,
  },
  chipActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  chipText: { fontSize: fontSizes.sm, color: colors.textSecondary, fontWeight: fontWeights.medium },
  chipTextActive: { color: colors.white, fontWeight: fontWeights.bold },

  // Products Grid
  productsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  productCard: {
    width: CARD_WIDTH,
    backgroundColor: colors.white,
    borderRadius: borderRadius.xl,
    overflow: 'hidden',
    ...shadows.card,
  },
  productImageWrap: { position: 'relative' },
  productImage: { width: '100%', height: CARD_WIDTH, resizeMode: 'cover' },
  productImagePlaceholder: {
    width: '100%',
    height: CARD_WIDTH,
    backgroundColor: colors.primarySurface2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  placeholderEmoji: { fontSize: 40 },
  conditionBadge: {
    position: 'absolute',
    top: spacing.xs,
    left: spacing.xs,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: borderRadius.full,
  },
  conditionText: { fontSize: fontSizes.xs, fontWeight: fontWeights.bold, color: colors.white },
  wishlistBtn: {
    position: 'absolute',
    top: spacing.xs,
    right: spacing.xs,
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: 'rgba(255,255,255,0.9)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  wishlistIcon: { fontSize: 16, color: colors.gray400 },
  productInfo: { padding: spacing.sm },
  productTitle: {
    fontSize: fontSizes.sm,
    color: colors.textPrimary,
    fontWeight: fontWeights.medium,
    lineHeight: 18,
    marginBottom: 4,
  },
  productPrice: {
    fontSize: fontSizes.md,
    color: colors.primary,
    fontWeight: fontWeights.extrabold,
    marginBottom: 4,
  },
  productMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  storeName: { fontSize: fontSizes.xs, color: colors.textSecondary, flex: 1 },
  ratingWrap: { flexDirection: 'row', alignItems: 'center', gap: 2 },
  ratingStar: { fontSize: fontSizes.xs, color: colors.accent },
  ratingText: { fontSize: fontSizes.xs, color: colors.textSecondary, fontWeight: fontWeights.semibold },

  // Skeleton
  skeletonCard: {
    width: CARD_WIDTH,
    backgroundColor: colors.white,
    borderRadius: borderRadius.xl,
    overflow: 'hidden',
    padding: spacing.sm,
  },
  skeletonImage: {
    width: '100%',
    height: CARD_WIDTH,
    backgroundColor: colors.gray200,
    borderRadius: borderRadius.lg,
    marginBottom: spacing.sm,
  },
  skeletonLine: {
    height: 12,
    backgroundColor: colors.gray200,
    borderRadius: borderRadius.sm,
    marginBottom: spacing.xs,
    width: '80%',
  },

  // Empty
  emptyState: { alignItems: 'center', paddingVertical: spacing['3xl'] },
  emptyEmoji: { fontSize: 56, marginBottom: spacing.md },
  emptyTitle: { fontSize: fontSizes.lg, fontWeight: fontWeights.bold, color: colors.textPrimary },
  emptySubtitle: { fontSize: fontSizes.base, color: colors.textSecondary, marginTop: spacing.xs },
});
