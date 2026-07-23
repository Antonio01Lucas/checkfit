'use client'

import { useState, useTransition } from 'react'
import { Plus, Dumbbell, Utensils, Droplets, Sparkles, Clock, Trash2, type LucideIcon } from 'lucide-react'
import { createRoutine, deleteRoutine, toggleRoutineActive } from '@/app/actions/scheduled-routines'
import type { RoutineItem, RoutineCategory } from '@/types/database'

interface RoutineClientProps {
  initialRoutines: RoutineItem[]
}

const categoryConfig: Record<RoutineCategory, { icon: LucideIcon; color: string; bg: string; label: string }> = {
  workout: { icon: Dumbbell, color: 'text-emerald-400', bg: 'bg-emerald-500/20', label: 'Treino' },
  meal: { icon: Utensils, color: 'text-orange-400', bg: 'bg-orange-500/20', label: 'Refeição' },
  hydration: { icon: Droplets, color: 'text-cyan-400', bg: 'bg-cyan-500/20', label: 'Água' },
  habit: { icon: Sparkles, color: 'text-purple-400', bg: 'bg-purple-500/20', label: 'Hábito' },
}

export function RoutineClient({ initialRoutines }: RoutineClientProps) {
  const [routines, setRoutines] = useState<RoutineItem[]>(initialRoutines)
  const [isPending, startTransition] = useTransition()
  
  const [isAdding, setIsAdding] = useState(false)
  const [newTitle, setNewTitle] = useState('')
  const [newTime, setNewTime] = useState('08:00')
  const [newCategory, setNewCategory] = useState<RoutineCategory>('habit')
  const [newDescription, setNewDescription] = useState('')

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault()
    if (!newTitle || !newTime) return

    startTransition(async () => {
      const { success, error } = await createRoutine(newTitle, newCategory, newTime, newDescription)
      
      if (success) {
        // Optimistic refresh
        const newItem: RoutineItem = {
          id: Math.random().toString(), // fake ID for now, Server Action revalidates page anyway
          user_id: '',
          title: newTitle,
          category: newCategory,
          scheduled_time: newTime,
          description: newDescription,
          is_active: true,
          created_at: new Date().toISOString()
        }
        
        setRoutines((prev) => [...prev, newItem].sort((a, b) => a.scheduled_time.localeCompare(b.scheduled_time)))
        setIsAdding(false)
        setNewTitle('')
        setNewDescription('')
        // page revalidation happens in server action
      } else {
        alert(error || 'Erro ao criar rotina')
      }
    })
  }

  const handleToggle = (id: string, currentStatus: boolean) => {
    // Optimistic update
    setRoutines(prev => prev.map(r => r.id === id ? { ...r, is_active: !currentStatus } : r))
    
    startTransition(async () => {
      const { success } = await toggleRoutineActive(id, !currentStatus)
      if (!success) {
        // Revert on error
        setRoutines(prev => prev.map(r => r.id === id ? { ...r, is_active: currentStatus } : r))
        alert('Erro ao atualizar status')
      }
    })
  }

  const handleDelete = (id: string) => {
    if (!confirm('Deseja realmente excluir este hábito da sua rotina?')) return

    const previousRoutines = [...routines]
    setRoutines(prev => prev.filter(r => r.id !== id))

    startTransition(async () => {
      const { success } = await deleteRoutine(id)
      if (!success) {
        setRoutines(previousRoutines)
        alert('Erro ao excluir rotina')
      }
    })
  }

  return (
    <div className="space-y-6">
      {/* Header Actions */}
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-white">Hábitos Agendados</h2>
        <button
          onClick={() => setIsAdding(!isAdding)}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold text-sm transition-all shadow-lg shadow-blue-600/25"
        >
          <Plus className="w-4 h-4" />
          {isAdding ? 'Cancelar' : 'Novo Hábito'}
        </button>
      </div>

      {/* Form de Adição */}
      {isAdding && (
        <form onSubmit={handleAdd} className="glass-panel p-6 rounded-3xl bg-slate-900/60 border border-blue-500/30">
          <h3 className="text-sm font-bold text-slate-200 mb-4 uppercase tracking-wider">Criar Novo Hábito</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-xs font-semibold text-slate-400 mb-1">Título</label>
              <input
                type="text"
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
                placeholder="Ex: Leitura da manhã"
                className="w-full px-4 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-slate-200 focus:outline-none focus:border-blue-500"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-400 mb-1">Horário Planejado</label>
              <input
                type="time"
                value={newTime}
                onChange={(e) => setNewTime(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-slate-200 focus:outline-none focus:border-blue-500"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-400 mb-1">Categoria</label>
              <select
                value={newCategory}
                onChange={(e) => setNewCategory(e.target.value as RoutineCategory)}
                className="w-full px-4 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-slate-200 focus:outline-none focus:border-blue-500 appearance-none"
              >
                <option value="habit">Hábito Geral</option>
                <option value="workout">Treino</option>
                <option value="meal">Refeição</option>
                <option value="hydration">Água</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-400 mb-1">Descrição (Opcional)</label>
              <input
                type="text"
                value={newDescription}
                onChange={(e) => setNewDescription(e.target.value)}
                placeholder="Detalhes adicionais..."
                className="w-full px-4 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-slate-200 focus:outline-none focus:border-blue-500"
              />
            </div>
          </div>
          <div className="flex justify-end">
            <button
              type="submit"
              disabled={isPending}
              className="px-6 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-white font-bold text-sm transition-all shadow-lg disabled:opacity-50"
            >
              {isPending ? 'Salvando...' : 'Salvar Hábito'}
            </button>
          </div>
        </form>
      )}

      {/* Lista de Hábitos */}
      <div className="space-y-4">
        {routines.length === 0 && !isAdding && (
          <div className="text-center py-12 glass-panel rounded-3xl bg-slate-900/40">
            <Clock className="w-12 h-12 text-slate-600 mx-auto mb-3" />
            <p className="text-slate-400 font-medium">Sua rotina está vazia.</p>
            <p className="text-slate-500 text-sm">Adicione hábitos para começar a organizar seu dia.</p>
          </div>
        )}

        {routines.map((routine) => {
          const config = categoryConfig[routine.category]
          const Icon = config.icon

          // Formatar hora para exibir apenas HH:MM (no BD vem como HH:MM:SS)
          const displayTime = routine.scheduled_time.substring(0, 5)

          return (
            <div 
              key={routine.id}
              className={`glass-panel p-4 rounded-2xl border transition-all flex items-center justify-between ${
                routine.is_active ? 'bg-slate-900/60 border-slate-700/50' : 'bg-slate-900/20 border-slate-800/30 opacity-60'
              }`}
            >
              <div className="flex items-center gap-4">
                {/* Horário */}
                <div className="w-16 text-center">
                  <span className={`text-lg font-black ${routine.is_active ? 'text-slate-200' : 'text-slate-500'}`}>
                    {displayTime}
                  </span>
                </div>

                {/* Ícone */}
                <div className={`p-3 rounded-xl ${routine.is_active ? config.bg : 'bg-slate-800'} ${routine.is_active ? config.color : 'text-slate-500'}`}>
                  <Icon className="w-5 h-5" />
                </div>

                {/* Detalhes */}
                <div>
                  <h3 className={`font-bold ${routine.is_active ? 'text-slate-100' : 'text-slate-500'}`}>
                    {routine.title}
                  </h3>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className="text-xs font-semibold text-slate-500 uppercase tracking-wide">
                      {config.label}
                    </span>
                    {routine.description && (
                      <>
                        <span className="w-1 h-1 rounded-full bg-slate-600" />
                        <span className="text-xs text-slate-400">{routine.description}</span>
                      </>
                    )}
                  </div>
                </div>
              </div>

              {/* Ações */}
              <div className="flex items-center gap-4">
                {/* Toggle Switch */}
                <button
                  onClick={() => handleToggle(routine.id, routine.is_active)}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none ${
                    routine.is_active ? 'bg-emerald-500' : 'bg-slate-700'
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      routine.is_active ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>

                {/* Excluir */}
                <button
                  onClick={() => handleDelete(routine.id)}
                  disabled={isPending}
                  className="p-2 rounded-xl text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 transition-colors disabled:opacity-50"
                  title="Excluir hábito"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
