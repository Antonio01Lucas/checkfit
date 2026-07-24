'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

import type { RoutineCategory } from '@/types/database'

export type RoutineItem = {
  id: string
  type: RoutineCategory
  title: string
  details: string
  time: string
  loggedAt: string
  routine_id?: string
}

/**
 * Busca todos os treinos e refeições logados hoje e os combina em uma única lista cronológica.
 */
export async function getTodayRoutine(): Promise<RoutineItem[]> {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return []

  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const tomorrow = new Date(today)
  tomorrow.setDate(tomorrow.getDate() + 1)

  // Fetch Workouts
  const { data: workouts } = await supabase
    .from('workout_logs')
    .select('*')
    .eq('user_id', user.id)
    .gte('logged_at', today.toISOString())
    .lt('logged_at', tomorrow.toISOString())

  // Fetch Meals
  const { data: meals } = await supabase
    .from('meal_logs')
    .select('*')
    .eq('user_id', user.id)
    .gte('logged_at', today.toISOString())
    .lt('logged_at', tomorrow.toISOString())

  // Fetch Hydration
  const { data: hydration } = await supabase
    .from('hydration_logs')
    .select('*')
    .eq('user_id', user.id)
    .gte('logged_at', today.toISOString())
    .lt('logged_at', tomorrow.toISOString())

  // Fetch Routine Completions
  const todayString = today.toISOString().split('T')[0]
  const { data: completions } = await supabase
    .from('routine_completions')
    .select(`
      id,
      completed_at,
      routine_id,
      routines (
        title,
        category,
        description
      )
    `)
    .eq('user_id', user.id)
    .eq('completed_date', todayString)

  const routineItems: RoutineItem[] = []

  if (workouts) {
    workouts.forEach(w => {
      const date = new Date(w.logged_at)
      routineItems.push({
        id: w.id,
        type: 'workout',
        title: w.workout_name,
        details: `${w.duration_minutes || 0} min • ${w.calories_burned || 0} kcal`,
        time: date.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
        loggedAt: w.logged_at
      })
    })
  }

  if (meals) {
    meals.forEach(m => {
      const date = new Date(m.logged_at)
      routineItems.push({
        id: m.id,
        type: 'meal',
        title: m.meal_name,
        details: `${m.calories || 0} kcal`,
        time: date.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
        loggedAt: m.logged_at
      })
    })
  }

  if (hydration) {
    hydration.forEach(h => {
      const date = new Date(h.logged_at)
      routineItems.push({
        id: h.id,
        type: 'hydration',
        title: 'Água',
        details: `${h.amount_ml || 0} ml`,
        time: date.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
        loggedAt: h.logged_at
      })
    })
  }

  if (completions) {
    type RoutineJoin = { title: string; category: string; description: string | null }
    type CompletionRow = {
      id: string
      completed_at: string
      routine_id: string
      routines: RoutineJoin | RoutineJoin[] | null
    }
    ;(completions as CompletionRow[]).forEach((c) => {
      const date = new Date(c.completed_at)
      const routine = Array.isArray(c.routines) ? c.routines[0] : c.routines
      routineItems.push({
        id: c.id,
        routine_id: c.routine_id,
        type: (routine?.category || 'habit') as RoutineCategory,
        title: routine?.title || 'Hábito Concluído',
        details: routine?.description || 'Concluído no Dashboard',
        time: date.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
        loggedAt: c.completed_at
      })
    })
  }

  // Ordenar cronologicamente
  routineItems.sort((a, b) => new Date(a.loggedAt).getTime() - new Date(b.loggedAt).getTime())

  return routineItems
}

/**
 * Adiciona um treino.
 */
export async function logWorkout(name: string, durationMinutes: number, caloriesBurned: number) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) throw new Error('Usuário não autenticado')

  const { data, error } = await supabase
    .from('workout_logs')
    .insert({
      user_id: user.id,
      workout_name: name,
      duration_minutes: durationMinutes,
      calories_burned: caloriesBurned
    })
    .select()
    .single()

  if (error) {
    console.error('Erro ao salvar treino:', error)
    throw new Error('Falha ao salvar treino')
  }

  revalidatePath('/dashboard')
  return data
}

/**
 * Adiciona uma refeição.
 */
export async function logMeal(name: string, calories: number) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) throw new Error('Usuário não autenticado')

  const { data, error } = await supabase
    .from('meal_logs')
    .insert({
      user_id: user.id,
      meal_name: name,
      calories: calories
    })
    .select()
    .single()

  if (error) {
    console.error('Erro ao salvar refeição:', error)
    throw new Error('Falha ao salvar refeição')
  }

  revalidatePath('/dashboard')
  return data
}

/**
 * Remove um log (treino, refeição ou água).
 */
export async function deleteRoutineLog(id: string, type: RoutineCategory): Promise<{ success: boolean; error?: string }> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return { success: false, error: 'Usuário não autenticado' }

  let table = ''
  if (type === 'workout') table = 'workout_logs'
  else if (type === 'meal') table = 'meal_logs'
  else if (type === 'hydration') table = 'hydration_logs'
  else return { success: false, error: 'Tipo inválido' }

  const { error } = await supabase
    .from(table)
    .delete()
    .eq('id', id)
    .eq('user_id', user.id)

  if (error) {
    console.error(`Erro ao apagar log de ${type}:`, error)
    return { success: false, error: 'Falha ao apagar registro' }
  }

  revalidatePath('/dashboard')
  return { success: true }
}

/**
 * Atualiza um log existente.
 */
export async function updateRoutineLog(
  id: string,
  type: RoutineCategory,
  data: {
    title?: string
    calories?: number
    duration?: number
    amount?: number
    logged_at?: string
  }
): Promise<{ success: boolean; error?: string }> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return { success: false, error: 'Usuário não autenticado' }

  let table = ''
  const updateData: Record<string, string | number> = {}

  if (type === 'workout') {
    table = 'workout_logs'
    if (data.title !== undefined) updateData.workout_name = data.title
    if (data.calories !== undefined) updateData.calories_burned = data.calories
    if (data.duration !== undefined) updateData.duration_minutes = data.duration
  } else if (type === 'meal') {
    table = 'meal_logs'
    if (data.title !== undefined) updateData.meal_name = data.title
    if (data.calories !== undefined) updateData.calories = data.calories
  } else if (type === 'hydration') {
    table = 'hydration_logs'
    if (data.amount !== undefined) updateData.amount_ml = data.amount
  } else {
    return { success: false, error: 'Tipo inválido' }
  }

  if (data.logged_at !== undefined) {
    updateData.logged_at = data.logged_at
  }

  const { error } = await supabase
    .from(table)
    .update(updateData)
    .eq('id', id)
    .eq('user_id', user.id)

  if (error) {
    console.error(`Erro ao atualizar log de ${type}:`, error)
    return { success: false, error: 'Falha ao atualizar registro' }
  }

  revalidatePath('/dashboard')
  return { success: true }
}
