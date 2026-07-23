-- ==============================================================================
-- 7. TABELA DE CONCLUSÃO DE ROTINAS (ROUTINE_COMPLETIONS)
-- Registra as vezes em que o usuário concluiu um hábito/rotina agendada (check in na timeline).
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.routine_completions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  routine_id UUID REFERENCES public.routines(id) ON DELETE CASCADE NOT NULL,
  completed_date DATE NOT NULL,
  completed_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, routine_id, completed_date) -- Cada rotina só pode ser concluída uma vez por dia
);

ALTER TABLE public.routine_completions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Usuários podem gerenciar suas próprias conclusões" 
  ON public.routine_completions FOR ALL 
  USING (auth.uid() = user_id);
