'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Activity, Mail, Lock, ArrowRight, Globe } from 'lucide-react'

/**
 * Página de Login e Cadastro do CheckFit.
 * Suporta Login/Cadastro tradicional por Email/Senha e Login Social via Google.
 */
export default function LoginPage() {
  const [isLogin, setIsLogin] = useState(true)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState<{ type: 'error' | 'success'; text: string } | null>(null)

  const supabase = createClient()

  // Handler de Login / Cadastro por Email e Senha
  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setMessage(null)

    try {
      if (isLogin) {
        // Login com e-mail e senha
        const { error } = await supabase.auth.signInWithPassword({ email, password })
        if (error) throw error
        window.location.href = '/dashboard'
      } else {
        // Cadastro de novo usuário
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: `${window.location.origin}/auth/callback`,
          },
        })
        if (error) throw error
        setMessage({
          type: 'success',
          text: 'Cadastro realizado com sucesso! Verifique seu e-mail para confirmar a conta.',
        })
      }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Ocorreu um erro na autenticação.'
      setMessage({ type: 'error', text: message })
    } finally {
      setLoading(false)
    }
  }

  // Handler de Login com Google OAuth
  const handleGoogleLogin = async () => {
    setLoading(true)
    setMessage(null)
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
        scopes: 'https://www.googleapis.com/auth/calendar https://www.googleapis.com/auth/tasks',
      },
    })
    if (error) {
      setMessage({ type: 'error', text: error.message })
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#090d16] flex items-center justify-center p-4 relative overflow-hidden">
      {/* Luzes decorativas de fundo (Glows) */}
      <div className="absolute top-1/4 left-1/3 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none"></div>
      <div className="absolute bottom-1/4 right-1/3 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none"></div>

      <div className="w-full max-w-md glass-panel p-8 rounded-3xl relative z-10 border border-slate-800 shadow-2xl">
        {/* Cabeçalho do Card */}
        <div className="text-center mb-8">
          <div className="w-14 h-14 rounded-2xl bg-linear-to-tr from-emerald-500 to-cyan-500 flex items-center justify-center mx-auto mb-4 shadow-lg shadow-emerald-500/20">
            <Activity className="w-8 h-8 text-slate-950 stroke-[2.5]" />
          </div>
          <h1 className="text-2xl font-bold text-slate-100 tracking-tight">
            {isLogin ? 'Acessar o CheckFit' : 'Criar sua conta no CheckFit'}
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Transforme sua rotina com IA, exercícios, nutrição e Google Sync.
          </p>
        </div>

        {/* Notificações de Erro/Sucesso */}
        {message && (
          <div
            className={`mb-6 p-3.5 rounded-xl text-xs font-medium border ${
              message.type === 'error'
                ? 'bg-rose-500/10 border-rose-500/20 text-rose-300'
                : 'bg-emerald-500/10 border-emerald-500/20 text-emerald-300'
            }`}
          >
            {message.text}
          </div>
        )}

        {/* Botão de Login Social com Google */}
        <button
          onClick={handleGoogleLogin}
          disabled={loading}
          className="w-full flex items-center justify-center gap-3 py-3 px-4 rounded-xl bg-slate-800/80 hover:bg-slate-800 border border-slate-700/60 text-slate-200 font-medium text-sm transition-all duration-200 mb-6 shadow-sm disabled:opacity-50"
        >
          <Globe className="w-5 h-5 text-cyan-400" />
          <span>Continuar com Google</span>
        </button>

        <div className="relative flex items-center justify-center mb-6">
          <div className="border-t border-slate-800 w-full"></div>
          <span className="bg-[#0f172a] px-3 text-[11px] text-slate-500 uppercase tracking-wider font-semibold">
            ou com email
          </span>
        </div>

        {/* Form de Autenticação */}
        <form onSubmit={handleAuth} className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1.5">E-mail</label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-500 absolute left-3.5 top-3.5" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="seu.email@exemplo.com"
                className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-900/90 border border-slate-800 text-slate-100 placeholder-slate-500 text-sm focus:outline-none focus:border-emerald-500/60 transition-all"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1.5">Senha</label>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-500 absolute left-3.5 top-3.5" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-900/90 border border-slate-800 text-slate-100 placeholder-slate-500 text-sm focus:outline-none focus:border-emerald-500/60 transition-all"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 px-4 rounded-xl bg-linear-to-r from-emerald-500 to-cyan-500 text-slate-950 font-bold text-sm hover:opacity-95 transition-all shadow-lg shadow-emerald-500/20 flex items-center justify-center gap-2 mt-6 disabled:opacity-50"
          >
            <span>{loading ? 'Processando...' : isLogin ? 'Entrar na Conta' : 'Criar Conta'}</span>
            <ArrowRight className="w-4 h-4 stroke-[2.5]" />
          </button>
        </form>

        {/* Alternar entre Login e Cadastro */}
        <div className="text-center mt-6 text-xs text-slate-400">
          {isLogin ? 'Ainda não possui uma conta?' : 'Já tem uma conta?'}
          <button
            onClick={() => setIsLogin(!isLogin)}
            className="ml-1.5 font-semibold text-emerald-400 hover:underline focus:outline-none"
          >
            {isLogin ? 'Cadastre-se gratuitamente' : 'Fazer Login'}
          </button>
        </div>
      </div>
    </div>
  )
}
