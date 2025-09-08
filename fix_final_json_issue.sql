-- Script final para corrigir o problema específico: números soltos em arrays JSON
-- Execute este SQL no Editor SQL do Supabase

-- O problema identificado: arrays como [2] contêm números soltos
-- PostgreSQL espera strings em arrays JSON, não números soltos

-- 1. Identificar todos os registros com números soltos em arrays JSON
SELECT 
    id,
    title,
    members,
    dependencies,
    history,
    'Problema: número solto em array JSON' as problema
FROM cards 
WHERE 
    -- Procurar por arrays que contêm números soltos (não strings)
    members::text ~ '\[[0-9]+\]' 
    OR dependencies::text ~ '\[[0-9]+\]'
    OR history::text ~ '\[[0-9]+\]'
    -- Ou procurar por qualquer caractere que não seja JSON válido
    OR members::text ~ '[^\[\]{}",:0-9\s]'
    OR dependencies::text ~ '[^\[\]{}",:0-9\s]'
    OR history::text ~ '[^\[\]{}",:0-9\s]';

-- 2. Corrigir especificamente arrays com números soltos
-- Converter [2] para [] (array vazio) ou ["2"] (array com string)
UPDATE cards 
SET members = '[]' 
WHERE members::text ~ '\[[0-9]+\]' 
   OR members::text ~ '[^\[\]{}",:0-9\s]'
   OR members::text = '2'
   OR members::text = '[2]';

UPDATE cards 
SET dependencies = '[]' 
WHERE dependencies::text ~ '\[[0-9]+\]' 
   OR dependencies::text ~ '[^\[\]{}",:0-9\s]'
   OR dependencies::text = '2'
   OR dependencies::text = '[2]';

UPDATE cards 
SET history = '[]' 
WHERE history::text ~ '\[[0-9]+\]' 
   OR history::text ~ '[^\[\]{}",:0-9\s]'
   OR history::text = '2'
   OR history::text = '[2]';

-- 3. Verificar se ainda há problemas após a correção
SELECT 
    COUNT(*) as total_cards,
    COUNT(CASE WHEN members::text ~ '^[\[\]{}",:0-9\s]*$' THEN 1 END) as members_validos,
    COUNT(CASE WHEN dependencies::text ~ '^[\[\]{}",:0-9\s]*$' THEN 1 END) as dependencies_validos,
    COUNT(CASE WHEN history::text ~ '^[\[\]{}",:0-9\s]*$' THEN 1 END) as history_validos
FROM cards;

-- 4. Verificação final - todos os dados JSON devem estar válidos agora
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

-- 5. Mostrar alguns exemplos para verificar
SELECT 
    id,
    title,
    members,
    dependencies,
    history
FROM cards 
ORDER BY id
LIMIT 10;

-- 6. Verificar especificamente se ainda há arrays com números soltos
SELECT 
    'Verificação de arrays com números soltos' as status,
    COUNT(*) as total_cards,
    COUNT(CASE WHEN members::text ~ '\[[0-9]+\]' THEN 1 END) as members_com_numeros,
    COUNT(CASE WHEN dependencies::text ~ '\[[0-9]+\]' THEN 1 END) as dependencies_com_numeros,
    COUNT(CASE WHEN history::text ~ '\[[0-9]+\]' THEN 1 END) as history_com_numeros
FROM cards;

