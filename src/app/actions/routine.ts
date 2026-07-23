'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export type RoutineItem = {
  id: string
  type: 'workout' | 'meal'
  title: string
  details: string
  time: string
  loggedAt: string
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
