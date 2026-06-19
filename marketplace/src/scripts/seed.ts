import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabase = createClient(supabaseUrl, supabaseAnonKey);

// ─── ACCOUNTS ───────────────────────────────────────
// seller1@prelove.test  / Password123!
// seller2@prelove.test  / Password123!
// buyer1@prelove.test   / Password123!
// buyer2@prelove.test   / Password123!

async function getUserId(email: string, password: string, fullName: string, username: string): Promise<string | null> {
  let { data, error } = await supabase.auth.signInWithPassword({ email, password });
  
  if (error || !data.user) {
    console.log(`User ${email} not found or login failed. Attempting to sign up...`);
    const res = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName,
          username: username
        }
      }
    });
    if (res.error || !res.data.user) {
      console.error(`❌ Cannot signup ${email}:`, res.error?.message);
      return null;
    }
    data = res.data;
  }
  
  console.log(`✅ Ready: ${email} (${data.user.id})`);
  return data.user.id;
}

async function seedCategories() {
  const cats = [
    { id: '11111111-1111-1111-1111-111111111111', name: 'Fashion Wanita', slug: 'fashion-wanita' },
    { id: '22222222-2222-2222-2222-222222222222', name: 'Fashion Pria', slug: 'fashion-pria' },
    { id: '33333333-3333-3333-3333-333333333333', name: 'Elektronik', slug: 'elektronik' },
    { id: '44444444-4444-4444-4444-444444444444', name: 'Buku & Alat Tulis', slug: 'buku-alat-tulis' },
    { id: '55555555-5555-5555-5555-555555555555', name: 'Tas & Aksesoris', slug: 'tas-aksesoris' },
  ];
  for (const cat of cats) {
    const { error } = await supabase.from('categories').upsert(cat, { onConflict: 'id' });
    if (error) console.warn('cat upsert:', error.message);
  }
  console.log('📦 Categories seeded');
}

async function seedSeller1(userId: string) {
  // Create store
  await supabase.from('stores').upsert({
    id: userId,
    owner_id: userId,
    name: 'Hijab Aesthetic Store',
    slug: 'hijab-aesthetic-store',
    description: 'Koleksi hijab premium second hand berkualitas tinggi. Brand lokal dan import.',
    city: 'Bandung',
    province: 'Jawa Barat',
    phone: '082211223344',
    logo_url: 'https://images.unsplash.com/photo-1594938298603-c8148c4dae35?w=200&h=200&fit=crop&crop=face',
    rating: 4.9,
    total_sales: 234,
  }, { onConflict: 'id' });

  await supabase.from('profiles').update({ role: 'seller' }).eq('id', userId);

  const products = [
    {
      id: 'p1-s1', store_id: userId, category_id: '11111111-1111-1111-1111-111111111111',
      title: 'Hijab Voal Premium Motif Bunga Mewah',
      slug: 'hijab-voal-premium-motif-bunga',
      description: 'Hijab voal premium motif bunga, bahan halus tidak mudah kusut. Cocok untuk acara formal dan sehari-hari. Kondisi 95% masih bagus.',
      price: 85000, original_price: 220000, condition: 'like_new', stock: 3,
      rating_avg: 5.0, rating_count: 12,
    },
    {
      id: 'p2-s1', store_id: userId, category_id: '11111111-1111-1111-1111-111111111111',
      title: 'Pashmina Satin Silk Polos Abu Elegance',
      slug: 'pashmina-satin-silk-polos-abu',
      description: 'Pashmina satin silk warna abu-abu elegan. Bahan jatuh dan mengkilap. Ukuran panjang, cocok untuk berbagai style.',
      price: 65000, original_price: 180000, condition: 'good', stock: 1,
      rating_avg: 4.8, rating_count: 7,
    },
    {
      id: 'p3-s1', store_id: userId, category_id: '11111111-1111-1111-1111-111111111111',
      title: 'Gamis Syari Wolfis Set Khimar XL',
      slug: 'gamis-syari-wolfis-set-khimar-xl',
      description: 'Set gamis syari bahan wolfis tebal, lengkap dengan khimar panjang. Warna putih bersih. Hanya dipakai 2x untuk lebaran.',
      price: 195000, original_price: 550000, condition: 'like_new', stock: 1,
      rating_avg: 4.9, rating_count: 21,
    },
    {
      id: 'p4-s1', store_id: userId, category_id: '55555555-5555-5555-5555-555555555555',
      title: 'Tas Selempang Wanita Muslimah Kulit Sintetis',
      slug: 'tas-selempang-muslimah-kulit-sintetis',
      description: 'Tas selempang cantik cocok untuk outfit muslimah. Bahan kulit sintetis premium, ada tali panjang bisa dilepas.',
      price: 120000, original_price: 350000, condition: 'good', stock: 2,
      rating_avg: 4.7, rating_count: 5,
    },
  ];

  const images: Record<string, string> = {
    'p1-s1': 'https://images.unsplash.com/photo-1589810635657-232948472d98?auto=format&fit=crop&w=800&q=80',
    'p2-s1': 'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?auto=format&fit=crop&w=800&q=80',
    'p3-s1': 'https://images.unsplash.com/photo-1606216840131-7fc7dee2f8e3?auto=format&fit=crop&w=800&q=80',
    'p4-s1': 'https://images.unsplash.com/photo-1548036328-c9fa89d128fa?auto=format&fit=crop&w=800&q=80',
  };

  for (const p of products) {
    await supabase.from('products').upsert(p, { onConflict: 'id' });
    await supabase.from('product_images').upsert({
      id: `img-${p.id}`, product_id: p.id,
      image_url: images[p.id], is_primary: true,
    }, { onConflict: 'id' });
  }
  console.log('🏪 Seller 1 (Hijab Aesthetic Store) seeded with', products.length, 'products');
}

