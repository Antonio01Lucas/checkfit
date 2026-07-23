'use client'

import { useState, useTransition, useOptimistic } from 'react'
import { Dumbbell, Utensils, CheckCircle2, X, Clock, Droplets, Sparkles, Loader2 } from 'lucide-react'
import { type RoutineItem, logWorkout, logMeal } from '@/app/actions/routine'
import { completeScheduledRoutine } from '@/app/actions/scheduled-routines'
import type { RoutineItem as DBScheduledRoutine } from '@/types/database'

interface RoutineTimelineProps {
  initialItems: RoutineItem[]
  scheduledRoutines?: DBScheduledRoutine[]
}

export function RoutineTimeline({ initialItems, scheduledRoutines = [] }: RoutineTimelineProps) {
  const [isPending, startTransition] = useTransition()
  
  const [optimisticItems, addOptimisticItem] = useOptimistic(
    initialItems,
    (state: RoutineItem[], newItem: RoutineItem) => {
      const updated = [...state, newItem]
      return updated.sort((a, b) => new Date(a.loggedAt).getTime() - new Date(b.loggedAt).getTime())
    }
  )

  const [isAddingMode, setIsAddingMode] = useState<'none' | 'workout' | 'meal'>('none')
  
  // States para o form
  const [name, setName] = useState('')
  const [calories, setCalories] = useState('')
  const [duration, setDuration] = useState('')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!name) return

    const now = new Date()
    
    // Criar item otimista falso
    const newItem: RoutineItem = {
      id: Math.random().toString(),
      type: isAddingMode as 'workout' | 'meal',
      title: name,
      details: isAddingMode === 'workout' 
        ? `${duration || 0} min • ${calories || 0} kcal` 
        : `${calories || 0} kcal`,
      time: now.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
      loggedAt: now.toISOString()
    }

    startTransition(async () => {
      addOptimisticItem(newItem)
      setIsAddingMode('none')
      setName('')
      setCalories('')
      setDuration('')

      try {
        if (newItem.type === 'workout') {
          await logWorkout(newItem.title, Number(duration) || 0, Number(calories) || 0)
        } else {
          await logMeal(newItem.title, Number(calories) || 0)
        }
      } catch (error) {
        console.error('Falha ao adicionar item à rotina:', error)
        alert('Falha ao salvar registro.')
      }
    })
  }

  const [completingId, setCompletingId] = useState<string | null>(null)

  const handleCompleteRoutine = (routine: DBScheduledRoutine) => {
    if (isPending) return
    setCompletingId(routine.id)
    
    const now = new Date()
    
    // Create optimistic completion item
    const newItem: RoutineItem = {
      id: Math.random().toString(),
      routine_id: routine.id,
      type: routine.category,
      title: routine.title,
      details: routine.description || 'Concluído no Dashboard',
      time: routine.scheduled_time.substring(0, 5),
      loggedAt: now.toISOString()
    }

    startTransition(async () => {
      addOptimisticItem(newItem)
      
      const { success, error } = await completeScheduledRoutine(routine.id)
      
      if (!success) {
        alert(error || 'Falha ao registrar conclusão.')
        // In a real app with proper error boundary/state, we would revert optimistic update here
      }
      setCompletingId(null)
    })
  }

  return (
    <div className="glass-panel p-6 rounded-3xl">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-bold text-slate-100">Meu Dia</h3>
          <p className="text-xs text-slate-400 mt-0.5">Hábitos agendados e atividades concluídas.</p>
        </div>
        
        {isAddingMode === 'none' ? (
          <div className="flex gap-2">
            <button 
              onClick={() => setIsAddingMode('meal')}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-orange-500/20 text-orange-400 font-bold text-xs hover:bg-orange-500/30 transition-all border border-orange-500/30"
            >
              <Utensils className="w-3.5 h-3.5" /> + Refeição
            </button>
            <button 
              onClick={() => setIsAddingMode('workout')}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-emerald-500/20 text-emerald-400 font-bold text-xs hover:bg-emerald-500/30 transition-all border border-emerald-500/30"
            >
              <Dumbbell className="w-3.5 h-3.5" /> + Treino
            </button>
          </div>
        ) : (
          <button 
            onClick={() => setIsAddingMode('none')}
            className="p-2 rounded-xl bg-slate-800 text-slate-400 hover:text-white transition-all"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {isAddingMode !== 'none' && (
        <form onSubmit={handleSubmit} className="mb-6 p-4 rounded-2xl border border-slate-700 bg-slate-800/50 flex flex-col gap-3">
          <div className="flex items-center gap-2 text-sm font-semibold text-slate-200 mb-1">
            {isAddingMode === 'workout' ? <Dumbbell className="w-4 h-4 text-emerald-400"/> : <Utensils className="w-4 h-4 text-orange-400"/>}
            Novo {isAddingMode === 'workout' ? 'Treino' : 'Refeição'}
          </div>
          
          <input 
            type="text" 
            placeholder={isAddingMode === 'workout' ? "Nome (ex: Musculação)" : "Nome (ex: Almoço)"}
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-2 text-sm text-white focus:outline-none focus:border-purple-500"
            required
          />
          
          <div className="flex gap-3">
            {isAddingMode === 'workout' && (
              <input 
                type="number" 
                placeholder="Duração (min)"
                value={duration}
                onChange={(e) => setDuration(e.target.value)}
                className="w-1/2 bg-slate-900 border border-slate-700 rounded-xl px-4 py-2 text-sm text-white focus:outline-none focus:border-purple-500"
              />
            )}
            <input 
              type="number" 
              placeholder="Calorias"
              value={calories}
              onChange={(e) => setCalories(e.target.value)}
              className="flex-1 bg-slate-900 border border-slate-700 rounded-xl px-4 py-2 text-sm text-white focus:outline-none focus:border-purple-500"
            />
          </div>
          
          <button 
            type="submit" 
            disabled={isPending || !name}
            className="mt-2 w-full py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-sm transition-all disabled:opacity-50"
          >
            {isPending ? 'Salvando...' : 'Salvar Registro'}
          </button>
        </form>
      )}

      {/* Lista de Itens da Rotina */}
      <div className="space-y-3">
        {(() => {
          type TimelineEvent = 
            | { status: 'completed', id: string, title: string, details: string, time: string, type: string, loggedAt: string }
            | { status: 'pending', id: string, title: string, details: string, time: string, type: string }

          const events: TimelineEvent[] = [
            ...optimisticItems.map(item => ({
              status: 'completed' as const,
              id: item.id,
              title: item.title,
              details: item.details,
              time: item.time,
              type: item.type,
              loggedAt: item.loggedAt
            })),
            ...scheduledRoutines
              // Filter out routines that are already completed today
              .filter(routine => !optimisticItems.some(opt => opt.routine_id === routine.id))
              .map(routine => ({
                status: 'pending' as const,
                id: routine.id,
                title: routine.title,
                details: routine.description || 'Planejado para hoje',
                time: routine.scheduled_time.substring(0, 5),
                type: routine.category,
              }))
          ]

          // Order by time
          events.sort((a, b) => a.time.localeCompare(b.time))

          if (events.length === 0) {
            return (
              <div className="text-center py-8 glass-panel rounded-2xl bg-slate-900/40 border border-slate-800/60">
                <p className="text-slate-400 text-sm">Seu dia está livre.</p>
                <p className="text-slate-500 text-xs mt-1">Nenhuma atividade agendada ou concluída.</p>
              </div>
            )
          }

          return events.map((item) => {
            const isCompleted = item.status === 'completed'
            return (
              <div 
                key={`${item.status}-${item.id}`}
                className={`flex items-center justify-between p-4 rounded-2xl border transition-all ${
                  isCompleted ? 'bg-slate-900/40 border-emerald-500/20' : 'bg-slate-900/20 border-slate-800/40 opacity-70'
                }`}
              >
                <div className="flex items-center gap-4">
                  {/* Status Indicator */}
                  {isCompleted ? (
                    <div className="w-8 h-8 rounded-xl flex items-center justify-center transition-all bg-emerald-500/20 text-emerald-400">
                      <CheckCircle2 className="w-5 h-5 stroke-[2.5]" />
                    </div>
                  ) : (
                    <button 
                      onClick={() => handleCompleteRoutine(scheduledRoutines.find(r => r.id === item.id)!)}
                      disabled={isPending && completingId === item.id}
                      title="Marcar como concluído"
                      className="w-8 h-8 rounded-xl flex items-center justify-center transition-all bg-slate-800 text-slate-500 hover:bg-emerald-500/20 hover:text-emerald-400 border border-transparent hover:border-emerald-500/30 group"
                    >
                      {isPending && completingId === item.id ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <Clock className="w-4 h-4 group-hover:hidden" />
                      )}
                      {!isPending && completingId !== item.id && (
                        <CheckCircle2 className="w-4 h-4 hidden group-hover:block" />
                      )}
                    </button>
                  )}

                  {/* Icon Indicator */}
                  <div className="p-2.5 rounded-xl bg-slate-800 text-slate-300 shadow-inner">
                    {item.type === 'meal' && <Utensils className="w-4 h-4 text-orange-400" />}
                    {item.type === 'workout' && <Dumbbell className="w-4 h-4 text-emerald-400" />}
                    {item.type === 'hydration' && <Droplets className="w-4 h-4 text-cyan-400" />}
                    {item.type === 'habit' && <Sparkles className="w-4 h-4 text-purple-400" />}
                  </div>

                  <div>
                    <h4 className={`text-sm font-semibold ${isCompleted ? 'text-slate-100' : 'text-slate-400'}`}>
                      {item.title}
                    </h4>
                    <p className="text-xs text-slate-500 mt-0.5">{item.details}</p>
                  </div>
                </div>

                <span className={`text-xs font-bold px-3 py-1.5 rounded-xl border shadow-inner ${
                  isCompleted ? 'bg-slate-800/80 text-slate-300 border-slate-700/50' : 'bg-slate-900 text-slate-600 border-slate-800/30'
                }`}>
                  {item.time}
                </span>
              </div>
            )
          })
        })()}
      </div>
    </div>
  )
}
