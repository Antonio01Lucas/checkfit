'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import type { Profile } from '@/types/database'

/**
 * Busca o perfil do usuário logado
 */
export async function getProfile(): Promise<{ profile: Profile | null, error: string | null }> {
  const supabase = await createClient()

  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) {
    return { profile: null, error: 'Usuário não autenticado' }
  }

  const { data: profile, error: dbError } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single()

  if (dbError) {
    console.error('Erro ao buscar perfil:', dbError)
    return { profile: null, error: 'Erro ao buscar dados do perfil' }
  }

  return { profile: profile as Profile, error: null }
}

/**
 * Atualiza as metas de saúde e outros dados básicos do perfil
 */
export async function updateProfileTargets(
  waterTarget: number,
  calorieTarget: number
): Promise<{ success: boolean, error: string | null }> {
  const supabase = await createClient()

  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) {
    return { success: false, error: 'Usuário não autenticado' }
  }

  const { error: updateError } = await supabase
    .from('profiles')
    .update({
      daily_water_target_ml: waterTarget,
      daily_calorie_target: calorieTarget,
      updated_at: new Date().toISOString()
    })
    .eq('id', user.id)

  if (updateError) {
    console.error('Erro ao atualizar perfil:', updateError)
    return { success: false, error: 'Não foi possível salvar as configurações' }
  }

  // Forçar o Next.js a revalidar os dados do dashboard em tempo real
  revalidatePath('/dashboard')
  revalidatePath('/dashboard/settings')

  return { success: true, error: null }
}

/**
 * Atualiza as preferências de IA do usuário (BYOK)
 */
export async function updateAIPreferences(provider: 'openai' | 'gemini' | 'anthropic' | null, apiKey: string | null): Promise<{ success: boolean; error?: string }> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return { success: false, error: 'Usuário não autenticado' }

  const { error: updateError } = await supabase
    .from('profiles')
    .update({
      ai_provider: provider,
      ai_api_key: apiKey,
      updated_at: new Date().toISOString()
    })
    .eq('id', user.id)

  if (updateError) {
    console.error('Erro ao salvar preferências de IA:', updateError)
    return { success: false, error: 'Falha ao salvar as configurações' }
  }

  revalidatePath('/dashboard/settings')
  return { success: true }
}
