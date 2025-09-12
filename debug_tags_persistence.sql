-- Script para debugar persistência de tags
-- Execute este SQL no Editor SQL do Supabase

-- 1. Verificar se há cards com tags
SELECT 
    id,
    card_id,
    title,
    tags,
    jsonb_array_length(tags) as num_tags,
    updated_at
FROM cards 
WHERE tags IS NOT NULL 
AND jsonb_array_length(tags) > 0
ORDER BY updated_at DESC
LIMIT 10;

-- 2. Verificar todos os cards (incluindo sem tags)
SELECT 
    id,
    card_id,
    title,
    tags,
    CASE 
        WHEN tags IS NULL THEN 'NULL'
        WHEN jsonb_array_length(tags) = 0 THEN 'VAZIO'
        ELSE jsonb_array_length(tags)::text
    END as status_tags,
    updated_at
FROM cards 
ORDER BY updated_at DESC
LIMIT 10;

-- 3. Testar inserção manual de tag
-- Primeiro, vamos ver se existe um card com ID 102
SELECT id, card_id, title, tags 
FROM cards 
WHERE id = 102 OR card_id = '102';

-- 4. Se o card existir, vamos adicionar uma tag de teste
UPDATE cards 
SET tags = '["API", "Teste"]'::jsonb,
    updated_at = NOW()
WHERE id = 102
RETURNING id, title, tags, jsonb_array_length(tags) as num_tags;

-- 5. Verificar se a atualização funcionou
SELECT 
    id,
    title,
    tags,
    jsonb_array_length(tags) as num_tags,
    updated_at
FROM cards 
WHERE id = 102;
