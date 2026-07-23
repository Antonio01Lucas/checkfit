import { type NextRequest } from 'next/server'
import { updateSession } from '@/lib/supabase/middleware'

/**
 * Middleware global do Next.js.
 * É executado antes de cada rota para atualizar a sessão do Supabase.
 */
export async function middleware(request: NextRequest) {
  return await updateSession(request)
}

/**
 * Configuração de correspondência de rotas (matcher).
 * Define quais rotas passarão pelo middleware (exclui arquivos estáticos como imagens e favicon).
 */
export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
