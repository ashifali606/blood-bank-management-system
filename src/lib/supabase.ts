import { createClient } from '@supabase/supabase-js';
import type { SupabaseClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

const isValidUrl = (url: string) => {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
};

const isConfigured = Boolean(
  supabaseUrl &&
  supabaseAnonKey &&
  isValidUrl(supabaseUrl) &&
  supabaseUrl.includes('supabase.co')
);

export const supabase = isConfigured
  ? createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true,
      },
    })
  : null;

export function isSupabaseConfigured(): boolean {
  return isConfigured;
}

const SCHEMA_CACHE_ERROR = 'Could not find the table';

type QueryResult = { data: unknown | null; error: { message: string } | null };

export async function safeQuery<T = unknown>(
  fn: (client: SupabaseClient<any, any, any>) => Promise<QueryResult>,
  retries = 1
): Promise<{ data: T | null; error: Error | null }> {
  if (!supabase) return { data: null, error: new Error('Supabase is not configured.') };

  let lastError: Error | null = null;

  for (let attempt = 0; attempt <= retries; attempt++) {
    const result = await fn(supabase);

    if (!result.error) return { data: result.data as T | null, error: null };

    const msg = result.error.message || '';

    if (msg.includes(SCHEMA_CACHE_ERROR) && attempt < retries) {
      await new Promise(r => setTimeout(r, 1500 * (attempt + 1)));
      lastError = new Error('Database is warming up. Please try again in a moment.');
      continue;
    }

    lastError = new Error(msg);
    break;
  }

  return { data: null, error: lastError };
}
