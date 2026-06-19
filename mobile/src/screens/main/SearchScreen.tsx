import React, { useEffect, useState, useCallback } from 'react';
import {
  View, Text, TextInput, ScrollView, StyleSheet,
  TouchableOpacity, Image, Dimensions, StatusBar,
} from 'react-native';
import { supabase } from '../../lib/supabase';
import { Product } from '../../types/database';
import { colors, spacing, fontSizes, fontWeights, borderRadius, shadows } from '../../constants/theme';
import { formatPrice } from '../../utils/format';

const { width } = Dimensions.get('window');
const CARD_WIDTH = (width - spacing.base * 2 - spacing.sm) / 2;

const CONDITIONS = [
  { label: 'Semua', value: null, icon: '✨' },
  { label: 'Baru', value: 'new', icon: '🌟' },
  { label: 'Seperti Baru', value: 'like_new', icon: '💎' },
  { label: 'Bagus', value: 'good', icon: '👍' },
  { label: 'Cukup Baik', value: 'fair', icon: '🔆' },
];

const SORT_OPTIONS = [
  { label: 'Terbaru', value: 'created_at', icon: '🕐' },
  { label: 'Termurah', value: 'price_asc', icon: '⬇️' },
  { label: 'Termahal', value: 'price_desc', icon: '⬆️' },
];

const TRENDING = ['Kemeja', 'Tas kulit', 'iPhone', 'Buku kuliah', 'Sepatu sneaker', 'Jam tangan'];

