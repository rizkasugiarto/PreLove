import React, { useEffect, useState } from 'react';
import {
  View, Text, ScrollView, StyleSheet, TouchableOpacity,
  TextInput, Image, Alert, ActivityIndicator, Switch,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { supabase } from '../../lib/supabase';
import { useAuthStore } from '../../stores/authStore';
import { Category } from '../../types/database';
import { colors, spacing, fontSizes, fontWeights, borderRadius, shadows } from '../../constants/theme';

const CONDITIONS = [
  { label: '🌟 Baru', value: 'new' },
  { label: '✨ Seperti Baru', value: 'like_new' },
  { label: '👍 Bagus', value: 'good' },
  { label: '🔆 Cukup Baik', value: 'fair' },
];

export default function AddProductScreen({ route, navigation }: any) {
  const { storeId, editProduct } = route.params ?? {};
  const { user } = useAuthStore();
  const isEdit = !!editProduct;

  const [title, setTitle] = useState(editProduct?.title ?? '');
  const [description, setDescription] = useState(editProduct?.description ?? '');
  const [price, setPrice] = useState(editProduct?.price?.toString() ?? '');
  const [originalPrice, setOriginalPrice] = useState(editProduct?.original_price?.toString() ?? '');
  const [condition, setCondition] = useState<string>(editProduct?.condition ?? 'good');
  const [stock, setStock] = useState(editProduct?.stock?.toString() ?? '1');
  const [weight, setWeight] = useState(editProduct?.weight_gram?.toString() ?? '500');
  const [categoryId, setCategoryId] = useState<string | null>(editProduct?.category_id ?? null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [images, setImages] = useState<{ uri: string; isNew: boolean; isExisting?: any }[]>(
    editProduct?.images?.map((i: any) => ({ uri: i.image_url, isNew: false, isExisting: i })) ?? []
  );
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    supabase.from('categories').select('*').order('sort_order').then(({ data }) => {
      if (data) setCategories(data);
    });
  }, []);

  const pickImages = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') return;
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsMultipleSelection: true,
      quality: 0.7,
      selectionLimit: 5 - images.length,
    });
    if (!result.canceled) {
      const newImgs = result.assets.map((a) => ({ uri: a.uri, isNew: true }));
      setImages((prev) => [...prev, ...newImgs].slice(0, 5));
    }
  };

  const removeImage = (idx: number) => setImages((prev) => prev.filter((_, i) => i !== idx));

  const uploadImage = async (uri: string, productId: string, isPrimary: boolean, order: number) => {
    const fileName = `products/${productId}/${Date.now()}_${order}.jpg`;
    const response = await fetch(uri);
    const blob = await response.blob();
    const arrayBuffer = await new Response(blob).arrayBuffer();
    await supabase.storage.from('prelove-images').upload(fileName, arrayBuffer, { contentType: 'image/jpeg' });
    const { data } = supabase.storage.from('prelove-images').getPublicUrl(fileName);
    return data.publicUrl;
  };

  const handleSubmit = async () => {
    if (!title.trim() || !price) {
      Alert.alert('Data Tidak Lengkap', 'Nama produk dan harga wajib diisi');
      return;
    }
    if (images.length === 0) {
      Alert.alert('Foto Diperlukan', 'Tambahkan minimal 1 foto produk');
      return;
    }
    setIsSubmitting(true);

    try {
      const productData = {
        store_id: storeId,
        title: title.trim(),
        description: description.trim() || null,
        price: parseFloat(price),
        original_price: originalPrice ? parseFloat(originalPrice) : null,
        condition,
        category_id: categoryId,
        stock: parseInt(stock) || 1,
        weight_gram: parseInt(weight) || 500,
      };

      let productId = editProduct?.id;

      if (isEdit) {
        await supabase.from('products').update(productData).eq('id', productId);
        // Hapus gambar lama yang dihapus
        const removedExisting = editProduct?.images?.filter(
          (i: any) => !images.find((img) => img.isExisting?.id === i.id)
        );
        if (removedExisting?.length > 0) {
          await supabase.from('product_images').delete().in('id', removedExisting.map((i: any) => i.id));
        }
      } else {
        const { data: prod, error } = await supabase.from('products').insert(productData).select().single();
        if (error) throw error;
        productId = prod.id;
      }

      // Upload gambar baru
      const newImages = images.filter((i) => i.isNew);
      for (let idx = 0; idx < newImages.length; idx++) {
        const imageUrl = await uploadImage(newImages[idx].uri, productId, idx === 0, idx);
        await supabase.from('product_images').insert({
          product_id: productId,
          image_url: imageUrl,
          is_primary: idx === 0 && !isEdit,
          sort_order: images.filter((i) => !i.isNew).length + idx,
        });
      }

      Alert.alert(
        isEdit ? 'Produk Diperbarui! ✅' : 'Produk Ditambahkan! 🎉',
        isEdit ? 'Perubahan berhasil disimpan' : 'Produkmu sudah tampil di marketplace!',
        [{ text: 'OK', onPress: () => navigation.goBack() }]
      );
    } catch (e: any) {
      Alert.alert('Gagal', e.message ?? 'Coba lagi ya!');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.backText}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{isEdit ? 'Edit Produk' : 'Tambah Produk'}</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>
        {/* Foto Produk */}
        <Section title="📸 Foto Produk (max 5)">
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.imageScroll}>
            {images.map((img, idx) => (
              <View key={idx} style={styles.imageWrap}>
                <Image source={{ uri: img.uri }} style={styles.imagePreview} />
                {idx === 0 && <View style={styles.primaryBadge}><Text style={styles.primaryBadgeText}>Utama</Text></View>}
                <TouchableOpacity style={styles.removeImgBtn} onPress={() => removeImage(idx)}>
                  <Text style={styles.removeImgText}>✕</Text>
                </TouchableOpacity>
              </View>
            ))}
            {images.length < 5 && (
              <TouchableOpacity style={styles.addImageBtn} onPress={pickImages}>
                <Text style={styles.addImageEmoji}>📷</Text>
                <Text style={styles.addImageText}>Tambah Foto</Text>
              </TouchableOpacity>
            )}
          </ScrollView>
        </Section>

        {/* Info Produk */}
        <Section title="📝 Info Produk">
          <InputField label="Nama Produk *" placeholder="Contoh: Jaket Denim Levi's Second" value={title} onChange={setTitle} />
          <InputField label="Deskripsi" placeholder="Ceritakan kondisi, ukuran, warna, dll." value={description} onChange={setDescription} multiline />
          <InputField label="Harga Jual *" placeholder="0" value={price} onChange={setPrice} keyboardType="numeric" prefix="Rp" />
          <InputField label="Harga Asli (opsional)" placeholder="Harga beli aslinya berapa?" value={originalPrice} onChange={setOriginalPrice} keyboardType="numeric" prefix="Rp" />
        </Section>

        {/* Kondisi */}
        <Section title="🔍 Kondisi Barang">
          <View style={styles.conditionGrid}>
            {CONDITIONS.map((c) => (
              <TouchableOpacity
                key={c.value}
                style={[styles.conditionChip, condition === c.value && styles.conditionChipActive]}
                onPress={() => setCondition(c.value)}
              >
                <Text style={[styles.conditionText, condition === c.value && styles.conditionTextActive]}>
                  {c.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </Section>

        {/* Kategori */}
        <Section title="📁 Kategori">
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {categories.map((cat) => (
              <TouchableOpacity
                key={cat.id}
                style={[styles.categoryChip, categoryId === cat.id && styles.categoryChipActive]}
                onPress={() => setCategoryId(cat.id === categoryId ? null : cat.id)}
              >
                <Text style={[styles.categoryText, categoryId === cat.id && styles.categoryTextActive]}>
                  {cat.name}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </Section>

        {/* Detail */}
        <Section title="📦 Detail Pengiriman">
          <InputField label="Stok" placeholder="1" value={stock} onChange={setStock} keyboardType="numeric" />
          <InputField label="Berat (gram)" placeholder="500" value={weight} onChange={setWeight} keyboardType="numeric" />
        </Section>

        <TouchableOpacity
          style={[styles.submitBtn, isSubmitting && styles.submitBtnDisabled]}
          onPress={handleSubmit}
          disabled={isSubmitting}
        >
          {isSubmitting ? (
            <ActivityIndicator color={colors.white} />
          ) : (
            <Text style={styles.submitBtnText}>
              {isEdit ? '💾 Simpan Perubahan' : '🚀 Publikasikan Produk'}
            </Text>
          )}
        </TouchableOpacity>
        <View style={{ height: spacing['3xl'] }} />
      </ScrollView>
    </View>
  );
}

function Section({ title, children }: any) {
  return (
    <View style={sStyles.container}>
      <Text style={sStyles.title}>{title}</Text>
      {children}
    </View>
  );
}

function InputField({ label, placeholder, value, onChange, multiline, keyboardType, prefix }: any) {
  return (
    <View style={fStyles.group}>
      <Text style={fStyles.label}>{label}</Text>
      <View style={[fStyles.inputWrap, multiline && fStyles.multilineWrap]}>
        {prefix && <Text style={fStyles.prefix}>{prefix}</Text>}
        <TextInput
          style={[fStyles.input, multiline && fStyles.multiline, prefix && fStyles.inputWithPrefix]}
          placeholder={placeholder}
          placeholderTextColor={colors.gray400}
          value={value}
          onChangeText={onChange}
          multiline={multiline}
          keyboardType={keyboardType ?? 'default'}
          numberOfLines={multiline ? 4 : 1}
        />
      </View>
    </View>
  );
}

const sStyles = StyleSheet.create({
  container: { backgroundColor: colors.white, marginBottom: spacing.sm, padding: spacing.base },
  title: { fontSize: fontSizes.base, fontWeight: fontWeights.bold, color: colors.textPrimary, marginBottom: spacing.md },
});
const fStyles = StyleSheet.create({
  group: { marginBottom: spacing.md },
  label: { fontSize: fontSizes.sm, fontWeight: fontWeights.semibold, color: colors.textPrimary, marginBottom: spacing.xs },
  inputWrap: { flexDirection: 'row', alignItems: 'center', borderWidth: 1.5, borderColor: colors.border, borderRadius: borderRadius.lg, backgroundColor: colors.gray50 },
  multilineWrap: { alignItems: 'flex-start' },
  prefix: { paddingLeft: spacing.md, color: colors.textSecondary, fontWeight: fontWeights.semibold },
  input: { flex: 1, padding: spacing.md, fontSize: fontSizes.base, color: colors.textPrimary },
  multiline: { minHeight: 80, textAlignVertical: 'top' },
  inputWithPrefix: { paddingLeft: spacing.xs },
});

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.backgroundDark },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: spacing.base, paddingTop: spacing['2xl'], backgroundColor: colors.white },
  backText: { fontSize: 24, color: colors.textPrimary },
  headerTitle: { fontSize: fontSizes.lg, fontWeight: fontWeights.bold, color: colors.textPrimary },
  scroll: { paddingTop: spacing.sm },
  imageScroll: { marginHorizontal: -spacing.xs },
  imageWrap: { position: 'relative', marginRight: spacing.sm },
  imagePreview: { width: 100, height: 100, borderRadius: borderRadius.lg, resizeMode: 'cover' },
  primaryBadge: { position: 'absolute', top: spacing.xs, left: spacing.xs, backgroundColor: colors.primary, borderRadius: borderRadius.sm, paddingHorizontal: spacing.xs, paddingVertical: 2 },
  primaryBadgeText: { color: colors.white, fontSize: fontSizes.xs, fontWeight: fontWeights.bold },
  removeImgBtn: { position: 'absolute', top: -6, right: -6, width: 22, height: 22, borderRadius: 11, backgroundColor: colors.error, alignItems: 'center', justifyContent: 'center' },
  removeImgText: { color: colors.white, fontSize: 10, fontWeight: fontWeights.bold },
  addImageBtn: { width: 100, height: 100, borderRadius: borderRadius.lg, borderWidth: 1.5, borderColor: colors.border, borderStyle: 'dashed', alignItems: 'center', justifyContent: 'center', backgroundColor: colors.gray50 },
  addImageEmoji: { fontSize: 28, marginBottom: 4 },
  addImageText: { fontSize: fontSizes.xs, color: colors.primary, fontWeight: fontWeights.semibold },
  conditionGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
  conditionChip: { paddingHorizontal: spacing.md, paddingVertical: spacing.sm, borderRadius: borderRadius.lg, borderWidth: 1.5, borderColor: colors.border, backgroundColor: colors.white },
  conditionChipActive: { backgroundColor: colors.primary, borderColor: colors.primary },
  conditionText: { fontSize: fontSizes.sm, color: colors.textSecondary, fontWeight: fontWeights.medium },
  conditionTextActive: { color: colors.white, fontWeight: fontWeights.bold },
  categoryChip: { paddingHorizontal: spacing.md, paddingVertical: spacing.sm, borderRadius: borderRadius.full, borderWidth: 1.5, borderColor: colors.border, marginRight: spacing.sm, backgroundColor: colors.white },
  categoryChipActive: { backgroundColor: colors.primary, borderColor: colors.primary },
  categoryText: { fontSize: fontSizes.sm, color: colors.textSecondary },
  categoryTextActive: { color: colors.white, fontWeight: fontWeights.bold },
  submitBtn: { margin: spacing.base, backgroundColor: colors.primary, borderRadius: borderRadius.xl, padding: spacing.base, alignItems: 'center', ...shadows.lg },
  submitBtnDisabled: { opacity: 0.6 },
  submitBtnText: { color: colors.white, fontWeight: fontWeights.extrabold, fontSize: fontSizes.lg },
});
