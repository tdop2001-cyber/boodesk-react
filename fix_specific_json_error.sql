-- Script para corrigir o erro específico: "Expected string or "}", but found "2""
-- Execute este SQL no Editor SQL do Supabase

-- O erro indica que há um "2" solto em algum campo JSON
-- Vamos identificar e corrigir especificamente este problema

-- 1. Identificar registros com o problema específico
SELECT 
    id,
    title,
    members,
    dependencies,
    history,
    'Problema identificado' as status
FROM cards 
WHERE 
    -- Procurar por "2" que não está dentro de uma estrutura JSON válida
    (members::text ~ '[^\[\]{}",:0-9\s]2[^\[\]{}",:0-9\s]' OR members::text = '2')
    OR (dependencies::text ~ '[^\[\]{}",:0-9\s]2[^\[\]{}",:0-9\s]' OR dependencies::text = '2')
    OR (history::text ~ '[^\[\]{}",:0-9\s]2[^\[\]{}",:0-9\s]' OR history::text = '2')
    -- Ou procurar por qualquer caractere que não seja JSON válido
    OR members::text ~ '[^\[\]{}",:0-9\s]'
    OR dependencies::text ~ '[^\[\]{}",:0-9\s]'
    OR history::text ~ '[^\[\]{}",:0-9\s]';

-- 2. Corrigir especificamente o problema do "2" solto
UPDATE cards 
SET members = '[]' 
WHERE members::text = '2' 
   OR members::text ~ '[^\[\]{}",:0-9\s]2[^\[\]{}",:0-9\s]'
   OR members::text ~ '[^\[\]{}",:0-9\s]';

UPDATE cards 
SET dependencies = '[]' 
WHERE dependencies::text = '2' 
   OR dependencies::text ~ '[^\[\]{}",:0-9\s]2[^\[\]{}",:0-9\s]'
   OR dependencies::text ~ '[^\[\]{}",:0-9\s]';

UPDATE cards 
SET history = '[]' 
WHERE history::text = '2' 
   OR history::text ~ '[^\[\]{}",:0-9\s]2[^\[\]{}",:0-9\s]'
   OR history::text ~ '[^\[\]{}",:0-9\s]';

-- 3. Verificar se ainda há problemas
SELECT 
    id,
    title,
    members,
    dependencies,
    history
FROM cards 
WHERE 
    members::text ~ '[^\[\]{}",:0-9\s]'
    OR dependencies::text ~ '[^\[\]{}",:0-9\s]'
    OR history::text ~ '[^\[\]{}",:0-9\s]';

-- 4. Se ainda houver problemas, vamos fazer uma limpeza mais agressiva
-- Converter todos os campos JSON para arrays vazios se não forem válidos
UPDATE cards 
SET members = '[]' 
WHERE NOT (members::text ~ '^[\[\]{}",:0-9\s]*$');

UPDATE cards 
SET dependencies = '[]' 
WHERE NOT (dependencies::text ~ '^[\[\]{}",:0-9\s]*$');

UPDATE cards 
SET history = '[]' 
WHERE NOT (history::text ~ '^[\[\]{}",:0-9\s]*$');

-- 5. Verificação final
SELECT 
    'Verificação final - todos os dados JSON devem estar válidos' as status,
    COUNT(*) as total_cards,
    COUNT(CASE 
        WHEN members::text ~ '^[\[\]{}",:0-9\s]*$' 
         AND dependencies::text ~ '^[\[\]{}",:0-9\s]*$'
         AND history::text ~ '^[\[\]{}",:0-9\s]*$' 
        THEN 1 
    END) as cards_completamente_validos
FROM cards;

-- 6. Mostrar alguns exemplos para verificar
SELECT 
    id,
    title,
    members,
    dependencies,
    history
FROM cards 
ORDER BY id
LIMIT 10;

