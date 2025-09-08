-- Script específico para corrigir erros de sintaxe JSON
-- Execute este SQL no Editor SQL do Supabase

-- 1. Primeiro, vamos identificar exatamente quais registros têm problemas JSON
SELECT 
    id,
    title,
    members,
    dependencies,
    history,
    CASE 
        WHEN members::text ~ '[^\[\]{}",:0-9\s]' THEN 'members inválido'
        WHEN dependencies::text ~ '[^\[\]{}",:0-9\s]' THEN 'dependencies inválido'
        WHEN history::text ~ '[^\[\]{}",:0-9\s]' THEN 'history inválido'
        ELSE 'OK'
    END as problema
FROM cards 
WHERE members::text ~ '[^\[\]{}",:0-9\s]' 
   OR dependencies::text ~ '[^\[\]{}",:0-9\s]'
   OR history::text ~ '[^\[\]{}",:0-9\s]'
ORDER BY id;

-- 2. Vamos verificar se há dados que não são JSON válido
SELECT 
    id,
    title,
    members,
    dependencies,
    history
FROM cards 
WHERE members IS NOT NULL 
  AND members::text != '[]' 
  AND members::text != '{}'
  AND members::text !~ '^[\[\]{}",:0-9\s]*$'
LIMIT 10;

-- 3. Corrigir dados JSON problemáticos de forma mais agressiva
-- Primeiro, vamos limpar completamente os campos JSON problemáticos
UPDATE cards 
SET members = '[]' 
WHERE members IS NULL 
   OR members::text = '' 
   OR members::text !~ '^[\[\]{}",:0-9\s]*$'
   OR members::text ~ '[^\[\]{}",:0-9\s]';

UPDATE cards 
SET dependencies = '[]' 
WHERE dependencies IS NULL 
   OR dependencies::text = '' 
   OR dependencies::text !~ '^[\[\]{}",:0-9\s]*$'
   OR dependencies::text ~ '[^\[\]{}",:0-9\s]';

UPDATE cards 
SET history = '[]' 
WHERE history IS NULL 
   OR history::text = '' 
   OR history::text !~ '^[\[\]{}",:0-9\s]*$'
   OR history::text ~ '[^\[\]{}",:0-9\s]';

-- 4. Verificar se ainda há problemas após a correção
SELECT 
    COUNT(*) as total_cards,
    COUNT(CASE WHEN members::text ~ '^[\[\]{}",:0-9\s]*$' THEN 1 END) as members_validos,
    COUNT(CASE WHEN dependencies::text ~ '^[\[\]{}",:0-9\s]*$' THEN 1 END) as dependencies_validos,
    COUNT(CASE WHEN history::text ~ '^[\[\]{}",:0-9\s]*$' THEN 1 END) as history_validos
FROM cards;

-- 5. Verificar se há dados que contêm o caractere "2" problemático
SELECT 
    id,
    title,
    members,
    dependencies,
    history
FROM cards 
WHERE members::text LIKE '%2%' 
   OR dependencies::text LIKE '%2%'
   OR history::text LIKE '%2%'
LIMIT 10;

-- 6. Corrigir especificamente dados que contêm "2" problemático
UPDATE cards 
SET members = '[]' 
WHERE members::text LIKE '%2%' 
  AND members::text !~ '^\[[0-9,\s]*\]$';

UPDATE cards 
SET dependencies = '[]' 
WHERE dependencies::text LIKE '%2%' 
  AND dependencies::text !~ '^\[[0-9,\s]*\]$';

UPDATE cards 
SET history = '[]' 
WHERE history::text LIKE '%2%' 
  AND history::text !~ '^\[[0-9,\s]*\]$';

-- 7. Verificação final - todos os dados JSON devem estar válidos agora
SELECT 
    'Verificação final de dados JSON' as status,
    COUNT(*) as total_cards,
    COUNT(CASE 
        WHEN members::text ~ '^[\[\]{}",:0-9\s]*$' 
         AND dependencies::text ~ '^[\[\]{}",:0-9\s]*$'
         AND history::text ~ '^[\[\]{}",:0-9\s]*$' 
        THEN 1 
    END) as cards_completamente_validos
FROM cards;

-- 8. Mostrar alguns exemplos de dados corrigidos
SELECT 
    id,
    title,
    members,
    dependencies,
    history
FROM cards 
LIMIT 5;

