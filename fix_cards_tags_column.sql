-- Script para garantir que a coluna tags existe na tabela cards
-- Execute este SQL no Editor SQL do Supabase

-- 1. Verificar se a coluna tags existe na tabela cards
DO $$
BEGIN
    -- Adicionar coluna tags se não existir
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_name = 'cards' 
        AND column_name = 'tags'
    ) THEN
        ALTER TABLE cards ADD COLUMN tags TEXT[] DEFAULT '{}';
        RAISE NOTICE 'Coluna tags adicionada à tabela cards';
    ELSE
        RAISE NOTICE 'Coluna tags já existe na tabela cards';
    END IF;
END $$;

-- 2. Verificar se a coluna tags existe na tabela subtasks
DO $$
BEGIN
    -- Adicionar coluna tags se não existir
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_name = 'subtasks' 
        AND column_name = 'tags'
    ) THEN
        ALTER TABLE subtasks ADD COLUMN tags TEXT[] DEFAULT '{}';
        RAISE NOTICE 'Coluna tags adicionada à tabela subtasks';
    ELSE
        RAISE NOTICE 'Coluna tags já existe na tabela subtasks';
    END IF;
END $$;

-- 3. Atualizar cards existentes que não têm tags definidas
UPDATE cards 
SET tags = '{}' 
WHERE tags IS NULL;

-- 4. Atualizar subtasks existentes que não têm tags definidas
UPDATE subtasks 
SET tags = '{}' 
WHERE tags IS NULL;

-- 5. Verificar a estrutura atual das tabelas
SELECT 
    table_name,
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name IN ('cards', 'subtasks') 
AND column_name = 'tags'
ORDER BY table_name, column_name;
