-- Script para adicionar colunas que estão faltando na tabela subtasks
-- Execute este SQL no Editor SQL do Supabase

-- Adicionar colunas que estão faltando na tabela subtasks
ALTER TABLE subtasks 
ADD COLUMN IF NOT EXISTS importance VARCHAR(50) DEFAULT 'normal',
ADD COLUMN IF NOT EXISTS category VARCHAR(255),
ADD COLUMN IF NOT EXISTS estimated_time VARCHAR(50),
ADD COLUMN IF NOT EXISTS actual_time VARCHAR(50),
ADD COLUMN IF NOT EXISTS tags JSONB DEFAULT '[]';

-- Atualizar comentários das colunas
COMMENT ON COLUMN subtasks.importance IS 'Nível de importância: low, normal, high, critical';
COMMENT ON COLUMN subtasks.category IS 'Categoria da subtarefa (ex: Frontend, Backend, Design)';
COMMENT ON COLUMN subtasks.estimated_time IS 'Tempo estimado em minutos ou formato texto (ex: 2h, 30min)';
COMMENT ON COLUMN subtasks.actual_time IS 'Tempo real gasto na subtarefa';
COMMENT ON COLUMN subtasks.tags IS 'Array de tags em formato JSON';

-- Verificar estrutura atualizada da tabela
SELECT 
    'Estrutura atualizada da tabela subtasks' as status,
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'subtasks'
ORDER BY ordinal_position;

-- Verificar se há dados de teste para validar
SELECT 
    'Verificação de dados de teste' as status,
    COUNT(*) as total_subtasks,
    COUNT(CASE WHEN importance IS NOT NULL THEN 1 END) as com_importance,
    COUNT(CASE WHEN category IS NOT NULL THEN 1 END) as com_category,
    COUNT(CASE WHEN estimated_time IS NOT NULL THEN 1 END) as com_estimated_time,
    COUNT(CASE WHEN tags IS NOT NULL AND tags != '[]' THEN 1 END) as com_tags
FROM subtasks;
