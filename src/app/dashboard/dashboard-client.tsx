'use client'

import { useEffect, useState } from 'react'
import { Sidebar } from '@/components/layout/sidebar'
import { Header } from '@/components/layout/header'
import { WaterTracker } from '@/components/dashboard/water-tracker'
import { RoutineTimeline } from '@/components/dashboard/routine-timeline'
import { AIBanner } from '@/components/dashboard/ai-banner'
import { CalendarWidget } from '@/components/dashboard/calendar-widget'
import { TasksWidget } from '@/components/dashboard/tasks-widget'
import { type RoutineItem } from '@/app/actions/routine'
import { getGoogleTasks, completeGoogleTask, type GoogleTask } from '@/app/actions/tasks'
import type { RoutineItem as DBScheduledRoutine } from '@/types/database'
import { 
  Dumbbell, 
  Flame,
  Clock,
  Utensils,
  Droplets,
  Sparkles,
  CheckCircle2,
  CheckSquare,
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

  const [tasks, setTasks] = useState<GoogleTask[]>([])
  const [tasksLoading, setTasksLoading] = useState(true)
  const [tasksError, setTasksError] = useState<string | null>(null)
  const [completingTask, setCompletingTask] = useState<string | null>(null)

  useEffect(() => {
    let isMounted = true
    async function fetchTasks() {
      const { tasks: fetchedTasks, error: fetchError } = await getGoogleTasks()
      if (isMounted) {
        if (fetchError) setTasksError(fetchError)
        else setTasks(fetchedTasks)
        setTasksLoading(false)
      }
    }
    fetchTasks()
    return () => { isMounted = false }
  }, [])

  const handleCompleteGoogleTask = async (taskId: string) => {
    if (completingTask) return
    setCompletingTask(taskId)
    
    // Atualização otimista
    const taskBackup = tasks.find(t => t.id === taskId)
    setTasks(prev => prev.filter(t => t.id !== taskId))
    
    const { success, error: completeError } = await completeGoogleTask(taskId)
    
    if (!success) {
      console.error('Falha ao concluir tarefa:', completeError)
      if (taskBackup) {
        setTasks(prev => [...prev, taskBackup])
      }
    }
    setCompletingTask(null)
  }

  // Function to get the next steps based on current time
  const getNextSteps = () => {
    const now = new Date()
    const currentTimeString = now.toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' })
    
    // Find routines that are scheduled after the current time
    const upcomingRoutines = scheduledRoutines
      .filter(r => r.scheduled_time >= currentTimeString)
      .map(r => ({ ...r, category: r.category as string }))
    
    // Pegamos todas as tarefas pendentes
    const upcomingTasks = tasks.map(t => ({
      id: t.id,
      category: 'task',
      title: t.title || '(Sem título)',
      description: t.notes || 'Google Task',
      scheduled_time: '23:59:59'
    }))

    // Combinamos rotinas primeiro (ordenadas por horário) e depois as tarefas
    const combined = [...upcomingRoutines, ...upcomingTasks]
    
    // Retornamos até 3 passos
    return combined.slice(0, 3)
  }

  const nextSteps = getNextSteps()

  const categoryConfig: Record<string, { icon: LucideIcon; color: string; bg: string; label: string }> = {
    workout: { icon: Dumbbell, color: 'text-emerald-400', bg: 'bg-emerald-500/10', label: 'Treino' },
    meal: { icon: Utensils, color: 'text-orange-400', bg: 'bg-orange-500/10', label: 'Refeição' },
    hydration: { icon: Droplets, color: 'text-cyan-400', bg: 'bg-cyan-500/10', label: 'Água' },
    habit: { icon: Sparkles, color: 'text-purple-400', bg: 'bg-purple-500/10', label: 'Hábito' },
    task: { icon: CheckSquare, color: 'text-purple-400', bg: 'bg-purple-500/10', label: 'Tarefa' }
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

            {/* Card de Próximos Passos */}
            <div className="glass-panel p-5 rounded-2xl flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-4 border-b border-slate-700/50 pb-3">
                  <div className="flex items-center gap-2 text-slate-300 font-semibold text-sm">
                    <Clock className="w-5 h-5 text-blue-400" />
                    <span>Próximos Passos</span>
                  </div>
                </div>

                <div className="space-y-3 mt-4">
                  {nextSteps.length > 0 ? (
                    nextSteps.map((step) => (
                      <div key={step.id} className="flex justify-between items-center p-4 rounded-2xl bg-slate-800/40 border border-slate-700/50">
                        <div className="pr-3">
                          <h3 className="text-sm font-bold text-slate-100 line-clamp-1">{step.title}</h3>
                          <p className="text-xs text-slate-400 mt-1 flex items-center gap-1 line-clamp-1">
                            {categoryConfig[step.category]?.label}
                            {step.description && ` • ${step.description}`}
                          </p>
                        </div>
                        {step.category !== 'task' ? (
                          <span className={`text-[11px] font-semibold px-2.5 py-1 rounded-lg border ${categoryConfig[step.category]?.color} ${categoryConfig[step.category]?.bg} border-current/20 whitespace-nowrap`}>
                            {step.scheduled_time.substring(0, 5)}
                          </span>
                        ) : (
                          <span className={`text-[11px] font-semibold px-2.5 py-1 rounded-lg border ${categoryConfig.task.color} ${categoryConfig.task.bg} border-current/20 whitespace-nowrap`}>
                            Pendente
                          </span>
                        )}
                      </div>
                    ))
                  ) : (
                    <div className="flex flex-col items-center justify-center py-4 text-center">
                      <CheckCircle2 className="w-8 h-8 text-emerald-500 mb-2" />
                      <h3 className="text-sm font-bold text-slate-200">Tudo concluído!</h3>
                      <p className="text-xs text-slate-500 mt-1">Você não tem mais atividades pendentes para hoje.</p>
                    </div>
                  )}
                </div>
              </div>

              {nextSteps.some(s => s.category === 'workout') && (
                <div className="flex items-center gap-2 mt-5 text-xs text-slate-300 border-t border-slate-700/50 pt-3">
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
            <TasksWidget 
              tasks={tasks}
              loading={tasksLoading}
              error={tasksError}
              completingTask={completingTask}
              onCompleteTask={handleCompleteGoogleTask}
            />
          </div>

          {/* Cronograma da Rotina Diária */}
          <RoutineTimeline 
            initialItems={initialRoutineItems} 
            scheduledRoutines={scheduledRoutines} 
            googleTasks={tasks}
            completingGoogleTask={completingTask}
            onCompleteGoogleTask={handleCompleteGoogleTask}
          />
        </main>
      </div>
    </div>
  )
}
