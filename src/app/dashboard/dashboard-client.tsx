'use client'

import { Sidebar } from '@/components/layout/sidebar'
import { Header } from '@/components/layout/header'
import { WaterTracker } from '@/components/dashboard/water-tracker'
import { RoutineTimeline } from '@/components/dashboard/routine-timeline'
import { AIBanner } from '@/components/dashboard/ai-banner'
import { CalendarWidget } from '@/components/dashboard/calendar-widget'
import { TasksWidget } from '@/components/dashboard/tasks-widget'
import { type RoutineItem } from '@/app/actions/routine'
import type { RoutineItem as DBScheduledRoutine, RoutineCategory } from '@/types/database'
import { 
  Dumbbell, 
  Flame,
  Clock,
  Utensils,
  Droplets,
  Sparkles,
  CheckCircle2,
  type LucideIcon
} from 'lucide-react'

import type { Profile } from '@/types/database'

/**
 * Painel Principal (Dashboard) do CheckFit.
 * Apresenta o resumo do dia, contador de água, cronograma de rotina e ações rápidas.
 */
export default function DashboardClient({ 
  profile,
  initialWaterIntake,
  initialRoutineItems,
  scheduledRoutines = []
}: { 
  profile: Profile | null,
  initialWaterIntake: number,
  initialRoutineItems: RoutineItem[],
  scheduledRoutines: DBScheduledRoutine[]
}) {

  // Function to get the next habit based on current time
  const getNextHabit = () => {
    if (!scheduledRoutines.length) return null
    const now = new Date()
    const currentTimeString = now.toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' })
    
    // Find the first routine that is scheduled after the current time
    const next = scheduledRoutines.find(r => r.scheduled_time >= currentTimeString)
    
    // If all routines for today have passed, maybe show the first one for tomorrow
    return next || null
  }

  const nextHabit = getNextHabit()

  const categoryConfig: Record<RoutineCategory, { icon: LucideIcon; color: string; bg: string; label: string }> = {
    workout: { icon: Dumbbell, color: 'text-emerald-400', bg: 'bg-emerald-500/10', label: 'Treino' },
    meal: { icon: Utensils, color: 'text-orange-400', bg: 'bg-orange-500/10', label: 'Refeição' },
    hydration: { icon: Droplets, color: 'text-cyan-400', bg: 'bg-cyan-500/10', label: 'Água' },
    habit: { icon: Sparkles, color: 'text-purple-400', bg: 'bg-purple-500/10', label: 'Hábito' },
  }

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
            <WaterTracker 
              initialWaterIntake={initialWaterIntake} 
              waterTarget={profile?.daily_water_target_ml}
            />

            {/* Card de Próximo Hábito */}
            <div className="glass-panel p-5 rounded-2xl flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2 text-slate-300 font-semibold text-sm">
                    <Clock className="w-5 h-5 text-blue-400" />
                    <span>Próximo Hábito</span>
                  </div>
                  {nextHabit && (
                    <span className={`text-xs font-semibold px-2.5 py-1 rounded-lg border ${categoryConfig[nextHabit.category].color} ${categoryConfig[nextHabit.category].bg} border-current/20`}>
                      {nextHabit.scheduled_time.substring(0, 5)}
                    </span>
                  )}
                </div>

                <div className="mt-2">
                  {nextHabit ? (
                    <>
                      <h3 className="text-base font-bold text-slate-100">{nextHabit.title}</h3>
                      <p className="text-xs text-slate-400 mt-1 flex items-center gap-1">
                        {categoryConfig[nextHabit.category].label}
                        {nextHabit.description && ` • ${nextHabit.description}`}
                      </p>
                    </>
                  ) : (
                    <div className="flex flex-col items-center justify-center py-4 text-center">
                      <CheckCircle2 className="w-8 h-8 text-emerald-500 mb-2" />
                      <h3 className="text-sm font-bold text-slate-200">Tudo concluído!</h3>
                      <p className="text-xs text-slate-500">Você não tem mais hábitos agendados para hoje.</p>
                    </div>
                  )}
                </div>
              </div>

              {nextHabit?.category === 'workout' && (
                <div className="flex items-center gap-2 mt-4 text-xs text-slate-300">
                  <Flame className="w-4 h-4 text-orange-400" />
                  <span>
                    Meta de queima: <strong className="text-orange-400">{profile?.daily_calorie_target || 2000} kcal</strong> diárias
                  </span>
                </div>
              )}
            </div>

            {/* Integração Google Calendar */}
            <CalendarWidget />

            {/* Integração Google Tasks */}
            <TasksWidget />
          </div>

          {/* Cronograma da Rotina Diária */}
          <RoutineTimeline initialItems={initialRoutineItems} scheduledRoutines={scheduledRoutines} />
        </main>
      </div>
    </div>
  )
}
