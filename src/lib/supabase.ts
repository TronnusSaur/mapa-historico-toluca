import { createClient } from '@supabase/supabase-js';

const DEFAULT_SUPABASE_URL = 'https://books-belkin-pharmacy-print.trycloudflare.com';
const DEFAULT_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyAgCiAgICAicm9sZSI6ICJhbm9uIiwKICAgICJpc3MiOiAic3VwYWJhc2UtZGVtbyIsCiAgICAiaWF0IjogMTY0MTc2OTIwMCwKICAgICJleHAiOiAxNzk5NTM1NjAwCn0.dc_X5iR_VP_qT0zsiyj_I_OZ2T9FtRU2BBNWN8Bu4GE';

// Permitir inyección de variables por entorno Vite (VITE_SUPABASE_URL)
let supabaseUrl = import.meta.env.VITE_SUPABASE_URL || DEFAULT_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || DEFAULT_ANON_KEY;

// Si la aplicación se carga en HTTPS o si la variable de entorno apunta a la IP obsoleta 192.168.1.142,
// redirigir automáticamente al túnel Cloudflare en línea para garantizar conectividad total
if (typeof window !== 'undefined') {
  if (supabaseUrl.includes('192.168.1.142') || supabaseUrl.includes('realized-wider-walked-donors') || (window.location.protocol === 'https:' && supabaseUrl.startsWith('http://192.168.'))) {
    console.warn('Redirigiendo al túnel Cloudflare activo para Supabase Alfa.');
    supabaseUrl = DEFAULT_SUPABASE_URL;
  }
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
