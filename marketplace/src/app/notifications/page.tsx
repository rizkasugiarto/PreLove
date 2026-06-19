'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/lib/supabase';
import { formatRelativeTime } from '@/lib/utils';
import { Bell, ArrowLeft, Package, CheckCircle, Info } from 'lucide-react';
import Link from 'next/link';

export default function NotificationsPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  
  const [notifications, setNotifications] = useState<any[]>([]);
  const [fetching, setFetching] = useState(true);

  useEffect(() => {
    if (!loading && !user) router.push('/auth/login');
  }, [user, loading]);

  useEffect(() => {
    if (user) {
      fetchNotifications();
      markAllAsRead();
    }
  }, [user]);

  const fetchNotifications = async () => {
    const { data } = await supabase
      .from('notifications')
      .select('*')
      .eq('user_id', user!.id)
      .order('created_at', { ascending: false });
    
    setNotifications(data ?? []);
    setFetching(false);
  };

  const markAllAsRead = async () => {
    await supabase
      .from('notifications')
      .update({ is_read: true })
      .eq('user_id', user!.id)
      .eq('is_read', false);
  };

  const getIcon = (type: string) => {
    switch (type) {
      case 'order_update': return <Package className="w-5 h-5 text-violet-600" />;
      case 'system': return <Info className="w-5 h-5 text-blue-600" />;
      case 'promo': return <Bell className="w-5 h-5 text-amber-500" />;
      default: return <CheckCircle className="w-5 h-5 text-emerald-500" />;
    }
  };

  if (fetching) return (
     <div className="min-h-screen flex items-center justify-center" style={{ background: 'var(--bg)' }}>
        <div className="w-12 h-12 rounded-full border-4 border-violet-200 border-t-violet-600 animate-spin" />
     </div>
  );

  return (
    <div className="min-h-screen" style={{ background: 'var(--bg)' }}>
      <div className="max-w-2xl mx-auto py-8 px-4">
        
        {/* Header */}
        <div className="flex items-center gap-4 mb-6">
          <Link href="/" className="p-2 rounded-xl hover:bg-white border border-transparent hover:border-gray-200 transition-all">
            <ArrowLeft className="w-5 h-5 text-gray-600" />
          </Link>
          <div>
            <h1 className="text-xl font-black flex items-center gap-2">
               <Bell className="w-5 h-5 text-violet-600" /> Notifikasi
            </h1>
          </div>
        </div>

        {/* Notifications List */}
        <div className="space-y-3">
          {notifications.length === 0 ? (
            <div className="text-center py-20 card">
              <div className="w-20 h-20 rounded-full bg-violet-50 flex items-center justify-center mx-auto mb-4">
                <Bell className="w-10 h-10 text-violet-300" />
              </div>
              <h3 className="text-lg font-bold mb-2">Belum ada notifikasi</h3>
              <p className="text-gray-500 text-sm">Pemberitahuan transaksi dan promo akan muncul di sini.</p>
            </div>
          ) : (
            notifications.map(notif => (
              <div 
                key={notif.id} 
                className={`card p-4 flex gap-4 transition-all ${!notif.is_read ? 'bg-violet-50/50 border-violet-100' : ''}`}
              >
                <div className="w-10 h-10 rounded-full bg-white border border-gray-100 flex flex-shrink-0 items-center justify-center">
                   {getIcon(notif.type)}
                </div>
                <div className="flex-1">
                  <div className="flex justify-between items-start mb-1">
                    <h4 className="font-bold text-sm text-gray-900">{notif.title}</h4>
                    <span className="text-xs text-gray-400 whitespace-nowrap ml-2">
                      {formatRelativeTime(notif.created_at)}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600">{notif.body}</p>
                </div>
              </div>
            ))
          )}
        </div>

      </div>
    </div>
  );
}
