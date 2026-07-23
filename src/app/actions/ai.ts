'use server'

import { GoogleGenAI } from '@google/genai'
import { getTodayRoutine, type RoutineItem } from './routine'
import { getDailyHydration } from './hydration'
import { createClient } from '@/lib/supabase/server'

/**
 * Gera uma recomendação diária com base nos registros do usuário.
 */
export async function getDailyAIRecommendation(): Promise<string> {
  const supabase = await createClient()

  // 1. Obter informações do usuário
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return "Lembre-se de beber água e focar na sua saúde hoje!"

  const { data: profile } = await supabase
    .from('profiles')
    .select('full_name')
    .eq('id', user.id)
    .single()

  const userName = profile?.full_name ? profile.full_name.split(' ')[0] : 'foco'

  // 2. Obter métricas do dia
  const [routineItems, waterIntake] = await Promise.all([
    getTodayRoutine(),
    getDailyHydration()
  ])

  const workouts = routineItems.filter(item => item.type === 'workout')
  const meals = routineItems.filter(item => item.type === 'meal')

  // Se não houver chave de API configurada, retornamos uma mensagem padrão (fallback)
  if (!process.env.GEMINI_API_KEY) {
    return "Adicione sua Chave de API do Google Gemini no arquivo .env.local para habilitar as recomendações inteligentes!"
  }

  try {
    // 3. Inicializar Google Gemini
    const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY })

    // 4. Montar o prompt de contexto
    const prompt = `
      Você é um personal trainer virtual e nutricionista motivacional.
      O usuário se chama ${userName}.
      
      Atividades dele hoje:
      - Água bebida: ${waterIntake} ml.
      - Treinos registrados: ${workouts.length > 0 ? workouts.map(w => w.title).join(', ') : 'nenhum treino ainda'}.
      - Refeições registradas: ${meals.length > 0 ? meals.map(m => m.title).join(', ') : 'nenhuma refeição ainda'}.
      
      Com base nisso, crie uma recomendação ou frase motivacional super amigável, em português do Brasil.
      Mantenha a resposta curta, entre 1 e 2 frases no máximo (máximo 150 caracteres).
      Seja encorajador, não julgue. Elogie se ele tiver treinado ou bebido bastante água, ou sugira se faltar.
    `

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
    })

    if (response.text) {
        return response.text
    }

    return "Continue focando na sua hidratação e treinos de hoje!"
  } catch (error) {
    console.error("Erro ao gerar recomendação da IA:", error)
    return "Não foi possível conectar à Inteligência Artificial agora, mas mantenha o foco!"
  }
}
