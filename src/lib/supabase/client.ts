import { createBrowserClient } from '@supabase/ssr'

/**
 * Cliente Supabase para uso exclusivo no lado do cliente (Client Components - 'use client').
 * 
 * Este utilitário reutiliza o token de autenticação armazenado no navegador (cookies/localStorage)
 * para realizar chamadas no banco de dados, autenticação e realtime diretamente pelo browser.
 */
export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
}
