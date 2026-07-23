import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

/**
 * Cliente Supabase para uso em Server Components, Server Actions e Route Handlers.
 * 
 * Ele acessa com segurança os cookies da requisição HTTP para recuperar a sessão 
 * autenticada do usuário sem expor chaves privadas no cliente.
 */
export async function createClient() {
  const cookieStore = await cookies()

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        // Recupera todos os cookies da requisição atual
        getAll() {
          return cookieStore.getAll()
        },
        // Atualiza cookies quando a sessão do Supabase é renovada ou alterada
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            )
          } catch {
            // Chamadas vindas de Server Components puros não podem modificar cookies diretamente.
            // O middleware.ts cuida de renovar a sessão em cada requisição.
          }
        },
      },
    }
  )
}
