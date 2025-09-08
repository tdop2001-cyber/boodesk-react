-- Script para corrigir o problema da coluna created_by
-- Execute este SQL no Editor SQL do Supabase

-- 1. Verificar se a tabela subtasks existe e sua estrutura
SELECT 
    'Verificando estrutura atual da tabela subtasks' as status,
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'subtasks'
ORDER BY ordinal_position;

-- 2. Verificar se a coluna created_by existe
SELECT 
    'Verificando se a coluna created_by existe' as status,
    CASE 
        WHEN EXISTS (
            SELECT 1 FROM information_schema.columns 
            WHERE table_name = 'subtasks' AND column_name = 'created_by'
        ) THEN 'EXISTE'
        ELSE 'NÃO EXISTE'
    END as created_by_status;

-- 3. Se a coluna created_by não existir, adicionar ela
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'subtasks' AND column_name = 'created_by'
    ) THEN
        ALTER TABLE subtasks ADD COLUMN created_by INTEGER;
        RAISE NOTICE 'Coluna created_by adicionada à tabela subtasks';
    ELSE
        RAISE NOTICE 'Coluna created_by já existe na tabela subtasks';
    END IF;
END $$;

-- 4. Verificar se a coluna foi adicionada
SELECT 
    'Verificando se a coluna created_by foi adicionada' as status,
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'subtasks' AND column_name = 'created_by';

-- 5. Adicionar foreign key para created_by se não existir
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'subtasks_created_by_fkey'
    ) THEN
        ALTER TABLE subtasks 
        ADD CONSTRAINT subtasks_created_by_fkey 
        FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE CASCADE;
        RAISE NOTICE 'Foreign key subtasks_created_by_fkey adicionada';
    ELSE
        RAISE NOTICE 'Foreign key subtasks_created_by_fkey já existe';
    END IF;
END $$;

-- 6. Verificar se a foreign key foi adicionada
SELECT 
    'Verificando foreign keys da tabela subtasks' as status,
    constraint_name,
    constraint_type,
    table_name
FROM information_schema.table_constraints 
WHERE table_name = 'subtasks' AND constraint_type = 'FOREIGN KEY';

-- 7. Atualizar registros existentes para ter created_by = 1 (se houver registros)
UPDATE subtasks 
SET created_by = 1 
WHERE created_by IS NULL;

-- 8. Tornar a coluna created_by NOT NULL se ainda não for
DO $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'subtasks' 
        AND column_name = 'created_by' 
        AND is_nullable = 'YES'
    ) THEN
        ALTER TABLE subtasks ALTER COLUMN created_by SET NOT NULL;
        RAISE NOTICE 'Coluna created_by definida como NOT NULL';
    ELSE
        RAISE NOTICE 'Coluna created_by já é NOT NULL';
    END IF;
END $$;

-- 9. Verificar estrutura final da tabela
SELECT 
    'Estrutura final da tabela subtasks' as status,
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'subtasks'
ORDER BY ordinal_position;

-- 10. Testar inserção de uma subtarefa
INSERT INTO subtasks (card_id, title, description, priority, due_date, status, members, created_by) 
SELECT 
    (SELECT MIN(id) FROM cards LIMIT 1), 
    'TESTE CORRIGIDO', 
    'Teste após correção da coluna created_by', 
    'medium', 
    '2025-09-30', 
    'todo', 
    '["1"]', 
    1
WHERE EXISTS (SELECT 1 FROM cards LIMIT 1)
ON CONFLICT DO NOTHING;

-- 11. Verificar se a inserção funcionou
SELECT 
    'Teste de inserção de subtarefa' as status,
    COUNT(*) as total_subtasks,
    COUNT(CASE WHEN created_by IS NOT NULL THEN 1 END) as subtasks_com_created_by
FROM subtasks;

-- 12. Mostrar todas as subtarefas
SELECT 
    'Todas as subtarefas' as status,
    id,
    title,
    status,
    created_by,
    members,
    created_at
FROM subtasks
ORDER BY created_at DESC;

