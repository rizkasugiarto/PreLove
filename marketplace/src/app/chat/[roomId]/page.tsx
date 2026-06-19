'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/lib/supabase';
import { formatRelativeTime } from '@/lib/utils';
import { ArrowLeft, Send, Image as ImageIcon, Package } from 'lucide-react';
import Link from 'next/link';
import toast from 'react-hot-toast';

export default function ChatRoomPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const { roomId } = useParams<{ roomId: string }>();
  const [room, setRoom] = useState<any>(null);
  const [messages, setMessages] = useState<any[]>([]);
  const [text, setText] = useState('');
  const [sending, setSending] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!loading && !user) router.push('/auth/login');
  }, [user, loading]);

  useEffect(() => {
    if (user && roomId) {
      fetchRoom();
      fetchMessages();
      markRead();

      // Realtime subscription
      const channel = supabase
        .channel(`room:${roomId}`)
        .on('postgres_changes', {
          event: 'INSERT',
          schema: 'public',
          table: 'chat_messages',
          filter: `room_id=eq.${roomId}`,
        }, payload => {
          setMessages(prev => [...prev, payload.new]);
          bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
        })
        .subscribe();

      return () => { supabase.removeChannel(channel); };
    }
  }, [user, roomId]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const fetchRoom = async () => {
    const { data } = await supabase
      .from('chat_rooms')
      .select('*, store:stores(id,name,slug,logo_url,phone), product:products(id,title,price,images:product_images(*))')
      .eq('id', roomId)
      .single();
    setRoom(data);
  };

  const fetchMessages = async () => {
    const { data } = await supabase
      .from('chat_messages')
      .select('*, sender:profiles(id,full_name,avatar_url)')
      .eq('room_id', roomId)
      .order('created_at', { ascending: true });
    setMessages(data ?? []);
  };

  const markRead = async () => {
    await supabase.from('chat_rooms').update({ buyer_unread_count: 0 }).eq('id', roomId);
  };

  const sendMessage = async () => {
    if (!text.trim() || !user) return;
    setSending(true);
    const msg = text.trim();
    setText('');
    const { error } = await supabase.from('chat_messages').insert({
      room_id: roomId,
      sender_id: user.id,
      message: msg,
    });
    if (error) {
      toast.error('Gagal kirim pesan');
      setText(msg);
    } else {
      // update last_message
      await supabase.from('chat_rooms').update({
        last_message: msg,
        last_message_at: new Date().toISOString(),
        seller_unread_count: (room?.seller_unread_count ?? 0) + 1,
      }).eq('id', roomId);
    }
    setSending(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <div className="h-screen flex flex-col" style={{ background: 'var(--bg)' }}>
      {/* Header */}
      <div className="glass border-b px-4 py-3 flex items-center gap-3 flex-shrink-0">
        <button onClick={() => router.back()} className="p-2 rounded-xl hover:bg-gray-100 transition-colors">
          <ArrowLeft className="w-5 h-5 text-gray-600" />
        </button>
        <div className="w-10 h-10 rounded-full overflow-hidden bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center flex-shrink-0">
          {room?.store?.logo_url ? (
            <img src={room.store.logo_url} alt="" className="w-full h-full object-cover" />
          ) : (
            <span className="text-white font-black">{(room?.store?.name ?? 'T')[0]}</span>
          )}
        </div>
        <div className="flex-1 min-w-0">
          <h2 className="font-bold text-sm truncate">{room?.store?.name ?? 'Toko'}</h2>
          <p className="text-xs text-gray-400">Penjual</p>
        </div>
      </div>

      {/* Product context card */}
      {room?.product && (
        <div className="px-4 py-2 bg-violet-50 border-b border-violet-100">
          <Link href={`/products/${room.product.id}`} className="flex items-center gap-2 text-xs text-violet-700">
            <Package className="w-3.5 h-3.5 flex-shrink-0" />
            <span className="truncate font-medium">{room.product.title}</span>
          </Link>
        </div>
      )}

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {messages.length === 0 && (
          <div className="text-center py-12">
            <div className="text-4xl mb-2">💬</div>
            <p className="text-sm" style={{ color: 'var(--text-muted)' }}>Mulai percakapan dengan penjual</p>
          </div>
        )}
        {messages.map((msg, i) => {
          const isMe = msg.sender_id === user?.id;
          return (
            <div key={msg.id ?? i} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
              <div className={isMe ? 'chat-bubble-right' : 'chat-bubble-left'}>
                <p style={{ wordBreak: 'break-word' }}>{msg.message}</p>
                <p className={`text-xs mt-1 ${isMe ? 'text-white/60' : 'text-gray-400'}`}>
                  {formatRelativeTime(msg.created_at)}
                </p>
              </div>
            </div>
          );
        })}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div className="p-4 glass border-t flex items-end gap-3 flex-shrink-0">
        <textarea
          value={text}
          onChange={e => setText(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Ketik pesan..."
          rows={1}
          className="flex-1 resize-none rounded-2xl border border-gray-200 bg-white px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent transition-all max-h-32"
          style={{ fontFamily: 'var(--font-sans)' }}
        />
        <button
          onClick={sendMessage}
          disabled={!text.trim() || sending}
          className="w-11 h-11 rounded-2xl flex items-center justify-center flex-shrink-0 transition-all"
          style={{
            background: text.trim() ? 'linear-gradient(135deg, #5B5BD6, #7C3AED)' : '#E5E7EB',
          }}
        >
          <Send className="w-4 h-4" style={{ color: text.trim() ? 'white' : '#9CA3AF' }} />
        </button>
      </div>
    </div>
  );
}
