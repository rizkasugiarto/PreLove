import React, { useEffect, useRef, useState } from 'react';
import {
  View, Text, FlatList, StyleSheet, TouchableOpacity,
  TextInput, Image, KeyboardAvoidingView, Platform, ActivityIndicator,
} from 'react-native';
import { supabase } from '../../lib/supabase';
import { useAuthStore } from '../../stores/authStore';
import { ChatMessage } from '../../types/database';
import { colors, spacing, fontSizes, fontWeights, borderRadius } from '../../constants/theme';
import { formatRelativeTime } from '../../utils/format';

export default function ChatScreen({ route, navigation }: any) {
  const { storeId, productId, roomId: existingRoomId } = route.params ?? {};
  const { user } = useAuthStore();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [roomId, setRoomId] = useState<string | null>(existingRoomId ?? null);
  const [storeInfo, setStoreInfo] = useState<any>(null);
  const [text, setText] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const flatListRef = useRef<FlatList>(null);

  useEffect(() => {
    if (!user) return;
    initRoom();
  }, [user]);

  useEffect(() => {
    if (!roomId) return;
    fetchMessages();
    // Realtime subscription
    const channel = supabase
      .channel(`chat:${roomId}`)
      .on('postgres_changes', {
        event: 'INSERT', schema: 'public', table: 'chat_messages',
        filter: `room_id=eq.${roomId}`,
      }, (payload) => {
        setMessages((prev) => [...prev, payload.new as ChatMessage]);
        setTimeout(() => flatListRef.current?.scrollToEnd({ animated: true }), 100);
      })
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [roomId]);

  const initRoom = async () => {
    setIsLoading(true);
    // Fetch store info
    if (storeId) {
      const { data: store } = await supabase.from('stores').select('*').eq('id', storeId).single();
      if (store) setStoreInfo(store);
    }

    if (existingRoomId) {
      setRoomId(existingRoomId);
      return;
    }

    // Cek room existing
    const { data: existing } = await supabase
      .from('chat_rooms')
      .select('id')
      .eq('buyer_id', user!.id)
      .eq('store_id', storeId)
      .maybeSingle();

    if (existing) {
      setRoomId(existing.id);
    } else {
      // Buat room baru
      const { data: newRoom } = await supabase
        .from('chat_rooms')
        .insert({ buyer_id: user!.id, store_id: storeId, product_id: productId })
        .select()
        .single();
      if (newRoom) setRoomId(newRoom.id);
    }
    setIsLoading(false);
  };

  const fetchMessages = async () => {
    const { data } = await supabase
      .from('chat_messages')
      .select('*, sender:profiles(full_name, avatar_url)')
      .eq('room_id', roomId)
      .order('created_at', { ascending: true });
    if (data) setMessages(data as ChatMessage[]);
    setIsLoading(false);
    setTimeout(() => flatListRef.current?.scrollToEnd({ animated: false }), 100);
  };

  const sendMessage = async () => {
    if (!text.trim() || !roomId || !user) return;
    const msg = text.trim();
    setText('');
    setIsSending(true);

    await supabase.from('chat_messages').insert({
      room_id: roomId,
      sender_id: user.id,
      message: msg,
    });

    // Update room last_message
    await supabase.from('chat_rooms').update({
      last_message: msg,
      last_message_at: new Date().toISOString(),
    }).eq('id', roomId);

    setIsSending(false);
  };

  const renderMessage = ({ item }: { item: ChatMessage }) => {
    const isMe = item.sender_id === user?.id;
    return (
      <View style={[styles.msgWrapper, isMe ? styles.msgRight : styles.msgLeft]}>
        {!isMe && (
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>
              {((item as any).sender?.full_name ?? '?')[0].toUpperCase()}
            </Text>
          </View>
        )}
        <View style={[styles.bubble, isMe ? styles.bubbleMe : styles.bubbleThem]}>
          {item.image_url && (
            <Image source={{ uri: item.image_url }} style={styles.msgImage} />
          )}
          {item.message && (
            <Text style={[styles.msgText, isMe ? styles.msgTextMe : styles.msgTextThem]}>
              {item.message}
            </Text>
          )}
          <Text style={[styles.msgTime, isMe ? styles.msgTimeMe : styles.msgTimeThem]}>
            {formatRelativeTime(item.created_at)}
          </Text>
        </View>
      </View>
    );
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={0}
    >
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Text style={styles.backText}>←</Text>
        </TouchableOpacity>
        <View style={styles.storeInfo}>
          <View style={styles.storeAvatar}>
            {storeInfo?.logo_url ? (
              <Image source={{ uri: storeInfo.logo_url }} style={styles.storeAvatarImg} />
            ) : (
              <Text style={{ fontSize: 22 }}>🏪</Text>
            )}
          </View>
          <View>
            <Text style={styles.storeName}>{storeInfo?.name ?? 'Chat'}</Text>
            <Text style={styles.storeOnline}>🟢 Online</Text>
          </View>
        </View>
      </View>

      {isLoading ? (
        <View style={styles.center}><ActivityIndicator color={colors.primary} /></View>
      ) : (
        <FlatList
          ref={flatListRef}
          data={messages}
          keyExtractor={(item) => item.id}
          renderItem={renderMessage}
          contentContainerStyle={styles.messageList}
          ListEmptyComponent={
            <View style={styles.emptyChat}>
              <Text style={styles.emptyChatEmoji}>💬</Text>
              <Text style={styles.emptyChatText}>Mulai percakapan!</Text>
              <Text style={styles.emptyChatSub}>Tanyakan kondisi barang, harga, dll.</Text>
            </View>
          }
        />
      )}

      {/* Input */}
      <View style={styles.inputBar}>
        <TextInput
          style={styles.input}
          placeholder="Ketik pesan..."
          placeholderTextColor={colors.gray400}
          value={text}
          onChangeText={setText}
          multiline
          maxLength={500}
        />
        <TouchableOpacity
          style={[styles.sendBtn, (!text.trim() || isSending) && styles.sendBtnDisabled]}
          onPress={sendMessage}
          disabled={!text.trim() || isSending}
        >
          <Text style={styles.sendIcon}>➤</Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  header: {
    flexDirection: 'row', alignItems: 'center', gap: spacing.md,
    padding: spacing.base, paddingTop: spacing['2xl'],
    backgroundColor: colors.white, borderBottomWidth: 1, borderBottomColor: colors.border,
  },
  backBtn: { padding: spacing.xs },
  backText: { fontSize: 24, color: colors.textPrimary },
  storeInfo: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  storeAvatar: { width: 44, height: 44, borderRadius: 22, backgroundColor: colors.primarySurface, alignItems: 'center', justifyContent: 'center', overflow: 'hidden' },
  storeAvatarImg: { width: 44, height: 44 },
  storeName: { fontSize: fontSizes.base, fontWeight: fontWeights.bold, color: colors.textPrimary },
  storeOnline: { fontSize: fontSizes.xs, color: colors.success },
  messageList: { padding: spacing.md, paddingBottom: spacing.base },
  msgWrapper: { flexDirection: 'row', marginBottom: spacing.sm, alignItems: 'flex-end', gap: spacing.sm },
  msgLeft: { justifyContent: 'flex-start' },
  msgRight: { justifyContent: 'flex-end' },
  avatar: { width: 32, height: 32, borderRadius: 16, backgroundColor: colors.primarySurface, alignItems: 'center', justifyContent: 'center' },
  avatarText: { fontSize: fontSizes.sm, fontWeight: fontWeights.bold, color: colors.primary },
  bubble: { maxWidth: '75%', borderRadius: borderRadius.xl, padding: spacing.md },
  bubbleMe: { backgroundColor: colors.primary, borderBottomRightRadius: 4 },
  bubbleThem: { backgroundColor: colors.white, borderBottomLeftRadius: 4 },
  msgText: { fontSize: fontSizes.base, lineHeight: 20 },
  msgTextMe: { color: colors.white },
  msgTextThem: { color: colors.textPrimary },
  msgTime: { fontSize: fontSizes.xs, marginTop: 4 },
  msgTimeMe: { color: colors.white + 'AA', textAlign: 'right' },
  msgTimeThem: { color: colors.textSecondary },
  msgImage: { width: 200, height: 150, borderRadius: borderRadius.md, marginBottom: spacing.xs, resizeMode: 'cover' },
  emptyChat: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingVertical: spacing['5xl'] },
  emptyChatEmoji: { fontSize: 56, marginBottom: spacing.md },
  emptyChatText: { fontSize: fontSizes.lg, fontWeight: fontWeights.bold, color: colors.textPrimary },
  emptyChatSub: { fontSize: fontSizes.base, color: colors.textSecondary, marginTop: spacing.xs },
  inputBar: {
    flexDirection: 'row', alignItems: 'flex-end', gap: spacing.sm,
    padding: spacing.sm, paddingBottom: spacing.xl,
    backgroundColor: colors.white, borderTopWidth: 1, borderTopColor: colors.border,
  },
  input: {
    flex: 1, borderWidth: 1.5, borderColor: colors.border, borderRadius: borderRadius['2xl'],
    paddingHorizontal: spacing.md, paddingVertical: spacing.sm,
    fontSize: fontSizes.base, color: colors.textPrimary,
    maxHeight: 120, backgroundColor: colors.gray50,
  },
  sendBtn: { width: 44, height: 44, borderRadius: 22, backgroundColor: colors.primary, alignItems: 'center', justifyContent: 'center' },
  sendBtnDisabled: { backgroundColor: colors.gray300 },
  sendIcon: { color: colors.white, fontSize: 18 },
});
