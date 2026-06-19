import React, { useEffect, useState } from 'react';
import {
  View, Text, ScrollView, StyleSheet, TouchableOpacity,
  TextInput, Alert, Image, ActivityIndicator,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { supabase } from '../../lib/supabase';
import { useAuthStore } from '../../stores/authStore';
import { colors, spacing, fontSizes, fontWeights, borderRadius, shadows } from '../../constants/theme';
import { makeSlug } from '../../utils/format';

const COURIERS = ['COD', 'JNE', 'JNT', 'SiCepat', 'AnterAja'];
const CONDITIONS = [
  { label: '🌟 Baru', value: 'new' },
  { label: '✨ Seperti Baru', value: 'like_new' },
  { label: '👍 Bagus', value: 'good' },
  { label: '🔆 Cukup Baik', value: 'fair' },
];

export default function CheckoutScreen({ route, navigation }: any) {
  const { user } = useAuthStore();
  const { fromCart } = route.params ?? {};

  const [addresses, setAddresses] = useState<any[]>([]);
  const [selectedAddress, setSelectedAddress] = useState<any>(null);
  const [selectedCourier, setSelectedCourier] = useState('JNE');
  const [cartItems, setCartItems] = useState<any[]>([]);
  const [bankAccounts, setBankAccounts] = useState<any[]>([]);
  const [selectedBank, setSelectedBank] = useState<any>(null);
  const [notes, setNotes] = useState('');
  const [paymentProof, setPaymentProof] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [step, setStep] = useState<'address' | 'shipping' | 'payment'>('address');

  useEffect(() => {
    if (!user) return;
    fetchData();
  }, [user]);

  const fetchData = async () => {
    const [{ data: addrData }, { data: cartData }, { data: bankData }] = await Promise.all([
      supabase.from('addresses').select('*').eq('user_id', user!.id).order('is_default', { ascending: false }),
      supabase.from('cart_items').select('*, product:products(*, images:product_images(*))').eq('user_id', user!.id),
      supabase.from('bank_accounts').select('*').eq('is_active', true).order('sort_order'),
    ]);
    if (addrData) { setAddresses(addrData); if (addrData.length > 0) setSelectedAddress(addrData[0]); }
    if (cartData) setCartItems(cartData);
    if (bankData) { setBankAccounts(bankData); if (bankData.length > 0) setSelectedBank(bankData[0]); }
  };

  const subtotal = cartItems.reduce((sum: number, i: any) => sum + (i.product?.price ?? 0) * i.quantity, 0);
  const shippingCost = selectedCourier === 'COD' ? 0 : 15000;
  const total = subtotal + shippingCost;

  const pickPaymentProof = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') { Alert.alert('Izin diperlukan', 'Izinkan akses galeri untuk upload bukti bayar'); return; }
    const result = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ImagePicker.MediaTypeOptions.Images, quality: 0.7 });
    if (!result.canceled && result.assets[0]) {
      setPaymentProof(result.assets[0].uri);
    }
  };

  const uploadPaymentProof = async (uri: string): Promise<string | null> => {
    const fileName = `payment_proofs/${user!.id}_${Date.now()}.jpg`;
    const response = await fetch(uri);
    const blob = await response.blob();
    const arrayBuffer = await new Response(blob).arrayBuffer();
    const { data, error } = await supabase.storage.from('prelove-images').upload(fileName, arrayBuffer, { contentType: 'image/jpeg' });
    if (error) return null;
    const { data: urlData } = supabase.storage.from('prelove-images').getPublicUrl(fileName);
    return urlData.publicUrl;
  };

  const handleOrder = async () => {
    if (!selectedAddress) { Alert.alert('Alamat Kosong', 'Pilih alamat pengiriman dulu'); return; }
    if (!selectedBank) { Alert.alert('Bank Kosong', 'Pilih rekening tujuan transfer'); return; }
    if (!paymentProof) { Alert.alert('Bukti Transfer', 'Upload bukti transfer dulu ya!'); return; }
    if (cartItems.length === 0) { Alert.alert('Keranjang kosong'); return; }

    setIsSubmitting(true);
    try {
      // Upload bukti bayar
      const proofUrl = await uploadPaymentProof(paymentProof);

      // Group by store
      const byStore: Record<string, any[]> = {};
      cartItems.forEach((ci: any) => {
        const storeId = ci.product?.store_id;
        if (!byStore[storeId]) byStore[storeId] = [];
        byStore[storeId].push(ci);
      });

      // Buat order per toko
      for (const [storeId, storeItems] of Object.entries(byStore)) {
        const storeSub = storeItems.reduce((s: number, i: any) => s + i.product.price * i.quantity, 0);
        const { data: order, error: orderError } = await supabase
          .from('orders')
          .insert({
            buyer_id: user!.id,
            store_id: storeId,
            address_id: selectedAddress.id,
            address_snapshot: selectedAddress,
            shipping_courier: selectedCourier,
            shipping_cost: shippingCost,
            subtotal: storeSub,
            total: storeSub + shippingCost,
            payment_status: 'pending_verification',
            payment_proof_url: proofUrl,
            payment_bank: selectedBank.bank_name,
            payment_account_number: selectedBank.account_number,
            payment_account_name: selectedBank.account_name,
            status: 'pending',
            notes,
          })
          .select()
          .single();

        if (orderError) throw orderError;

        // Insert order items
        const orderItems = storeItems.map((ci: any) => ({
          order_id: order.id,
          product_id: ci.product_id,
          quantity: ci.quantity,
          price: ci.product.price,
          product_snapshot: ci.product,
        }));
        await supabase.from('order_items').insert(orderItems);
      }

      // Hapus cart
      await supabase.from('cart_items').delete().eq('user_id', user!.id);

      Alert.alert('Pesanan Dibuat! 🎉', 'Pesanan kamu sedang diverifikasi penjual. Cek di halaman pesanan ya!', [
        { text: 'Lihat Pesanan', onPress: () => navigation.navigate('Orders') },
      ]);
    } catch (e) {
      Alert.alert('Gagal', 'Terjadi kesalahan. Coba lagi ya!');
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
        <Text style={styles.headerTitle}>Checkout</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Alamat */}
        <Section title="📍 Alamat Pengiriman">
          {addresses.length === 0 ? (
            <TouchableOpacity style={styles.addBtn} onPress={() => navigation.navigate('AddAddress')}>
              <Text style={styles.addBtnText}>+ Tambah Alamat</Text>
            </TouchableOpacity>
          ) : (
            addresses.map((addr) => (
              <TouchableOpacity
                key={addr.id}
                style={[styles.optionCard, selectedAddress?.id === addr.id && styles.optionCardActive]}
                onPress={() => setSelectedAddress(addr)}
              >
                <View style={styles.radioOuter}>
                  {selectedAddress?.id === addr.id && <View style={styles.radioInner} />}
                </View>
                <View style={styles.flex1}>
                  <Text style={styles.addrLabel}>{addr.label} {addr.is_default ? '🏠' : ''}</Text>
                  <Text style={styles.addrName}>{addr.recipient_name} · {addr.phone}</Text>
                  <Text style={styles.addrText} numberOfLines={2}>{addr.address}, {addr.city}</Text>
                </View>
              </TouchableOpacity>
            ))
          )}
        </Section>

        {/* Kurir */}
        <Section title="🚚 Pilih Kurir">
          <View style={styles.courierGrid}>
            {COURIERS.map((c) => (
              <TouchableOpacity
                key={c}
                style={[styles.courierChip, selectedCourier === c && styles.courierChipActive]}
                onPress={() => setSelectedCourier(c)}
              >
                <Text style={[styles.courierText, selectedCourier === c && styles.courierTextActive]}>{c}</Text>
                {c === 'COD' && <Text style={[styles.courierSub, selectedCourier === c && { color: colors.white }]}>Gratis</Text>}
              </TouchableOpacity>
            ))}
          </View>
        </Section>

        {/* Produk */}
        <Section title="🛍️ Produk Dipesan">
          {cartItems.map((ci: any) => {
            const img = ci.product?.images?.find((i: any) => i.is_primary)?.image_url ?? ci.product?.images?.[0]?.image_url;
            return (
              <View key={ci.id} style={styles.orderItem}>
                {img ? <Image source={{ uri: img }} style={styles.orderItemImg} /> : <View style={styles.orderItemImgPlaceholder}><Text>📦</Text></View>}
                <View style={styles.flex1}>
                  <Text style={styles.orderItemTitle} numberOfLines={1}>{ci.product?.title}</Text>
                  <Text style={styles.orderItemPrice}>{ci.quantity}x · {ci.product?.price?.toLocaleString('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 })}</Text>
                </View>
              </View>
            );
          })}
        </Section>

        {/* Catatan */}
        <Section title="📝 Catatan (opsional)">
          <TextInput
            style={styles.notesInput}
            placeholder="Contoh: Tolong bubble wrap dobel ya kak 🙏"
            placeholderTextColor={colors.gray400}
            value={notes}
            onChangeText={setNotes}
            multiline
            numberOfLines={3}
          />
        </Section>

        {/* Payment Manual Transfer */}
        <Section title="💳 Pembayaran Manual Transfer">
          <View style={styles.infoBox}>
            <Text style={styles.infoText}>Transfer ke salah satu rekening di bawah, lalu upload bukti transfernya ya! 📸</Text>
          </View>
          {bankAccounts.map((bank) => (
            <TouchableOpacity
              key={bank.id}
              style={[styles.optionCard, selectedBank?.id === bank.id && styles.optionCardActive]}
              onPress={() => setSelectedBank(bank)}
            >
              <View style={styles.radioOuter}>
                {selectedBank?.id === bank.id && <View style={styles.radioInner} />}
              </View>
              <View>
                <Text style={styles.bankName}>{bank.bank_name}</Text>
                <Text style={styles.bankNumber}>{bank.account_number}</Text>
                <Text style={styles.bankOwner}>a.n. {bank.account_name}</Text>
              </View>
            </TouchableOpacity>
          ))}

          <TouchableOpacity style={styles.uploadProofBtn} onPress={pickPaymentProof}>
            {paymentProof ? (
              <Image source={{ uri: paymentProof }} style={styles.proofPreview} />
            ) : (
              <View style={styles.uploadPlaceholder}>
                <Text style={styles.uploadEmoji}>📸</Text>
                <Text style={styles.uploadText}>Upload Bukti Transfer</Text>
                <Text style={styles.uploadSub}>Tap untuk pilih foto</Text>
              </View>
            )}
          </TouchableOpacity>
        </Section>

        {/* Ringkasan */}
        <Section title="📊 Ringkasan Pembayaran">
          <View style={styles.summaryRow}><Text style={styles.summaryLabel}>Subtotal</Text><Text style={styles.summaryValue}>{subtotal.toLocaleString('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 })}</Text></View>
          <View style={styles.summaryRow}><Text style={styles.summaryLabel}>Ongkir ({selectedCourier})</Text><Text style={styles.summaryValue}>{selectedCourier === 'COD' ? 'GRATIS' : 'Rp 15.000'}</Text></View>
          <View style={styles.divider} />
          <View style={styles.summaryRow}>
            <Text style={styles.summaryTotal}>Total</Text>
            <Text style={styles.summaryTotalValue}>{total.toLocaleString('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 })}</Text>
          </View>
        </Section>

        <View style={{ height: 100 }} />
      </ScrollView>

      <View style={styles.bottomBar}>
        <View>
          <Text style={styles.totalLabel}>Total</Text>
          <Text style={styles.totalValue}>{total.toLocaleString('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 })}</Text>
        </View>
        <TouchableOpacity
          style={[styles.orderBtn, isSubmitting && styles.orderBtnDisabled]}
          onPress={handleOrder}
          disabled={isSubmitting}
        >
          {isSubmitting ? <ActivityIndicator color={colors.white} /> : <Text style={styles.orderBtnText}>Buat Pesanan 🚀</Text>}
        </TouchableOpacity>
      </View>
    </View>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <View style={sectionStyles.container}>
      <Text style={sectionStyles.title}>{title}</Text>
      {children}
    </View>
  );
}

const sectionStyles = StyleSheet.create({
  container: { backgroundColor: colors.white, marginBottom: spacing.sm, padding: spacing.base },
  title: { fontSize: fontSizes.base, fontWeight: fontWeights.bold, color: colors.textPrimary, marginBottom: spacing.md },
});

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.backgroundDark },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: spacing.base, paddingTop: spacing['2xl'], backgroundColor: colors.white },
  backText: { fontSize: 24, color: colors.textPrimary },
  headerTitle: { fontSize: fontSizes.lg, fontWeight: fontWeights.bold, color: colors.textPrimary },
  addBtn: { borderWidth: 1.5, borderColor: colors.primary, borderRadius: borderRadius.lg, borderStyle: 'dashed', padding: spacing.md, alignItems: 'center' },
  addBtnText: { color: colors.primary, fontWeight: fontWeights.semibold },
  optionCard: { flexDirection: 'row', alignItems: 'flex-start', gap: spacing.md, padding: spacing.md, borderRadius: borderRadius.lg, borderWidth: 1.5, borderColor: colors.border, marginBottom: spacing.sm },
  optionCardActive: { borderColor: colors.primary, backgroundColor: colors.primarySurface },
  radioOuter: { width: 20, height: 20, borderRadius: 10, borderWidth: 2, borderColor: colors.primary, alignItems: 'center', justifyContent: 'center', marginTop: 2 },
  radioInner: { width: 10, height: 10, borderRadius: 5, backgroundColor: colors.primary },
  flex1: { flex: 1 },
  addrLabel: { fontSize: fontSizes.sm, fontWeight: fontWeights.bold, color: colors.textPrimary },
  addrName: { fontSize: fontSizes.sm, color: colors.textSecondary, marginTop: 2 },
  addrText: { fontSize: fontSizes.sm, color: colors.textSecondary, marginTop: 2, lineHeight: 18 },
  courierGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
  courierChip: { paddingHorizontal: spacing.md, paddingVertical: spacing.sm, borderRadius: borderRadius.lg, borderWidth: 1.5, borderColor: colors.border, alignItems: 'center' },
  courierChipActive: { backgroundColor: colors.primary, borderColor: colors.primary },
  courierText: { fontSize: fontSizes.base, fontWeight: fontWeights.semibold, color: colors.textPrimary },
  courierTextActive: { color: colors.white },
  courierSub: { fontSize: fontSizes.xs, color: colors.success, marginTop: 2 },
  orderItem: { flexDirection: 'row', gap: spacing.md, alignItems: 'center', marginBottom: spacing.sm },
  orderItemImg: { width: 56, height: 56, borderRadius: borderRadius.md, resizeMode: 'cover' },
  orderItemImgPlaceholder: { width: 56, height: 56, borderRadius: borderRadius.md, backgroundColor: colors.gray100, alignItems: 'center', justifyContent: 'center' },
  orderItemTitle: { fontSize: fontSizes.sm, fontWeight: fontWeights.medium, color: colors.textPrimary },
  orderItemPrice: { fontSize: fontSizes.sm, color: colors.textSecondary, marginTop: 4 },
  notesInput: { borderWidth: 1.5, borderColor: colors.border, borderRadius: borderRadius.lg, padding: spacing.md, fontSize: fontSizes.base, color: colors.textPrimary, textAlignVertical: 'top', minHeight: 80, backgroundColor: colors.gray50 },
  infoBox: { backgroundColor: colors.primarySurface, borderRadius: borderRadius.lg, padding: spacing.md, marginBottom: spacing.md },
  infoText: { fontSize: fontSizes.sm, color: colors.primary, lineHeight: 20 },
  bankName: { fontSize: fontSizes.base, fontWeight: fontWeights.bold, color: colors.textPrimary },
  bankNumber: { fontSize: fontSizes.lg, fontWeight: fontWeights.extrabold, color: colors.primary, marginTop: 2, letterSpacing: 1 },
  bankOwner: { fontSize: fontSizes.sm, color: colors.textSecondary, marginTop: 2 },
  uploadProofBtn: { borderWidth: 1.5, borderColor: colors.border, borderRadius: borderRadius.xl, borderStyle: 'dashed', marginTop: spacing.md, overflow: 'hidden', minHeight: 140 },
  uploadPlaceholder: { alignItems: 'center', justifyContent: 'center', padding: spacing['2xl'] },
  uploadEmoji: { fontSize: 40, marginBottom: spacing.sm },
  uploadText: { fontSize: fontSizes.base, fontWeight: fontWeights.semibold, color: colors.primary },
  uploadSub: { fontSize: fontSizes.sm, color: colors.textSecondary, marginTop: spacing.xs },
  proofPreview: { width: '100%', height: 200, resizeMode: 'cover' },
  summaryRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: spacing.sm },
  summaryLabel: { fontSize: fontSizes.base, color: colors.textSecondary },
  summaryValue: { fontSize: fontSizes.base, color: colors.textPrimary, fontWeight: fontWeights.medium },
  summaryTotal: { fontSize: fontSizes.lg, fontWeight: fontWeights.bold, color: colors.textPrimary },
  summaryTotalValue: { fontSize: fontSizes.lg, fontWeight: fontWeights.extrabold, color: colors.primary },
  divider: { height: 1, backgroundColor: colors.border, marginVertical: spacing.sm },
  bottomBar: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: spacing.base, paddingBottom: spacing.xl, backgroundColor: colors.white, borderTopWidth: 1, borderTopColor: colors.border },
  totalLabel: { fontSize: fontSizes.xs, color: colors.textSecondary },
  totalValue: { fontSize: fontSizes.xl, fontWeight: fontWeights.extrabold, color: colors.primary },
  orderBtn: { backgroundColor: colors.primary, borderRadius: borderRadius.lg, paddingHorizontal: spacing.xl, paddingVertical: spacing.md, ...shadows.lg },
  orderBtnDisabled: { opacity: 0.6 },
  orderBtnText: { color: colors.white, fontWeight: fontWeights.bold, fontSize: fontSizes.base },
});
