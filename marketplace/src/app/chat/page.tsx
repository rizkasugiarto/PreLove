'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/lib/supabase';
import { formatRelativeTime } from '@/lib/utils';
import { MessageCircle, Search } from 'lucide-react';
import Link from 'next/link';
import toast from 'react-hot-toast';

export default function ChatListPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [rooms, setRooms] = useState<any[]>([]);
  const [fetching, setFetching] = useState(true);
  const [search, setSearch] = useState('');

  const storeId = searchParams.get('storeId');
  const productId = searchParams.get('productId');

  useEffect(() => {
    if (!loading && !user) router.push('/auth/login');
  }, [user, loading]);

  useEffect(() => {
    if (user) {
      if (storeId) {
        handleDirectChat(storeId, productId);
      } else {
        fetchRooms();
      }
    }
  }, [user, storeId, productId]);

  const handleDirectChat = async (sId: string, pId: string | null) => {
    // Cari room yang sudah ada (1 buyer hanya boleh punya 1 room per store)
    const { data: existingRooms } = await supabase
      .from('chat_rooms')
      .select('id')
      .eq('buyer_id', user!.id)
      .eq('store_id', sId)
      .order('created_at', { ascending: false });
    
    if (existingRooms && existingRooms.length > 0) {
      router.replace(`/chat/${existingRooms[0].id}`);
    } else {
      const { data: newRoom, error } = await supabase.from('chat_rooms').insert({
        buyer_id: user!.id,
        store_id: sId,
        product_id: pId || null,
        last_message: '',
        buyer_unread_count: 0,
        seller_unread_count: 0
      }).select().single();
      
      if (newRoom && !error) {
        router.replace(`/chat/${newRoom.id}`);
      } else {
        toast.error('Gagal membuat obrolan baru: ' + (error?.message || 'Unknown error'));
        fetchRooms();
      }
    }
  };

  const fetchRooms = async () => {
    const { data } = await supabase
      .from('chat_rooms')
      .select('*, store:stores(id,name,slug,logo_url), product:products(id,title)')
      .eq('buyer_id', user!.id)
      .order('last_message_at', { ascending: false });
    setRooms(data ?? []);
    setFetching(false);
  };

  const filtered = rooms.filter(r =>
    r.store?.name?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="min-h-screen" style={{ background: 'var(--bg)' }}>
      <div className="max-w-2xl mx-auto py-8 px-4">
        <div className="mb-6">
          <h1 className="section-title flex items-center gap-2 mb-4">
            <MessageCircle className="w-6 h-6 text-violet-600" /> Pesan
          </h1>
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Cari toko..."
              className="input-field pl-11"
            />
          </div>
        </div>

        {fetching ? (
          <div className="space-y-3">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="card p-4 flex gap-4">
                <div className="w-12 h-12 rounded-full skeleton flex-shrink-0" />
                <div className="flex-1 space-y-2">
                  <div className="h-4 skeleton w-1/3" />
                  <div className="h-3 skeleton w-2/3" />
                </div>
              </div>
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-20">
            <div className="w-20 h-20 rounded-full bg-violet-50 flex items-center justify-center mx-auto mb-4">
              <MessageCircle className="w-9 h-9 text-violet-300" />
            </div>
            <h3 className="text-xl font-black mb-2">Belum ada pesan</h3>
            <p style={{ color: 'var(--text-muted)' }} className="mb-6">
              Chat dengan penjual dari halaman produk
            </p>
            <Link href="/" className="btn-primary">Lihat Produk</Link>
          </div>
        ) : (
          <div className="space-y-2">
            {filtered.map(room => (
              <Link
                key={room.id}
                href={`/chat/${room.id}`}
                className="card p-4 flex items-center gap-4 hover:border-violet-200 transition-all"
              >
                {/* Avatar */}
                <div className="w-12 h-12 rounded-full overflow-hidden bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center flex-shrink-0">
                  {room.store?.logo_url ? (
                    <img src={room.store.logo_url} alt={room.store.name} className="w-full h-full object-cover" />
                  ) : (
                    <span className="text-white font-black text-lg">{(room.store?.name ?? 'T')[0]}</span>
                  )}
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <h3 className="font-bold text-sm truncate" style={{ color: 'var(--text)' }}>
                      {room.store?.name}
                    </h3>
                    {room.last_message_at && (
                      <span className="text-xs flex-shrink-0 ml-2" style={{ color: 'var(--text-muted)' }}>
                        {formatRelativeTime(room.last_message_at)}
                      </span>
                    )}
                  </div>
                  <p className="text-sm truncate mt-0.5" style={{ color: 'var(--text-muted)' }}>
                    {room.last_message ?? 'Mulai percakapan...'}
                  </p>
                  {room.product?.title && (
                    <p className="text-xs mt-1 truncate text-violet-500">
                      📦 {room.product.title}
                    </p>
                  )}
                </div>

                {/* Unread badge */}
                {room.buyer_unread_count > 0 && (
                  <div className="w-5 h-5 rounded-full bg-violet-600 text-white text-xs flex items-center justify-center font-bold flex-shrink-0">
                    {room.buyer_unread_count > 9 ? '9+' : room.buyer_unread_count}
                  </div>
                )}
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
