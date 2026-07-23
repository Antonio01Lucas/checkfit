import { redirect } from 'next/navigation'

/**
 * Rota raiz do aplicativo (`/`).
 * Redireciona automaticamente para o Dashboard do CheckFit.
 */
export default function HomePage() {
  redirect('/dashboard')
}
