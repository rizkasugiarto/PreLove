'use client';

import { useEffect, useState, use } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/context/AuthContext';
import toast from 'react-hot-toast';
import { Star, ArrowLeft, Send, CheckCircle2, MessageSquare } from 'lucide-react';
import Link from 'next/link';
import LogoLoader from '@/components/LogoLoader';

const QUICK_REPLIES = [
  'Kualitas barang sangat bagus! ✨',
  'Sesuai dengan deskripsi 👍',
  'Pengiriman sangat cepat 🚀',
  'Penjual ramah dan responsif 😊',
  'Barang mulus seperti baru 💯',
  'Harga sangat terjangkau 💸'
];

export default function ReviewPage({ params }: { params: Promise<{ id: string }> }) {
  // Extract id from params Promise (Next.js 15+ standard for dynamic params)
  const resolvedParams = use(params);
  const orderId = resolvedParams.id;
  
  const { user } = useAuth();
  const router = useRouter();
  const [order, setOrder] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  
  // State to hold review data for each order item
  // key: order_item_id, value: { rating, comment }
  const [reviews, setReviews] = useState<Record<string, { rating: number, comment: string }>>({});

  useEffect(() => {
    if (!user) {
      router.push('/auth/login');
      return;
    }
    fetchOrderDetails();
  }, [user, orderId]);

  const fetchOrderDetails = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('orders')
      .select('*, store:stores(name), items:order_items(id, product_id, price, product_snapshot)')
      .eq('id', orderId)
      .eq('buyer_id', user!.id)
      .single();

    if (error || !data) {
      toast.error('Pesanan tidak ditemukan');
      router.push('/orders');
      return;
    }

    if (data.status === 'completed') {
      toast.error('Pesanan ini sudah diulas');
      router.push('/orders');
      return;
    }

    setOrder(data);
    
    // Initialize review state
    const initialReviews: Record<string, { rating: number, comment: string }> = {};
    data.items.forEach((item: any) => {
      initialReviews[item.id] = { rating: 5, comment: '' }; // Default 5 stars
    });
    setReviews(initialReviews);
    setLoading(false);
  };

  const handleRatingChange = (itemId: string, rating: number) => {
    setReviews(prev => ({ ...prev, [itemId]: { ...prev[itemId], rating } }));
  };

  const handleCommentChange = (itemId: string, comment: string) => {
    setReviews(prev => ({ ...prev, [itemId]: { ...prev[itemId], comment } }));
  };

  const handleQuickReply = (itemId: string, reply: string) => {
    setReviews(prev => {
      const currentComment = prev[itemId].comment;
      const newComment = currentComment ? `${currentComment} ${reply}` : reply;
      return { ...prev, [itemId]: { ...prev[itemId], comment: newComment } };
    });
  };

  const handleSubmit = async () => {
    if (!user || !order) return;
    setSubmitting(true);

    try {
      // 1. Prepare review rows
      const reviewRows = order.items.map((item: any) => ({
        order_id: order.id,
        order_item_id: item.id,
        product_id: item.product_id,
        store_id: order.store_id,
        reviewer_id: user.id,
        rating: reviews[item.id].rating,
        comment: reviews[item.id].comment.trim(),
      }));

      // 2. Insert into reviews table
      const { error: reviewError } = await supabase.from('reviews').insert(reviewRows);
      if (reviewError) throw reviewError;

      // 3. Update order status to completed
      const { error: orderError } = await supabase
        .from('orders')
        .update({ status: 'completed' })
        .eq('id', order.id);
      if (orderError) throw orderError;

      toast.success('Terima kasih! Ulasan berhasil dikirim 🎉');
      router.push('/orders');
      router.refresh();
      
    } catch (error: any) {
      console.error('Submit review error:', error);
      toast.error('Gagal mengirim ulasan. Coba lagi.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <LogoLoader text="Memuat Form Ulasan..." />;

  return (
    <div style={{ minHeight: '100vh', background: 'radial-gradient(ellipse at top left, #EDE9FE 0%, #F5F3FF 40%, #EFF6FF 100%)', color: '#111827', paddingBottom: '128px', paddingTop: '112px', position: 'relative' }}>
      {/* Aurora Blobs */}
      <div className="absolute top-0 left-0 w-full h-[500px] overflow-hidden pointer-events-none">
        <div className="absolute -top-[20%] -left-[10%] w-[50%] h-[80%] rounded-full blur-[120px] bg-purple-300/40 mix-blend-multiply" />
        <div className="absolute top-[10%] -right-[10%] w-[40%] h-[60%] rounded-full blur-[100px] bg-emerald-200/40 mix-blend-multiply" />
      </div>

      <div style={{ maxWidth: '768px', margin: '0 auto', position: 'relative', zIndex: 10, padding: '0 16px' }}>
        
        {/* Header */}
        <Link href="/orders" style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', color: '#6B7280', textDecoration: 'none', fontWeight: 700, marginBottom: '24px', fontSize: '15px' }} className="hover:text-purple-600 transition-colors">
          <ArrowLeft size={18} /> Kembali ke Pesanan
        </Link>
        
        <div style={{
          background: 'rgba(255,255,255,0.88)', backdropFilter: 'blur(24px)', WebkitBackdropFilter: 'blur(24px)',
          borderRadius: '24px', border: '1px solid rgba(255,255,255,0.9)',
          boxShadow: '0 12px 32px rgba(124,58,237,0.06), 0 4px 12px rgba(0,0,0,0.02)',
          padding: '24px', marginBottom: '24px',
          display: 'flex', alignItems: 'center', gap: '20px'
        }}>
          <div style={{ width: '60px', height: '60px', borderRadius: '16px', background: 'linear-gradient(135deg, #F59E0B, #D97706)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, boxShadow: '0 8px 16px rgba(245,158,11,0.2)' }}>
            <MessageSquare size={28} color="white" />
          </div>
          <div>
            <h1 style={{ fontSize: '22px', fontWeight: 900, margin: '0 0 4px 0', letterSpacing: '-0.5px' }}>Beri Ulasan</h1>
            <p style={{ fontSize: '14px', color: '#6B7280', margin: 0 }}>Bagikan pengalaman belanja kamu di <strong className="text-purple-700">{order?.store?.name}</strong></p>
          </div>
        </div>

        {/* Review Items */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          {order?.items.map((item: any) => {
            const snapshot = item.product_snapshot;
            const img = snapshot?.images?.find((i: any) => i.is_primary)?.image_url ?? snapshot?.images?.[0]?.image_url;
            const reviewState = reviews[item.id] || { rating: 5, comment: '' };

            return (
              <div key={item.id} style={{
                background: 'rgba(255,255,255,0.85)', backdropFilter: 'blur(24px)',
                borderRadius: '24px', border: '1px solid rgba(255,255,255,1)',
                boxShadow: '0 4px 12px rgba(124,58,237,0.03)', overflow: 'hidden', padding: '24px'
              }}>
                {/* Product Info */}
                <div style={{ display: 'flex', gap: '16px', alignItems: 'center', marginBottom: '24px', paddingBottom: '20px', borderBottom: '1px dashed rgba(0,0,0,0.1)' }}>
                  <div className="w-[72px] h-[72px] rounded-[16px] bg-[#F3F4F6] overflow-hidden shrink-0 border border-black/5 shadow-sm">
                    {img ? <img src={img} alt="" className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center text-[24px]">📦</div>}
                  </div>
                  <div>
                    <h3 style={{ fontWeight: 800, color: '#1F2937', fontSize: '16px', margin: '0 0 4px 0' }}>{snapshot?.title ?? 'Produk Preloved'}</h3>
                    <p style={{ fontSize: '14px', color: '#6B7280', margin: 0 }}>Varian/Kondisi: {snapshot?.condition === 'like_new' ? 'Seperti Baru' : snapshot?.condition === 'good' ? 'Baik' : snapshot?.condition === 'fair' ? 'Cukup' : 'Baru'}</p>
                  </div>
                </div>

                {/* Rating Input */}
                <div style={{ marginBottom: '24px', textAlign: 'center' }}>
                  <p style={{ fontWeight: 800, fontSize: '15px', color: '#374151', marginBottom: '12px' }}>Bagaimana kualitas produk ini?</p>
                  <div style={{ display: 'flex', justifyContent: 'center', gap: '8px' }}>
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        type="button"
                        onClick={() => handleRatingChange(item.id, star)}
                        className={`transition-all duration-200 hover:scale-110 active:scale-95`}
                        style={{ background: 'transparent', border: 'none', cursor: 'pointer', padding: '4px' }}
                      >
                        <Star
                          size={40}
                          fill={star <= reviewState.rating ? '#F59E0B' : 'transparent'}
                          color={star <= reviewState.rating ? '#F59E0B' : '#D1D5DB'}
                          style={{ filter: star <= reviewState.rating ? 'drop-shadow(0 4px 6px rgba(245,158,11,0.3))' : 'none' }}
                        />
                      </button>
                    ))}
                  </div>
                  <p style={{ fontSize: '14px', fontWeight: 700, color: '#F59E0B', marginTop: '12px' }}>
                    {reviewState.rating === 5 ? 'Sangat Baik! 😍' : reviewState.rating === 4 ? 'Baik 🙂' : reviewState.rating === 3 ? 'Cukup 😐' : reviewState.rating === 2 ? 'Kurang Baik 😕' : 'Sangat Buruk 😞'}
                  </p>
                </div>

                {/* Quick Replies */}
                <div style={{ marginBottom: '16px' }}>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                    {QUICK_REPLIES.map((reply, idx) => (
                      <button
                        key={idx}
                        onClick={() => handleQuickReply(item.id, reply)}
                        className="hover:bg-purple-100 transition-colors"
                        style={{
                          background: 'rgba(243,244,246,0.8)', border: '1px solid rgba(229,231,235,1)',
                          padding: '8px 16px', borderRadius: '999px', fontSize: '13px', fontWeight: 600, color: '#4B5563',
                          cursor: 'pointer'
                        }}
                      >
                        {reply}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Comment Textarea */}
                <div>
                  <textarea
                    value={reviewState.comment}
                    onChange={(e) => handleCommentChange(item.id, e.target.value)}
                    placeholder="Ceritakan pengalamanmu tentang produk ini..."
                    style={{
                      width: '100%', minHeight: '120px', padding: '16px',
                      background: 'rgba(249,250,251,0.5)', border: '1px solid rgba(209,213,219,1)', borderRadius: '16px',
                      fontSize: '15px', color: '#1F2937', resize: 'vertical', outline: 'none',
                      transition: 'border-color 0.2s, box-shadow 0.2s'
                    }}
                    className="focus:border-purple-500 focus:ring-4 focus:ring-purple-500/10"
                  />
                </div>
              </div>
            );
          })}
        </div>

        {/* Submit Button */}
        <div style={{ marginTop: '32px', display: 'flex', justifyContent: 'flex-end' }}>
          <button
            onClick={handleSubmit}
            disabled={submitting}
            style={{
              padding: '16px 32px', background: 'linear-gradient(135deg, #8B5CF6, #6D28D9)', color: 'white',
              fontSize: '16px', fontWeight: 800, borderRadius: '999px', border: 'none', cursor: submitting ? 'not-allowed' : 'pointer',
              boxShadow: '0 8px 24px rgba(109,40,217,0.3)', display: 'flex', alignItems: 'center', gap: '12px',
              opacity: submitting ? 0.7 : 1, transition: 'transform 0.2s, box-shadow 0.2s'
            }}
            onMouseOver={(e) => { if(!submitting) { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 12px 32px rgba(109,40,217,0.4)'; } }}
            onMouseOut={(e) => { if(!submitting) { e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = '0 8px 24px rgba(109,40,217,0.3)'; } }}
          >
            {submitting ? 'Mengirim...' : 'Kirim Ulasan'} <Send size={18} />
          </button>
        </div>

      </div>
    </div>
  );
}
