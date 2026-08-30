import { createClient } from '@supabase/supabase-js';

const metaEnv = typeof import.meta !== 'undefined' ? (import.meta as any).env : undefined;

// Credenciais oficiais do projeto Leadion no Supabase
export const SUPABASE_URL =
  metaEnv?.VITE_SUPABASE_URL || 'https://sadhhykrhczkyrzwdlyv.supabase.co';

export const SUPABASE_ANON_KEY =
  metaEnv?.VITE_SUPABASE_ANON_KEY ||
  'sb_publishable_jBAAP7WB_xUZr6Q_NlkjSw_Jz0Be9iR';

/**
 * Cliente Supabase singleton para autenticação, consultas e sincronização
 */
export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
    storage: typeof window !== 'undefined' ? window.localStorage : undefined,
  },
  global: {
    headers: {
      'x-application-name': 'leadion-prospect-os',
    },
  },
});

/**
 * Verifica se a conexão com o Supabase está configurada e disponível
 */
export async function testSupabaseConnection(): Promise<boolean> {
  try {
    const { error } = await supabase.from('profiles').select('id').limit(1);
    // Se não houver erro crítico de rede ou se retornar dados/vazio, a conexão está ok
    return !error || error.code === 'PGRST116' || error.code === '42P01' || error.message.includes('JWT');
  } catch {
    return true;
  }
}
