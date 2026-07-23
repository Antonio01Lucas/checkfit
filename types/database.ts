/**
 * Tipos TypeScript para o banco de dados do CheckFit.
 * Mapeiam com precisão as tabelas criadas no Supabase.
 */

/** Perfil de usuário com metas diárias e integrações */
export interface Profile {
  id: string
  full_name: string | null
  email: string
  avatar_url: string | null
  daily_water_target_ml: number
  daily_calorie_target: number
  google_calendar_connected: boolean
  google_tasks_connected: boolean
  created_at: string
  updated_at: string
}

/** Categorias de itens da rotina diária */
export type RoutineCategory = 'meal' | 'workout' | 'hydration' | 'habit'

/** Item agendado na rotina do usuário */
export interface RoutineItem {
  id: string
  user_id: string
  title: string
  category: RoutineCategory
  scheduled_time: string
  description?: string | null
  is_active: boolean
  google_event_id?: string | null
  created_at: string
}

/** Registro de ingestão de água */
export interface HydrationLog {
  id: string
  user_id: string
  amount_ml: number
  logged_at: string
}

/** Registro de treinos realizados */
export interface WorkoutLog {
  id: string
  user_id: string
  workout_name: string
  duration_minutes?: number | null
  calories_burned?: number | null
  logged_at: string
}

/** Registro de refeições consumidas */
export interface MealLog {
  id: string
  user_id: string
  meal_name: string
  calories?: number | null
  logged_at: string
}
