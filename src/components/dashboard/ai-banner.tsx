'use client'

import { useEffect, useState } from 'react'
import { Sparkles, Brain } from 'lucide-react'
import { getDailyAIRecommendation } from '@/app/actions/ai'
import type { Profile } from '@/types/database'

interface AIBannerProps {
  profile: Profile | null
}

export function AIBanner({ profile }: AIBannerProps) {
  const [recommendation, setRecommendation] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  const userName = profile?.full_name ? profile.full_name.split(' ')[0] : 'foco'

  useEffect(() => {
    let isMounted = true

    async function fetchAI() {
      try {
        const text = await getDailyAIRecommendation()
        if (isMounted) {
          setRecommendation(text)
          setLoading(false)
        }
      } catch {
        if (isMounted) {
          setRecommendation("Continue focando na sua hidratação e treinos de hoje!")
          setLoading(false)
        }
      }
    }

    fetchAI()

    return () => {
      isMounted = false
    }
  }, [])

  return (
    <div className="glass-panel p-6 rounded-3xl bg-linear-to-r from-slate-900/90 via-slate-900/60 to-purple-950/30 border border-purple-500/20 relative overflow-hidden min-h-35">
      <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="w-full">
          <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-purple-500/15 border border-purple-500/30 text-purple-300 text-xs font-semibold w-fit mb-3">
            <Brain className="w-3.5 h-3.5" />
            <span>CheckFit AI</span>
          </div>
          <h2 className="text-xl font-bold text-slate-100">
            Olá, {userName}!
          </h2>
          
          <div className="mt-2 text-sm text-slate-300 leading-relaxed max-w-3xl">
            {loading ? (
              <div className="flex flex-col gap-2 animate-pulse mt-3">
                <div className="h-4 bg-slate-700/50 rounded-md w-3/4"></div>
                <div className="h-4 bg-slate-700/50 rounded-md w-1/2"></div>
              </div>
            ) : (
              <p className="flex items-start gap-2">
                <Sparkles className="w-4 h-4 text-purple-400 shrink-0 mt-0.5" />
                <span>{recommendation}</span>
              </p>
            )}
          </div>
        </div>

        {/* Círculo decorativo ao fundo */}
        <div className="absolute -right-20 -top-20 w-64 h-64 bg-purple-600/10 rounded-full blur-3xl pointer-events-none"></div>
      </div>
    </div>
  )
}
