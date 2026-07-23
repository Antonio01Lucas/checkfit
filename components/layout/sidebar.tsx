'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { 
  LayoutDashboard, 
  CalendarDays, 
  Utensils, 
  Dumbbell, 
  Share2, 
  Settings, 
  Activity, 
  Sparkles 
} from 'lucide-react'

/**
 * Menu Lateral (Sidebar) de navegação principal do CheckFit.
 * Exibe a logo, links de navegação com indicador de rota ativa e status da IA.
 */
export function Sidebar() {
  const pathname = usePathname()

  // Itens de navegação do aplicativo
  const navItems = [
    { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
    { name: 'Minha Rotina', href: '/routine', icon: CalendarDays },
    { name: 'Nutrição & Água', href: '/nutrition', icon: Utensils },
    { name: 'Exercícios', href: '/workouts', icon: Dumbbell },
    { name: 'Integrações Google', href: '/integrations', icon: Share2 },
    { name: 'Configurações', href: '/settings', icon: Settings },
  ]

  return (
    <aside className="w-64 glass-panel border-r border-slate-800/60 flex flex-col justify-between h-screen sticky top-0 z-40 p-4">
      <div>
        {/* Logo do CheckFit */}
        <div className="flex items-center gap-3 px-3 py-4 mb-6">
          <div className="w-10 h-10 rounded-xl bg-linear-to-tr from-emerald-500 to-cyan-500 flex items-center justify-center shadow-lg shadow-emerald-500/20">
            <Activity className="w-6 h-6 text-slate-950 stroke-[2.5]" />
          </div>
          <div>
            <h1 className="font-bold text-xl tracking-tight gradient-text">CheckFit</h1>
            <p className="text-xs text-slate-400 font-medium">Rotina & IA de Saúde</p>
          </div>
        </div>

        {/* Links de Navegação */}
        <nav className="space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon
            const isActive = pathname === item.href

            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 px-3.5 py-3 rounded-xl text-sm font-medium transition-all duration-200 ${
                  isActive
                    ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 font-semibold shadow-sm'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
                }`}
              >
                <Icon className={`w-5 h-5 ${isActive ? 'text-emerald-400' : 'text-slate-400'}`} />
                <span>{item.name}</span>
              </Link>
            )
          })}
        </nav>
      </div>

      {/* Widget de Status da Assistente de IA */}
      <div className="p-3.5 rounded-2xl bg-slate-900/80 border border-purple-500/20 bg-gradient-to-b from-purple-500/5 to-transparent">
        <div className="flex items-center gap-2 mb-2">
          <div className="p-1.5 rounded-lg bg-purple-500/20 text-purple-400">
            <Sparkles className="w-4 h-4" />
          </div>
          <span className="text-xs font-semibold text-purple-300">Assistente CheckFit IA</span>
        </div>
        <p className="text-xs text-slate-400 leading-relaxed mb-3">
          Pronto para ajustar sua rotina de hoje de acordo com seus horários.
        </p>
        <div className="flex items-center justify-between text-[11px] text-emerald-400 font-medium">
          <span className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            Ativo
          </span>
          <span className="text-slate-500">v1.0</span>
        </div>
      </div>
    </aside>
  )
}
