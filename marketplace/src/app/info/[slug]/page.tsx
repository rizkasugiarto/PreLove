'use client';

import { useParams, useRouter } from 'next/navigation';
import BackButton from '@/components/BackButton';
import { ArrowLeft, ShieldCheck, FileText, Heart, Globe, Users, Briefcase, Zap, Mail, Phone, CheckCircle2 } from 'lucide-react';

const BG = 'radial-gradient(ellipse at top left, #EDE9FE 0%, #F5F3FF 40%, #EFF6FF 100%)';

const card = {
  background: 'rgba(255,255,255,0.85)',
  backdropFilter: 'blur(24px)',
  WebkitBackdropFilter: 'blur(24px)',
  borderRadius: '24px',
  border: '1px solid rgba(255,255,255,0.9)',
  boxShadow: '0 12px 32px rgba(124,58,237,0.06)',
  padding: '32px',
  marginBottom: '20px',
} as React.CSSProperties;

const h2s = { fontSize: '16px', fontWeight: 900, color: '#111827', margin: '24px 0 8px' } as React.CSSProperties;
const ps  = { fontSize: '14px', color: '#4B5563', lineHeight: 1.8, margin: '0 0 8px' } as React.CSSProperties;

const PAGES: Record<string, { title: string; emoji: string; icon: any; content: React.ReactNode }> = {
  about: {
    title: 'Tentang PreLove', emoji: '💜', icon: Heart,
    content: (
      <>
        <div style={card}>
          <p style={{ ...ps, fontSize: '16px' }}>
            PreLove adalah platform marketplace eksklusif yang dirancang khusus untuk mahasiswa Indonesia.
            Kami percaya setiap barang punya cerita dan berhak dapat kesempatan kedua.
          </p>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px', marginBottom: '20px' }}>
          {[
            { label: 'Visi', color: '#F5F3FF', border: '#DDD6FE', text: '#5B21B6', desc: 'Menjadi ekosistem sirkular ekonomi terbesar di lingkungan kampus seluruh Indonesia.' },
            { label: 'Misi', color: '#ECFDF5', border: '#A7F3D0', text: '#065F46', desc: 'Mempermudah mahasiswa mencari barang berkualitas terjangkau sambil mengurangi limbah.' },
          ].map(v => (
            <div key={v.label} style={{ background: v.color, border: `1px solid ${v.border}`, borderRadius: '20px', padding: '24px' }}>
              <h3 style={{ fontWeight: 900, color: v.text, marginBottom: '8px' }}>{v.label} Kami</h3>
              <p style={{ fontSize: '14px', color: v.text, opacity: 0.8, margin: 0 }}>{v.desc}</p>
            </div>
          ))}
        </div>
        <div style={card}>
          <h2 style={h2s}>Mengapa PreLove?</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginTop: '12px' }}>
            {['Harga lebih terjangkau dari barang baru', 'Komunitas penjual terverifikasi mahasiswa', 'Sistem pembayaran aman & terproteksi', 'Ramah lingkungan — kurangi limbah pakaian'].map(t => (
              <div key={t} style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <CheckCircle2 size={18} color="#7C3AED" />
                <span style={{ fontSize: '14px', color: '#374151', fontWeight: 600 }}>{t}</span>
              </div>
            ))}
          </div>
        </div>
      </>
    ),
  },
  hki: {
    title: 'Hak Kekayaan Intelektual', emoji: '⚖️', icon: ShieldCheck,
    content: (
      <>
        <div style={card}>
          <p style={ps}>PreLove sangat menghargai Hak Kekayaan Intelektual (HKI). Kami berkomitmen melindungi hak cipta, merek dagang, dan paten semua pihak.</p>
          <h2 style={h2s}>Pelanggaran HKI</h2>
          <p style={ps}>Jika Anda menemukan barang replika/bajakan atau barang yang melanggar hak cipta Anda di platform kami, laporkan ke PreLove Care. Kami akan memproses dalam 2×24 jam dan mengambil tindakan tegas.</p>
          <h2 style={h2s}>Merek Dagang PreLove</h2>
          <p style={ps}>Nama "PreLove", logo, dan semua aset visual platform ini merupakan kekayaan intelektual PT. PreLove Indonesia dan dilindungi hukum yang berlaku di Indonesia.</p>
        </div>
        <div style={{ ...card, background: 'linear-gradient(135deg, #FEF3C7, #FFFBEB)', border: '1px solid #FDE68A' }}>
          <p style={{ fontSize: '14px', color: '#92400E', fontWeight: 600, margin: 0 }}>
            📬 Laporan HKI: <span style={{ color: '#7C3AED' }}>hki@prelove.test</span>
          </p>
        </div>
      </>
    ),
  },
  karir: {
    title: 'Karir di PreLove', emoji: '🚀', icon: Briefcase,
    content: (
      <>
        <div style={{ ...card, textAlign: 'center', padding: '48px 32px' }}>
          <div style={{ width: '80px', height: '80px', borderRadius: '24px', background: 'linear-gradient(135deg, #7C3AED, #DB2777)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px', boxShadow: '0 16px 32px rgba(124,58,237,0.3)' }}>
            <Zap size={36} color="white" />
          </div>
          <h2 style={{ fontSize: '22px', fontWeight: 900, color: '#111827', marginBottom: '12px' }}>Mari Tumbuh Bersama!</h2>
          <p style={{ ...ps, maxWidth: '480px', margin: '0 auto 24px' }}>Kami membangun tim impian untuk merevolusi gaya hidup sirkular di Indonesia. Daftarkan dirimu dan jadilah bagian dari perubahan!</p>
          <div style={{ display: 'inline-block', background: '#F3F4F6', color: '#9CA3AF', fontWeight: 700, padding: '12px 28px', borderRadius: '14px', fontSize: '14px' }}>
            Belum Ada Lowongan Tersedia
          </div>
        </div>
        <div style={card}>
          <h2 style={{ ...h2s, marginTop: 0 }}>Posisi yang Biasanya Dibuka</h2>
          {['Frontend Engineer (React/Next.js)', 'UI/UX Designer', 'Product Manager', 'Digital Marketing', 'Business Development'].map(p => (
            <div key={p} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 0', borderBottom: '1px dashed #F3F4F6' }}>
              <span style={{ fontSize: '14px', fontWeight: 600, color: '#374151' }}>{p}</span>
              <span style={{ fontSize: '12px', background: '#F3F4F6', color: '#9CA3AF', padding: '4px 10px', borderRadius: '8px', fontWeight: 700 }}>Soon</span>
            </div>
          ))}
        </div>
      </>
    ),
  },
  blog: {
    title: 'Blog & Insight', emoji: '📝', icon: FileText,
    content: (
      <>
        <div style={card}>
          <p style={ps}>Tips dan trik seputar gaya hidup hemat mahasiswa dan tren preloved terkini. Konten lengkap segera hadir!</p>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '16px' }}>
          {[
            { tag: 'Tips', title: '5 Cara Jual Baju Bekas Cepat Laku', date: 'Coming Soon' },
            { tag: 'Lifestyle', title: 'Tren Thrifting 2026 yang Wajib Kamu Tahu', date: 'Coming Soon' },
            { tag: 'Keuangan', title: 'Hemat 50% Belanja dengan Preloved', date: 'Coming Soon' },
            { tag: 'Sustainability', title: 'Kenapa Preloved itu Keren?', date: 'Coming Soon' },
          ].map(b => (
            <div key={b.title} style={{ ...card, marginBottom: 0, cursor: 'not-allowed', opacity: 0.7 }}>
              <div style={{ height: '120px', background: 'linear-gradient(135deg, #EDE9FE, #FCE7F3)', borderRadius: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '16px', fontSize: '32px' }}>📖</div>
              <span style={{ fontSize: '11px', background: '#EDE9FE', color: '#7C3AED', padding: '3px 10px', borderRadius: '999px', fontWeight: 800 }}>{b.tag}</span>
              <h3 style={{ fontSize: '15px', fontWeight: 800, color: '#111827', margin: '10px 0 6px' }}>{b.title}</h3>
              <p style={{ fontSize: '12px', color: '#9CA3AF', margin: 0 }}>{b.date}</p>
            </div>
          ))}
        </div>
      </>
    ),
  },
  sustainability: {
    title: 'Dampak Lingkungan', emoji: '🌱', icon: Globe,
    content: (
      <>
        <div style={{ background: 'linear-gradient(135deg, #059669, #0D9488)', borderRadius: '24px', padding: '32px', marginBottom: '20px', color: 'white' }}>
          <div style={{ fontSize: '40px', marginBottom: '12px' }}>🌍</div>
          <h2 style={{ fontSize: '20px', fontWeight: 900, marginBottom: '10px' }}>Satu Barang Preloved = Satu Kebaikan untuk Bumi</h2>
          <p style={{ fontSize: '14px', opacity: 0.9, lineHeight: 1.7, margin: 0 }}>Dengan membeli & menjual di PreLove, kamu langsung membantu mengurangi emisi karbon dan sampah tekstil.</p>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '16px', marginBottom: '20px' }}>
          {[{ val: '10.000+', label: 'Pakaian terselamatkan' }, { val: '5 Juta L', label: 'Air bersih dihemat' }, { val: '20 ton', label: 'CO₂ dikurangi' }].map(s => (
            <div key={s.label} style={{ ...card, textAlign: 'center', marginBottom: 0, padding: '24px 16px' }}>
              <div style={{ fontSize: '24px', fontWeight: 900, color: '#059669', marginBottom: '6px' }}>{s.val}</div>
              <div style={{ fontSize: '13px', color: '#6B7280', fontWeight: 600 }}>{s.label}</div>
            </div>
          ))}
        </div>
        <div style={card}>
          <h2 style={{ ...h2s, marginTop: 0 }}>Komitmen Kami</h2>
          {['Kemasan pengiriman ramah lingkungan', 'Mendorong ekonomi sirkular di kampus', 'Edukasi gaya hidup berkelanjutan'].map(t => (
            <div key={t} style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '10px 0' }}>
              <CheckCircle2 size={16} color="#059669" />
              <span style={{ fontSize: '14px', color: '#374151' }}>{t}</span>
            </div>
          ))}
        </div>
      </>
    ),
  },
  care: {
    title: 'PreLove Care', emoji: '💬', icon: Users,
    content: (
      <>
        <div style={card}>
          <h2 style={{ ...h2s, marginTop: 0 }}>Pusat Bantuan 24/7</h2>
          <p style={ps}>Tim PreLove Care siap membantu menyelesaikan semua masalah transaksimu kapan saja.</p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginTop: '16px' }}>
            {[
              { icon: '📧', label: 'Email Support', val: 'support@prelove.test' },
              { icon: '📱', label: 'WhatsApp (Chat Only)', val: '+62 811-2233-4455' },
              { icon: '⏰', label: 'Jam Operasional', val: 'Senin–Jumat, 09.00–18.00 WIB' },
            ].map(c => (
              <div key={c.label} style={{ display: 'flex', alignItems: 'center', gap: '16px', background: 'rgba(249,250,251,0.8)', border: '1px solid rgba(0,0,0,0.04)', borderRadius: '16px', padding: '16px' }}>
                <span style={{ fontSize: '24px' }}>{c.icon}</span>
                <div>
                  <p style={{ fontSize: '12px', fontWeight: 800, color: '#9CA3AF', margin: '0 0 2px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{c.label}</p>
                  <p style={{ fontSize: '14px', fontWeight: 700, color: '#7C3AED', margin: 0 }}>{c.val}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
        <div style={card}>
          <h2 style={{ ...h2s, marginTop: 0 }}>Topik Bantuan Populer</h2>
          {['Cara melacak pesanan saya', 'Barang tidak sesuai deskripsi', 'Pengembalian dana (refund)', 'Masalah login / akun terkunci', 'Cara menjadi penjual'].map(t => (
            <div key={t} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 0', borderBottom: '1px dashed #F3F4F6' }}>
              <span style={{ fontSize: '14px', color: '#374151', fontWeight: 500 }}>{t}</span>
              <ArrowLeft size={14} color="#9CA3AF" style={{ transform: 'rotate(180deg)' }} />
            </div>
          ))}
        </div>
      </>
    ),
  },
  terms: {
    title: 'Syarat dan Ketentuan', emoji: '📜', icon: FileText,
    content: (
      <div style={card}>
        <p style={{ ...ps, color: '#9CA3AF' }}>Terakhir diperbarui: 24 Juni 2026</p>
        {[
          { title: '1. Penggunaan Layanan', body: 'Pengguna wajib menggunakan data asli dan tidak menyalahgunakan platform untuk penipuan, pencucian uang, atau tindakan melanggar hukum.' },
          { title: '2. Pendaftaran Akun', body: 'Setiap pengguna wajib mendaftarkan satu akun dengan data yang valid. Akun yang terbukti palsu akan dihapus tanpa pemberitahuan.' },
          { title: '3. Transaksi & Pembayaran', body: 'Semua transaksi melalui sistem PreLove dilindungi. Transaksi di luar platform (transfer langsung ke penjual tanpa lewat sistem) bukan tanggung jawab kami.' },
          { title: '4. Pengembalian Dana', body: 'Refund hanya dapat dilakukan jika penjual membatalkan pesanan atau barang terbukti bermasalah, disertai video unboxing sebagai bukti.' },
          { title: '5. Pelarangan', body: 'Dilarang menjual barang ilegal, senjata, narkotika, barang palsu/replika bermerek, atau konten yang melanggar norma dan hukum Indonesia.' },
          { title: '6. Penangguhan Akun', body: 'PreLove berhak menangguhkan atau menghapus akun yang terbukti melanggar syarat & ketentuan ini tanpa ganti rugi.' },
        ].map(s => (
          <div key={s.title}>
            <h3 style={h2s}>{s.title}</h3>
            <p style={ps}>{s.body}</p>
          </div>
        ))}
      </div>
    ),
  },
  privacy: {
    title: 'Kebijakan Privasi', emoji: '🔒', icon: ShieldCheck,
    content: (
      <div style={card}>
        <p style={{ ...ps, color: '#9CA3AF' }}>Terakhir diperbarui: 24 Juni 2026</p>
        <p style={ps}>Keamanan data kamu adalah prioritas mutlak kami.</p>
        {[
          { title: 'Data yang Kami Kumpulkan', body: 'Nama, alamat email, nomor telepon, alamat pengiriman, dan data transaksi — semata-mata untuk keperluan pengiriman dan keamanan akun.' },
          { title: 'Penggunaan Data', body: 'Data kamu tidak akan pernah kami jual kepada pihak ketiga. Data hanya diteruskan ke mitra logistik untuk keperluan label pengiriman.' },
          { title: 'Enkripsi & Keamanan', body: 'Sistem kami menggunakan enkripsi TLS 1.3 dan standar keamanan PCI DSS. Semua transaksi finansial dienkripsi secara End-to-End.' },
          { title: 'Hak Pengguna', body: 'Kamu berhak meminta akses, koreksi, atau penghapusan data pribadi kapan saja melalui menu Pengaturan Akun atau menghubungi tim kami.' },
          { title: 'Cookie', body: 'Kami menggunakan cookie untuk meningkatkan pengalaman pengguna. Kamu dapat menonaktifkan cookie melalui pengaturan browser, namun beberapa fitur mungkin tidak berfungsi optimal.' },
        ].map(s => (
          <div key={s.title}>
            <h3 style={h2s}>{s.title}</h3>
            <p style={ps}>{s.body}</p>
          </div>
        ))}
      </div>
    ),
  },
};

export default function InfoPage() {
  const { slug } = useParams<{ slug: string }>();
  const router = useRouter();

  const page = PAGES[slug] ?? {
    title: 'Halaman Tidak Ditemukan', emoji: '🔍', icon: FileText,
    content: <div style={{ textAlign: 'center', padding: '64px 0', color: '#9CA3AF' }}>Halaman tidak tersedia.</div>,
  };

  const Icon = page.icon;

  return (
    <div style={{ minHeight: '100vh', background: BG, paddingTop: '112px', paddingBottom: '80px' }}>
      {/* Aurora blobs */}
      <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '500px', overflow: 'hidden', pointerEvents: 'none', zIndex: 0 }}>
        <div style={{ position: 'absolute', top: '-20%', left: '-10%', width: '50%', height: '80%', borderRadius: '50%', filter: 'blur(120px)', background: 'rgba(216,180,254,0.4)', mixBlendMode: 'multiply' }} />
        <div style={{ position: 'absolute', top: '10%', right: '-10%', width: '40%', height: '60%', borderRadius: '50%', filter: 'blur(100px)', background: 'rgba(167,243,208,0.35)', mixBlendMode: 'multiply' }} />
      </div>

      <div style={{ maxWidth: '760px', margin: '0 auto', padding: '0 20px', position: 'relative', zIndex: 10 }}>
        {/* Back button */}
        <BackButton />

        {/* Page Header */}
        <div style={{
          background: 'rgba(255,255,255,0.88)', backdropFilter: 'blur(24px)', WebkitBackdropFilter: 'blur(24px)',
          borderRadius: '28px', border: '1px solid rgba(255,255,255,0.9)',
          boxShadow: '0 12px 32px rgba(124,58,237,0.06)',
          padding: '36px 36px 28px', marginBottom: '20px',
          display: 'flex', alignItems: 'center', gap: '20px',
        }}>
          <div style={{
            width: '64px', height: '64px', borderRadius: '20px', flexShrink: 0,
            background: 'linear-gradient(135deg, #EDE9FE, #FCE7F3)',
            border: '1.5px solid rgba(139,92,246,0.15)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '28px',
          }}>
            {page.emoji}
          </div>
          <div>
            <h1 style={{ fontSize: '26px', fontWeight: 900, color: '#111827', margin: 0, letterSpacing: '-0.5px' }}>{page.title}</h1>
            <p style={{ fontSize: '13px', color: '#9CA3AF', margin: '4px 0 0', fontWeight: 500 }}>PreLove — Platform Preloved Terpercaya</p>
          </div>
        </div>

        {/* Content */}
        {page.content}
      </div>
    </div>
  );
}
