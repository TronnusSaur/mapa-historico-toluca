import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'http://192.168.1.33:8000';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

if (!supabaseAnonKey) {
  console.warn('VITE_SUPABASE_ANON_KEY is not defined. Supabase connection might fail.');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
