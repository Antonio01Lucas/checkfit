import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

/**
 * Função responsável por interceptar as requisições no Middleware do Next.js
 * para renovar tokens de sessão expirados antes que a página seja renderizada.
 */
export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        // Lê os cookies do cabeçalho da requisição recebida
        getAll() {
          return request.cookies.getAll()
        },
        // Atualiza cookies de sessão nos cabeçalhos da resposta enviada ao navegador
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
          supabaseResponse = NextResponse.next({
            request,
          })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  // IMPORTANTE: Evite colocar lógica complexa entre createServerClient e getUser().
  // Chamamos getUser() para garantir a validação e renovação do token JWT do usuário.
  await supabase.auth.getUser()

  return supabaseResponse
}
