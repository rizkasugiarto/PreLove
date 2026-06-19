// Database types matching our SQL schema

export type UserRole = 'customer' | 'seller' | 'admin';
export type ProductCondition = 'new' | 'like_new' | 'good' | 'fair';
export type ShippingCourier = 'COD' | 'JNE' | 'JNT' | 'SiCepat' | 'AnterAja';
export type OrderStatus =
  | 'waiting_payment'
  | 'pending'
  | 'confirmed'
  | 'packed'
  | 'shipped'
  | 'delivered'
  | 'completed'
  | 'cancelled';
export type PaymentStatus = 'unpaid' | 'pending_verification' | 'paid' | 'refunded';

export interface Profile {
  id: string;
  username: string | null;
  full_name: string | null;
  avatar_url: string | null;
  phone: string | null;
  bio: string | null;
  is_banned: boolean;
  role: UserRole;
  fcm_token: string | null;
  created_at: string;
  updated_at: string;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  icon_url: string | null;
  parent_id: string | null;
  sort_order: number;
}

export interface Store {
  id: string;
  owner_id: string;
  name: string;
  slug: string;
  logo_url: string | null;
  banner_url: string | null;
  description: string | null;
  address: string | null;
  city: string | null;
  province: string | null;
  phone: string | null;
  is_active: boolean;
  rating: number;
  total_sales: number;
  total_reviews: number;
  created_at: string;
  updated_at: string;
  // joined
  owner?: Profile;
}

export interface Product {
  id: string;
  store_id: string;
  title: string;
  description: string | null;
  price: number;
  original_price: number | null;
  condition: ProductCondition;
  category_id: string | null;
  stock: number;
  weight_gram: number;
  is_active: boolean;
  is_sold: boolean;
  view_count: number;
  rating: number;
  total_reviews: number;
  created_at: string;
  updated_at: string;
  // joined
  store?: Store;
  category?: Category;
  images?: ProductImage[];
}

export interface ProductImage {
  id: string;
  product_id: string;
  image_url: string;
  is_primary: boolean;
  sort_order: number;
}

export interface Address {
  id: string;
  user_id: string;
  label: string;
  recipient_name: string;
  phone: string;
  address: string;
  city: string;
  province: string;
  postal_code: string | null;
  is_default: boolean;
  created_at: string;
}

export interface CartItem {
  id: string;
  user_id: string;
  product_id: string;
  quantity: number;
  created_at: string;
  // joined
  product?: Product;
}

export interface Order {
  id: string;
  order_number: string;
  buyer_id: string;
  store_id: string;
  address_id: string | null;
  address_snapshot: Address | null;
  shipping_courier: ShippingCourier;
  shipping_service: string | null;
  shipping_cost: number;
  tracking_number: string | null;
  subtotal: number;
  total: number;
  payment_method: string;
  payment_status: PaymentStatus;
  payment_proof_url: string | null;
  payment_bank: string | null;
  payment_account_number: string | null;
  payment_account_name: string | null;
  status: OrderStatus;
  notes: string | null;
  cancelled_reason: string | null;
  cancelled_by: string | null;
  created_at: string;
  updated_at: string;
  // joined
  buyer?: Profile;
  store?: Store;
  items?: OrderItem[];
}

export interface OrderItem {
  id: string;
  order_id: string;
  product_id: string | null;
  quantity: number;
  price: number;
  product_snapshot: Partial<Product> & { images?: ProductImage[] };
}

export interface Review {
  id: string;
  order_id: string;
  product_id: string;
  store_id: string;
  reviewer_id: string;
  rating: number;
  comment: string | null;
  image_urls: string[] | null;
  seller_reply: string | null;
  created_at: string;
  // joined
  reviewer?: Profile;
}

export interface Wishlist {
  id: string;
  user_id: string;
  product_id: string;
  created_at: string;
  // joined
  product?: Product;
}

export interface ChatRoom {
  id: string;
  buyer_id: string;
  store_id: string;
  product_id: string | null;
  last_message: string | null;
  last_message_at: string | null;
  buyer_unread_count: number;
  seller_unread_count: number;
  created_at: string;
  // joined
  buyer?: Profile;
  store?: Store;
  product?: Product;
}

export interface ChatMessage {
  id: string;
  room_id: string;
  sender_id: string;
  message: string | null;
  image_url: string | null;
  is_read: boolean;
  created_at: string;
  // joined
  sender?: Profile;
}

export interface Notification {
  id: string;
  user_id: string;
  type: 'order_update' | 'chat' | 'review' | 'payment' | 'promo' | 'system';
  title: string;
  body: string;
  data: Record<string, unknown> | null;
  is_read: boolean;
  created_at: string;
}

export interface BankAccount {
  id: string;
  bank_name: string;
  account_number: string;
  account_name: string;
  is_active: boolean;
  sort_order: number;
}
