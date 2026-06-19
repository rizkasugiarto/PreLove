import { create } from 'zustand';
import { CartItem } from '../types/database';
import { supabase } from '../lib/supabase';

interface CartStore {
  items: CartItem[];
  isLoading: boolean;

  fetchCart: (userId: string) => Promise<void>;
  addToCart: (userId: string, productId: string) => Promise<{ error: string | null }>;
  removeFromCart: (itemId: string) => Promise<void>;
  updateQuantity: (itemId: string, quantity: number) => Promise<void>;
  clearCart: () => void;
  getTotalItems: () => number;
  getTotalPrice: () => number;
}

export const useCartStore = create<CartStore>((set, get) => ({
  items: [],
  isLoading: false,

  fetchCart: async (userId) => {
    set({ isLoading: true });
    const { data, error } = await supabase
      .from('cart_items')
      .select(`
        *,
        product:products(
          *,
          images:product_images(*)
        )
      `)
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (!error && data) {
      set({ items: data as CartItem[] });
    }
    set({ isLoading: false });
  },

  addToCart: async (userId, productId) => {
    // Cek apakah sudah ada di cart
    const existing = get().items.find((i) => i.product_id === productId);
    if (existing) {
      await get().updateQuantity(existing.id, existing.quantity + 1);
      return { error: null };
    }

    const { data, error } = await supabase
      .from('cart_items')
      .insert({ user_id: userId, product_id: productId })
      .select(`*, product:products(*, images:product_images(*))`)
      .single();

    if (!error && data) {
      set((state) => ({ items: [data as CartItem, ...state.items] }));
    }
    return { error: error?.message ?? null };
  },

  removeFromCart: async (itemId) => {
    await supabase.from('cart_items').delete().eq('id', itemId);
    set((state) => ({ items: state.items.filter((i) => i.id !== itemId) }));
  },

  updateQuantity: async (itemId, quantity) => {
    if (quantity <= 0) {
      await get().removeFromCart(itemId);
      return;
    }
    await supabase.from('cart_items').update({ quantity }).eq('id', itemId);
    set((state) => ({
      items: state.items.map((i) => (i.id === itemId ? { ...i, quantity } : i)),
    }));
  },

  clearCart: () => set({ items: [] }),

  getTotalItems: () => get().items.reduce((sum, i) => sum + i.quantity, 0),

  getTotalPrice: () =>
    get().items.reduce(
      (sum, i) => sum + (i.product?.price ?? 0) * i.quantity,
      0
    ),
}));
