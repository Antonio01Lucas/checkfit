'use client'

import { useState } from 'react'
import { Calendar as CalendarIcon, Clock, Link as LinkIcon, RefreshCw, Plus, X } from 'lucide-react'
import { type GoogleEvent } from '@/app/actions/calendar'
import { createClient } from '@/lib/supabase/client'

interface CalendarWidgetProps {
  events: GoogleEvent[]
  loading: boolean
  error: string | null
  onAddEvent?: (title: string, date?: string, startTime?: string, endTime?: string, recurrence?: string) => void
}

export function CalendarWidget({ events, loading, error, onAddEvent }: CalendarWidgetProps) {
  const [isAdding, setIsAdding] = useState(false)
  const [newEventTitle, setNewEventTitle] = useState('')
  const [newEventDate, setNewEventDate] = useState('')
  const [newStartTime, setNewStartTime] = useState('')
  const [newEndTime, setNewEndTime] = useState('')
  const [newRecurrence, setNewRecurrence] = useState('')

  // O fetch e state foram elevados para o DashboardClient

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
    <div className="glass-panel p-6 rounded-3xl bg-slate-900/60 border border-slate-800 flex flex-col h-full min-h-87.5">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-blue-500/10 text-blue-400">
            <CalendarIcon className="w-5 h-5" />
          </div>
          <h3 className="text-lg font-bold text-slate-100">Sua Agenda de Hoje</h3>
        </div>
        <div className="flex items-center gap-2">
          {onAddEvent && (
            <button 
              onClick={() => {
                setIsAdding(!isAdding)
                if (isAdding) {
                  setNewEventTitle('')
                  setNewEventDate('')
                  setNewStartTime('')
                  setNewEndTime('')
                  setNewRecurrence('')
                }
              }}
              className="p-2 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition-colors"
              title="Novo Evento"
            >
              {isAdding ? <X className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
            </button>
          )}
          <button 
            onClick={() => window.location.reload()}
            className="p-2 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition-colors"
            title="Recarregar Agenda"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {isAdding && onAddEvent && (
        <div className="mb-6 p-4 rounded-2xl bg-slate-800/40 border border-slate-700/50 flex flex-col gap-3">
          <input 
            type="text" 
            autoFocus
            placeholder="Título (ex: Reunião com a equipe)"
            className="w-full bg-slate-900/60 border border-slate-700/50 rounded-xl px-4 py-2.5 text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:border-blue-500/50"
            value={newEventTitle}
            onChange={(e) => setNewEventTitle(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Escape') {
                setIsAdding(false)
                setNewEventTitle('')
                setNewEventDate('')
                setNewStartTime('')
                setNewEndTime('')
                setNewRecurrence('')
              }
            }}
          />
          
          <div className="flex-1">
            <label className="text-[10px] uppercase font-bold text-slate-500 ml-1 mb-1 block">Data (Padrão: Hoje)</label>
            <input 
              type="date" 
              className="w-full bg-slate-900/60 border border-slate-700/50 rounded-xl px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-blue-500/50"
              value={newEventDate}
              onChange={(e) => setNewEventDate(e.target.value)}
            />
          </div>

          <div className="flex gap-3">
            <div className="flex-1">
              <label className="text-[10px] uppercase font-bold text-slate-500 ml-1 mb-1 block">Início (Opcional)</label>
              <input 
                type="time" 
                className="w-full bg-slate-900/60 border border-slate-700/50 rounded-xl px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-blue-500/50"
                value={newStartTime}
                onChange={(e) => setNewStartTime(e.target.value)}
              />
            </div>
            <div className="flex-1">
              <label className="text-[10px] uppercase font-bold text-slate-500 ml-1 mb-1 block">Fim (Opcional)</label>
              <input 
                type="time" 
                className="w-full bg-slate-900/60 border border-slate-700/50 rounded-xl px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-blue-500/50"
                value={newEndTime}
                onChange={(e) => setNewEndTime(e.target.value)}
              />
            </div>
          </div>
          
          <div className="flex-1">
            <label className="text-[10px] uppercase font-bold text-slate-500 ml-1 mb-1 block">Repetição</label>
            <select 
              className="w-full bg-slate-900/60 border border-slate-700/50 rounded-xl px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-blue-500/50 appearance-none"
              value={newRecurrence}
              onChange={(e) => setNewRecurrence(e.target.value)}
            >
              <option value="">Não repetir</option>
              <option value="RRULE:FREQ=DAILY">Todos os dias</option>
              <option value="RRULE:FREQ=WEEKLY">Semanalmente</option>
              <option value="RRULE:FREQ=MONTHLY">Mensalmente</option>
            </select>
          </div>

          <div className="flex justify-end gap-2 mt-1">
            <button 
              onClick={() => {
                setIsAdding(false)
                setNewEventTitle('')
                setNewEventDate('')
                setNewStartTime('')
                setNewEndTime('')
                setNewRecurrence('')
              }}
              className="px-4 py-2 text-xs font-medium text-slate-400 hover:text-slate-200 bg-slate-800 rounded-xl hover:bg-slate-700 transition-colors"
            >
              Cancelar
            </button>
            <button 
              onClick={() => {
                if (newEventTitle.trim()) {
                  onAddEvent(newEventTitle.trim(), newEventDate || undefined, newStartTime || undefined, newEndTime || undefined, newRecurrence || undefined)
                  setNewEventTitle('')
                  setNewEventDate('')
                  setNewStartTime('')
                  setNewEndTime('')
                  setNewRecurrence('')
                  setIsAdding(false)
                }
              }}
              disabled={!newEventTitle.trim()}
              className="px-6 py-2 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 disabled:hover:bg-blue-600 text-white rounded-xl text-sm font-bold transition-colors"
            >
              Criar Evento
            </button>
          </div>
        </div>
      )}

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
              <p className="text-slate-500 text-sm max-w-50 mx-auto mb-6">
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
          <div className="space-y-4 overflow-y-auto pr-2 custom-scrollbar flex-1 max-h-75">
            {events.map((event) => (
              <a 
                key={event.id}
                href={event.htmlLink}
                target="_blank"
                rel="noreferrer"
                className="group flex gap-4 p-4 rounded-2xl bg-slate-800/40 hover:bg-slate-800/80 border border-slate-700/50 transition-all"
              >
                <div className="flex flex-col items-center justify-center min-w-12.5 border-r border-slate-700/50 pr-4">
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
