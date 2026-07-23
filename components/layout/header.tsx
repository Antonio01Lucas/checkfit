'use client'

import { Bell, Droplets, User, Calendar } from 'lucide-react'

import type { Profile } from '@/types/database'

interface HeaderProps {
  title?: string
  description?: string
  profile?: Profile | null
}

/**
 * Cabeçalho superior (Header) do CheckFit.
 * Exibe título da página, data atual formatada, atalho rápido de água e perfil.
 */
export function Header({ 
  title = 'Dashboard', 
  description = 'Bem-vindo de volta! Confira seu progresso e rotina de hoje.',
  profile
}: HeaderProps) {
  // Formatação de data em português (Ex: "Quinta-feira, 23 de Julho")
  const todayFormatted = new Intl.DateTimeFormat('pt-BR', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
  }).format(new Date())

  return (
    <header className="sticky top-0 z-30 glass-panel border-b border-slate-800/60 px-6 py-4 flex items-center justify-between">
      {/* Título e data da página */}
      <div>
        <h1 className="text-xl font-bold text-slate-100">{title}</h1>
        <p className="text-xs text-slate-400 mt-0.5">{description}</p>
      </div>

      {/* Ações rápidas no topo */}
      <div className="flex items-center gap-4">
        {/* Badge da Data Atual */}
        <div className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-800/60 border border-slate-700/50 text-xs text-slate-300 font-medium capitalize">
          <Calendar className="w-3.5 h-3.5 text-cyan-400" />
          <span>{todayFormatted}</span>
        </div>

        {/* Botão Atalho Rápido de Água (+250ml) */}
        <button 
          title="Registrar +250ml de água"
          className="flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-cyan-500/15 border border-cyan-500/30 text-cyan-300 hover:bg-cyan-500/25 transition-all text-xs font-semibold"
        >
          <Droplets className="w-4 h-4 text-cyan-400" />
          <span>+250 ml</span>
        </button>

        {/* Notificações */}
        <button 
          className="p-2 rounded-xl bg-slate-800/60 border border-slate-700/50 text-slate-300 hover:text-white hover:bg-slate-800 transition-all relative"
          title="Notificações de lembrete"
        >
          <Bell className="w-4 h-4" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-emerald-400"></span>
        </button>

        {/* Perfil do Usuário */}
        <div className="flex items-center gap-3 pl-2 border-l border-slate-800">
          <div className="flex items-center gap-2">
            <div className="hidden md:block text-right">
              <p className="text-sm font-semibold text-slate-200">{profile?.full_name || 'Usuário'}</p>
            </div>
            <div className="w-9 h-9 rounded-xl bg-slate-800 border border-slate-700/60 flex items-center justify-center text-slate-300 font-bold text-sm shadow-inner overflow-hidden">
              {profile?.avatar_url ? (
                /* eslint-disable-next-line @next/next/no-img-element */
                <img src={profile.avatar_url} alt={profile.full_name || 'Avatar'} className="w-full h-full object-cover" />
              ) : profile?.full_name ? (
                <span>{profile.full_name.charAt(0).toUpperCase()}</span>
              ) : (
                <User className="w-5 h-5 text-slate-400" />
              )}
            </div>
          </div>
        </div>
      </div>
    </header>
  )
}
