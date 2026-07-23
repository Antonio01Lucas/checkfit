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
    const { data, error } = await supabase.auth.exchangeCodeForSession(code)

    console.log('AUTH CALLBACK ERROR?', error)
    console.log('HAS SESSION?', !!data?.session)
    console.log('HAS PROVIDER TOKEN?', !!data?.session?.provider_token)

    if (!error && data?.session) {
      // Se tiver provider_token, salva no profile do usuário (Google Calendar/Tasks)
      if (data.session.provider_token) {
        const { error: updateError } = await supabase
          .from('profiles')
          .update({
            google_access_token: data.session.provider_token,
            google_refresh_token: data.session.provider_refresh_token || null,
            google_calendar_connected: true
          })
          .eq('id', data.session.user.id)
          
        console.log('UPDATE PROFILE ERROR?', updateError)
      }

      // Redireciona o usuário autenticado para a tela principal (Dashboard)
      return NextResponse.redirect(`${origin}/dashboard`)
    }
  }

  // Se houver erro, retorna o usuário para a tela de login
  return NextResponse.redirect(`${origin}/login?error=auth-failed`)
}
