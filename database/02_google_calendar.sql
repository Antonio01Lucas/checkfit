-- ==============================================================================
-- CHECKFIT - ATUALIZAÇÃO DE ESQUEMA (MIGRAÇÃO)
-- Integração com Google Calendar
-- ==============================================================================
-- Rode este arquivo no SQL Editor do Supabase para adicionar as colunas
-- necessárias para salvar a integração do usuário com a API do Google.
-- ==============================================================================

ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS google_refresh_token TEXT,
ADD COLUMN IF NOT EXISTS google_access_token TEXT;

-- Recarrega o cache do PostgREST para a API reconhecer as novas colunas imediatamente
NOTIFY pgrst, 'reload schema';
