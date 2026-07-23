'use client'

import { Sidebar } from '@/components/layout/sidebar'
import { Header } from '@/components/layout/header'
import { WaterTracker } from '@/components/dashboard/water-tracker'
import { RoutineTimeline } from '@/components/dashboard/routine-timeline'
import { type RoutineItem } from '@/app/actions/routine'
import { 
  Sparkles, 
  Dumbbell, 
  Calendar, 
  ChevronRight,
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
          {/* Banner de Boas-Vindas com Sugestão de IA */}
          <div className="glass-panel p-6 rounded-3xl bg-linear-to-r from-slate-900/90 via-slate-900/60 to-purple-950/30 border border-purple-500/20 relative overflow-hidden">
            <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-purple-500/15 border border-purple-500/30 text-purple-300 text-xs font-semibold w-fit mb-3">
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Recomendação Inteligente de Hoje</span>
                </div>
                <h2 className="text-xl font-bold text-slate-100">
                  Olá, {profile?.full_name ? profile.full_name.split(' ')[0] : 'foco'}! Dia de recuperação e hidratação.
                </h2>
                <p className="text-xs text-slate-400 mt-1 max-w-2xl leading-relaxed">
                  A IA analisou sua rotina: você tem um treino de 45min agendado às 11:00. 
                  Lembre-se de tomar pelo menos mais <strong className="text-cyan-300">750ml de água</strong> antes das 13:00 para manter a hidratação alta.
                </p>
              </div>

              <button className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-semibold text-xs transition-all shadow-lg shadow-purple-600/25 whitespace-nowrap self-start md:self-auto">
                <span>Ajustar com IA</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>

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
