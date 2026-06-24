import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing Supabase credentials');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function fixOrder() {
  // We don't have service role key easily accessible, but since we just want to update,
  // we might need RLS bypass or just update the order if RLS allows it (usually seller can update their orders).
  // Wait, anon key might fail RLS if it's not logged in.
  // Let's check if there's a service role key in .env.local
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  const client = serviceKey ? createClient(supabaseUrl, serviceKey) : supabase;
  
  const { data, error } = await client
    .from('orders')
    .update({ status: 'pending' })
    .eq('status', 'waiting_payment')
    .eq('payment_bank', 'COD')
    .select();

  if (error) {
    console.error('Error updating order:', error);
  } else {
    console.log('Successfully updated orders:', data);
  }
}

fixOrder();
