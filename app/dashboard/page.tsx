'use client'

import { useState } from 'react'
import { Sidebar } from '@/components/layout/sidebar'
import { Header } from '@/components/layout/header'
import { 
  Sparkles, 
  Droplets, 
  Dumbbell, 
  Utensils, 
  CheckCircle2, 
  Calendar, 
  Plus, 
  Flame,
  ChevronRight
} from 'lucide-react'

/**
 * Painel Principal (Dashboard) do CheckFit.
 * Apresenta o resumo do dia, contador de água, cronograma de rotina e ações rápidas.
 */
export default function DashboardPage() {
  // Estado local para controle interativo da quantidade de água consumida (em mL)
  const [waterIntake, setWaterIntake] = useState(1750)
  const waterTarget = 2500

  // Função para adicionar ingestão de água
  const addWater = (amount: number) => {
    setWaterIntake((prev) => Math.min(prev + amount, 5000))
  }

  // Lista simulada de itens da rotina diária
  const todayRoutine = [
    {
      id: '1',
      time: '07:30',
      title: 'Café da Manhã Nutritivo',
      category: 'meal',
      completed: true,
      details: 'Ovos mexidos, aveia e banana',
    },
    {
      id: '2',
      time: '09:00',
      title: 'Lembrete de Hidratação 500ml',
      category: 'hydration',
      completed: true,
      details: 'Meta parcial da manhã atingida',
    },
    {
      id: '3',
      time: '11:00',
      title: 'Treino de Musculação - Peito e Tríceps',
      category: 'workout',
      completed: false,
      details: '45 minutos de treino agendado no Google Calendar',
    },
    {
      id: '4',
      time: '13:00',
      title: 'Almoço Balanceado',
      category: 'meal',
      completed: false,
      details: 'Frango grelhado, arroz integral e salada verde',
    },
    {
      id: '5',
      time: '17:30',
      title: 'Caminhada de Descompressão',
      category: 'workout',
      completed: false,
      details: 'Sincronizado com Google Tasks',
    },
  ]

  // Cálculo da porcentagem da meta de água
  const waterPercentage = Math.min(Math.round((waterIntake / waterTarget) * 100), 100)

  return (
    <div className="min-h-screen bg-[#090d16] flex">
      {/* Menu Lateral de Navegação */}
      <Sidebar />

      {/* Área de Conteúdo Principal */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Cabeçalho */}
        <Header 
          title="Visão Geral da Sua Rotina" 
          description="Sua saúde e compromissos sincronizados com IA e Google Workspace." 
        />

        <main className="flex-1 p-6 space-y-6 overflow-y-auto">
          {/* Banner de Boas-Vindas com Sugestão de IA */}
          <div className="glass-panel p-6 rounded-3xl bg-linear-to-r from-slate-900/90 via-slate-900/60 to-purple-950/30 border border-purple-500/20 relative overflow-hidden">
            <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-purple-500/15 border border-purple-500/30 text-purple-300 text-xs font-semibold w-fit mb-3">
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Recomendação Inteligente de Hoje</span>
                </div>
                <h2 className="text-xl font-bold text-slate-100">
                  Dia de foco na recuperação e hidratação!
                </h2>
                <p className="text-xs text-slate-400 mt-1 max-w-2xl leading-relaxed">
                  A IA analisou sua rotina: você tem um treino de 45min agendado às 11:00. 
                  Lembre-se de tomar pelo menos mais <strong className="text-cyan-300">750ml de água</strong> antes das 13:00 para manter a hidratação alta.
                </p>
              </div>

              <button className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-semibold text-xs transition-all shadow-lg shadow-purple-600/25 whitespace-nowrap self-start md:self-auto">
                <span>Ajustar com IA</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Grid de Cards de Estatísticas e Metas */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Card de Hidratação Interativa */}
            <div className="glass-panel p-5 rounded-2xl relative overflow-hidden">
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
                <span className="text-3xl font-extrabold text-slate-100">{waterIntake}</span>
                <span className="text-xs text-slate-400 font-medium">/ {waterTarget} mL</span>
              </div>

              {/* Barra de Progresso */}
              <div className="w-full bg-slate-800 rounded-full h-2.5 mt-3 overflow-hidden">
                <div 
                  className="bg-linear-to-r from-cyan-500 to-blue-500 h-full rounded-full transition-all duration-500"
                  style={{ width: `${waterPercentage}%` }}
                ></div>
              </div>

              {/* Botões de Ação Rápida de Água */}
              <div className="flex items-center gap-2 mt-4">
                <button 
                  onClick={() => addWater(250)}
                  className="flex-1 py-2 rounded-xl bg-cyan-500/15 hover:bg-cyan-500/25 text-cyan-300 font-medium text-xs border border-cyan-500/30 transition-all flex items-center justify-center gap-1"
                >
                  <Plus className="w-3.5 h-3.5" /> +250 mL
                </button>
                <button 
                  onClick={() => addWater(500)}
                  className="flex-1 py-2 rounded-xl bg-cyan-500/15 hover:bg-cyan-500/25 text-cyan-300 font-medium text-xs border border-cyan-500/30 transition-all flex items-center justify-center gap-1"
                >
                  <Plus className="w-3.5 h-3.5" /> +500 mL
                </button>
              </div>
            </div>

            {/* Card de Exercícios do Dia */}
            <div className="glass-panel p-5 rounded-2xl">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2 text-emerald-400 font-semibold text-sm">
                  <Dumbbell className="w-5 h-5" />
                  <span>Atividade Física</span>
                </div>
                <span className="text-xs font-semibold text-emerald-300 bg-emerald-500/10 px-2.5 py-1 rounded-lg border border-emerald-500/20">
                  45 min
                </span>
              </div>

              <div className="mt-2">
                <h3 className="text-base font-bold text-slate-100">Musculação - Peito/Tríceps</h3>
                <p className="text-xs text-slate-400 mt-1">Horário previsto: 11:00 hrs</p>
              </div>

              <div className="flex items-center gap-2 mt-6 text-xs text-slate-300">
                <Flame className="w-4 h-4 text-orange-400" />
                <span>Estimativa de <strong className="text-orange-400">320 kcal</strong> queimadas</span>
              </div>
            </div>

            {/* Card de Integração Google Workspace */}
            <div className="glass-panel p-5 rounded-2xl">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2 text-purple-400 font-semibold text-sm">
                  <Calendar className="w-5 h-5" />
                  <span>Google Workspace</span>
                </div>
                <span className="text-xs font-semibold text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-lg border border-emerald-500/20">
                  Conectado
                </span>
              </div>

              <p className="text-xs text-slate-400 mt-2 leading-relaxed">
                Seus horários de treino e refeições estão sincronizados com seu <strong>Google Calendar</strong> e <strong>Google Tasks</strong>.
              </p>

              <button className="w-full mt-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700/80 text-slate-200 font-medium text-xs border border-slate-700/60 transition-all">
                Gerenciar Sincronização
              </button>
            </div>
          </div>

          {/* Cronograma da Rotina Diária */}
          <div className="glass-panel p-6 rounded-3xl">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-lg font-bold text-slate-100">Cronograma de Hoje</h3>
                <p className="text-xs text-slate-400 mt-0.5">Acompanhe seus horários planejados de comer, treinar e beber água.</p>
              </div>
              <button className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-emerald-500 text-slate-950 font-bold text-xs hover:bg-emerald-400 transition-all shadow-md shadow-emerald-500/20">
                <Plus className="w-4 h-4 stroke-3" />
                <span>Nova Tarefa</span>
              </button>
            </div>

            {/* Lista de Itens da Rotina */}
            <div className="space-y-3">
              {todayRoutine.map((item) => (
                <div 
                  key={item.id}
                  className={`flex items-center justify-between p-4 rounded-2xl border transition-all ${
                    item.completed 
                      ? 'bg-slate-900/40 border-slate-800/60 opacity-75' 
                      : 'bg-slate-900/80 border-slate-800 hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-center gap-4">
                    {/* Checkbox de Conclusão */}
                    <button 
                      className={`w-6 h-6 rounded-lg flex items-center justify-center transition-all ${
                        item.completed 
                          ? 'bg-emerald-500 text-slate-950' 
                          : 'border-2 border-slate-700 text-transparent hover:border-emerald-500'
                      }`}
                    >
                      <CheckCircle2 className="w-4 h-4 stroke-3" />
                    </button>

                    {/* Ícone por Categoria */}
                    <div className="p-2.5 rounded-xl bg-slate-800 text-slate-300">
                      {item.category === 'meal' && <Utensils className="w-4 h-4 text-orange-400" />}
                      {item.category === 'workout' && <Dumbbell className="w-4 h-4 text-emerald-400" />}
                      {item.category === 'hydration' && <Droplets className="w-4 h-4 text-cyan-400" />}
                    </div>

                    <div>
                      <h4 className={`text-sm font-semibold ${item.completed ? 'line-through text-slate-400' : 'text-slate-100'}`}>
                        {item.title}
                      </h4>
                      <p className="text-xs text-slate-400 mt-0.5">{item.details}</p>
                    </div>
                  </div>

                  <span className="text-xs font-bold text-slate-400 bg-slate-800/80 px-3 py-1.5 rounded-xl border border-slate-700/50">
                    {item.time}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}
