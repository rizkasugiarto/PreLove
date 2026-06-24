# 🛍️ PreLove — Platform Marketplace Preloved

<div align="center">

![PreLove](https://img.shields.io/badge/PreLove-Marketplace-8B5CF6?style=for-the-badge&logo=shopify&logoColor=white)
![Next.js](https://img.shields.io/badge/Next.js-15-black?style=for-the-badge&logo=next.js)
![React Native](https://img.shields.io/badge/React%20Native-Expo-0EA5E9?style=for-the-badge&logo=expo)
![Supabase](https://img.shields.io/badge/Supabase-Database-3ECF8E?style=for-the-badge&logo=supabase)
![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?style=for-the-badge&logo=typescript)

**Platform jual-beli barang bekas / preloved yang modern, aman, dan mudah digunakan.**

*Tersedia sebagai Web App, Mobile App (Android & iOS), dan Admin Dashboard.*

</div>

---

## 📖 Tentang PreLove

**PreLove** adalah platform marketplace digital untuk jual-beli barang bekas (*preloved*) yang dirancang khusus untuk mahasiswa dan masyarakat umum. Dengan PreLove, siapapun bisa menjadi penjual maupun pembeli dengan alur yang sederhana, tampilan yang modern bergaya **Liquid Glassmorphism 2026**, dan pengalaman yang premium.

### Kenapa PreLove?
- ♻️ **Ramah lingkungan** — perpanjang umur produk, kurangi limbah tekstil
- 💸 **Hemat biaya** — dapatkan barang berkualitas dengan harga lebih terjangkau
- 🏪 **Buka toko sendiri** — siapapun bisa buka toko dan mulai berjualan
- 📱 **Multi-platform** — akses via web browser maupun aplikasi mobile
- 💬 **Chat real-time** — komunikasi langsung antara pembeli dan penjual
- 🔒 **Transaksi aman** — sistem verifikasi dan bukti pembayaran

---

## 🗂️ Struktur Monorepo

```
PROJECT PRELOVE/
├── marketplace/        # 🌐 Web App (Next.js 15 + Tailwind CSS)
├── admin/              # 🔧 Admin Dashboard (Next.js)
├── mobile/             # 📱 Mobile App (React Native + Expo)
└── supabase/           # 🗄️ Database Migrations & Schema
    └── migrations/
        ├── 001_initial_schema.sql
        └── 002_seed_data.sql
```

---

## ✨ Fitur Utama

### 👤 Autentikasi & Profil
- Register & Login dengan email/password (via Supabase Auth)
- Profil pengguna dengan foto avatar, nama, dan informasi pribadi
- Edit profil dengan upload foto

### 🏠 Beranda & Eksplorasi
- Hero section dengan animasi floating product cards
- Flash Sale section (produk terbaru pilihan)
- Grid produk rekomendasi dengan filter kategori aktif
- Statistik platform (counter animasi)
- Section komunitas & CTA bergabung

### 🔍 Pencarian & Filter
- Smart Search dengan Supabase Full-Text Search (FTS RPC)
- Fallback ke ILIKE jika FTS tidak tersedia
- Filter: kategori, kondisi barang, harga min–maks
- Reset filter instan

### 📦 Produk
- Halaman detail produk: galeri foto responsif (1:1 aspect ratio, max 480px), deskripsi, kondisi barang
- Badge kategori dan kondisi (tidak terpotong, `whiteSpace: nowrap`)
- Ulasan & rating dari pembeli
- Info penjual, rating toko, tombol chat
- Tombol Tambah ke Keranjang & Beli Langsung

### 🛒 Keranjang & Checkout
- Tambah/hapus produk dari keranjang belanja
- Perhitungan **ongkos kirim dinamis** berdasarkan lokasi:
  - Satu kota: **Rp 10.000**
  - Satu provinsi beda kota: **Rp 15.000**
  - Beda provinsi: **Rp 25.000**
- Pilihan pengiriman: JNE Reguler, J&T Express, SiCepat, AnterAja
- Form alamat pengiriman dengan dropdown Provinsi → Kota/Kabupaten (cascade)
- Metode pembayaran: Transfer Bank, E-Wallet
- Ringkasan pesanan lengkap

### 💳 Pembayaran
- Halaman konfirmasi pembayaran dengan timer countdown
- Upload bukti transfer (foto)
- Informasi rekening tujuan penjual

### 📋 Manajemen Pesanan — Pembeli
- Riwayat pesanan dengan tab status
- Status: Menunggu Pembayaran → Dikonfirmasi → Dikirim → Selesai
- Detail pesanan: produk, harga, ongkir, metode pembayaran, alamat
- Konfirmasi penerimaan barang
- **Beri Ulasan** produk setelah pesanan selesai (rating bintang + quick reply + komentar bebas)

### 💬 Chat Real-Time
- Chat antara pembeli dan penjual per produk
- **Glassmorphism UI** dengan bubble chat gradient ungu untuk pesan sendiri
- Dot pattern background ungu halus
- Quick reply templates (pertanyaan umum produk)
- Status baca pesan (✓ terkirim / ✓✓ dibaca)
- Indikator online penjual

### 🔔 Notifikasi
- Notifikasi order status update
- Notifikasi pesan baru
- Notifikasi sistem platform

### 🏪 Fitur Penjual (Seller Portal)
- **Buka Toko** — nama, deskripsi, logo, nomor WhatsApp
- **Pengaturan Toko** — edit profil toko, lokasi lengkap (Provinsi + Kota + Alamat) untuk kalkulasi ongkir otomatis
- **Dashboard Toko** — statistik: total produk, pesanan masuk, produk terjual, total pendapatan
- **Manajemen Produk** — tambah, edit, hapus produk
  - Upload hingga 5 foto per produk
  - Input: nama, deskripsi, harga jual, kategori, kondisi, stok, berat (gram)
  - Tanpa field "Harga Awal" / diskon (dihapus untuk simplifikasi)
- **Manajemen Pesanan Masuk** — konfirmasi, proses, input nomor resi
- **Detail Pesanan Penjual** — info pembeli, produk, bukti pembayaran

### 🔧 Admin Dashboard
- Overview statistik platform (total users, orders, revenue, laporan)
- Manajemen pengguna & toko
- Moderasi produk & laporan

### 🌐 Halaman Informasi (Footer Links)
- `/info/about` — Tentang PreLove (visi, misi, alasan pilih PreLove)
- `/info/hki` — Hak Kekayaan Intelektual
- `/info/karir` — Karir (daftar posisi)
- `/info/blog` — Blog & Insight (coming soon)
- `/info/sustainability` — Dampak Lingkungan (statistik impact)
- `/info/care` — PreLove Care / Bantuan (kontak CS, topik populer)
- `/info/terms` — Syarat & Ketentuan (6 pasal)
- `/info/privacy` — Kebijakan Privasi (5 poin)

---

## 🎨 Desain System

PreLove menggunakan sistem desain **Liquid Glassmorphism 2026**:

| Elemen | Nilai |
|--------|-------|
| **Warna Primer** | `#7C3AED` (Violet) → `#DB2777` (Pink) |
| **Background** | `radial-gradient(ellipse at top left, #EDE9FE, #F5F3FF, #EFF6FF)` |
| **Card Style** | `rgba(255,255,255,0.85)` + `backdropFilter: blur(24px)` |
| **Border** | `1px solid rgba(255,255,255,0.9)` |
| **Shadow** | `0 12px 32px rgba(124,58,237,0.06)` |
| **Border Radius** | `24px` – `32px` |
| **Typography** | Inter / System Font, weight 500–900 |
| **Aurora Blobs** | Blur circles ungu & hijau di background |

### Komponen Global
- **`LogoLoader`** — loading screen premium dengan animasi bounce logo PreLove (digunakan di semua halaman)
- **`BackButton`** — tombol kembali pill putih dengan icon circle lavender, hover geser kiri
- **`Footer`** — dark glassmorphism dengan 3 kolom link + brand header + social icons
- **`Navbar`** — sticky glassmorphism dengan search bar, notifikasi, keranjang

---

## 🔄 Alur Penggunaan

### Alur Pembeli
```
1. Register / Login
       ↓
2. Browse Produk (Home / Search + Filter)
       ↓
3. Lihat Detail Produk → Chat Penjual (opsional)
       ↓
4. Tambah ke Keranjang
       ↓
5. Checkout
   ├── Isi Alamat Pengiriman (Provinsi → Kota cascade)
   ├── Pilih Metode Pengiriman (ongkir otomatis berdasarkan jarak)
   └── Pilih Metode Pembayaran
       ↓
6. Upload Bukti Pembayaran
       ↓
7. Tunggu Konfirmasi Penjual
       ↓
8. Barang Dikirim → Konfirmasi Terima
       ↓
9. Beri Ulasan Produk ⭐
       ↓
10. Pesanan Selesai ✅
```

### Alur Penjual
```
1. Register / Login
       ↓
2. Buka Toko (nama, logo, deskripsi, lokasi)
       ↓
3. Tambah Produk
   ├── Upload Foto (maks. 5)
   ├── Isi Nama, Deskripsi, Harga Jual
   ├── Pilih Kategori & Kondisi
   ├── Atur Stok & Berat (gram)
   └── Simpan Produk
       ↓
4. Produk Tampil di Marketplace
       ↓
5. Terima Pesanan → Konfirmasi Pembayaran
       ↓
6. Kirim Barang → Input Nomor Resi
       ↓
7. Pesanan Selesai → Dana Diterima ✅
```

---

## 🛠️ Tech Stack

| Layer | Teknologi |
|-------|-----------|
| **Web Frontend** | Next.js 15, React 19, TypeScript, Tailwind CSS, Vanilla CSS |
| **Mobile App** | React Native, Expo SDK 54, TypeScript |
| **State Management** | React Context (Web), Zustand (Mobile) |
| **Backend / DB** | Supabase (PostgreSQL + Auth + Realtime + Storage) |
| **Admin Dashboard** | Next.js, TypeScript |
| **Navigation (Mobile)** | React Navigation v6 (Stack + Bottom Tabs) |
| **UI Icons** | Lucide React (Web), Expo Icons (Mobile) |
| **Toast / Notif** | React Hot Toast (Web), React Native Toast Message (Mobile) |
| **Realtime Chat** | Supabase Realtime (postgres_changes subscription) |

---

## 🗄️ Skema Database

### Tabel Utama

| Tabel | Deskripsi |
|-------|-----------|
| `profiles` | Data profil pengguna (nama, avatar, role) |
| `stores` | Toko penjual (nama, deskripsi, logo, alamat, provinsi, kota) |
| `categories` | Kategori produk |
| `products` | Produk preloved (nama, harga, kondisi, stok, berat, gambar) |
| `product_images` | Gambar produk (is_primary, sort_order) |
| `orders` | Pesanan (buyer, seller, status, total, ongkir, metode bayar) |
| `order_items` | Item dalam setiap pesanan (product_snapshot untuk histori) |
| `cart_items` | Item di keranjang belanja |
| `chat_rooms` | Room chat per produk antara buyer & seller |
| `chat_messages` | Pesan dalam chat room |
| `reviews` | Ulasan produk dari pembeli (rating, komentar) |
| `notifications` | Notifikasi sistem |

### Role Pengguna

| Role | Akses |
|------|-------|
| `buyer` | Browse, beli, chat, pesanan, ulasan |
| `seller` | Semua akses buyer + kelola toko, produk & pesanan masuk |
| `admin` | Full akses + moderasi platform |

---

## 🚀 Cara Menjalankan

### Prasyarat
- Node.js >= 18
- npm atau yarn
- Akun Supabase (untuk database & storage)
- Expo CLI (untuk mobile)

### 1. Clone Repository

```bash
git clone https://github.com/rizkasugiarto/PreLove.git
cd PreLove
```

### 2. Setup Environment Variables

Buat file `.env.local` di folder `marketplace/` dan `admin/`:

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

Buat file `.env` di folder `mobile/`:

```env
EXPO_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

### 3. Setup Database

Jalankan migrations di Supabase SQL Editor secara urutan:

```
supabase/migrations/001_initial_schema.sql
supabase/migrations/002_seed_data.sql
```

### 4. Jalankan Web App (Marketplace)

```bash
cd marketplace
npm install
npm run dev
# Akses di http://localhost:3000
```

### 5. Jalankan Admin Dashboard

```bash
cd admin
npm install
npm run dev
# Akses di http://localhost:3001
```

### 6. Jalankan Mobile App

```bash
cd mobile
npm install
npx expo start
# Scan QR code dengan Expo Go app
```

---

## 📱 Halaman Web App

| Halaman | Path | Deskripsi |
|---------|------|-----------|
| Beranda | `/` | Hero, Flash Sale, produk, kategori, statistik |
| Search | `/search` | Pencarian + filter lengkap |
| Detail Produk | `/products/[id]` | Info produk, foto, ulasan, beli |
| Keranjang | `/cart` | Daftar belanja |
| Checkout | `/checkout` | Alamat, ongkir, pembayaran |
| Pembayaran | `/orders/[id]/payment` | Upload bukti transfer |
| Pesanan | `/orders` | Riwayat pesanan |
| Detail Pesanan | `/orders/[id]` | Detail + konfirmasi terima |
| Ulasan | `/review/[id]` | Form beri ulasan |
| Chat | `/chat/[roomId]` | Chat real-time penjual |
| Profil | `/profile` | Edit profil pengguna |
| Buka Toko | `/seller/open-store` | Daftar sebagai penjual |
| Dashboard Penjual | `/seller/dashboard` | Statistik toko |
| Produk Penjual | `/seller/products` | Kelola produk |
| Tambah Produk | `/seller/products/add` | Form tambah produk |
| Edit Produk | `/seller/products/[id]/edit` | Form edit produk |
| Pesanan Penjual | `/seller/orders` | Pesanan masuk |
| Pengaturan Toko | `/seller/settings` | Edit profil & alamat toko |
| Admin Dashboard | `/admin/dashboard` | Panel admin |
| Info Pages | `/info/[slug]` | Tentang, HKI, Karir, Blog, dll |

---

## 👥 Tim Pengembang

| Nama | Role |
|------|------|
| Rizka Sugiarto | Full Stack Developer |

---

## 📄 Lisensi

Proyek ini menggunakan lisensi **MIT**. Lihat file [LICENSE](./mobile/LICENSE) untuk detail lebih lanjut.

---

## 🤝 Kontribusi

Pull request sangat disambut! Untuk perubahan besar, harap buka issue terlebih dahulu.

1. Fork repository ini
2. Buat branch fitur (`git checkout -b feature/NamaFitur`)
3. Commit perubahan (`git commit -m 'feat: NamaFitur'`)
4. Push ke branch (`git push origin feature/NamaFitur`)
5. Buka Pull Request

---

<div align="center">

Dibuat dengan ❤️ oleh **Rizka Sugiarto**

*Barang bekas, nilai baru.*

**PreLove — Platform Preloved Mahasiswa #1**

</div>
