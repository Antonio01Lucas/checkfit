'use server'

import { createClient } from '@/lib/supabase/server'

export type GoogleTask = {
  id: string
  title: string
  notes?: string
  status: 'needsAction' | 'completed'
  due?: string
  updated: string
}

/**
 * Busca as tarefas pendentes do Google Tasks
 */
export async function getGoogleTasks(): Promise<{ tasks: GoogleTask[], error: string | null }> {
  const supabase = await createClient()

  // 1. Verificar o usuário logado
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { tasks: [], error: 'Usuário não autenticado' }

  // 2. Buscar tokens no banco
  const { data: profile } = await supabase
    .from('profiles')
    .select('google_access_token, google_calendar_connected')
    .eq('id', user.id)
    .single()

  if (!profile?.google_calendar_connected || !profile.google_access_token) {
    return { tasks: [], error: 'not_connected' }
  }

  const accessToken = profile.google_access_token

  try {
    const url = `https://tasks.googleapis.com/tasks/v1/lists/@default/tasks?showCompleted=false&showHidden=false`
    console.log('Buscando tarefas no Google:', url)

    // 3. Buscar Tarefas no Google Tasks API
    const response = await fetch(url, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        Accept: 'application/json'
      },
      // Não usar cache em servidor
      cache: 'no-store'
    })

    if (!response.ok) {
      if (response.status === 401) {
        return { tasks: [], error: 'token_expired' }
      }
      const errorBody = await response.text()
      console.error('Google Tasks API Error:', errorBody)
      throw new Error(`Google Tasks API responded with ${response.status}: ${errorBody}`)
    }

    const data = await response.json()
    console.log(`O Google retornou ${data.items?.length || 0} tarefas pendentes`)
    
    return { tasks: data.items || [], error: null }
  } catch (error) {
    console.error('Erro ao buscar tarefas:', error)
    return { tasks: [], error: 'Erro de conexão com Google' }
  }
}

/**
 * Marca uma tarefa do Google Tasks como concluída
 */
export async function completeGoogleTask(taskId: string): Promise<{ success: boolean; error: string | null }> {
  const supabase = await createClient()

  // 1. Verificar o usuário logado
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { success: false, error: 'Usuário não autenticado' }

  // 2. Buscar token no banco
  const { data: profile } = await supabase
    .from('profiles')
    .select('google_access_token')
    .eq('id', user.id)
    .single()

  if (!profile?.google_access_token) {
    return { success: false, error: 'not_connected' }
  }

  const accessToken = profile.google_access_token

  try {
    const url = `https://tasks.googleapis.com/tasks/v1/lists/@default/tasks/${taskId}`
    console.log('Completando tarefa no Google:', url)

    // Precisamos buscar a tarefa primeiro para conseguir fazer o patch
    // (O PATCH requer o ID da tarefa)
    // Mas de acordo com a documentação do Google Tasks API, 
    // podemos apenas dar um POST/PATCH com o status 'completed'.
    // Mas na verdade, é recomendado enviar o status diretamente via PATCH.
    
    const response = await fetch(url, {
      method: 'PATCH',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        status: 'completed'
      })
    })

    if (!response.ok) {
      const errorBody = await response.text()
      console.error('Google Tasks API Error na conclusão:', errorBody)
      return { success: false, error: `Erro na API: ${response.status}` }
    }

    return { success: true, error: null }
  } catch (error) {
    console.error('Erro ao completar tarefa:', error)
    return { success: false, error: 'Erro de conexão com Google' }
  }
}

/**
 * Cria uma nova tarefa no Google Tasks
 */
export async function createGoogleTask(title: string, notes?: string): Promise<{ task: GoogleTask | null; error: string | null }> {
  const supabase = await createClient()

  // 1. Verificar o usuário logado
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { task: null, error: 'Usuário não autenticado' }

  // 2. Buscar token no banco
  const { data: profile } = await supabase
    .from('profiles')
    .select('google_access_token')
    .eq('id', user.id)
    .single()

  if (!profile?.google_access_token) {
    return { task: null, error: 'not_connected' }
  }

  const accessToken = profile.google_access_token

  try {
    const url = `https://tasks.googleapis.com/tasks/v1/lists/@default/tasks`
    console.log('Criando tarefa no Google:', url)

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        title,
        notes: notes || undefined
      })
    })

    if (!response.ok) {
      const errorBody = await response.text()
      console.error('Google Tasks API Error na criação:', errorBody)
      return { task: null, error: `Erro na API: ${response.status}` }
    }

    const newTask = await response.json()
    return { task: newTask, error: null }
  } catch (error) {
    console.error('Erro ao criar tarefa:', error)
    return { task: null, error: 'Erro de conexão com Google' }
  }
}

/**
 * Atualiza o título de uma tarefa no Google Tasks
 */
export async function updateGoogleTask(taskId: string, title: string, notes?: string): Promise<{ success: boolean; task: GoogleTask | null; error: string | null }> {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { success: false, task: null, error: 'Usuário não autenticado' }

  const { data: profile } = await supabase
    .from('profiles')
    .select('google_access_token')
    .eq('id', user.id)
    .single()

  if (!profile?.google_access_token) {
    return { success: false, task: null, error: 'not_connected' }
  }

  const accessToken = profile.google_access_token

  try {
    const url = `https://tasks.googleapis.com/tasks/v1/lists/@default/tasks/${taskId}`

    const response = await fetch(url, {
      method: 'PATCH',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        title,
        ...(notes !== undefined && { notes })
      })
    })

    if (!response.ok) {
      const errorBody = await response.text()
      console.error('Google Tasks API Error na atualização:', errorBody)
      return { success: false, task: null, error: `Erro na API: ${response.status}` }
    }

    const updatedTask = await response.json()
    return { success: true, task: updatedTask, error: null }
  } catch (error) {
    console.error('Erro ao atualizar tarefa:', error)
    return { success: false, task: null, error: 'Erro de conexão com Google' }
  }
}
