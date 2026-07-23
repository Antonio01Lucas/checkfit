'use client'

import { useEffect, useState } from 'react'
import { Calendar as CalendarIcon, Clock, Link as LinkIcon, RefreshCw, Plus } from 'lucide-react'
import { getTodayCalendarEvents, type GoogleEvent } from '@/app/actions/calendar'
import { createClient } from '@/lib/supabase/client'

export function CalendarWidget() {
  const [events, setEvents] = useState<GoogleEvent[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let isMounted = true

    async function fetchCalendar() {
      const { events: fetchedEvents, error: fetchError } = await getTodayCalendarEvents()
      
      if (isMounted) {
        if (fetchError) {
          setError(fetchError)
        } else {
          setEvents(fetchedEvents)
          setError(null)
        }
        setLoading(false)
      }
    }

    fetchCalendar()

    return () => {
      isMounted = false
    }
  }, [])

  const handleConnectGoogle = async () => {
    const supabase = createClient()
    await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
        scopes: 'https://www.googleapis.com/auth/calendar https://www.googleapis.com/auth/tasks',
      },
    })
  }

  // Função auxiliar para formatar a hora (ex: 14:30)
  const formatTime = (dateStr?: string) => {
    if (!dateStr) return 'Dia todo'
    const date = new Date(dateStr)
    return date.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
  }

  return (
    <div className="glass-panel p-6 rounded-3xl bg-slate-900/60 border border-slate-800 flex flex-col h-full min-h-[350px]">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-blue-500/10 text-blue-400">
            <CalendarIcon className="w-5 h-5" />
          </div>
          <h3 className="text-lg font-bold text-slate-100">Sua Agenda de Hoje</h3>
        </div>
        <button 
          onClick={() => window.location.reload()}
          className="p-2 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition-colors"
          title="Recarregar Agenda"
        >
          <RefreshCw className="w-4 h-4" />
        </button>
      </div>

      <div className="flex-1 flex flex-col">
        {loading ? (
          <div className="flex-1 flex items-center justify-center">
            <div className="w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : error === 'not_connected' || error === 'token_expired' ? (
          <div className="flex-1 flex flex-col items-center justify-center text-center px-4 space-y-4">
            <div className="w-16 h-16 rounded-full bg-slate-800/80 flex items-center justify-center mb-2">
              <CalendarIcon className="w-8 h-8 text-slate-500" />
            </div>
            <div>
              <p className="text-slate-300 font-medium mb-1">
                {error === 'token_expired' ? 'Sua sessão expirou' : 'Google Calendar desconectado'}
              </p>
              <p className="text-slate-500 text-sm max-w-[200px] mx-auto mb-6">
                Conecte sua conta para ver seus compromissos e planejar sua rotina.
              </p>
            </div>
            <button 
              onClick={handleConnectGoogle}
              className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold text-sm transition-all shadow-lg shadow-blue-600/25 w-full justify-center"
            >
              <LinkIcon className="w-4 h-4" />
              <span>Conectar Google</span>
            </button>
          </div>
        ) : error ? (
          <div className="flex-1 flex items-center justify-center text-rose-400 text-sm">
            {error}
          </div>
        ) : events.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center text-slate-400 text-sm gap-3">
            <div className="p-4 rounded-full bg-slate-800/50">
              <Plus className="w-6 h-6 text-slate-500" />
            </div>
            <p>Nenhum compromisso agendado para hoje.</p>
          </div>
        ) : (
          <div className="space-y-4 overflow-y-auto pr-2 custom-scrollbar flex-1 max-h-[300px]">
            {events.map((event) => (
              <a 
                key={event.id}
                href={event.htmlLink}
                target="_blank"
                rel="noreferrer"
                className="group flex gap-4 p-4 rounded-2xl bg-slate-800/40 hover:bg-slate-800/80 border border-slate-700/50 transition-all block"
              >
                <div className="flex flex-col items-center justify-center min-w-[50px] border-r border-slate-700/50 pr-4">
                  <span className="text-sm font-bold text-slate-200">
                    {formatTime(event.start.dateTime)}
                  </span>
                  {event.end.dateTime && (
                    <span className="text-xs text-slate-500 mt-0.5">
                      {formatTime(event.end.dateTime)}
                    </span>
                  )}
                </div>
                <div className="flex-1 min-w-0 flex flex-col justify-center">
                  <h4 className="text-sm font-semibold text-slate-200 truncate group-hover:text-blue-400 transition-colors">
                    {event.summary || '(Sem título)'}
                  </h4>
                  <div className="flex items-center gap-1.5 mt-1 text-slate-500">
                    <Clock className="w-3 h-3" />
                    <span className="text-xs">
                      {event.start.dateTime ? 'Horário marcado' : 'Dia todo'}
                    </span>
                  </div>
                </div>
              </a>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
