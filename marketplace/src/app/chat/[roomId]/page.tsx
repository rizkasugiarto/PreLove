'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/lib/supabase';
import { formatRelativeTime } from '@/lib/utils';
import { ArrowLeft, Send, Image as ImageIcon, Package, Store, MessageCircle, Check, CheckCheck } from 'lucide-react';
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
    <div className="fixed top-[64px] inset-x-0 bottom-0 z-40 bg-[#F4F4F5] flex justify-center p-0 md:p-6 lg:p-10">
      
      {/* Main Chat Container - Premium Clean Style */}
      <div className="w-full max-w-3xl h-full bg-[#F9FAFB] md:rounded-[32px] md:border border-gray-200 shadow-[0_20px_40px_-15px_rgba(0,0,0,0.05)] flex flex-col overflow-hidden relative mx-auto">
        
        {/* HEADER - Clean & Crisp */}
        <div className="bg-white px-4 py-3 sm:px-6 sm:py-4 flex items-center gap-4 flex-shrink-0 z-20 border-b border-gray-100 shadow-sm relative">
          <button onClick={() => router.back()} className="p-2 -ml-2 rounded-full hover:bg-gray-50 transition-colors">
            <ArrowLeft className="w-5 h-5 text-gray-700" />
          </button>
          
          <div className="relative flex-shrink-0">
            <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full overflow-hidden bg-gray-100 border border-gray-200 flex items-center justify-center">
              {room?.store?.logo_url ? (
                <img src={room.store.logo_url} alt="" className="w-full h-full object-cover" />
              ) : (
                <Store className="w-5 h-5 text-gray-400" />
              )}
            </div>
            {/* Online indicator */}
            <span className="absolute bottom-0 right-0 w-3.5 h-3.5 bg-emerald-500 border-2 border-white rounded-full"></span>
          </div>

          <div className="flex-1 min-w-0">
            <h2 className="font-bold text-[15px] sm:text-[17px] text-gray-900 truncate tracking-tight">
              {room?.store?.name ?? 'Nama Toko'}
            </h2>
            <p className="text-[12px] sm:text-[13px] text-emerald-600 font-medium tracking-wide flex items-center gap-1 mt-0.5">
              Online
            </p>
          </div>
        </div>

        {/* PRODUCT CONTEXT - Centered Minimalist Card */}
        {room?.product && (
          <div className="bg-white/80 backdrop-blur-md border-b border-gray-100 p-3 flex justify-center flex-shrink-0 z-10">
            <div className="w-full max-w-md">
              <Link href={`/products/${room.product.id}`} className="flex items-center gap-3 sm:gap-4 p-2.5 rounded-2xl hover:bg-gray-50 transition-colors group border border-transparent hover:border-gray-200 bg-white shadow-sm">
                <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-xl bg-gray-100 overflow-hidden flex-shrink-0">
                  {room.product.images?.[0]?.image_url ? (
                    <img src={room.product.images[0].image_url} alt="" className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center"><Package className="w-6 h-6 text-gray-300" /></div>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <span className="font-semibold text-[14px] sm:text-[15px] text-gray-900 block truncate group-hover:text-violet-600 transition-colors">
                    {room.product.title}
                  </span>
                  <span className="font-bold text-[14px] text-violet-600 mt-0.5 block">
                    Rp {room.product.price?.toLocaleString('id-ID')}
                  </span>
                </div>
              </Link>
            </div>
          </div>
        )}

        {/* MESSAGES AREA - Subtle Pattern */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6 z-0 relative" style={{ backgroundImage: 'radial-gradient(#E5E7EB 1px, transparent 1px)', backgroundSize: '24px 24px' }}>
          {messages.length === 0 && (
            <div className="text-center py-20 max-w-sm mx-auto">
              <div className="w-20 h-20 bg-white shadow-sm border border-gray-100 rounded-full flex items-center justify-center mx-auto mb-5">
                <MessageCircle className="w-8 h-8 text-violet-500" />
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-2">Pesan Penjual</h3>
              <p className="text-[14px] text-gray-500 leading-relaxed">Punya pertanyaan soal produk ini? Jangan ragu untuk chat penjual sekarang.</p>
            </div>
          )}
          
          {(() => {
            const isBuyer = user?.id === room?.buyer_id;
            let unreadCount = isBuyer ? (room?.seller_unread_count || 0) : (room?.buyer_unread_count || 0);
            const readStatusMap = new Map();
            
            for (let i = messages.length - 1; i >= 0; i--) {
              const msg = messages[i];
              if (msg.sender_id === user?.id) {
                if (unreadCount > 0) {
                  readStatusMap.set(msg.id ?? i, false);
                  unreadCount--;
                } else {
                  readStatusMap.set(msg.id ?? i, true);
                }
              }
            }

            return messages.map((msg, i) => {
              const isMe = msg.sender_id === user?.id;
              const isRead = readStatusMap.get(msg.id ?? i);

              return (
                <div key={msg.id ?? i} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[85%] sm:max-w-[75%] px-4 sm:px-5 py-3 relative ${
                    isMe 
                      ? 'bg-violet-600 text-white rounded-2xl rounded-tr-sm shadow-sm' 
                      : 'bg-white text-gray-800 rounded-2xl rounded-tl-sm shadow-sm border border-gray-100'
                  }`}>
                    <p className="text-[14px] sm:text-[15px] leading-relaxed" style={{ wordBreak: 'break-word' }}>{msg.message}</p>
                    <div className={`text-[11px] mt-1.5 font-medium flex items-center gap-1 justify-end ${isMe ? 'text-violet-200' : 'text-gray-400'}`}>
                      {formatRelativeTime(msg.created_at)}
                      {isMe && (
                        isRead ? (
                          <CheckCheck className="w-4 h-4 text-sky-300" />
                        ) : (
                          <Check className="w-4 h-4 text-violet-300" />
                        )
                      )}
                    </div>
                  </div>
                </div>
              );
            });
          })()}
          <div ref={bottomRef} className="h-4" />
        </div>

        {/* INPUT AREA WITH QUICK REPLIES */}
        <div className="bg-white border-t border-gray-200 flex-shrink-0 z-20 flex flex-col">
          <style dangerouslySetInnerHTML={{__html: `
            .hide-scroll::-webkit-scrollbar { display: none; }
            .hide-scroll { -ms-overflow-style: none; scrollbar-width: none; }
          `}} />
          
          {/* Quick Replies - Centered on Laptop */}
          {room?.product && (
            <div className="px-3 sm:px-4 pt-3 pb-2 flex justify-start md:justify-center gap-2 w-full mx-auto overflow-x-auto hide-scroll">
              {[
                "Hai, barang ini masih ready?",
                "Boleh minta detail foto aslinya?",
                "Apakah harga masih bisa nego?",
                "Apakah ada minus/cacat pada barang?"
              ].map((qr, i) => (
                <button
                  key={i}
                  onClick={() => setText(qr)}
                  className="whitespace-nowrap px-4 py-2 bg-white text-violet-700 text-[13px] font-bold rounded-full border border-violet-200 shadow-sm hover:bg-gradient-to-r hover:from-violet-600 hover:to-purple-600 hover:text-white hover:border-transparent hover:shadow-md active:scale-95 transition-all duration-300 flex-shrink-0"
                >
                  {qr}
                </button>
              ))}
            </div>
          )}

          {/* Actual Input */}
          <div className="p-3 sm:p-4 flex items-end gap-2 sm:gap-3 w-full">
            <div className="flex-1 bg-gray-100 rounded-[24px] border border-transparent focus-within:border-violet-300 focus-within:bg-white focus-within:shadow-[0_0_0_4px_rgba(139,92,246,0.1)] transition-all duration-300 relative flex items-center min-h-[48px]">
              <textarea
                value={text}
                onChange={e => setText(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Ketik pesan..."
                rows={1}
                className="w-full resize-none bg-transparent border-none px-5 py-3 text-[15px] font-medium text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-0 max-h-32 hide-scroll"
                style={{ fontFamily: 'var(--font-sans)', display: 'block' }}
              />
            </div>
            <button
              onClick={sendMessage}
              disabled={!text.trim() || sending}
              className={`w-[48px] h-[48px] rounded-full flex items-center justify-center flex-shrink-0 transition-all duration-300 ${
                text.trim() && !sending 
                  ? 'bg-gradient-to-tr from-violet-600 to-fuchsia-500 text-white hover:shadow-[0_8px_20px_rgba(139,92,246,0.3)] hover:scale-105 active:scale-95' 
                  : 'bg-gray-200 text-gray-400 cursor-not-allowed'
              }`}
            >
              <Send className={`w-[22px] h-[22px] ${text.trim() ? 'ml-0.5' : ''}`} />
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
