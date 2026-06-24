'use client';

import { useParams, useRouter } from 'next/navigation';
import { ArrowLeft, ShieldCheck, FileText, Heart, Globe, Users, Briefcase, Zap } from 'lucide-react';
import Link from 'next/link';

const INFO_PAGES: Record<string, { title: string; icon: any; content: React.ReactNode }> = {
  'about': {
    title: 'Tentang PreLove',
    icon: Heart,
    content: (
      <div className="space-y-6">
        <p className="text-lg leading-relaxed text-gray-700">
          PreLove adalah platform marketplace eksklusif yang dirancang khusus untuk mahasiswa. Kami percaya bahwa setiap barang memiliki cerita dan berhak mendapatkan kesempatan kedua.
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-8">
          <div className="bg-purple-50 p-6 rounded-2xl border border-purple-100">
            <h3 className="font-bold text-purple-900 mb-2">Visi Kami</h3>
            <p className="text-purple-700 text-sm">Menjadi ekosistem sirkular ekonomi terbesar di lingkungan kampus seluruh Indonesia.</p>
          </div>
          <div className="bg-emerald-50 p-6 rounded-2xl border border-emerald-100">
            <h3 className="font-bold text-emerald-900 mb-2">Misi Kami</h3>
            <p className="text-emerald-700 text-sm">Mempermudah mahasiswa dalam mencari barang terjangkau berkualitas sekaligus mengurangi limbah.</p>
          </div>
        </div>
      </div>
    )
  },
  'hki': {
    title: 'Hak Kekayaan Intelektual',
    icon: ShieldCheck,
    content: (
      <div className="space-y-4 text-gray-700 leading-relaxed">
        <p>PreLove sangat menghargai Hak Kekayaan Intelektual (HKI). Kami berkomitmen untuk melindungi hak cipta, merek dagang, dan paten dari semua pihak.</p>
        <h3 className="font-bold text-lg text-gray-900 mt-6">Pelanggaran HKI</h3>
        <p>Jika Anda menemukan barang replika, bajakan, atau barang yang melanggar hak cipta Anda dijual di platform kami, Anda dapat melaporkannya ke tim PreLove Care. Kami akan memproses laporan Anda dalam waktu maksimal 2x24 jam dan mengambil tindakan tegas berupa penghapusan produk atau penutupan toko pelaku.</p>
      </div>
    )
  },
  'karir': {
    title: 'Karir di PreLove',
    icon: Briefcase,
    content: (
      <div className="text-center py-12">
        <div className="w-24 h-24 bg-gradient-to-br from-violet-400 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-6 text-white">
          <Zap size={40} />
        </div>
        <h2 className="text-2xl font-black text-gray-900 mb-4">Mari Tumbuh Bersama!</h2>
        <p className="text-gray-600 mb-8 max-w-md mx-auto">Kami sedang membangun tim impian untuk merevolusi gaya hidup sirkular. Saat ini belum ada posisi yang terbuka, tapi kami akan segera membukanya!</p>
        <button className="bg-gray-100 text-gray-400 font-bold px-8 py-3 rounded-xl cursor-not-allowed">Belum Ada Lowongan</button>
      </div>
    )
  },
  'blog': {
    title: 'Blog & Insight',
    icon: FileText,
    content: (
      <div className="space-y-6">
        <p className="text-gray-600">Dapatkan tips dan trik terbaru seputar gaya hidup hemat ala mahasiswa dan tren preloved terkini.</p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="border border-gray-100 rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-shadow">
              <div className="h-40 bg-gray-100 animate-pulse" />
              <div className="p-4">
                <div className="h-4 w-1/3 bg-gray-200 rounded mb-2 animate-pulse" />
                <div className="h-6 w-full bg-gray-200 rounded animate-pulse" />
              </div>
            </div>
          ))}
        </div>
        <p className="text-center text-sm text-gray-400 mt-8 italic">Artikel akan segera tersedia.</p>
      </div>
    )
  },
  'sustainability': {
    title: 'Dampak Lingkungan',
    icon: Globe,
    content: (
      <div className="space-y-6 text-gray-700 leading-relaxed">
        <div className="bg-gradient-to-r from-emerald-500 to-teal-600 rounded-3xl p-8 text-white shadow-lg shadow-emerald-500/20">
          <h2 className="text-2xl font-black mb-4">Satu Barang Preloved = Satu Kebaikan untuk Bumi</h2>
          <p className="opacity-90">Dengan membeli dan menjual barang preloved di platform ini, kamu secara langsung telah membantu mengurangi emisi karbon, menghemat air, dan mengurangi tumpukan sampah di TPA.</p>
        </div>
        <h3 className="font-bold text-xl text-gray-900 mt-8 mb-4">Laporan Dampak 2026</h3>
        <ul className="list-disc pl-6 space-y-2">
          <li>Lebih dari <strong>10.000 potong pakaian</strong> terhindar dari pembuangan.</li>
          <li>Menghemat setara dengan <strong>5 juta liter air</strong> bersih.</li>
          <li>Mengurangi jejak karbon sebanyak <strong>20 ton CO2</strong>.</li>
        </ul>
      </div>
    )
  },
  'care': {
    title: 'PreLove Care (Bantuan)',
    icon: Users,
    content: (
      <div className="space-y-6 text-gray-700">
        <p>Pusat bantuan 24/7 untuk menyelesaikan masalah transaksimu.</p>
        <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm">
          <h3 className="font-bold text-gray-900 mb-4 text-lg">Hubungi Kami</h3>
          <div className="space-y-4">
            <div className="flex items-center gap-4 bg-gray-50 p-4 rounded-xl">
              <span className="text-2xl">📧</span>
              <div>
                <p className="text-sm font-bold text-gray-900">Email Support</p>
                <p className="text-sm text-purple-600">support@prelove.test</p>
              </div>
            </div>
            <div className="flex items-center gap-4 bg-gray-50 p-4 rounded-xl">
              <span className="text-2xl">📱</span>
              <div>
                <p className="text-sm font-bold text-gray-900">WhatsApp (Chat Only)</p>
                <p className="text-sm text-purple-600">+62 811-2233-4455</p>
              </div>
            </div>
          </div>
        </div>
        <p className="text-sm text-gray-500 text-center mt-6">Waktu operasional CS: Senin - Jumat (09:00 - 18:00 WIB)</p>
      </div>
    )
  },
  'terms': {
    title: 'Syarat dan Ketentuan',
    icon: FileText,
    content: (
      <div className="space-y-4 text-gray-700 leading-relaxed text-sm">
        <p>Terakhir diperbarui: 24 Juni 2026</p>
        <h3 className="font-bold text-gray-900 mt-6 text-lg">1. Penggunaan Layanan</h3>
        <p>Pengguna diwajibkan untuk menggunakan data asli dan tidak menyalahgunakan platform untuk tindakan penipuan atau pencucian uang.</p>
        <h3 className="font-bold text-gray-900 mt-4 text-lg">2. Transaksi & Pembayaran</h3>
        <p>Semua transaksi yang dilakukan melalui sistem otomatis PreLove dilindungi. Transaksi di luar platform (transfer langsung ke penjual tanpa lewat sistem PreLove) bukan menjadi tanggung jawab kami.</p>
        <h3 className="font-bold text-gray-900 mt-4 text-lg">3. Pengembalian Dana</h3>
        <p>Pengembalian dana (refund) hanya dapat dilakukan jika penjual membatalkan pesanan atau barang terbukti bermasalah saat tiba dengan menyertakan video unboxing.</p>
      </div>
    )
  },
  'privacy': {
    title: 'Kebijakan Privasi',
    icon: ShieldCheck,
    content: (
      <div className="space-y-4 text-gray-700 leading-relaxed text-sm">
        <p>Keamanan data kamu adalah prioritas mutlak kami.</p>
        <h3 className="font-bold text-gray-900 mt-6 text-lg">Pengumpulan Data</h3>
        <p>Kami mengumpulkan data seperti Nama, Alamat, Email, dan Nomor Telepon semata-mata untuk keperluan pengiriman barang dan verifikasi keamanan akun.</p>
        <h3 className="font-bold text-gray-900 mt-4 text-lg">Penggunaan Data</h3>
        <p>Data kamu tidak akan pernah kami jual kepada pihak ketiga. Penggunaan data ke pihak logistik hanya sebatas label pengiriman resi kurir.</p>
        <h3 className="font-bold text-gray-900 mt-4 text-lg">Enkripsi</h3>
        <p>Sistem kami dilengkapi dengan protokol keamanan PCI DSS untuk memastikan transaksi kartu/bank yang kamu lakukan terenkripsi secara aman (End-to-End Encryption).</p>
      </div>
    )
  }
};

