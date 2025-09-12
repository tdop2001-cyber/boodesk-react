-- Teste específico para tags JSONB
-- Execute este SQL no Editor SQL do Supabase

-- 1. Verificar estrutura atual das colunas tags
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

-- 2. Criar board de teste se não existir
INSERT INTO boards (board_id, name, description, owner_id) 
VALUES ('test-board', 'Board de Teste', 'Board para testes de tags', 1)
ON CONFLICT (board_id) DO NOTHING;

-- 3. Testar inserção de card com tags JSONB
INSERT INTO cards (
    card_id, 
    board_id, 
    list_name, 
    title, 
    description, 
    status, 
    importance,
    tags
) VALUES (
    'test-card-jsonb-' || extract(epoch from now()),
    'test-board',
    'A Fazer',
    'Teste Tags JSONB',
    'Card para testar tags em formato JSONB',
    'todo',
    'medium',
    '["API", "Frontend", "Teste"]'::jsonb
) RETURNING id, title, tags, jsonb_array_length(tags) as num_tags;

-- 4. Testar atualização de tags
UPDATE cards 
SET tags = '["API", "Backend", "Atualizado"]'::jsonb,
    updated_at = NOW()
WHERE title = 'Teste Tags JSONB'
RETURNING id, title, tags, jsonb_array_length(tags) as num_tags;

-- 5. Testar adição de nova tag
UPDATE cards 
SET tags = tags || '"Nova Tag"'::jsonb,
    updated_at = NOW()
WHERE title = 'Teste Tags JSONB'
RETURNING id, title, tags, jsonb_array_length(tags) as num_tags;

-- 6. Testar remoção de tag
UPDATE cards 
SET tags = tags - 'API',
    updated_at = NOW()
WHERE title = 'Teste Tags JSONB'
RETURNING id, title, tags, jsonb_array_length(tags) as num_tags;

-- 7. Testar busca por tag específica
SELECT 
    id,
    title,
    tags,
    jsonb_array_length(tags) as num_tags
FROM cards 
WHERE tags ? 'Frontend'
ORDER BY updated_at DESC;

-- 8. Testar busca por múltiplas tags
SELECT 
    id,
    title,
    tags,
    jsonb_array_length(tags) as num_tags
FROM cards 
WHERE tags ?| ARRAY['Frontend', 'Backend']
ORDER BY updated_at DESC;

-- 9. Testar busca por todas as tags
SELECT 
    id,
    title,
    tags,
    jsonb_array_length(tags) as num_tags
FROM cards 
WHERE tags ?& ARRAY['Frontend', 'Teste']
ORDER BY updated_at DESC;

-- 10. Listar todos os cards com tags
SELECT 
    id,
    title,
    tags,
    jsonb_array_length(tags) as num_tags,
    created_at,
    updated_at
FROM cards 
WHERE tags IS NOT NULL 
AND jsonb_array_length(tags) > 0
ORDER BY updated_at DESC
LIMIT 10;

-- 11. Limpar dados de teste
DELETE FROM cards 
WHERE title = 'Teste Tags JSONB';

-- 12. Verificar se a limpeza funcionou
SELECT COUNT(*) as cards_restantes
FROM cards 
WHERE title = 'Teste Tags JSONB';
