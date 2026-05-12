import { createClient, type SupabaseClient } from '@supabase/supabase-js'

let cachedClient: SupabaseClient | null = null
let warnedMissingEnv = false

function readEnv(): { url?: string; key?: string } {
  return {
    url: import.meta.env.VITE_SUPABASE_URL,
    key: import.meta.env.VITE_SUPABASE_ANON_KEY,
  }
}

export function isSupabaseConfigured(): boolean {
  const { url, key } = readEnv()
  return Boolean(url && key)
}

function getClient(): SupabaseClient {
  if (cachedClient) return cachedClient
  const { url, key } = readEnv()
  if (!url || !key) {
    if (!warnedMissingEnv) {
      warnedMissingEnv = true
      // eslint-disable-next-line no-console
      console.error(
        'Supabase env vars não configuradas. Defina VITE_SUPABASE_URL e VITE_SUPABASE_ANON_KEY no .env. ' +
          'A landing page pública continua funcionando; rotas autenticadas (/login, /app/*) precisam dessas variáveis.',
      )
    }
    throw new Error(
      'Supabase env vars não configuradas. Defina VITE_SUPABASE_URL e VITE_SUPABASE_ANON_KEY no .env.',
    )
  }
  cachedClient = createClient(url, key, {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true,
    },
  })
  return cachedClient
}

export const supabase = new Proxy({} as SupabaseClient, {
  get(_target, prop, receiver) {
    const client = getClient()
    const value = Reflect.get(client, prop, receiver)
    return typeof value === 'function' ? value.bind(client) : value
  },
}) as SupabaseClient
