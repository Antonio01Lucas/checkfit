'use client'

import { useOptimistic, useTransition, useState } from 'react'
import { Droplets, Plus, X } from 'lucide-react'
import { addWaterIntake } from '@/app/actions/hydration'

interface WaterTrackerProps {
  initialWaterIntake: number
  waterTarget?: number
}

export function WaterTracker({ initialWaterIntake, waterTarget = 2500 }: WaterTrackerProps) {
  // hook useOptimistic permite atualizar a UI instantaneamente
  const [optimisticWaterIntake, addOptimisticWater] = useOptimistic(
    initialWaterIntake,
    (state: number, amount: number) => Math.max(0, Math.min(state + amount, 5000))
  )

  const [isPending, startTransition] = useTransition()
  
  const [isCustom, setIsCustom] = useState(false)
  const [customAmount, setCustomAmount] = useState('')

  // Função para adicionar ingestão de água, executando a server action
  const handleAddWater = (amount: number) => {
    startTransition(async () => {
      // 1. Atualização Otimista (DEVE ficar dentro da transition no React 19)
      addOptimisticWater(amount)

      // 2. Server Action em background
      try {
        await addWaterIntake(amount)
      } catch (error) {
        // Se a Server Action lançar erro, a UI reverterá para o `initialWaterIntake` automaticamente.
        // O ideal é mostrar um Toast aqui informando a falha.
        console.error('Falha ao adicionar água:', error)
        alert('Falha ao salvar hidratação no banco de dados. Verifique sua conexão e tente novamente.')
      }
    })
  }

  // Cálculo da porcentagem para a barra (limitado a 100%)
  const waterPercentage = Math.min(Math.round((optimisticWaterIntake / waterTarget) * 100), 100)

  return (
    <div className="glass-panel p-5 rounded-2xl relative overflow-hidden h-full flex flex-col justify-between">
      <div>
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2 text-cyan-400 font-semibold text-sm">
            <Droplets className="w-5 h-5" />
            <span>Meta de Hidratação</span>
          </div>
          <span className="text-xs font-bold text-cyan-300 bg-cyan-500/10 px-2.5 py-1 rounded-lg border border-cyan-500/20">
            {waterPercentage}%
          </span>
        </div>

        <div className="mt-2 flex items-baseline gap-2">
          <span className="text-3xl font-extrabold text-slate-100">{optimisticWaterIntake}</span>
          <span className="text-xs text-slate-400 font-medium">/ {waterTarget} mL</span>
        </div>

        {/* Barra de Progresso */}
        <div className="w-full bg-slate-800 rounded-full h-2.5 mt-3 overflow-hidden">
          <div 
            className="bg-linear-to-r from-cyan-500 to-blue-500 h-full rounded-full transition-all duration-500"
            style={{ width: `${waterPercentage}%` }}
          ></div>
        </div>
      </div>

      {/* Botões de Ação Rápida de Água */}
      <div className="flex flex-col gap-2 mt-4 pt-4 border-t border-slate-800">
        {isCustom ? (
          <div className="flex items-center gap-2">
            <input 
              type="number"
              autoFocus
              placeholder="Ex: 300"
              className="min-w-0 w-20 flex-1 bg-slate-800/60 border border-slate-700/50 rounded-xl px-3 py-2 text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:border-cyan-500/50"
              value={customAmount}
              onChange={(e) => setCustomAmount(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && customAmount) {
                  handleAddWater(Number(customAmount))
                  setCustomAmount('')
                  setIsCustom(false)
                } else if (e.key === 'Escape') {
                  setIsCustom(false)
                  setCustomAmount('')
                }
              }}
            />
            <span className="text-sm font-medium text-slate-400">mL</span>
            <button 
              onClick={() => {
                if (customAmount) {
                  handleAddWater(Number(customAmount))
                  setCustomAmount('')
                  setIsCustom(false)
                }
              }}
              disabled={!customAmount || isPending}
              className="px-3 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-medium text-xs disabled:opacity-50 transition-all"
            >
              Add
            </button>
            <button 
              onClick={() => {
                if (customAmount) {
                  handleAddWater(-Number(customAmount))
                  setCustomAmount('')
                  setIsCustom(false)
                }
              }}
              disabled={!customAmount || isPending}
              className="px-3 py-2 rounded-xl bg-rose-600/80 hover:bg-rose-500 text-white font-medium text-xs disabled:opacity-50 transition-all"
            >
              Remover
            </button>
            <button 
              onClick={() => {
                setIsCustom(false)
                setCustomAmount('')
              }}
              className="p-2 rounded-xl text-slate-400 hover:bg-slate-800 hover:text-slate-200 transition-colors"
              title="Cancelar"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        ) : (
          <div className="flex items-center gap-2">
            <button 
              onClick={() => handleAddWater(250)}
              disabled={isPending}
              className="flex-1 py-2 rounded-xl bg-cyan-500/15 hover:bg-cyan-500/25 text-cyan-300 font-medium text-xs border border-cyan-500/30 transition-all flex items-center justify-center gap-1 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Plus className="w-3.5 h-3.5" /> 250 mL
            </button>
            <button 
              onClick={() => handleAddWater(500)}
              disabled={isPending}
              className="flex-1 py-2 rounded-xl bg-cyan-500/15 hover:bg-cyan-500/25 text-cyan-300 font-medium text-xs border border-cyan-500/30 transition-all flex items-center justify-center gap-1 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Plus className="w-3.5 h-3.5" /> 500 mL
            </button>
            <button 
              onClick={() => setIsCustom(true)}
              disabled={isPending}
              className="flex-[0.6] py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-medium text-xs border border-slate-700 transition-all flex items-center justify-center"
            >
              Outro
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
