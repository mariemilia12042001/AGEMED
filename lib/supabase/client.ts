import { createClient, SupabaseClient } from '@supabase/supabase-js';
import type { Database } from './types';

// En Remix/Vite podemos usar process.env o import.meta.env según el entorno
const importMeta = import.meta as any;

const supabaseUrl =
  (typeof process !== 'undefined' ? process.env?.SUPABASE_URL : null) ||
  (importMeta.env?.VITE_SUPABASE_URL) ||
  '';

const supabaseAnonKey =
  (typeof process !== 'undefined' ? process.env?.SUPABASE_ANON_KEY : null) ||
  (importMeta.env?.VITE_SUPABASE_ANON_KEY) ||
  '';

const hasCredentials = Boolean(supabaseUrl && supabaseAnonKey);

if (!hasCredentials) {
  console.warn(
    '[AGEMED] Supabase credentials are missing. ' +
    'The app will run in offline/mock mode. ' +
    'Set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in your .env file.'
  );
}

/** Lazy singleton — only created once credentials exist. Returns null in offline mode. */
let _client: SupabaseClient<Database> | null = null;

export function getSupabaseClient(): SupabaseClient<Database> | null {
  if (!hasCredentials) return null;
  if (!_client) {
    _client = createClient<Database>(supabaseUrl, supabaseAnonKey);
  }
  return _client;
}

/** @deprecated Use getSupabaseClient() instead to safely handle missing credentials. */
export const supabase = hasCredentials
  ? createClient<Database>(supabaseUrl, supabaseAnonKey)
  : null;

