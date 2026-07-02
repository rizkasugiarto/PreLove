'use client';

import Link from 'next/link';
import { ArrowLeft, Shield, ShoppingBag, AlertTriangle, CheckCircle, Lock, Users, HelpCircle } from 'lucide-react';

const sections = [
  {
    icon: Users,
    title: '1. Ketentuan Umum',
    content: [
      'PreLove adalah platform marketplace online yang mempertemukan pembeli dan penjual barang preloved (bekas pakai) secara aman dan terpercaya.',
      'Dengan mendaftar dan menggunakan platform PreLove, kamu dianggap telah membaca, memahami, dan menyetujui seluruh Syarat & Ketentuan yang berlaku.',
      'PreLove berhak mengubah Syarat & Ketentuan ini sewaktu-waktu. Perubahan akan diumumkan melalui platform dan berlaku sejak tanggal pengumuman.',
      'Pengguna wajib berusia minimal 17 tahun atau mendapatkan persetujuan dari orang tua/wali untuk menggunakan platform ini.',
    ],
  },
  {
    icon: CheckCircle,
    title: '2. Pendaftaran & Akun',
    content: [
      'Setiap pengguna hanya diperbolehkan memiliki satu akun. Pembuatan akun ganda dapat mengakibatkan pemblokiran akun.',
      'Pengguna bertanggung jawab penuh atas keamanan akun, termasuk kata sandi. Segera hubungi kami jika akunmu diakses tanpa izin.',
      'Data yang diisi saat pendaftaran harus valid dan sesuai dengan identitas asli. PreLove berhak menangguhkan akun dengan informasi palsu.',
      'Untuk membuka toko sebagai penjual, pengguna wajib melengkapi informasi toko termasuk alamat yang valid untuk keperluan pengiriman.',
    ],
  },
  {
    icon: ShoppingBag,
    title: '3. Jual Beli Barang',
    content: [
      'Penjual bertanggung jawab penuh atas keaslian, kondisi, dan deskripsi produk yang dijual. Deskripsi wajib jujur dan tidak menyesatkan pembeli.',
      'Barang yang dilarang untuk dijual: barang ilegal, barang palsu (KW), senjata, narkoba, produk dewasa, hewan peliharaan, dan barang yang melanggar hukum.',
      'Pembeli diharapkan membaca deskripsi produk dengan teliti sebelum melakukan pembelian. Transaksi yang sudah selesai tidak dapat dibatalkan kecuali ada kesalahan dari penjual.',
      'PreLove tidak bertanggung jawab atas kerugian yang timbul akibat transaksi yang dilakukan di luar platform (COD tanpa pengawasan, transfer langsung, dll).',
      'Harga yang tercantum sudah termasuk harga barang. Ongkos kirim akan dihitung berdasarkan berat dan jarak pengiriman.',
    ],
  },
  {
    icon: Lock,
    title: '4. Privasi & Keamanan Data',
    content: [
      'PreLove mengumpulkan data pribadi pengguna (nama, email, nomor telepon, alamat) hanya untuk keperluan operasional platform.',
      'Data pribadi pengguna tidak akan dijual atau dibagikan kepada pihak ketiga tanpa persetujuan pengguna, kecuali diwajibkan oleh hukum.',
      'PreLove menggunakan enkripsi dan teknologi keamanan terkini untuk melindungi data penggunanya.',
      'Pengguna berhak meminta penghapusan akun dan data pribadinya dengan menghubungi tim dukungan PreLove.',
    ],
  },
  {
    icon: AlertTriangle,
    title: '5. Larangan & Sanksi',
    content: [
      'Dilarang melakukan penipuan, manipulasi harga, atau segala bentuk kecurangan dalam bertransaksi di platform PreLove.',
      'Dilarang mengunggah konten yang bersifat SARA, pornografi, kekerasan, atau konten yang melanggar hak cipta pihak lain.',
      'Dilarang melakukan spam, phishing, atau aktivitas berbahaya lainnya yang dapat merugikan pengguna lain.',
      'Pelanggaran terhadap ketentuan ini dapat mengakibatkan penangguhan sementara atau pemblokiran permanen akun tanpa pemberitahuan sebelumnya.',
    ],
  },
  {
    icon: Shield,
    title: '6. Penyelesaian Sengketa',
    content: [
      'Apabila terjadi sengketa antara pembeli dan penjual, kedua pihak diharapkan menyelesaikannya secara musyawarah melalui fitur chat di platform.',
      'Jika tidak tercapai kesepakatan, pengguna dapat mengajukan laporan kepada tim PreLove untuk mediasi.',
      'Keputusan tim PreLove dalam penyelesaian sengketa bersifat final dan mengikat kedua belah pihak.',
      'PreLove tidak bertanggung jawab atas kerugian yang terjadi di luar ekosistem platform PreLove.',
    ],
  },
  {
    icon: HelpCircle,
    title: '7. Kontak & Dukungan',
    content: [
      'Jika kamu memiliki pertanyaan, keluhan, atau membutuhkan bantuan, silakan hubungi tim kami melalui fitur chat dukungan di aplikasi.',
      'Tim dukungan PreLove siap membantu kamu setiap hari pada jam operasional 08.00 - 22.00 WIB.',
      'Kami berkomitmen untuk merespons setiap pertanyaan dan keluhan dalam waktu 1x24 jam kerja.',
    ],
  },
];