async function seedSeller2(userId: string) {
  await supabase.from('stores').upsert({
    id: userId,
    owner_id: userId,
    name: 'Modesty Closet',
    slug: 'modesty-closet',
    description: 'Fashion muslimah modern dan stylish. Temukan koleksi baju, hijab, dan aksesoris terbaik.',
    city: 'Jakarta Selatan',
    province: 'DKI Jakarta',
    phone: '089955443322',
    logo_url: 'https://images.unsplash.com/photo-1567401893414-76b7b1e5a7a5?w=200&h=200&fit=crop',
    rating: 4.7,
    total_sales: 178,
  }, { onConflict: 'id' });

  await supabase.from('profiles').update({ role: 'seller' }).eq('id', userId);

  const products = [
    {
      id: 'p1-s2', store_id: userId, category_id: '11111111-1111-1111-1111-111111111111',
      title: 'Baju Atasan Blouse Tunik Muslimah Crinkle',
      slug: 'blouse-tunik-muslimah-crinkle',
      description: 'Atasan tunik bahan crinkle airflow, adem dan tidak mudah kusut. Cocok untuk kerja maupun hangout. Warna dusty pink.',
      price: 75000, original_price: 200000, condition: 'like_new', stock: 2,
      rating_avg: 4.8, rating_count: 15,
    },
    {
      id: 'p2-s2', store_id: userId, category_id: '11111111-1111-1111-1111-111111111111',
      title: 'Dress Midi Floral Muslimah Lengan Panjang',
      slug: 'dress-midi-floral-muslimah',
      description: 'Dress midi cantik bermotif bunga-bunga pastel. Bahan linen premium, adem untuk cuaca Indonesia. Size M.',
      price: 150000, original_price: 420000, condition: 'good', stock: 1,
      rating_avg: 5.0, rating_count: 8,
    },
    {
      id: 'p3-s2', store_id: userId, category_id: '11111111-1111-1111-1111-111111111111',
      title: 'Hijab Bergo Instan Jersey Premium Anti Merosot',
      slug: 'hijab-bergo-instan-jersey-premium',
      description: 'Bergo instan bahan jersey premium, nyaman dipakai seharian. Tidak merosot dan mudah dipakai. Warna hitam.',
      price: 45000, original_price: 120000, condition: 'like_new', stock: 5,
      rating_avg: 4.9, rating_count: 30,
    },
    {
      id: 'p4-s2', store_id: userId, category_id: '22222222-2222-2222-2222-222222222222',
      title: 'Koko Pria Bahan Katun Premium Motif Songket',
      slug: 'koko-pria-katun-premium-songket',
      description: 'Baju koko pria bahan katun premium, motif songket elegan. Cocok untuk sholat Jumat dan acara formal. Size L.',
      price: 130000, original_price: 380000, condition: 'good', stock: 1,
      rating_avg: 4.6, rating_count: 9,
    },
  ];

  const images: Record<string, string> = {
    'p1-s2': 'https://images.unsplash.com/photo-1620799140408-edc6dcb6d633?auto=format&fit=crop&w=800&q=80',
    'p2-s2': 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=800&q=80',
    'p3-s2': 'https://images.unsplash.com/photo-1581044777550-4cfa60707c03?auto=format&fit=crop&w=800&q=80',
    'p4-s2': 'https://images.unsplash.com/photo-1594938298603-c8148c4dae35?auto=format&fit=crop&w=800&q=80',
  };

  for (const p of products) {
    await supabase.from('products').upsert(p, { onConflict: 'id' });
    await supabase.from('product_images').upsert({
      id: `img-${p.id}`, product_id: p.id,
      image_url: images[p.id], is_primary: true,
    }, { onConflict: 'id' });
  }
  console.log('🏪 Seller 2 (Modesty Closet) seeded with', products.length, 'products');
}

async function main() {
  console.log('\n🚀 Starting seed...\n');
  await seedCategories();

  // Login as each user and seed their data
  const s1Id = await getUserId('seller1@prelove.test', 'Password123!', 'Rina Maharani', 'rina_hijab');
  if (s1Id) await seedSeller1(s1Id);

  const s2Id = await getUserId('seller2@prelove.test', 'Password123!', 'Siti Nurhaliza', 'siti_modesty');
  if (s2Id) await seedSeller2(s2Id);

  // Buyers just need login check
  const b1Id = await getUserId('buyer1@prelove.test', 'Password123!', 'Anisa Rahmawati', 'anisa_buyer');
  if (b1Id) console.log('👤 Buyer 1 ready:', b1Id);

  const b2Id = await getUserId('buyer2@prelove.test', 'Password123!', 'Dewi Kartika', 'dewi_buyer');
  if (b2Id) console.log('👤 Buyer 2 ready:', b2Id);

  console.log('\n✅ Seed complete!\n');
  console.log('📋 Accounts:');
  console.log('  seller1@prelove.test / Password123! → Hijab Aesthetic Store');
  console.log('  seller2@prelove.test / Password123! → Modesty Closet');
  console.log('  buyer1@prelove.test  / Password123! → Customer 1');
  console.log('  buyer2@prelove.test  / Password123! → Customer 2');
}

main();
