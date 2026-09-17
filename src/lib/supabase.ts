import { createClient } from '@supabase/supabase-js';

const DEFAULT_SUPABASE_URL = 'https://realized-wider-walked-donors.trycloudflare.com';
const DEFAULT_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyAgCiAgICAicm9sZSI6ICJhbm9uIiwKICAgICJpc3MiOiAic3VwYWJhc2UtZGVtbyIsCiAgICAiaWF0IjogMTY0MTc2OTIwMCwKICAgICJleHAiOiAxNzk5NTM1NjAwCn0.dc_X5iR_VP_qT0zsiyj_I_OZ2T9FtRU2BBNWN8Bu4GE';

// Permitir inyección de variables por entorno Vite (VITE_SUPABASE_URL)
let supabaseUrl = import.meta.env.VITE_SUPABASE_URL || DEFAULT_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || DEFAULT_ANON_KEY;

// Si la aplicación se carga en HTTPS (como GitHub Pages) y la URL apunta a una IP privada local HTTP,
// redirigir automáticamente al túnel HTTPS para evitar error de Mixed Content y bloqueo de Private Network Access
if (typeof window !== 'undefined' && window.location.protocol === 'https:' && supabaseUrl.startsWith('http://192.168.')) {
  console.warn('Detectado entorno HTTPS con URL local de Supabase. Usando túnel Cloudflare seguro para evitar bloqueo del navegador.');
  supabaseUrl = DEFAULT_SUPABASE_URL;
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
