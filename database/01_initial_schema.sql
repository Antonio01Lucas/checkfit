-- ==============================================================================
-- CHECKFIT - ESQUEMA INICIAL DO BANCO DE DADOS (SUPABASE / POSTGRESQL)
-- ==============================================================================
-- Este arquivo contém a estrutura inicial de tabelas, políticas de segurança RLS 
-- e gatilhos (triggers) para o aplicativo CheckFit.
-- 
-- Para aplicar: Cole este conteúdo no SQL Editor do painel do Supabase.
-- ==============================================================================

-- 1. TABELA DE PERFIS DE USUÁRIO (PROFILES)
-- Armazena dados cadastrais e metas de saúde de cada usuário registrado.
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  full_name TEXT,
  email TEXT NOT NULL,
  avatar_url TEXT,
  daily_water_target_ml INT DEFAULT 2500, -- Meta diária de água em mL (padrão: 2.5L)
  daily_calorie_target INT DEFAULT 2000,  -- Meta diária de calorias
  google_calendar_connected BOOLEAN DEFAULT FALSE, -- Status de integração com Google Calendar
  google_tasks_connected BOOLEAN DEFAULT FALSE,    -- Status de integração com Google Tasks
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Habilita Row Level Security (RLS) na tabela profiles
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Políticas de acesso para profiles:
CREATE POLICY "Usuários podem visualizar o próprio perfil" 
  ON public.profiles FOR SELECT 
  USING (auth.uid() = id);

CREATE POLICY "Usuários podem atualizar o próprio perfil" 
  ON public.profiles FOR UPDATE 
  USING (auth.uid() = id);

-- ------------------------------------------------------------------------------
-- 2. TABELA DE ROTINAS E LEMBRETES (ROUTINES)
-- Armazena tarefas de rotina (refeições, horários de treino, hidratação, hábitos).
CREATE TABLE IF NOT EXISTS public.routines (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,                             -- Ex: "Café da manhã reforçado", "Treino de Pernas"
  category TEXT NOT NULL CHECK (category IN ('meal', 'workout', 'hydration', 'habit')),
  scheduled_time TIME NOT NULL,                    -- Horário planejado (Ex: '08:00')
  description TEXT,
  is_active BOOLEAN DEFAULT TRUE,
  google_event_id TEXT,                            -- ID do evento sincronizado no Google Calendar
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.routines ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Usuários podem gerenciar suas próprias rotinas" 
  ON public.routines FOR ALL 
  USING (auth.uid() = user_id);

-- ------------------------------------------------------------------------------
-- 3. TABELA DE REGISTRO DE HIDRATAÇÃO (HYDRATION_LOGS)
-- Registra cada copo/garrafa de água ingerido ao longo do dia.
CREATE TABLE IF NOT EXISTS public.hydration_logs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  amount_ml INT NOT NULL,                          -- Quantidade de água em mL (Ex: 300, 500)
  logged_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.hydration_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Usuários podem gerenciar seus registros de água" 
  ON public.hydration_logs FOR ALL 
  USING (auth.uid() = user_id);

-- ------------------------------------------------------------------------------
-- 4. TABELA DE REGISTRO DE EXERCÍCIOS (WORKOUT_LOGS)
-- Registra treinos realizados pelo usuário.
CREATE TABLE IF NOT EXISTS public.workout_logs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  workout_name TEXT NOT NULL,                       -- Ex: "Musculação - Peito e Tríceps", "Corrida 5km"
  duration_minutes INT,                             -- Duração em minutos
  calories_burned INT,                              -- Estimativa de calorias queimadas
  logged_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.workout_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Usuários podem gerenciar seus registros de treino" 
  ON public.workout_logs FOR ALL 
  USING (auth.uid() = user_id);

-- ------------------------------------------------------------------------------
-- 5. TABELA DE REGISTRO DE REFEIÇÕES (MEAL_LOGS)
-- Registra refeições consumidas pelo usuário.
CREATE TABLE IF NOT EXISTS public.meal_logs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  meal_name TEXT NOT NULL,                          -- Ex: "Almoço saudável", "Shake proteico"
  calories INT,
  logged_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.meal_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Usuários podem gerenciar seus registros de refeição" 
  ON public.meal_logs FOR ALL 
  USING (auth.uid() = user_id);

-- ------------------------------------------------------------------------------
-- 6. GATILHO AUTOMÁTICO PARA CRIAR PERFIL AO REGISTRAR NOVO USUÁRIO
-- Função para inserir automaticamente uma linha na tabela public.profiles 
-- quando um novo usuário se cadastra no Supabase Auth.
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, avatar_url)
  VALUES (
    NEW.id,
    NEW.email,
    NEW.raw_user_meta_data->>'full_name',
    NEW.raw_user_meta_data->>'avatar_url'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Atribuição do gatilho à tabela auth.users
CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