export default function TermsPage() {
  return (
    <div style={{
      minHeight: '100vh',
      background: 'radial-gradient(ellipse at top left, #EDE9FE 0%, #F5F3FF 40%, #EFF6FF 100%)',
      paddingTop: '100px',
      paddingBottom: '80px',
    }}>
      <div style={{ maxWidth: '800px', margin: '0 auto', padding: '0 16px' }}>

        {/* Back button */}
        <Link href="/" style={{
          display: 'inline-flex', alignItems: 'center', gap: '8px',
          color: '#7C3AED', fontWeight: 700, textDecoration: 'none', marginBottom: '32px',
          fontSize: '14px',
        }}>
          <div style={{
            width: '36px', height: '36px', borderRadius: '50%', background: '#fff',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
          }}>
            <ArrowLeft size={18} />
          </div>
          Kembali
        </Link>

        {/* Hero Card */}
        <div style={{
          background: 'linear-gradient(135deg, #7C3AED 0%, #A855F7 50%, #EC4899 100%)',
          borderRadius: '28px',
          padding: '48px 40px',
          marginBottom: '32px',
          position: 'relative',
          overflow: 'hidden',
        }}>
          <div style={{
            position: 'absolute', top: '-40px', right: '-40px',
            width: '200px', height: '200px', borderRadius: '50%',
            background: 'rgba(255,255,255,0.06)',
          }} />
          <div style={{
            position: 'absolute', bottom: '-60px', left: '-20px',
            width: '250px', height: '250px', borderRadius: '50%',
            background: 'rgba(255,255,255,0.04)',
          }} />
          <div style={{ position: 'relative', zIndex: 1 }}>
            <div style={{
              width: '64px', height: '64px', borderRadius: '20px',
              background: 'rgba(255,255,255,0.2)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              marginBottom: '20px',
              backdropFilter: 'blur(8px)',
            }}>
              <Shield size={32} color="#fff" />
            </div>
            <h1 style={{
              fontSize: '32px', fontWeight: 900, color: '#fff',
              margin: '0 0 12px 0', letterSpacing: '-0.03em',
            }}>
              Syarat & Ketentuan
            </h1>
            <p style={{ color: 'rgba(255,255,255,0.8)', fontSize: '15px', margin: '0 0 16px 0', lineHeight: 1.6 }}>
              Harap baca dan pahami ketentuan penggunaan platform PreLove sebelum memulai berjualan.
            </p>
            <div style={{
              display: 'inline-flex', alignItems: 'center', gap: '6px',
              background: 'rgba(255,255,255,0.15)', borderRadius: '999px',
              padding: '6px 14px', backdropFilter: 'blur(8px)',
            }}>
              <span style={{ color: 'rgba(255,255,255,0.9)', fontSize: '12px', fontWeight: 600 }}>
                📅 Berlaku sejak 1 Juli 2025
              </span>
            </div>
          </div>
        </div>

        {/* Sections */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {sections.map((section, i) => {
            const Icon = section.icon;
            return (
              <div key={i} style={{
                background: 'rgba(255,255,255,0.88)',
                backdropFilter: 'blur(24px)',
                WebkitBackdropFilter: 'blur(24px)',
                borderRadius: '20px',
                border: '1px solid rgba(255,255,255,0.9)',
                boxShadow: '0 4px 16px rgba(124,58,237,0.06)',
                overflow: 'hidden',
              }}>
                <div style={{
                  display: 'flex', alignItems: 'center', gap: '14px',
                  padding: '20px 24px',
                  borderBottom: '1px solid #F3F4F6',
                }}>
                  <div style={{
                    width: '40px', height: '40px', borderRadius: '12px', flexShrink: 0,
                    background: 'linear-gradient(135deg, #EDE9FE, #F3E8FF)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                  }}>
                    <Icon size={20} color="#7C3AED" />
                  </div>
                  <h2 style={{
                    fontSize: '16px', fontWeight: 800, color: '#111827',
                    margin: 0, letterSpacing: '-0.01em',
                  }}>
                    {section.title}
                  </h2>
                </div>
                <div style={{ padding: '20px 24px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  {section.content.map((text, j) => (
                    <div key={j} style={{ display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
                      <div style={{
                        width: '6px', height: '6px', borderRadius: '50%',
                        background: '#A78BFA', flexShrink: 0, marginTop: '8px',
                      }} />
                      <p style={{
                        fontSize: '14px', color: '#374151', lineHeight: 1.7,
                        margin: 0, fontWeight: 500,
                      }}>
                        {text}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>

        {/* Footer note */}
        <div style={{
          textAlign: 'center', marginTop: '40px',
          padding: '24px',
          background: 'rgba(255,255,255,0.6)',
          borderRadius: '16px',
          border: '1px solid rgba(255,255,255,0.9)',
        }}>
          <p style={{ fontSize: '13px', color: '#6B7280', margin: '0 0 12px 0', lineHeight: 1.6 }}>
            Dengan menggunakan platform PreLove, kamu menyatakan telah membaca dan menyetujui seluruh Syarat & Ketentuan di atas.
          </p>
          <Link href="/seller/open-store" style={{
            display: 'inline-flex', alignItems: 'center', gap: '8px',
            background: 'linear-gradient(135deg, #7C3AED, #A855F7)',
            color: '#fff', textDecoration: 'none',
            padding: '12px 28px', borderRadius: '12px',
            fontWeight: 700, fontSize: '14px',
            boxShadow: '0 4px 16px rgba(124,58,237,0.3)',
          }}>
            <ShoppingBag size={16} />
            Saya Setuju — Buka Toko Sekarang
          </Link>
        </div>

      </div>
    </div>
  );
}
