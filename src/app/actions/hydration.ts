'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

/**
 * Adiciona um registro de consumo de água (em mililitros)
 */
export async function addWaterIntake(amount: number) {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    throw new Error('Usuário não autenticado')
  }

  const { error } = await supabase
    .from('hydration_logs')
    .insert({
      user_id: user.id,
      amount_ml: amount,
      // logged_at é gerado automaticamente pelo banco
    })

  if (error) {
    console.error('Erro ao salvar hidratação:', error)
    throw new Error('Falha ao registrar consumo de água')
  }

  // Força o Next.js a limpar o cache da página e buscar os dados mais recentes
  revalidatePath('/dashboard')
}

/**
 * Busca a quantidade total de água consumida no dia de hoje
 */
export async function getDailyHydration(): Promise<number> {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return 0
  }

  // Define o início e fim do dia atual (fuso horário local do servidor)
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const tomorrow = new Date(today)
  tomorrow.setDate(tomorrow.getDate() + 1)

  const { data, error } = await supabase
    .from('hydration_logs')
    .select('amount_ml')
    .eq('user_id', user.id)
    .gte('logged_at', today.toISOString())
    .lt('logged_at', tomorrow.toISOString())

  if (error) {
    console.error('Erro ao buscar hidratação diária:', error)
    return 0
  }

  const total = data.reduce((sum, log) => sum + log.amount_ml, 0)
  return total
}
