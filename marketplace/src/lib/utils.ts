export function formatPrice(price: number): string {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
  }).format(price);
}

export function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('id-ID', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
}

export function formatRelativeTime(dateStr: string): string {
  const now = new Date();
  const date = new Date(dateStr);
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);
  if (diffInSeconds < 60) return 'Baru saja';
  if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} menit lalu`;
  if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)} jam lalu`;
  if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)} hari lalu`;
  return formatDate(dateStr);
}

export const CONDITIONS: Record<string, { label: string; color: string }> = {
  new: { label: '🌟 Baru', color: 'bg-blue-100 text-blue-700' },
  like_new: { label: '✨ Seperti Baru', color: 'bg-emerald-100 text-emerald-700' },
  good: { label: '👍 Bagus', color: 'bg-amber-100 text-amber-700' },
  fair: { label: '🔆 Cukup Baik', color: 'bg-orange-100 text-orange-700' },
};

export const ORDER_STATUS: Record<string, { label: string; color: string; emoji: string }> = {
  pending: { label: 'Menunggu Konfirmasi', color: 'text-amber-600 bg-amber-50', emoji: '⏳' },
  confirmed: { label: 'Dikonfirmasi', color: 'text-blue-600 bg-blue-50', emoji: '✅' },
  packed: { label: 'Dikemas', color: 'text-indigo-600 bg-indigo-50', emoji: '📦' },
  shipped: { label: 'Dikirim', color: 'text-violet-600 bg-violet-50', emoji: '🚚' },
  delivered: { label: 'Tiba di Tujuan', color: 'text-emerald-600 bg-emerald-50', emoji: '📬' },
  completed: { label: 'Selesai', color: 'text-green-600 bg-green-50', emoji: '🎉' },
  cancelled: { label: 'Dibatalkan', color: 'text-red-600 bg-red-50', emoji: '❌' },
};
