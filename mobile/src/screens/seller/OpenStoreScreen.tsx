import React, { useEffect, useState } from 'react';
import {
  View, Text, ScrollView, StyleSheet, TouchableOpacity,
  TextInput, Image, Alert, ActivityIndicator,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { supabase } from '../../lib/supabase';
import { useAuthStore } from '../../stores/authStore';
import { colors, spacing, fontSizes, fontWeights, borderRadius, shadows } from '../../constants/theme';
import { makeSlug } from '../../utils/format';

export default function OpenStoreScreen({ navigation }: any) {
  const { user, updateProfile } = useAuthStore();
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [address, setAddress] = useState('');
  const [city, setCity] = useState('');
  const [province, setProvince] = useState('');
  const [phone, setPhone] = useState('');
  const [logoUri, setLogoUri] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const pickLogo = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') return;
    const result = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ImagePicker.MediaTypeOptions.Images, quality: 0.7, aspect: [1, 1] });
    if (!result.canceled) setLogoUri(result.assets[0].uri);
  };

  const uploadLogo = async (uri: string): Promise<string | null> => {
    const fileName = `store_logos/${user!.id}_${Date.now()}.jpg`;
    const response = await fetch(uri);
    const blob = await response.blob();
    const arrayBuffer = await new Response(blob).arrayBuffer();
    const { error } = await supabase.storage.from('prelove-images').upload(fileName, arrayBuffer, { contentType: 'image/jpeg' });
    if (error) return null;
    const { data } = supabase.storage.from('prelove-images').getPublicUrl(fileName);
    return data.publicUrl;
  };

  const handleCreate = async () => {
    if (!name.trim() || !city.trim()) {
      Alert.alert('Lengkapi data', 'Nama toko dan kota wajib diisi');
      return;
    }
    setIsSubmitting(true);
    try {
      let logoUrl: string | null = null;
      if (logoUri) logoUrl = await uploadLogo(logoUri);

      const slug = makeSlug(name) + '-' + Date.now().toString(36);
      const { data: store, error } = await supabase
        .from('stores')
        .insert({
          owner_id: user!.id,
          name: name.trim(),
          slug,
          logo_url: logoUrl,
          description: description.trim(),
          address: address.trim(),
          city: city.trim(),
          province: province.trim(),
          phone: phone.trim(),
        })
        .select()
        .single();

      if (error) throw error;

      // Update role ke seller
      await updateProfile({ role: 'seller' });

      Alert.alert('Toko Berhasil Dibuat! 🎉', `Toko "${name}" sudah aktif. Mulai tambah produkmu!`, [
        { text: 'Tambah Produk', onPress: () => navigation.replace('MyStore', { storeId: store.id }) },
      ]);
    } catch (e: any) {
      Alert.alert('Gagal', e.message ?? 'Terjadi kesalahan');
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
        <Text style={styles.headerTitle}>Buka Toko</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>
        {/* Logo Upload */}
        <TouchableOpacity style={styles.logoUpload} onPress={pickLogo}>
          {logoUri ? (
            <Image source={{ uri: logoUri }} style={styles.logoPreview} />
          ) : (
            <View style={styles.logoPlaceholder}>
              <Text style={styles.logoEmoji}>🏪</Text>
              <Text style={styles.logoUploadText}>Upload Logo Toko</Text>
              <Text style={styles.logoUploadSub}>Tap untuk pilih foto</Text>
            </View>
          )}
        </TouchableOpacity>

        <View style={styles.form}>
          <Field label="Nama Toko *" placeholder="Contoh: Second Style By Dinda" value={name} onChangeText={setName} />
          <Field label="Deskripsi" placeholder="Ceritakan tokomu..." value={description} onChangeText={setDescription} multiline />
          <Field label="Nomor HP Toko" placeholder="08xx-xxxx-xxxx" value={phone} onChangeText={setPhone} keyboardType="phone-pad" />
          <Field label="Alamat Toko" placeholder="Jl. Merpati No. 12..." value={address} onChangeText={setAddress} multiline />
          <Field label="Kota *" placeholder="Jakarta Selatan" value={city} onChangeText={setCity} />
          <Field label="Provinsi" placeholder="DKI Jakarta" value={province} onChangeText={setProvince} />
        </View>

        <View style={styles.infoBox}>
          <Text style={styles.infoTitle}>📋 Syarat Buka Toko</Text>
          <Text style={styles.infoItem}>✅ Produk harus barang preloved / bekas</Text>
          <Text style={styles.infoItem}>✅ Foto produk harus nyata & tidak menyesatkan</Text>
          <Text style={styles.infoItem}>✅ Dilarang menjual produk ilegal</Text>
        </View>

        <TouchableOpacity
          style={[styles.createBtn, isSubmitting && styles.createBtnDisabled]}
          onPress={handleCreate}
          disabled={isSubmitting}
        >
          {isSubmitting ? (
            <ActivityIndicator color={colors.white} />
          ) : (
            <Text style={styles.createBtnText}>🚀 Buat Toko Sekarang</Text>
          )}
        </TouchableOpacity>
        <View style={{ height: spacing['3xl'] }} />
      </ScrollView>
    </View>
  );
}

