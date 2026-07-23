import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

/**
 * Rota de Callback de Autenticação OAuth (ex: Google Login).
 * O Supabase redireciona o usuário para este endpoint com o parâmetro `code` 
 * para trocar por uma sessão válida com cookies no navegador.
 */
export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')

  if (code) {
    const supabase = await createClient()
    const { error } = await supabase.auth.exchangeCodeForSession(code)

    if (!error) {
      // Redireciona o usuário autenticado para a tela principal (Dashboard)
      return NextResponse.redirect(`${origin}/dashboard`)
    }
  }

  // Se houver erro, retorna o usuário para a tela de login
  return NextResponse.redirect(`${origin}/login?error=auth-failed`)
}
