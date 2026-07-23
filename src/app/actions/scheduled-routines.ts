'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import type { RoutineItem, RoutineCategory } from '@/types/database'

/**
 * Busca todas as rotinas agendadas do usuário, ordenadas por horário.
 */
export async function getScheduledRoutines(): Promise<RoutineItem[]> {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return []

  const { data, error } = await supabase
    .from('routines')
    .select('*')
    .eq('user_id', user.id)
    .order('scheduled_time', { ascending: true })

  if (error) {
    console.error('Erro ao buscar rotinas agendadas:', error)
    return []
  }

  return data as RoutineItem[]
}

/**
 * Cria uma nova rotina/hábito agendado.
 */
export async function createRoutine(
  title: string,
  category: RoutineCategory,
  scheduledTime: string,
  description?: string
): Promise<{ success: boolean; error?: string }> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return { success: false, error: 'Usuário não autenticado' }

  const { error } = await supabase
    .from('routines')
    .insert({
      user_id: user.id,
      title,
      category,
      scheduled_time: scheduledTime,
      description: description || null
    })

  if (error) {
    console.error('Erro ao criar rotina:', error)
    return { success: false, error: 'Falha ao salvar a rotina no banco de dados' }
  }

  revalidatePath('/dashboard/routine')
  revalidatePath('/dashboard')
  return { success: true }
}

/**
 * Alterna o status ativo/inativo de uma rotina.
 */
export async function toggleRoutineActive(
  id: string,
  isActive: boolean
): Promise<{ success: boolean; error?: string }> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return { success: false, error: 'Usuário não autenticado' }

  const { error } = await supabase
    .from('routines')
    .update({ is_active: isActive })
    .eq('id', id)
    .eq('user_id', user.id) // Segurança: garantir que pertence ao usuário

  if (error) {
    console.error('Erro ao alternar status da rotina:', error)
    return { success: false, error: 'Falha ao atualizar o status' }
  }

  revalidatePath('/dashboard/routine')
  return { success: true }
}

/**
 * Remove uma rotina agendada.
 */
export async function deleteRoutine(id: string): Promise<{ success: boolean; error?: string }> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return { success: false, error: 'Usuário não autenticado' }

  const { error } = await supabase
    .from('routines')
    .delete()
    .eq('id', id)
    .eq('user_id', user.id)

  if (error) {
    console.error('Erro ao excluir rotina:', error)
    return { success: false, error: 'Falha ao excluir a rotina' }
  }

  revalidatePath('/dashboard/routine')
  return { success: true }
}

/**
 * Marca uma rotina agendada como concluída para o dia atual.
 */
export async function completeScheduledRoutine(routineId: string): Promise<{ success: boolean; error?: string }> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return { success: false, error: 'Usuário não autenticado' }

  const today = new Date()
  const todayString = today.toISOString().split('T')[0] // YYYY-MM-DD

  const { error } = await supabase
    .from('routine_completions')
    .insert({
      user_id: user.id,
      routine_id: routineId,
      completed_date: todayString
    })

  if (error) {
    console.error('Erro ao concluir rotina:', error)
    if (error.code === '23505') {
      return { success: false, error: 'Esta atividade já foi concluída hoje.' }
    }
    return { success: false, error: 'Falha ao registrar conclusão' }
  }

  revalidatePath('/dashboard')
  return { success: true }
}