export default function SearchScreen({ navigation }: any) {
  const [query, setQuery] = useState('');
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedCondition, setSelectedCondition] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState('created_at');
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');
  const [showFilter, setShowFilter] = useState(false);
  const [isFocused, setIsFocused] = useState(false);

  useEffect(() => {
    const timeout = setTimeout(() => {
      if (query.trim() || selectedCondition || minPrice || maxPrice) {
        search();
      }
    }, 400);
    return () => clearTimeout(timeout);
  }, [query, selectedCondition, sortBy, minPrice, maxPrice]);

  const search = async () => {
    setIsLoading(true);
    let q = supabase
      .from('products')
      .select('*, store:stores(name), images:product_images(*)')
      .eq('is_active', true);

    if (query.trim()) {
      q = q.ilike('title', `%${query.trim()}%`);
    }
    if (selectedCondition) q = q.eq('condition', selectedCondition);
    if (minPrice) q = q.gte('price', parseFloat(minPrice));
    if (maxPrice) q = q.lte('price', parseFloat(maxPrice));

    if (sortBy === 'price_asc') q = q.order('price', { ascending: true });
    else if (sortBy === 'price_desc') q = q.order('price', { ascending: false });
    else q = q.order('created_at', { ascending: false });

    const { data } = await q.limit(30);
    if (data) setProducts(data as Product[]);
    setIsLoading(false);
  };

  const primaryImage = (p: Product) =>
    (p as any).images?.find((i: any) => i.is_primary)?.image_url ?? (p as any).images?.[0]?.image_url;

  const conditionColor: Record<string, string> = {
    new: colors.success,
    like_new: '#8B5CF6',
    good: colors.primary,
    fair: colors.warning,
  };
  const conditionLabel: Record<string, string> = {
    new: 'Baru',
    like_new: 'Seperti Baru',
    good: 'Bagus',
    fair: 'Cukup Baik',
  };

  const showTrending = !query && !selectedCondition && products.length === 0;
  const hasActiveFilter = selectedCondition || minPrice || maxPrice || sortBy !== 'created_at';

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={colors.primaryDark} />

      {/* Search Header */}
      <View style={styles.header}>
        <View style={styles.headerRow}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
            <Text style={styles.backIcon}>←</Text>
          </TouchableOpacity>
          <View style={[styles.searchBar, isFocused && styles.searchBarFocused]}>
            <Text style={styles.searchIconText}>🔍</Text>
            <TextInput
              style={styles.searchInput}
              placeholder="Cari produk preloved..."
              placeholderTextColor="rgba(255,255,255,0.6)"
              value={query}
              onChangeText={setQuery}
              onFocus={() => setIsFocused(true)}
              onBlur={() => setIsFocused(false)}
              autoFocus
              returnKeyType="search"
              onSubmitEditing={search}
            />
            {query ? (
              <TouchableOpacity onPress={() => setQuery('')}>
                <Text style={styles.clearIcon}>✕</Text>
              </TouchableOpacity>
            ) : null}
          </View>
          <TouchableOpacity
            style={[styles.filterIconBtn, (showFilter || hasActiveFilter) && styles.filterIconBtnActive]}
            onPress={() => setShowFilter(!showFilter)}
          >
            <Text style={styles.filterIconText}>⚙️</Text>
            {hasActiveFilter && <View style={styles.filterActiveDot} />}
          </TouchableOpacity>
        </View>
      </View>

      {/* Filter Panel */}
      {showFilter && (
        <View style={styles.filterPanel}>
          <Text style={styles.filterSectionTitle}>Kondisi Barang</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterScroll}>
            {CONDITIONS.map((c) => (
              <TouchableOpacity
                key={c.label}
                style={[styles.filterChip, selectedCondition === c.value && styles.filterChipActive]}
                onPress={() => setSelectedCondition(c.value)}
              >
                <Text style={styles.filterChipIcon}>{c.icon}</Text>
                <Text style={[styles.filterChipText, selectedCondition === c.value && styles.filterChipTextActive]}>
                  {c.label}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>

          <Text style={styles.filterSectionTitle}>Rentang Harga</Text>
          <View style={styles.priceRow}>
            <TextInput
              style={styles.priceInput}
              placeholder="Min (Rp)"
              placeholderTextColor={colors.gray400}
              value={minPrice}
              onChangeText={setMinPrice}
              keyboardType="numeric"
            />
            <View style={styles.priceSepWrap}>
              <Text style={styles.priceSep}>—</Text>
            </View>
            <TextInput
              style={styles.priceInput}
              placeholder="Max (Rp)"
              placeholderTextColor={colors.gray400}
              value={maxPrice}
              onChangeText={setMaxPrice}
              keyboardType="numeric"
            />
          </View>

          <Text style={styles.filterSectionTitle}>Urutkan</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterScroll}>
            {SORT_OPTIONS.map((s) => (
              <TouchableOpacity
                key={s.value}
                style={[styles.filterChip, sortBy === s.value && styles.filterChipActive]}
                onPress={() => setSortBy(s.value)}
              >
                <Text style={styles.filterChipIcon}>{s.icon}</Text>
                <Text style={[styles.filterChipText, sortBy === s.value && styles.filterChipTextActive]}>
                  {s.label}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      )}

      {/* Results Header */}
      {!showTrending && (
        <View style={styles.resultsBar}>
          <Text style={styles.resultsText}>
            {isLoading ? '🔎 Mencari...' : `${products.length} produk ditemukan`}
          </Text>
        </View>
      )}

      {showTrending ? (
        // Trending Section
        <ScrollView style={styles.trendingContainer} showsVerticalScrollIndicator={false}>
          <View style={styles.trendingSection}>
            <Text style={styles.trendingSectionTitle}>🔥 Trending Sekarang</Text>
            <View style={styles.trendingGrid}>
              {TRENDING.map((t, idx) => (
                <TouchableOpacity
                  key={idx}
                  style={styles.trendingChip}
                  onPress={() => setQuery(t)}
                >
                  <Text style={styles.trendingChipIcon}>🔍</Text>
                  <Text style={styles.trendingChipText}>{t}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
          <View style={styles.trendingSection}>
            <Text style={styles.trendingSectionTitle}>💡 Tips Mencari</Text>
            <View style={styles.tipsCard}>
              <Text style={styles.tipItem}>✅ Gunakan kata kunci spesifik</Text>
              <Text style={styles.tipItem}>✅ Filter kondisi untuk hasil terbaik</Text>
              <Text style={styles.tipItem}>✅ Urutkan harga dari termurah</Text>
            </View>
          </View>
        </ScrollView>
      ) : products.length === 0 && !isLoading ? (
        <View style={styles.emptyState}>
          <Text style={styles.emptyEmoji}>🔍</Text>
          <Text style={styles.emptyTitle}>Tidak ada hasil</Text>
          <Text style={styles.emptySubtitle}>Coba kata kunci lain atau ubah filter</Text>
          <TouchableOpacity
            style={styles.resetBtn}
            onPress={() => {
              setQuery('');
              setSelectedCondition(null);
              setMinPrice('');
              setMaxPrice('');
              setSortBy('created_at');
            }}
          >
            <Text style={styles.resetBtnText}>Reset Filter</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <ScrollView showsVerticalScrollIndicator={false}>
          <View style={styles.grid}>
            {products.map((item) => (
              <TouchableOpacity
                key={item.id}
                style={styles.card}
                onPress={() => navigation.navigate('ProductDetail', { productId: item.id })}
                activeOpacity={0.9}
              >
                {primaryImage(item) ? (
                  <Image source={{ uri: primaryImage(item) }} style={styles.cardImage} />
                ) : (
                  <View style={styles.cardImagePlaceholder}>
                    <Text style={{ fontSize: 36 }}>📦</Text>
                  </View>
                )}
                {/* condition badge */}
                {item.condition && (
                  <View style={[styles.cardBadge, { backgroundColor: conditionColor[item.condition] }]}>
                    <Text style={styles.cardBadgeText}>{conditionLabel[item.condition]}</Text>
                  </View>
                )}
                <TouchableOpacity style={styles.cardWishlist}>
                  <Text style={{ fontSize: 14, color: colors.gray400 }}>♡</Text>
                </TouchableOpacity>
                <View style={styles.cardInfo}>
                  <Text style={styles.cardTitle} numberOfLines={2}>{item.title}</Text>
                  <Text style={styles.cardPrice}>{formatPrice(item.price)}</Text>
                  <Text style={styles.cardStore} numberOfLines={1}>
                    🏪 {(item as any).store?.name}
                  </Text>
                </View>
              </TouchableOpacity>
            ))}
          </View>
          <View style={{ height: spacing['3xl'] }} />
        </ScrollView>
      )}
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
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  backBtn: {
    width: 38,
    height: 38,
    borderRadius: borderRadius.lg,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  backIcon: { fontSize: 20, color: colors.white, fontWeight: fontWeights.bold },
  searchBar: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: borderRadius.full,
    paddingHorizontal: spacing.md,
    height: 44,
    gap: spacing.sm,
    borderWidth: 1.5,
    borderColor: 'transparent',
  },
  searchBarFocused: {
    backgroundColor: 'rgba(255,255,255,0.25)',
    borderColor: 'rgba(255,255,255,0.5)',
  },
  searchIconText: { fontSize: 15 },
  searchInput: {
    flex: 1,
    fontSize: fontSizes.base,
    color: colors.white,
    fontWeight: fontWeights.medium,
  },
  clearIcon: { fontSize: 14, color: 'rgba(255,255,255,0.7)', padding: spacing.xs },
  filterIconBtn: {
    width: 44,
    height: 44,
    borderRadius: borderRadius.lg,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  filterIconBtnActive: {
    backgroundColor: 'rgba(255,255,255,0.35)',
  },
  filterIconText: { fontSize: 18 },
  filterActiveDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.accent,
    position: 'absolute',
    top: 8,
    right: 8,
  },

  // Filter Panel
  filterPanel: {
    backgroundColor: colors.white,
    paddingHorizontal: spacing.base,
    paddingBottom: spacing.base,
    borderBottomLeftRadius: 16,
    borderBottomRightRadius: 16,
    ...shadows.md,
  },
  filterSectionTitle: {
    fontSize: fontSizes.sm,
    fontWeight: fontWeights.bold,
    color: colors.textPrimary,
    marginTop: spacing.md,
    marginBottom: spacing.sm,
  },
  filterScroll: { marginBottom: spacing.xs },
  filterChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.full,
    borderWidth: 1.5,
    borderColor: colors.border,
    marginRight: spacing.sm,
    backgroundColor: colors.white,
    gap: spacing.xs,
  },
  filterChipActive: { backgroundColor: colors.primary, borderColor: colors.primary },
  filterChipIcon: { fontSize: 14 },
  filterChipText: { fontSize: fontSizes.sm, color: colors.textSecondary, fontWeight: fontWeights.medium },
  filterChipTextActive: { color: colors.white, fontWeight: fontWeights.bold },
  priceRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  priceInput: {
    flex: 1,
    borderWidth: 1.5,
    borderColor: colors.border,
    borderRadius: borderRadius.lg,
    padding: spacing.sm,
    fontSize: fontSizes.sm,
    color: colors.textPrimary,
    backgroundColor: colors.gray50,
  },
  priceSepWrap: { alignItems: 'center' },
  priceSep: { color: colors.gray400, fontSize: fontSizes.lg, fontWeight: fontWeights.bold },

  // Results
  resultsBar: {
    paddingHorizontal: spacing.base,
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    backgroundColor: colors.white,
  },
  resultsText: {
    fontSize: fontSizes.sm,
    color: colors.textSecondary,
    fontWeight: fontWeights.medium,
  },

  // Trending
  trendingContainer: { flex: 1 },
  trendingSection: {
    padding: spacing.base,
    marginBottom: spacing.sm,
  },
  trendingSectionTitle: {
    fontSize: fontSizes.lg,
    fontWeight: fontWeights.bold,
    color: colors.textPrimary,
    marginBottom: spacing.md,
  },
  trendingGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  trendingChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    backgroundColor: colors.white,
    borderRadius: borderRadius.full,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderWidth: 1.5,
    borderColor: colors.border,
    ...shadows.sm,
  },
  trendingChipIcon: { fontSize: 13 },
  trendingChipText: { fontSize: fontSizes.sm, color: colors.textSecondary, fontWeight: fontWeights.medium },
  tipsCard: {
    backgroundColor: colors.primarySurface2,
    borderRadius: borderRadius.xl,
    padding: spacing.base,
    gap: spacing.sm,
    borderWidth: 1,
    borderColor: colors.primarySurface,
  },
  tipItem: { fontSize: fontSizes.sm, color: colors.primary, fontWeight: fontWeights.medium },

  // Empty
  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing['5xl'],
    paddingHorizontal: spacing['2xl'],
  },
  emptyEmoji: { fontSize: 64, marginBottom: spacing.md },
  emptyTitle: { fontSize: fontSizes.xl, fontWeight: fontWeights.bold, color: colors.textPrimary, marginBottom: spacing.sm },
  emptySubtitle: { fontSize: fontSizes.base, color: colors.textSecondary, textAlign: 'center', marginBottom: spacing.xl },
  resetBtn: {
    backgroundColor: colors.primary,
    borderRadius: borderRadius.full,
    paddingHorizontal: spacing['2xl'],
    paddingVertical: spacing.md,
  },
  resetBtnText: { color: colors.white, fontWeight: fontWeights.bold, fontSize: fontSizes.base },

  // Product Grid
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    padding: spacing.base,
    gap: spacing.sm,
  },
  card: {
    width: CARD_WIDTH,
    backgroundColor: colors.white,
    borderRadius: borderRadius.xl,
    overflow: 'hidden',
    ...shadows.card,
    position: 'relative',
  },
  cardImage: { width: '100%', height: CARD_WIDTH, resizeMode: 'cover' },
  cardImagePlaceholder: {
    width: '100%',
    height: CARD_WIDTH,
    backgroundColor: colors.primarySurface2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardBadge: {
    position: 'absolute',
    top: spacing.xs,
    left: spacing.xs,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: borderRadius.full,
  },
  cardBadgeText: { fontSize: fontSizes.xs, fontWeight: fontWeights.bold, color: colors.white },
  cardWishlist: {
    position: 'absolute',
    top: spacing.xs,
    right: spacing.xs,
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: 'rgba(255,255,255,0.9)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardInfo: { padding: spacing.sm },
  cardTitle: {
    fontSize: fontSizes.sm,
    color: colors.textPrimary,
    fontWeight: fontWeights.medium,
    lineHeight: 18,
    marginBottom: 4,
  },
  cardPrice: {
    fontSize: fontSizes.md,
    color: colors.primary,
    fontWeight: fontWeights.extrabold,
    marginBottom: 4,
  },
  cardStore: { fontSize: fontSizes.xs, color: colors.textSecondary },
});
