'use client'

import { useState } from 'react'
import { Droplets, Flame, User, Save, ShieldCheck, Mail } from 'lucide-react'
import { updateProfileTargets } from '@/app/actions/profile'
import { useRouter } from 'next/navigation'
import type { Profile } from '@/types/database'

interface SettingsClientProps {
  initialProfile: Profile
}

export function SettingsClient({ initialProfile }: SettingsClientProps) {
  const router = useRouter()
  
  const [waterTarget, setWaterTarget] = useState(initialProfile.daily_water_target_ml)
  const [calorieTarget, setCalorieTarget] = useState(initialProfile.daily_calorie_target)
  const [isSaving, setIsSaving] = useState(false)
  const [saveStatus, setSaveStatus] = useState<'idle' | 'success' | 'error'>('idle')
  const [errorMessage, setErrorMessage] = useState('')

  const handleSave = async () => {
    setIsSaving(true)
    setSaveStatus('idle')

    const { success, error } = await updateProfileTargets(waterTarget, calorieTarget)

    setIsSaving(false)
    if (success) {
      setSaveStatus('success')
      router.refresh()
      setTimeout(() => setSaveStatus('idle'), 3000)
    } else {
      setSaveStatus('error')
      setErrorMessage(error || 'Ocorreu um erro desconhecido.')
    }
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      {/* Coluna Principal: Metas */}
      <div className="lg:col-span-2 space-y-6">
        <div className="glass-panel p-8 rounded-3xl bg-slate-900/60 border border-slate-800">
          <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
            <h2 className="text-xl font-bold text-slate-100 flex items-center gap-3">
              <User className="w-6 h-6 text-blue-400" />
              Metas Diárias
            </h2>
            <button
              onClick={handleSave}
              disabled={isSaving}
              className={`flex items-center gap-2 px-6 py-2.5 rounded-xl font-semibold text-sm transition-all shadow-lg ${
                saveStatus === 'success'
                  ? 'bg-emerald-500 hover:bg-emerald-400 text-white shadow-emerald-500/25'
                  : 'bg-blue-600 hover:bg-blue-500 text-white shadow-blue-600/25'
              } disabled:opacity-50 disabled:cursor-not-allowed`}
            >
              {isSaving ? (
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <Save className="w-4 h-4" />
              )}
              {saveStatus === 'success' ? 'Salvo!' : 'Salvar Metas'}
            </button>
          </div>

          {saveStatus === 'error' && (
            <div className="mb-6 p-4 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-sm">
              {errorMessage}
            </div>
          )}

          <div className="space-y-8">
            {/* Meta de Água */}
            <div className="space-y-4">
              <label className="flex items-center gap-2 text-slate-300 font-medium">
                <Droplets className="w-5 h-5 text-blue-400" />
                Meta de Hidratação (ml)
              </label>
              <div className="flex items-center gap-4">
                <input
                  type="range"
                  min="1000"
                  max="5000"
                  step="100"
                  value={waterTarget}
                  onChange={(e) => setWaterTarget(Number(e.target.value))}
                  className="flex-1 h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-blue-500"
                />
                <div className="relative">
                  <input
                    type="number"
                    value={waterTarget}
                    onChange={(e) => setWaterTarget(Number(e.target.value))}
                    className="w-24 px-4 py-2 bg-slate-800 border border-slate-700 rounded-xl text-slate-200 font-semibold focus:outline-none focus:border-blue-500 transition-colors"
                  />
                  <span className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 text-xs">ml</span>
                </div>
              </div>
            </div>

            <div className="h-px bg-slate-800/50 w-full" />

            {/* Meta de Calorias */}
            <div className="space-y-4">
              <label className="flex items-center gap-2 text-slate-300 font-medium">
                <Flame className="w-5 h-5 text-orange-400" />
                Meta de Calorias (kcal)
              </label>
              <div className="flex items-center gap-4">
                <input
                  type="range"
                  min="1000"
                  max="4000"
                  step="50"
                  value={calorieTarget}
                  onChange={(e) => setCalorieTarget(Number(e.target.value))}
                  className="flex-1 h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-orange-500"
                />
                <div className="relative">
                  <input
                    type="number"
                    value={calorieTarget}
                    onChange={(e) => setCalorieTarget(Number(e.target.value))}
                    className="w-28 px-4 py-2 bg-slate-800 border border-slate-700 rounded-xl text-slate-200 font-semibold focus:outline-none focus:border-orange-500 transition-colors"
                  />
                  <span className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 text-xs">kcal</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Coluna Lateral: Informações */}
      <div className="space-y-6">
        {/* Card do Perfil */}
        <div className="glass-panel p-6 rounded-3xl bg-slate-900/60 border border-slate-800 text-center flex flex-col items-center">
          <div className="w-24 h-24 rounded-full bg-slate-800 border-4 border-slate-700/50 mb-4 overflow-hidden flex items-center justify-center">
            {initialProfile.avatar_url ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={initialProfile.avatar_url} alt="Avatar" className="w-full h-full object-cover" />
            ) : (
              <User className="w-10 h-10 text-slate-500" />
            )}
          </div>
          <h3 className="text-lg font-bold text-slate-200 mb-1">
            {initialProfile.full_name || 'Usuário'}
          </h3>
          <p className="text-sm text-slate-400 flex items-center gap-2 justify-center">
            <Mail className="w-4 h-4" />
            {initialProfile.email}
          </p>
        </div>

        {/* Card de Segurança/Integrações */}
        <div className="glass-panel p-6 rounded-3xl bg-slate-900/60 border border-slate-800">
          <h3 className="text-sm font-bold text-slate-300 uppercase tracking-wider mb-4 flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            Integrações
          </h3>
          
          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 rounded-xl bg-slate-800/50 border border-slate-700/30">
              <span className="text-sm text-slate-300 font-medium">Google Calendar</span>
              <span className={`text-xs px-2 py-1 rounded-md font-semibold ${
                initialProfile.google_calendar_connected 
                  ? 'bg-emerald-500/10 text-emerald-400'
                  : 'bg-slate-700 text-slate-400'
              }`}>
                {initialProfile.google_calendar_connected ? 'Conectado' : 'Desconectado'}
              </span>
            </div>

            <div className="flex items-center justify-between p-3 rounded-xl bg-slate-800/50 border border-slate-700/30">
              <span className="text-sm text-slate-300 font-medium">Google Tasks</span>
              <span className={`text-xs px-2 py-1 rounded-md font-semibold ${
                initialProfile.google_calendar_connected 
                  ? 'bg-emerald-500/10 text-emerald-400'
                  : 'bg-slate-700 text-slate-400'
              }`}>
                {initialProfile.google_calendar_connected ? 'Conectado' : 'Desconectado'}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
