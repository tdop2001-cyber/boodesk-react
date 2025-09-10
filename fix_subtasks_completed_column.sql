-- Script para corrigir a coluna completed na tabela subtasks
-- Execute este SQL no Editor SQL do Supabase

-- 1. Verificar se a coluna completed existe
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'subtasks' AND column_name = 'completed'
    ) THEN
        -- Adicionar coluna completed
        ALTER TABLE subtasks ADD COLUMN completed BOOLEAN DEFAULT FALSE;
        RAISE NOTICE 'Coluna completed adicionada à tabela subtasks';
    ELSE
        RAISE NOTICE 'Coluna completed já existe na tabela subtasks';
    END IF;
END $$;

-- 2. Verificar se a coluna completed_at existe
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'subtasks' AND column_name = 'completed_at'
    ) THEN
        -- Adicionar coluna completed_at
        ALTER TABLE subtasks ADD COLUMN completed_at TIMESTAMP WITH TIME ZONE;
        RAISE NOTICE 'Coluna completed_at adicionada à tabela subtasks';
    ELSE
        RAISE NOTICE 'Coluna completed_at já existe na tabela subtasks';
    END IF;
END $$;

-- 3. Atualizar valores existentes baseado no status
UPDATE subtasks 
SET completed = (status = 'completed'),
    completed_at = CASE 
        WHEN status = 'completed' THEN updated_at 
        ELSE NULL 
    END
WHERE completed IS NULL OR completed_at IS NULL;

-- 4. Verificar estrutura final
SELECT 
    'Estrutura final da tabela subtasks' as status,
    column_name, 
    data_type, 
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'subtasks' 
ORDER BY ordinal_position;


