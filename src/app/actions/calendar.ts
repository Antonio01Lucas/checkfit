'use server'

import { createClient } from '@/lib/supabase/server'

export type GoogleEvent = {
  id: string
  summary: string
  start: { dateTime?: string; date?: string }
  end: { dateTime?: string; date?: string }
  htmlLink: string
  status?: string
}

/**
 * Busca a agenda de hoje do Google Calendar
 */
export async function getTodayCalendarEvents(): Promise<{ events: GoogleEvent[], error: string | null }> {
  const supabase = await createClient()

  // 1. Verificar o usuário logado
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { events: [], error: 'Usuário não autenticado' }

  // 2. Buscar tokens no banco
  const { data: profile } = await supabase
    .from('profiles')
    .select('google_access_token, google_calendar_connected')
    .eq('id', user.id)
    .single()

  if (!profile?.google_calendar_connected || !profile.google_access_token) {
    return { events: [], error: 'not_connected' }
  }

  const accessToken = profile.google_access_token

  // 3. Montar datas para o dia atual (do início da manhã ao fim do dia)
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const tomorrow = new Date(today)
  tomorrow.setDate(tomorrow.getDate() + 1)

  try {
    const url = `https://www.googleapis.com/calendar/v3/calendars/primary/events?timeMin=${today.toISOString()}&timeMax=${tomorrow.toISOString()}&singleEvents=true&orderBy=startTime`
    console.log('Buscando eventos no Google:', url)

    // 4. Buscar Eventos no Google Calendar API
    const response = await fetch(url, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        Accept: 'application/json'
      },
      // Não usar cache em servidor, para pegar a agenda em tempo real
      cache: 'no-store'
    })

    if (!response.ok) {
      if (response.status === 401) {
        // Token Expirado
        // TODO: Implementar lógica de refresh_token se houver
        return { events: [], error: 'token_expired' }
      }
      const errorBody = await response.text()
      console.error('Google API Error:', errorBody)
      throw new Error(`Google API responded with ${response.status}: ${errorBody}`)
    }

    const data = await response.json()
    console.log(`O Google retornou ${data.items?.length || 0} eventos na agenda 'primary' (principal)`)
    
    // Imprimir detalhes dos eventos encontrados para debug
    if (data.items?.length > 0) {
      data.items.forEach((ev: GoogleEvent) => {
        console.log(`- Evento: "${ev.summary}" | Status: ${ev.status} | Início: ${ev.start?.dateTime || ev.start?.date}`)
      })
    }

    // Filtrar eventos cancelados
    const validEvents = (data.items || []).filter((ev: GoogleEvent) => ev.status !== 'cancelled')
    
    return { events: validEvents, error: null }
  } catch (error) {
    console.error('Erro ao buscar calendário:', error)
    return { events: [], error: 'Erro de conexão com Google' }
  }
}

/**
 * Cria um evento no Google Calendar para o horário atual + 1 hora
 */
export async function createGoogleEvent(title: string, startTimeIso?: string, endTimeIso?: string, recurrence?: string): Promise<{ event: GoogleEvent | null, error: string | null }> {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { event: null, error: 'Usuário não autenticado' }

  const { data: profile } = await supabase
    .from('profiles')
    .select('google_access_token')
    .eq('id', user.id)
    .single()

  if (!profile?.google_access_token) {
    return { event: null, error: 'not_connected' }
  }

  const accessToken = profile.google_access_token

  try {
    const url = `https://www.googleapis.com/calendar/v3/calendars/primary/events`
    
    // Configura o evento
    let startIso = startTimeIso
    let endIso = endTimeIso

    if (!startIso) {
      const now = new Date()
      const start = new Date(now)
      start.setMinutes(Math.ceil(now.getMinutes() / 15) * 15)
      start.setSeconds(0, 0)
      startIso = start.toISOString()
      
      const end = new Date(start)
      end.setHours(end.getHours() + 1)
      endIso = end.toISOString()
    } else if (!endIso) {
      const end = new Date(startIso)
      end.setHours(end.getHours() + 1)
      endIso = end.toISOString()
    }

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        summary: title,
        start: {
          dateTime: startIso,
        },
        end: {
          dateTime: endIso,
        },
        ...(recurrence && { recurrence: [recurrence] }),
        reminders: {
          useDefault: false,
          overrides: [
            { method: 'popup', minutes: 720 }
          ]
        }
      })
    })

    if (!response.ok) {
      const errorBody = await response.text()
      console.error('Google Calendar API Error na criação:', errorBody)
      return { event: null, error: `Erro na API: ${response.status}` }
    }

    const newEvent = await response.json()
    return { event: newEvent, error: null }
  } catch (error) {
    console.error('Erro ao criar evento:', error)
    return { event: null, error: 'Erro de conexão com Google' }
  }
}
