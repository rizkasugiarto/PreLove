'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/lib/supabase';
import { formatRelativeTime } from '@/lib/utils';
import { ArrowLeft, Send, Package, Store, MessageCircle, Check, CheckCheck, ShoppingBag } from 'lucide-react';
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
    const { data: insertedMsg, error } = await supabase.from('chat_messages').insert({
      room_id: roomId,
      sender_id: user.id,
      message: msg,
    }).select().single();

    if (error) {
      toast.error('Gagal kirim pesan');
      setText(msg);
    } else {
      const newMsgObj = {
        ...insertedMsg,
        sender: {
          id: user.id,
          full_name: user.user_metadata?.full_name || 'Anda',
          avatar_url: user.user_metadata?.avatar_url
        }
      };
      setMessages(prev => {
        if (prev.find(m => m.id === insertedMsg.id)) return prev;
        return [...prev, newMsgObj];
      });
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

  const QUICK = [
    'Hai, barang ini masih ready? 👋',
    'Boleh minta detail foto aslinya? 📸',
    'Apakah harga masih bisa nego? 🙏',
    'Ada minus/cacat pada barang? 🔍',
  ];

  return (
    <div style={{
      position: 'fixed', top: '64px', left: 0, right: 0, bottom: 0,
      background: 'radial-gradient(ellipse at top left, #EDE9FE 0%, #F5F3FF 40%, #EFF6FF 100%)',
      display: 'flex', justifyContent: 'center', alignItems: 'stretch',
      padding: '0', zIndex: 40,
    }}>
      {/* Aurora blobs */}
      <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', top: '-10%', left: '-5%', width: '40%', height: '60%', borderRadius: '50%', filter: 'blur(80px)', background: 'rgba(196,181,253,0.35)', mixBlendMode: 'multiply' }} />
        <div style={{ position: 'absolute', bottom: '10%', right: '-5%', width: '35%', height: '50%', borderRadius: '50%', filter: 'blur(80px)', background: 'rgba(167,243,208,0.3)', mixBlendMode: 'multiply' }} />
      </div>

      {/* Chat container */}
      <div style={{
        width: '100%', maxWidth: '780px', height: '100%',
        background: 'rgba(255,255,255,0.75)',
        backdropFilter: 'blur(32px)', WebkitBackdropFilter: 'blur(32px)',
        borderLeft: '1px solid rgba(255,255,255,0.8)',
        borderRight: '1px solid rgba(255,255,255,0.8)',
        display: 'flex', flexDirection: 'column', overflow: 'hidden',
        position: 'relative', zIndex: 10,
        boxShadow: '0 0 60px rgba(124,58,237,0.06)',
      }}>

        {/* ── HEADER ── */}
        <div style={{
          background: 'rgba(255,255,255,0.95)',
          borderBottom: '1px solid rgba(139,92,246,0.1)',
          padding: '14px 20px',
          display: 'flex', alignItems: 'center', gap: '14px',
          flexShrink: 0, backdropFilter: 'blur(20px)',
          boxShadow: '0 4px 20px rgba(124,58,237,0.06)',
        }}>
          {/* Back btn */}
          <button onClick={() => router.back()} style={{
            width: '40px', height: '40px', borderRadius: '14px',
            background: 'rgba(237,233,254,0.6)',
            border: '1.5px solid rgba(139,92,246,0.15)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            cursor: 'pointer', flexShrink: 0, transition: 'all 0.2s',
          }}>
            <ArrowLeft size={18} color="#7C3AED" />
          </button>

          {/* Store avatar */}
          <div style={{ position: 'relative', flexShrink: 0 }}>
            <div style={{
              width: '46px', height: '46px', borderRadius: '16px', overflow: 'hidden',
              background: 'linear-gradient(135deg, #EDE9FE, #F3E8FF)',
              border: '2px solid rgba(139,92,246,0.15)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              {room?.store?.logo_url
                ? <img src={room.store.logo_url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                : <Store size={20} color="#8B5CF6" />}
            </div>
            <span style={{
              position: 'absolute', bottom: '-1px', right: '-1px',
              width: '13px', height: '13px', background: '#10B981',
              border: '2px solid white', borderRadius: '50%',
            }} />
          </div>

          {/* Store name */}
          <div style={{ flex: 1, minWidth: 0 }}>
            <h2 style={{ fontWeight: 900, fontSize: '16px', color: '#111827', margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {room?.store?.name ?? 'Toko Penjual'}
            </h2>
            <p style={{ fontSize: '12px', color: '#10B981', fontWeight: 700, margin: '2px 0 0', display: 'flex', alignItems: 'center', gap: '4px' }}>
              <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#10B981', display: 'inline-block' }} />
              Online
            </p>
          </div>

          {/* Logo badge */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', opacity: 0.4 }}>
            <ShoppingBag size={18} color="#7C3AED" />
            <span style={{ fontWeight: 900, fontSize: '14px', color: '#7C3AED' }}>PreLove</span>
          </div>
        </div>

        {/* ── PRODUCT CARD ── */}
        {room?.product && (
          <div style={{
            background: 'rgba(255,255,255,0.7)',
            borderBottom: '1px solid rgba(139,92,246,0.08)',
            padding: '10px 20px',
            flexShrink: 0,
          }}>
            <Link href={`/products/${room.product.id}`} style={{
              display: 'flex', alignItems: 'center', gap: '12px',
              background: 'rgba(255,255,255,0.9)',
              border: '1px solid rgba(139,92,246,0.12)',
              borderRadius: '16px', padding: '10px 14px',
              textDecoration: 'none', transition: 'all 0.2s',
              boxShadow: '0 2px 12px rgba(124,58,237,0.06)',
            }}>
              <div style={{ width: '44px', height: '44px', borderRadius: '12px', overflow: 'hidden', background: '#F3F4F6', flexShrink: 0, border: '1px solid rgba(0,0,0,0.04)' }}>
                {room.product.images?.[0]?.image_url
                  ? <img src={room.product.images[0].image_url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  : <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Package size={18} color="#D1D5DB" /></div>}
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <span style={{ fontWeight: 700, fontSize: '13px', color: '#374151', display: 'block', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {room.product.title}
                </span>
                <span style={{ fontWeight: 900, fontSize: '14px', color: '#7C3AED', background: 'linear-gradient(135deg,#7C3AED,#DB2777)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                  Rp {room.product.price?.toLocaleString('id-ID')}
                </span>
              </div>
              <span style={{ fontSize: '11px', fontWeight: 800, color: '#7C3AED', background: '#F5F3FF', padding: '4px 10px', borderRadius: '999px', flexShrink: 0, border: '1px solid #DDD6FE' }}>Lihat →</span>
            </Link>
          </div>
        )}

        {/* ── MESSAGES ── */}
        <div style={{
          flex: 1, overflowY: 'auto', padding: '20px',
          display: 'flex', flexDirection: 'column', gap: '8px',
          background: 'transparent',
          backgroundImage: 'radial-gradient(rgba(139,92,246,0.06) 1px, transparent 1px)',
          backgroundSize: '28px 28px',
        }}>
          {messages.length === 0 && (
            <div style={{ textAlign: 'center', margin: 'auto', padding: '40px 24px' }}>
              <div style={{
                width: '72px', height: '72px', borderRadius: '24px',
                background: 'rgba(255,255,255,0.9)',
                border: '1.5px solid rgba(139,92,246,0.15)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                margin: '0 auto 16px',
                boxShadow: '0 8px 24px rgba(124,58,237,0.1)',
              }}>
                <MessageCircle size={30} color="#8B5CF6" />
              </div>
              <h3 style={{ fontWeight: 900, fontSize: '18px', color: '#111827', margin: '0 0 8px' }}>Mulai Percakapan</h3>
              <p style={{ fontSize: '14px', color: '#9CA3AF', margin: 0, lineHeight: 1.6 }}>Tanyakan apapun tentang produk ini langsung ke penjual.</p>
            </div>
          )}

          {(() => {
            const isBuyer = user?.id === room?.buyer_id;
            let unreadCount = isBuyer ? (room?.seller_unread_count || 0) : (room?.buyer_unread_count || 0);
            const readStatusMap = new Map();
            for (let i = messages.length - 1; i >= 0; i--) {
              const msg = messages[i];
              if (msg.sender_id === user?.id) {
                readStatusMap.set(msg.id ?? i, unreadCount > 0 ? (unreadCount--, false) : true);
              }
            }

            return messages.map((msg, i) => {
              const isMe = msg.sender_id === user?.id;
              const isRead = readStatusMap.get(msg.id ?? i);

              return (
                <div key={msg.id ?? i} style={{ display: 'flex', justifyContent: isMe ? 'flex-end' : 'flex-start' }}>
                  <div style={{
                    maxWidth: '72%', padding: '12px 16px',
                    background: isMe
                      ? 'linear-gradient(135deg, #7C3AED, #9333EA)'
                      : 'rgba(255,255,255,0.92)',
                    color: isMe ? 'white' : '#1F2937',
                    borderRadius: isMe ? '20px 20px 4px 20px' : '20px 20px 20px 4px',
                    boxShadow: isMe
                      ? '0 4px 16px rgba(124,58,237,0.25)'
                      : '0 2px 8px rgba(0,0,0,0.06)',
                    border: isMe ? 'none' : '1px solid rgba(255,255,255,0.9)',
                    backdropFilter: isMe ? 'none' : 'blur(8px)',
                  }}>
                    <p style={{ fontSize: '14px', lineHeight: 1.6, margin: 0, wordBreak: 'break-word' }}>{msg.message}</p>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '4px', marginTop: '6px' }}>
                      <span style={{ fontSize: '11px', opacity: 0.7, fontWeight: 500 }}>{formatRelativeTime(msg.created_at)}</span>
                      {isMe && (isRead
                        ? <CheckCheck size={13} color="rgba(125,211,252,0.9)" />
                        : <Check size={13} color="rgba(255,255,255,0.6)" />
                      )}
                    </div>
                  </div>
                </div>
              );
            });
          })()}
          <div ref={bottomRef} style={{ height: '4px' }} />
        </div>

        {/* ── INPUT AREA ── */}
        <div style={{
          background: 'rgba(255,255,255,0.92)',
          backdropFilter: 'blur(20px)',
          borderTop: '1px solid rgba(139,92,246,0.1)',
          flexShrink: 0,
        }}>
          {/* Quick replies */}
          {room?.product && (
            <div style={{ padding: '10px 16px 4px', display: 'flex', gap: '8px', overflowX: 'auto' }}
              className="hide-scroll">
              <style>{`.hide-scroll::-webkit-scrollbar{display:none}.hide-scroll{-ms-overflow-style:none;scrollbar-width:none}`}</style>
              {QUICK.map((qr, i) => (
                <button key={i} onClick={() => setText(qr)} style={{
                  whiteSpace: 'nowrap', padding: '7px 14px',
                  background: 'rgba(237,233,254,0.6)',
                  color: '#6D28D9', fontSize: '12px', fontWeight: 700,
                  borderRadius: '999px', border: '1px solid rgba(139,92,246,0.2)',
                  cursor: 'pointer', transition: 'all 0.2s', flexShrink: 0,
                }}>
                  {qr}
                </button>
              ))}
            </div>
          )}

          {/* Input row */}
          <div style={{ padding: '10px 16px 14px', display: 'flex', alignItems: 'flex-end', gap: '10px' }}>
            <div style={{
              flex: 1,
              background: 'rgba(243,244,246,0.8)',
              borderRadius: '20px',
              border: '1.5px solid rgba(139,92,246,0.12)',
              display: 'flex', alignItems: 'center',
              minHeight: '48px', padding: '0 16px',
              transition: 'all 0.2s',
            }}>
              <textarea
                value={text}
                onChange={e => setText(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Ketik pesan..."
                rows={1}
                style={{
                  width: '100%', background: 'transparent', border: 'none', outline: 'none',
                  resize: 'none', fontSize: '15px', fontWeight: 500,
                  color: '#111827', fontFamily: 'inherit', lineHeight: 1.5,
                  padding: '12px 0', maxHeight: '120px',
                }}
              />
            </div>

            <button
              onClick={sendMessage}
              disabled={!text.trim() || sending}
              style={{
                width: '48px', height: '48px', borderRadius: '16px', flexShrink: 0,
                background: text.trim() && !sending
                  ? 'linear-gradient(135deg, #7C3AED, #DB2777)'
                  : 'rgba(229,231,235,0.8)',
                border: 'none', cursor: text.trim() ? 'pointer' : 'not-allowed',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                boxShadow: text.trim() ? '0 4px 16px rgba(124,58,237,0.3)' : 'none',
                transition: 'all 0.2s',
              }}
            >
              <Send size={20} color={text.trim() ? 'white' : '#9CA3AF'} style={{ marginLeft: '2px' }} />
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
