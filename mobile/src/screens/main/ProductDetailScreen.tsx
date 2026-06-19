import React, { useEffect, useState } from 'react';
import {
  View, Text, ScrollView, StyleSheet, TouchableOpacity,
  Image, Dimensions, ActivityIndicator, Alert,
} from 'react-native';
import { supabase } from '../../lib/supabase';
import { useAuthStore } from '../../stores/authStore';
import { useCartStore } from '../../stores/cartStore';
import { Product, Review } from '../../types/database';
import { colors, spacing, fontSizes, fontWeights, borderRadius, shadows } from '../../constants/theme';
import { formatPrice, formatRelativeTime } from '../../utils/format';

const { width } = Dimensions.get('window');

const CONDITION_LABEL: Record<string, string> = {
  new: '🌟 Baru', like_new: '✨ Seperti Baru', good: '👍 Bagus', fair: '🔆 Cukup Baik',
};
const CONDITION_COLOR: Record<string, string> = {
  new: colors.success, like_new: colors.info, good: colors.primary, fair: colors.warning,
};

export default function ProductDetailScreen({ route, navigation }: any) {
  const { productId } = route.params;
  const { user } = useAuthStore();
  const { addToCart } = useCartStore();

  const [product, setProduct] = useState<Product | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeImg, setActiveImg] = useState(0);
  const [inWishlist, setInWishlist] = useState(false);
  const [addingCart, setAddingCart] = useState(false);

  useEffect(() => {
    fetchProduct();
    if (user) checkWishlist();
    // Tambah view count
    supabase.rpc('increment_view', { product_id: productId }).catch(() => {});
  }, [productId]);

  const fetchProduct = async () => {
    const { data } = await supabase
      .from('products')
      .select(`*, store:stores(*, owner:profiles(*)), images:product_images(*), category:categories(*)`)
      .eq('id', productId)
      .single();

    if (data) {
      setProduct(data as Product);
      const imgs = (data as any).images ?? [];
      const primaryIdx = imgs.findIndex((i: any) => i.is_primary);
      setActiveImg(primaryIdx >= 0 ? primaryIdx : 0);
      fetchReviews();
    }
    setIsLoading(false);
  };

  const fetchReviews = async () => {
    const { data } = await supabase
      .from('reviews')
      .select('*, reviewer:profiles(full_name, avatar_url)')
      .eq('product_id', productId)
      .order('created_at', { ascending: false })
      .limit(5);
    if (data) setReviews(data as Review[]);
  };

  const checkWishlist = async () => {
    const { data } = await supabase
      .from('wishlists')
      .select('id')
      .eq('user_id', user!.id)
      .eq('product_id', productId)
      .maybeSingle();
    setInWishlist(!!data);
  };

  const toggleWishlist = async () => {
    if (!user) { navigation.navigate('Login'); return; }
    if (inWishlist) {
      await supabase.from('wishlists').delete().eq('user_id', user.id).eq('product_id', productId);
    } else {
      await supabase.from('wishlists').insert({ user_id: user.id, product_id: productId });
    }
    setInWishlist(!inWishlist);
  };

  const handleAddToCart = async () => {
    if (!user) { navigation.navigate('Login'); return; }
    setAddingCart(true);
    const { error } = await addToCart(user.id, productId);
    setAddingCart(false);
    if (error) {
      Alert.alert('Gagal', error);
    } else {
      Alert.alert('Berhasil! 🛒', 'Produk ditambahkan ke keranjang');
    }
  };

  const handleChat = () => {
    if (!user) { navigation.navigate('Login'); return; }
    navigation.navigate('Chat', { storeId: (product as any)?.store?.id, productId });
  };

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  if (!product) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.notFoundText}>Produk tidak ditemukan 😢</Text>
      </View>
    );
  }

  const images = (product as any).images ?? [];
  const store = (product as any).store;
  const discount = product.original_price
    ? Math.round(((product.original_price - product.price) / product.original_price) * 100)
    : 0;

  return (
    <View style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Image Carousel */}
        <View style={styles.imageContainer}>
          <ScrollView
            horizontal pagingEnabled showsHorizontalScrollIndicator={false}
            onMomentumScrollEnd={(e) => {
              setActiveImg(Math.round(e.nativeEvent.contentOffset.x / width));
            }}
          >
            {images.length > 0 ? images.map((img: any, idx: number) => (
              <Image key={img.id} source={{ uri: img.image_url }}
                style={styles.productImage} resizeMode="cover" />
            )) : (
              <View style={styles.placeholderImage}>
                <Text style={{ fontSize: 64 }}>📦</Text>
              </View>
            )}
          </ScrollView>

          {/* Dots Indicator */}
          {images.length > 1 && (
            <View style={styles.dots}>
              {images.map((_: any, i: number) => (
                <View key={i} style={[styles.dot, i === activeImg && styles.dotActive]} />
              ))}
            </View>
          )}

          {/* Back & Wishlist */}
          <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
            <Text style={styles.backBtnText}>←</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.wishlistBtn} onPress={toggleWishlist}>
            <Text style={styles.wishlistIcon}>{inWishlist ? '❤️' : '🤍'}</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.content}>
          {/* Price & Title */}
          <View style={styles.priceRow}>
            <Text style={styles.price}>{formatPrice(product.price)}</Text>
            {discount > 0 && (
              <View style={styles.discountBadge}>
                <Text style={styles.discountText}>{discount}% OFF</Text>
              </View>
            )}
          </View>
          {product.original_price && (
            <Text style={styles.originalPrice}>{formatPrice(product.original_price)}</Text>
          )}
          <Text style={styles.title}>{product.title}</Text>

          {/* Badges */}
          <View style={styles.badges}>
            <View style={[styles.badge, { backgroundColor: CONDITION_COLOR[product.condition] + '20' }]}>
              <Text style={[styles.badgeText, { color: CONDITION_COLOR[product.condition] }]}>
                {CONDITION_LABEL[product.condition]}
              </Text>
            </View>
            {(product as any).category && (
              <View style={styles.badge}>
                <Text style={styles.badgeText}>📁 {(product as any).category.name}</Text>
              </View>
            )}
            <View style={styles.badge}>
              <Text style={styles.badgeText}>📦 Stok: {product.stock}</Text>
            </View>
          </View>

          {/* Rating */}
          {product.rating > 0 && (
            <View style={styles.ratingRow}>
              <Text style={styles.ratingStars}>⭐ {product.rating.toFixed(1)}</Text>
              <Text style={styles.ratingCount}>({product.total_reviews} ulasan)</Text>
              <Text style={styles.viewCount}>👁️ {product.view_count} dilihat</Text>
            </View>
          )}

          <View style={styles.divider} />

          {/* Description */}
          <Text style={styles.sectionTitle}>Deskripsi Produk</Text>
          <Text style={styles.description}>{product.description ?? 'Tidak ada deskripsi.'}</Text>

          <View style={styles.divider} />

          {/* Store Info */}
          {store && (
            <TouchableOpacity
              style={styles.storeCard}
              onPress={() => navigation.navigate('StoreDetail', { storeId: store.id })}
            >
              <View style={styles.storeAvatar}>
                {store.logo_url ? (
                  <Image source={{ uri: store.logo_url }} style={styles.storeAvatarImg} />
                ) : (
                  <Text style={{ fontSize: 28 }}>🏪</Text>
                )}
              </View>
              <View style={styles.storeInfo}>
                <Text style={styles.storeName}>{store.name}</Text>
                <Text style={styles.storeLocation}>
                  📍 {store.city ?? 'Tidak diketahui'}
                </Text>
                {store.rating > 0 && (
                  <Text style={styles.storeRating}>⭐ {store.rating.toFixed(1)} · {store.total_sales} terjual</Text>
                )}
              </View>
              <Text style={styles.storeArrow}>›</Text>
            </TouchableOpacity>
          )}

          <View style={styles.divider} />

          {/* Reviews */}
          <View style={styles.reviewsHeader}>
            <Text style={styles.sectionTitle}>Ulasan</Text>
            {reviews.length > 0 && (
              <TouchableOpacity onPress={() => navigation.navigate('Reviews', { productId })}>
                <Text style={styles.seeAll}>Lihat semua →</Text>
              </TouchableOpacity>
            )}
          </View>

          {reviews.length === 0 ? (
            <Text style={styles.noReviews}>Belum ada ulasan</Text>
          ) : (
            reviews.map((review) => (
              <View key={review.id} style={styles.reviewCard}>
                <View style={styles.reviewHeader}>
                  <Text style={styles.reviewName}>{(review as any).reviewer?.full_name ?? 'Anonim'}</Text>
                  <Text style={styles.reviewDate}>{formatRelativeTime(review.created_at)}</Text>
                </View>
                <Text style={styles.reviewStars}>{'⭐'.repeat(review.rating)}</Text>
                {review.comment && <Text style={styles.reviewComment}>{review.comment}</Text>}
              </View>
            ))
          )}

          <View style={{ height: 100 }} />
        </View>
      </ScrollView>

      {/* Bottom Action Bar */}
      <View style={styles.bottomBar}>
        <TouchableOpacity style={styles.chatBtn} onPress={handleChat}>
          <Text style={styles.chatBtnText}>💬 Chat</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.cartBtn, addingCart && styles.btnDisabled]}
          onPress={handleAddToCart}
          disabled={addingCart || product.is_sold || product.stock === 0}
        >
          {addingCart ? (
            <ActivityIndicator color={colors.white} size="small" />
          ) : (
            <Text style={styles.cartBtnText}>
              {product.is_sold || product.stock === 0 ? 'Habis Terjual' : '🛒 Keranjang'}
            </Text>
          )}
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.buyBtn, (product.is_sold || product.stock === 0) && styles.btnDisabled]}
          disabled={product.is_sold || product.stock === 0}
          onPress={() => navigation.navigate('Checkout', { productIds: [productId] })}
        >
          <Text style={styles.buyBtnText}>Beli Sekarang</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  loadingContainer: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  notFoundText: { fontSize: fontSizes.lg, color: colors.textSecondary },
  imageContainer: { position: 'relative', height: width },
  productImage: { width, height: width },
  placeholderImage: { width, height: width, backgroundColor: colors.gray100, alignItems: 'center', justifyContent: 'center' },
  dots: { position: 'absolute', bottom: spacing.md, flexDirection: 'row', alignSelf: 'center', gap: 6 },
  dot: { width: 6, height: 6, borderRadius: 3, backgroundColor: colors.white + '80' },
  dotActive: { width: 18, backgroundColor: colors.white },
  backBtn: {
    position: 'absolute', top: spacing['2xl'], left: spacing.base,
    width: 40, height: 40, borderRadius: 20, backgroundColor: colors.white + 'CC',
    alignItems: 'center', justifyContent: 'center',
  },
  backBtnText: { fontSize: 20, color: colors.textPrimary },
  wishlistBtn: {
    position: 'absolute', top: spacing['2xl'], right: spacing.base,
    width: 40, height: 40, borderRadius: 20, backgroundColor: colors.white + 'CC',
    alignItems: 'center', justifyContent: 'center',
  },
  wishlistIcon: { fontSize: 22 },
  content: { padding: spacing.base },
  priceRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  price: { fontSize: fontSizes['3xl'], fontWeight: fontWeights.extrabold, color: colors.primary },
  discountBadge: { backgroundColor: colors.error, borderRadius: borderRadius.sm, paddingHorizontal: spacing.sm, paddingVertical: 2 },
  discountText: { color: colors.white, fontSize: fontSizes.xs, fontWeight: fontWeights.bold },
  originalPrice: { fontSize: fontSizes.sm, color: colors.textSecondary, textDecorationLine: 'line-through', marginTop: 2 },
  title: { fontSize: fontSizes.xl, fontWeight: fontWeights.bold, color: colors.textPrimary, marginTop: spacing.sm },
  badges: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm, marginTop: spacing.md },
  badge: { backgroundColor: colors.gray100, borderRadius: borderRadius.full, paddingHorizontal: spacing.sm, paddingVertical: 4 },
  badgeText: { fontSize: fontSizes.xs, color: colors.textSecondary, fontWeight: fontWeights.medium },
  ratingRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, marginTop: spacing.md },
  ratingStars: { fontSize: fontSizes.base, fontWeight: fontWeights.semibold, color: colors.accent },
  ratingCount: { fontSize: fontSizes.sm, color: colors.textSecondary },
  viewCount: { fontSize: fontSizes.sm, color: colors.textSecondary, marginLeft: 'auto' },
  divider: { height: 1, backgroundColor: colors.border, marginVertical: spacing.base },
  sectionTitle: { fontSize: fontSizes.md, fontWeight: fontWeights.bold, color: colors.textPrimary, marginBottom: spacing.sm },
  description: { fontSize: fontSizes.base, color: colors.textSecondary, lineHeight: 22 },
  storeCard: {
    flexDirection: 'row', alignItems: 'center', gap: spacing.md,
    backgroundColor: colors.white, borderRadius: borderRadius.xl, padding: spacing.md,
    ...shadows.sm,
  },
  storeAvatar: { width: 56, height: 56, borderRadius: 28, backgroundColor: colors.primarySurface, alignItems: 'center', justifyContent: 'center', overflow: 'hidden' },
  storeAvatarImg: { width: 56, height: 56 },
  storeInfo: { flex: 1 },
  storeName: { fontSize: fontSizes.base, fontWeight: fontWeights.bold, color: colors.textPrimary },
  storeLocation: { fontSize: fontSizes.sm, color: colors.textSecondary, marginTop: 2 },
  storeRating: { fontSize: fontSizes.sm, color: colors.accent, marginTop: 2 },
  storeArrow: { fontSize: 24, color: colors.gray400 },
  reviewsHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: spacing.sm },
  seeAll: { fontSize: fontSizes.sm, color: colors.primary, fontWeight: fontWeights.semibold },
  noReviews: { color: colors.textSecondary, fontSize: fontSizes.base, textAlign: 'center', paddingVertical: spacing.lg },
  reviewCard: {
    backgroundColor: colors.white, borderRadius: borderRadius.lg, padding: spacing.md,
    marginBottom: spacing.sm, ...shadows.sm,
  },
  reviewHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4 },
  reviewName: { fontSize: fontSizes.sm, fontWeight: fontWeights.semibold, color: colors.textPrimary },
  reviewDate: { fontSize: fontSizes.xs, color: colors.textSecondary },
  reviewStars: { fontSize: fontSizes.sm, marginBottom: 4 },
  reviewComment: { fontSize: fontSizes.sm, color: colors.textSecondary, lineHeight: 20 },
  bottomBar: {
    position: 'absolute', bottom: 0, left: 0, right: 0,
    flexDirection: 'row', gap: spacing.sm, padding: spacing.md,
    backgroundColor: colors.white, borderTopWidth: 1, borderTopColor: colors.border,
    paddingBottom: spacing.xl,
  },
  chatBtn: {
    flex: 0.8, borderWidth: 1.5, borderColor: colors.primary, borderRadius: borderRadius.lg,
    padding: spacing.md, alignItems: 'center',
  },
  chatBtnText: { color: colors.primary, fontWeight: fontWeights.bold, fontSize: fontSizes.sm },
  cartBtn: {
    flex: 1, backgroundColor: colors.secondarySurface, borderRadius: borderRadius.lg,
    padding: spacing.md, alignItems: 'center',
  },
  cartBtnText: { color: colors.secondary, fontWeight: fontWeights.bold, fontSize: fontSizes.sm },
  buyBtn: {
    flex: 1.2, backgroundColor: colors.primary, borderRadius: borderRadius.lg,
    padding: spacing.md, alignItems: 'center',
    ...shadows.lg,
  },
  buyBtnText: { color: colors.white, fontWeight: fontWeights.bold, fontSize: fontSizes.sm },
  btnDisabled: { opacity: 0.5 },
});