export default function InfoPage() {
  const { slug } = useParams<{ slug: string }>();
  const router = useRouter();
  
  const pageData = INFO_PAGES[slug] || {
    title: 'Halaman Tidak Ditemukan',
    icon: FileText,
    content: <div className="text-center py-20 text-gray-500">Maaf, halaman yang kamu cari tidak tersedia atau sedang dalam perbaikan.</div>
  };

  const Icon = pageData.icon;

  return (
    <div className="min-h-screen bg-[#FAFAFA] relative overflow-hidden text-gray-900">
      {/* Background Ornaments */}
      <div className="absolute top-0 left-0 w-full h-[600px] overflow-hidden pointer-events-none">
        <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[70%] rounded-full blur-[100px] bg-purple-200/50 mix-blend-multiply" />
        <div className="absolute top-[10%] right-[-10%] w-[40%] h-[60%] rounded-full blur-[120px] bg-emerald-200/40 mix-blend-multiply" />
      </div>

      <div className="relative z-10 max-w-3xl mx-auto px-6 py-12 md:py-20">
        <button 
          onClick={() => router.back()}
          className="flex items-center gap-2 text-sm font-bold text-gray-500 hover:text-purple-600 transition-colors mb-8 bg-white/50 backdrop-blur-md py-2 px-4 rounded-xl border border-white/40 shadow-sm w-fit"
        >
          <ArrowLeft size={16} /> Kembali
        </button>

        <div className="bg-white/80 backdrop-blur-2xl border border-white/60 shadow-[0_20px_60px_-15px_rgba(0,0,0,0.05)] rounded-[32px] overflow-hidden">
          {/* Page Header */}
          <div className="bg-gradient-to-br from-purple-50 to-white px-8 py-10 md:px-12 md:py-14 border-b border-purple-100/50">
            <div className="w-16 h-16 bg-white shadow-xl shadow-purple-500/10 rounded-2xl flex items-center justify-center mb-6">
              <Icon size={32} className="text-purple-600" />
            </div>
            <h1 className="text-3xl md:text-4xl font-black text-gray-900 tracking-tight">{pageData.title}</h1>
          </div>

          {/* Page Content */}
          <div className="px-8 py-10 md:px-12 md:py-12">
            {pageData.content}
          </div>
        </div>

      </div>
    </div>
  );
}
