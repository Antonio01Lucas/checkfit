-- ==============================================================================
-- CHECKFIT - MIGRAÇÃO: ADIÇÃO DE CHAVES PRÓPRIAS DE IA (BYOK)
-- ==============================================================================
-- Este script adiciona as colunas necessárias para permitir que o usuário 
-- forneça sua própria chave de API de Inteligência Artificial (OpenAI, Gemini).
-- 
-- Para aplicar: Cole este conteúdo no SQL Editor do painel do Supabase.
-- ==============================================================================

-- Adiciona o provedor de IA e a chave na tabela profiles
ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS ai_provider TEXT,
ADD COLUMN IF NOT EXISTS ai_api_key TEXT;

-- Opcional: Adicionar uma restrição CHECK para limitar os provedores permitidos
-- ALTER TABLE public.profiles ADD CONSTRAINT allowed_ai_providers CHECK (ai_provider IN ('openai', 'gemini', 'anthropic', NULL));
