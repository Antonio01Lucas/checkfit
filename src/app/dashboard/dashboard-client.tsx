'use client'

import { Sidebar } from '@/components/layout/sidebar'
import { Header } from '@/components/layout/header'
import { WaterTracker } from '@/components/dashboard/water-tracker'
import { RoutineTimeline } from '@/components/dashboard/routine-timeline'
import { AIBanner } from '@/components/dashboard/ai-banner'
import { type RoutineItem } from '@/app/actions/routine'
import { 
  Dumbbell, 
  Calendar, 
  Flame
} from 'lucide-react'

import type { Profile } from '@/types/database'

/**
 * Painel Principal (Dashboard) do CheckFit.
 * Apresenta o resumo do dia, contador de água, cronograma de rotina e ações rápidas.
 */
export default function DashboardClient({ 
  profile,
  initialWaterIntake,
  initialRoutineItems
}: { 
  profile: Profile | null,
  initialWaterIntake: number,
  initialRoutineItems: RoutineItem[]
}) {

  return (
    <div className="min-h-screen bg-[#090d16] flex">
      {/* Menu Lateral de Navegação */}
      <Sidebar />

      {/* Área de Conteúdo Principal */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Cabeçalho */}
        <Header 
          title="Visão Geral da Sua Rotina" 
          description="Sua saúde e compromissos sincronizados com IA e Google Workspace." 
          profile={profile}
        />

        <main className="flex-1 p-6 space-y-6 overflow-y-auto">
          {/* Banner de Boas-Vindas com Inteligência Artificial */}
          <AIBanner profile={profile} />

          {/* Grid de Cards de Estatísticas e Metas */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Card de Hidratação Interativa */}
            <WaterTracker initialWaterIntake={initialWaterIntake} />

            {/* Card de Exercícios do Dia */}
            <div className="glass-panel p-5 rounded-2xl">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2 text-emerald-400 font-semibold text-sm">
                  <Dumbbell className="w-5 h-5" />
                  <span>Atividade Física</span>
                </div>
                <span className="text-xs font-semibold text-emerald-300 bg-emerald-500/10 px-2.5 py-1 rounded-lg border border-emerald-500/20">
                  45 min
                </span>
              </div>

              <div className="mt-2">
                <h3 className="text-base font-bold text-slate-100">Musculação - Peito/Tríceps</h3>
                <p className="text-xs text-slate-400 mt-1">Horário previsto: 11:00 hrs</p>
              </div>

              <div className="flex items-center gap-2 mt-6 text-xs text-slate-300">
                <Flame className="w-4 h-4 text-orange-400" />
                <span>Estimativa de <strong className="text-orange-400">320 kcal</strong> queimadas</span>
              </div>
            </div>

            {/* Card de Integração Google Workspace */}
            <div className="glass-panel p-5 rounded-2xl">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2 text-purple-400 font-semibold text-sm">
                  <Calendar className="w-5 h-5" />
                  <span>Google Workspace</span>
                </div>
                <span className="text-xs font-semibold text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-lg border border-emerald-500/20">
                  Conectado
                </span>
              </div>

              <p className="text-xs text-slate-400 mt-2 leading-relaxed">
                Seus horários de treino e refeições estão sincronizados com seu <strong>Google Calendar</strong> e <strong>Google Tasks</strong>.
              </p>

              <button className="w-full mt-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700/80 text-slate-200 font-medium text-xs border border-slate-700/60 transition-all">
                Gerenciar Sincronização
              </button>
            </div>
          </div>

          {/* Cronograma da Rotina Diária */}
          <RoutineTimeline initialItems={initialRoutineItems} />
        </main>
      </div>
    </div>
  )
}