function Field({ label, placeholder, value, onChangeText, multiline, keyboardType }: any) {
  return (
    <View style={fieldStyles.group}>
      <Text style={fieldStyles.label}>{label}</Text>
      <TextInput
        style={[fieldStyles.input, multiline && fieldStyles.multiline]}
        placeholder={placeholder}
        placeholderTextColor={colors.gray400}
        value={value}
        onChangeText={onChangeText}
        multiline={multiline}
        keyboardType={keyboardType}
        numberOfLines={multiline ? 3 : 1}
      />
    </View>
  );
}

const fieldStyles = StyleSheet.create({
  group: { marginBottom: spacing.md },
  label: { fontSize: fontSizes.sm, fontWeight: fontWeights.semibold, color: colors.textPrimary, marginBottom: spacing.xs },
  input: {
    borderWidth: 1.5, borderColor: colors.border, borderRadius: borderRadius.lg,
    padding: spacing.md, fontSize: fontSizes.base, color: colors.textPrimary,
    backgroundColor: colors.gray50,
  },
  multiline: { minHeight: 80, textAlignVertical: 'top' },
});

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: spacing.base, paddingTop: spacing['2xl'], backgroundColor: colors.white },
  backText: { fontSize: 24, color: colors.textPrimary },
  headerTitle: { fontSize: fontSizes.lg, fontWeight: fontWeights.bold, color: colors.textPrimary },
  scroll: { padding: spacing.base },
  logoUpload: {
    alignSelf: 'center', width: 120, height: 120, borderRadius: 60,
    backgroundColor: colors.primarySurface, overflow: 'hidden',
    borderWidth: 2, borderColor: colors.primary, borderStyle: 'dashed',
    marginBottom: spacing.xl,
  },
  logoPreview: { width: 120, height: 120 },
  logoPlaceholder: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  logoEmoji: { fontSize: 36 },
  logoUploadText: { fontSize: fontSizes.xs, fontWeight: fontWeights.semibold, color: colors.primary, marginTop: spacing.xs },
  logoUploadSub: { fontSize: fontSizes.xs, color: colors.textSecondary },
  form: { backgroundColor: colors.white, borderRadius: borderRadius.xl, padding: spacing.base, ...shadows.sm, marginBottom: spacing.base },
  infoBox: { backgroundColor: colors.primarySurface, borderRadius: borderRadius.xl, padding: spacing.base, marginBottom: spacing.xl },
  infoTitle: { fontSize: fontSizes.base, fontWeight: fontWeights.bold, color: colors.primary, marginBottom: spacing.sm },
  infoItem: { fontSize: fontSizes.sm, color: colors.textSecondary, marginBottom: spacing.xs, lineHeight: 20 },
  createBtn: { backgroundColor: colors.primary, borderRadius: borderRadius.xl, padding: spacing.base, alignItems: 'center', ...shadows.lg },
  createBtnDisabled: { opacity: 0.6 },
  createBtnText: { color: colors.white, fontWeight: fontWeights.extrabold, fontSize: fontSizes.lg },
});
