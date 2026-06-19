# 🛍️ PreLove — Second-Hand Marketplace Platform

<div align="center">

![PreLove Banner](https://img.shields.io/badge/PreLove-Marketplace-8B5CF6?style=for-the-badge&logo=shopify&logoColor=white)
![Next.js](https://img.shields.io/badge/Next.js-16-black?style=for-the-badge&logo=next.js)
![React Native](https://img.shields.io/badge/React%20Native-Expo-0EA5E9?style=for-the-badge&logo=expo)
![Supabase](https://img.shields.io/badge/Supabase-Database-3ECF8E?style=for-the-badge&logo=supabase)
![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?style=for-the-badge&logo=typescript)

**Platform jual-beli barang bekas / preloved yang modern, aman, dan mudah digunakan.**

*Tersedia sebagai Web App, Mobile App (Android & iOS), dan Admin Dashboard.*

</div>

---

## 📖 Tentang PreLove

**PreLove** adalah platform marketplace digital untuk jual-beli barang bekas (*preloved*) yang dirancang untuk mahasiswa dan masyarakat umum. Dengan PreLove, siapa pun bisa menjadi penjual maupun pembeli dengan alur yang sederhana dan tampilan yang modern.

### Kenapa PreLove?
- ♻️ **Ramah lingkungan** — perpanjang umur produk, kurangi limbah
- 💸 **Hemat biaya** — dapatkan barang berkualitas dengan harga lebih terjangkau
- 🏪 **Buka toko sendiri** — siapapun bisa buka toko dan mulai berjualan
- 📱 **Multi-platform** — akses via web browser maupun aplikasi mobile

---

## 🗂️ Struktur Monorepo

```
PROJECT PRELOVE/
├── marketplace/        # 🌐 Web App (Next.js 16 + Tailwind CSS v4)
├── admin/              # 🔧 Admin Dashboard (Next.js 16)
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
- Profil pengguna dengan foto, nama, dan informasi pribadi
- Manajemen akun dan pengaturan profil

### 🏠 Beranda & Eksplorasi
- Hero section dengan featured products
- Browsing produk terbaru dan rekomendasi
- Kategori produk (Fashion, Electronics, Books, dll)
- Banner promosi dinamis

### 🔍 Pencarian & Filter
- Pencarian produk berdasarkan nama / deskripsi
- Filter berdasarkan: kategori, harga (min–max), kondisi barang, lokasi
- Sorting: terbaru, termurah, termahal, terpopuler

### 📦 Produk
- Halaman detail produk (foto, deskripsi, kondisi, harga, penjual)
- Galeri foto produk
- Informasi kondisi barang (Baru, Sangat Baik, Baik, Cukup)
- Wishlist / simpan produk favorit

### 🛒 Keranjang & Checkout
- Tambah/hapus produk ke keranjang belanja
- Ringkasan belanja dengan kalkulasi harga otomatis
- Pilihan pengiriman (JNE, J&T, SiCepat, Gojek)
- Form pengiriman (nama, alamat, nomor HP)
- Multiple metode pembayaran:
  - Transfer Bank (BCA, Mandiri, BNI, BRI)
  - E-Wallet (GoPay, OVO, DANA, ShopeePay)
  - COD (Cash on Delivery)
- Upload bukti pembayaran

### 📋 Manajemen Pesanan
- Riwayat pesanan dengan status real-time
- Status: Menunggu Konfirmasi → Dikonfirmasi → Dikirim → Selesai
- Detail pesanan lengkap (produk, harga, pengiriman, pembayaran)
- Konfirmasi penerimaan barang

### 💬 Chat / Pesan
- Real-time chat antara pembeli dan penjual
- Riwayat percakapan

### 🔔 Notifikasi
- Notifikasi order status update
- Notifikasi pesan baru
- Notifikasi sistem

### 🏪 Fitur Penjual (Seller)
- Buka toko dengan nama toko dan deskripsi
- Dashboard toko: statistik penjualan, total pendapatan, jumlah produk
- Tambah, edit, hapus produk
- Manajemen stok dan kondisi barang
- Upload hingga 5 foto per produk
- Manajemen pesanan masuk (konfirmasi, proses, kirim)

### 🔧 Admin Dashboard
- Overview statistik platform (total users, orders, revenue)
- Manajemen pengguna
- Moderasi produk dan toko

---

## 🔄 Alur Penggunaan

### Alur Pembeli

```
1. Register / Login
       ↓
2. Browse Produk (Home / Search)
       ↓
3. Lihat Detail Produk
       ↓
4. Tambah ke Keranjang
       ↓
5. Checkout
   ├── Isi Alamat Pengiriman
   ├── Pilih Metode Pengiriman
   └── Pilih Metode Pembayaran
       ↓
6. Upload Bukti Pembayaran
       ↓
7. Tunggu Konfirmasi Penjual
       ↓
8. Barang Dikirim → Konfirmasi Terima
       ↓
9. Pesanan Selesai ✅
```

### Alur Penjual

```
1. Register / Login
       ↓
2. Buka Toko (nama, deskripsi, foto)
       ↓
3. Tambah Produk
   ├── Upload Foto (maks. 5)
   ├── Isi Nama, Deskripsi, Harga
   ├── Pilih Kategori & Kondisi
   └── Atur Stok
       ↓
4. Produk Tampil di Marketplace
       ↓
5. Terima Pesanan → Konfirmasi
       ↓
6. Kirim Barang → Input Nomor Resi
       ↓
7. Pesanan Selesai → Dana Diterima ✅
```

---

## 🛠️ Tech Stack

| Layer | Teknologi |
|-------|-----------|
| **Web Frontend** | Next.js 16, React 19, TypeScript, Tailwind CSS v4 |
| **Mobile App** | React Native, Expo SDK 54, TypeScript |
| **State Management** | React Context (Web), Zustand (Mobile) |
| **Backend / DB** | Supabase (PostgreSQL + Auth + Storage + Realtime) |
| **Admin Dashboard** | Next.js 16, TypeScript |
| **Navigation (Mobile)** | React Navigation v6 (Stack + Bottom Tabs) |
| **UI Icons** | Lucide React (Web), Expo Icons (Mobile) |
| **Toast/Notif** | React Hot Toast (Web), React Native Toast Message (Mobile) |

---

## 🗄️ Skema Database

### Tabel Utama

| Tabel | Deskripsi |
|-------|-----------|
| `profiles` | Data profil pengguna (nama, avatar, role) |
| `stores` | Toko penjual (nama, deskripsi, foto) |
| `categories` | Kategori produk |
| `products` | Produk preloved (nama, harga, kondisi, stok, gambar) |
| `orders` | Pesanan (buyer, seller, status, total) |
| `order_items` | Item dalam setiap pesanan |
| `cart_items` | Item di keranjang belanja |
| `messages` | Chat antar pengguna |
| `wishlist` | Daftar produk favorit pengguna |
| `notifications` | Notifikasi sistem |

### Role Pengguna

| Role | Akses |
|------|-------|
| `buyer` | Browse, beli, chat, kelola pesanan |
| `seller` | Semua akses buyer + kelola toko & produk |
| `admin` | Full akses + moderasi platform |

---

## 🚀 Cara Menjalankan

### Prasyarat
- Node.js >= 18
- npm atau yarn
- Akun Supabase (untuk database)
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

Jalankan migrations di Supabase SQL Editor:

```bash
# Jalankan file-file ini secara urutan di Supabase Dashboard > SQL Editor
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
# Scan QR code dengan Expo Go app di HP kamu
```

---

## 📱 Screenshot / Preview

### Web Marketplace
- **Beranda** — Hero section, produk terbaru, kategori
- **Search** — Filter dan pencarian real-time
- **Detail Produk** — Galeri foto, info penjual, tombol beli
- **Cart & Checkout** — Multi-step checkout flow
- **Dashboard Penjual** — Statistik toko dan manajemen produk

### Mobile App
- Navigasi bottom tab: Home, Search, Orders, Profile
- Dark/Light mode support
- Responsive di berbagai ukuran layar

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

Pull request sangat disambut! Untuk perubahan besar, harap buka issue terlebih dahulu untuk mendiskusikan apa yang ingin diubah.

1. Fork repository ini
2. Buat branch fitur (`git checkout -b feature/NamaFitur`)
3. Commit perubahan (`git commit -m 'Add: NamaFitur'`)
4. Push ke branch (`git push origin feature/NamaFitur`)
5. Buka Pull Request

---

<div align="center">

Dibuat dengan ❤️ oleh tim **PreLove**

*Barang bekas, nilai baru.*

</div>
