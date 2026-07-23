'use client'

import { useEffect, useState } from 'react'
import { CheckSquare, Link as LinkIcon, RefreshCw, Plus, Clock } from 'lucide-react'
import { getGoogleTasks, type GoogleTask } from '@/app/actions/tasks'
import { createClient } from '@/lib/supabase/client'

export function TasksWidget() {
  const [tasks, setTasks] = useState<GoogleTask[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let isMounted = true

    async function fetchTasks() {
      const { tasks: fetchedTasks, error: fetchError } = await getGoogleTasks()
      
      if (isMounted) {
        if (fetchError) {
          setError(fetchError)
        } else {
          setTasks(fetchedTasks)
          setError(null)
        }
        setLoading(false)
      }
    }

    fetchTasks()

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

  // Função auxiliar para formatar a data de vencimento
  const formatDue = (dateStr?: string) => {
    if (!dateStr) return null
    const date = new Date(dateStr)
    return date.toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' })
  }

  return (
    <div className="glass-panel p-6 rounded-3xl bg-slate-900/60 border border-slate-800 flex flex-col h-full min-h-87.5">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-purple-500/10 text-purple-400">
            <CheckSquare className="w-5 h-5" />
          </div>
          <h3 className="text-lg font-bold text-slate-100">Suas Tarefas</h3>
        </div>
        <button 
          onClick={() => window.location.reload()}
          className="p-2 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition-colors"
          title="Recarregar Tarefas"
        >
          <RefreshCw className="w-4 h-4" />
        </button>
      </div>

      <div className="flex-1 flex flex-col">
        {loading ? (
          <div className="flex-1 flex items-center justify-center">
            <div className="w-6 h-6 border-2 border-purple-500 border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : error === 'not_connected' || error === 'token_expired' ? (
          <div className="flex-1 flex flex-col items-center justify-center text-center px-4 space-y-4">
            <div className="w-16 h-16 rounded-full bg-slate-800/80 flex items-center justify-center mb-2">
              <CheckSquare className="w-8 h-8 text-slate-500" />
            </div>
            <div>
              <p className="text-slate-300 font-medium mb-1">
                {error === 'token_expired' ? 'Sua sessão expirou' : 'Google Tasks desconectado'}
              </p>
              <p className="text-slate-500 text-sm max-w-50 mx-auto mb-6">
                Conecte sua conta para organizar e visualizar suas tarefas.
              </p>
            </div>
            <button 
              onClick={handleConnectGoogle}
              className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-semibold text-sm transition-all shadow-lg shadow-purple-600/25 w-full justify-center"
            >
              <LinkIcon className="w-4 h-4" />
              <span>Conectar Google</span>
            </button>
          </div>
        ) : error ? (
          <div className="flex-1 flex items-center justify-center text-rose-400 text-sm">
            {error}
          </div>
        ) : tasks.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center text-slate-400 text-sm gap-3">
            <div className="p-4 rounded-full bg-slate-800/50">
              <Plus className="w-6 h-6 text-slate-500" />
            </div>
            <p>Nenhuma tarefa pendente!</p>
          </div>
        ) : (
          <div className="space-y-3 overflow-y-auto pr-2 custom-scrollbar flex-1 max-h-75">
            {tasks.map((task) => (
              <div 
                key={task.id}
                className="group flex items-start gap-4 p-4 rounded-2xl bg-slate-800/40 hover:bg-slate-800/80 border border-slate-700/50 transition-all cursor-pointer"
              >
                <div className="mt-1">
                  <div className="w-5 h-5 rounded-md border-2 border-slate-500 group-hover:border-purple-400 transition-colors"></div>
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="text-sm font-semibold text-slate-200 group-hover:text-purple-400 transition-colors leading-snug">
                    {task.title || '(Sem título)'}
                  </h4>
                  {task.notes && (
                    <p className="text-xs text-slate-500 mt-1 line-clamp-1">
                      {task.notes}
                    </p>
                  )}
                  {task.due && (
                    <div className="flex items-center gap-1.5 mt-2 text-slate-400 bg-slate-800/60 w-fit px-2 py-0.5 rounded-md">
                      <Clock className="w-3 h-3 text-purple-400" />
                      <span className="text-[11px] font-medium">
                        Prazo: {formatDue(task.due)}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
