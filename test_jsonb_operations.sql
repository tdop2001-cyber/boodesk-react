-- Teste simples de operações JSONB (sem inserir dados)
-- Execute este SQL no Editor SQL do Supabase

-- 1. Verificar estrutura das colunas tags
SELECT 
    table_name,
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name IN ('cards', 'subtasks') 
AND column_name = 'tags'
ORDER BY table_name;

-- 2. Testar operações JSONB com dados existentes
-- Verificar se há cards com tags
SELECT 
    id,
    title,
    tags,
    jsonb_array_length(tags) as num_tags,
    created_at
FROM cards 
WHERE tags IS NOT NULL 
AND jsonb_array_length(tags) > 0
ORDER BY updated_at DESC
LIMIT 5;

-- 3. Testar busca por tag específica (se houver dados)
SELECT 
    id,
    title,
    tags,
    jsonb_array_length(tags) as num_tags
FROM cards 
WHERE tags ? 'API'
ORDER BY updated_at DESC
LIMIT 3;

-- 4. Testar busca por múltiplas tags
SELECT 
    id,
    title,
    tags,
    jsonb_array_length(tags) as num_tags
FROM cards 
WHERE tags ?| ARRAY['API', 'Frontend']
ORDER BY updated_at DESC
LIMIT 3;

-- 5. Testar operações JSONB em variáveis (sem afetar dados reais)
WITH test_data AS (
    SELECT '["API", "Frontend", "Teste"]'::jsonb as tags
)
SELECT 
    tags,
    jsonb_array_length(tags) as num_tags,
    tags ? 'API' as has_api,
    tags ?| ARRAY['API', 'Backend'] as has_any,
    tags ?& ARRAY['API', 'Frontend'] as has_all,
    tags || '"Nova Tag"'::jsonb as with_new_tag,
    tags - 'API' as without_api
FROM test_data;

-- 6. Verificar se as funções foram criadas corretamente
SELECT 
    routine_name,
    routine_type,
    data_type
FROM information_schema.routines 
WHERE routine_name IN ('add_tags_to_card', 'remove_tags_from_card', 'get_cards_by_tag')
ORDER BY routine_name;
