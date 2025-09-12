-- =====================================================
-- CORREÇÃO DA TABELA CARDS PARA MÉTRICAS DE PERFORMANCE
-- =====================================================

-- 1. Verificar se a coluna completed_at existe na tabela cards
DO $$
BEGIN
    -- Adicionar coluna completed_at se não existir
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'cards' AND column_name = 'completed_at'
    ) THEN
        ALTER TABLE cards ADD COLUMN completed_at TIMESTAMP;
        RAISE NOTICE 'Coluna completed_at adicionada à tabela cards';
    ELSE
        RAISE NOTICE 'Coluna completed_at já existe na tabela cards';
    END IF;
    
    -- Adicionar coluna created_by se não existir
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'cards' AND column_name = 'created_by'
    ) THEN
        ALTER TABLE cards ADD COLUMN created_by INTEGER REFERENCES users(id);
        RAISE NOTICE 'Coluna created_by adicionada à tabela cards';
    ELSE
        RAISE NOTICE 'Coluna created_by já existe na tabela cards';
    END IF;
    
    -- Adicionar coluna status se não existir ou atualizar valores
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'cards' AND column_name = 'status'
    ) THEN
        ALTER TABLE cards ADD COLUMN status VARCHAR(50) DEFAULT 'todo';
        RAISE NOTICE 'Coluna status adicionada à tabela cards';
    ELSE
        -- Atualizar valores de status para padronizar
        UPDATE cards SET status = 'done' WHERE status IN ('completed', 'concluido', 'finalizado');
        UPDATE cards SET status = 'progress' WHERE status IN ('in_progress', 'em_andamento', 'progresso');
        UPDATE cards SET status = 'todo' WHERE status IN ('to_do', 'a_fazer', 'pendente');
        RAISE NOTICE 'Valores de status padronizados na tabela cards';
    END IF;
END $$;

-- 2. Verificar se a coluna completed_at existe na tabela subtasks
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'subtasks' AND column_name = 'completed_at'
    ) THEN
        ALTER TABLE subtasks ADD COLUMN completed_at TIMESTAMP;
        RAISE NOTICE 'Coluna completed_at adicionada à tabela subtasks';
    ELSE
        RAISE NOTICE 'Coluna completed_at já existe na tabela subtasks';
    END IF;
END $$;

-- 3. Criar trigger para atualizar completed_at quando status mudar para 'done'
CREATE OR REPLACE FUNCTION update_card_completion_date()
RETURNS TRIGGER AS $$
BEGIN
    -- Se o status mudou para 'done' e completed_at é NULL, definir a data atual
    IF NEW.status = 'done' AND OLD.status != 'done' AND NEW.completed_at IS NULL THEN
        NEW.completed_at = NOW();
    END IF;
    
    -- Se o status mudou de 'done' para outro, limpar completed_at
    IF OLD.status = 'done' AND NEW.status != 'done' THEN
        NEW.completed_at = NULL;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Aplicar trigger na tabela cards
DROP TRIGGER IF EXISTS trigger_update_card_completion_date ON cards;
CREATE TRIGGER trigger_update_card_completion_date
    BEFORE UPDATE ON cards
    FOR EACH ROW
    EXECUTE FUNCTION update_card_completion_date();

-- 4. Criar trigger para subtasks
CREATE OR REPLACE FUNCTION update_subtask_completion_date()
RETURNS TRIGGER AS $$
BEGIN
    -- Se o status mudou para 'done' e completed_at é NULL, definir a data atual
    IF NEW.status = 'done' AND OLD.status != 'done' AND NEW.completed_at IS NULL THEN
        NEW.completed_at = NOW();
    END IF;
    
    -- Se o status mudou de 'done' para outro, limpar completed_at
    IF OLD.status = 'done' AND NEW.status != 'done' THEN
        NEW.completed_at = NULL;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Aplicar trigger na tabela subtasks
DROP TRIGGER IF EXISTS trigger_update_subtask_completion_date ON subtasks;
CREATE TRIGGER trigger_update_subtask_completion_date
    BEFORE UPDATE ON subtasks
    FOR EACH ROW
    EXECUTE FUNCTION update_subtask_completion_date();

-- 5. Atualizar completed_at para cards que já estão com status 'done'
UPDATE cards 
SET completed_at = updated_at 
WHERE status = 'done' AND completed_at IS NULL;

-- 6. Atualizar completed_at para subtasks que já estão com status 'done'
UPDATE subtasks 
SET completed_at = updated_at 
WHERE status = 'done' AND completed_at IS NULL;

-- 7. Verificar estrutura final das tabelas
SELECT 'Estrutura da tabela cards:' as info;
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns 
WHERE table_name = 'cards' 
ORDER BY ordinal_position;

SELECT 'Estrutura da tabela subtasks:' as info;
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns 
WHERE table_name = 'subtasks' 
ORDER BY ordinal_position;

-- 8. Verificar dados de exemplo
SELECT 'Dados de exemplo - Cards:' as info;
SELECT id, title, status, created_at, completed_at, updated_at
FROM cards 
ORDER BY created_at DESC 
LIMIT 5;

SELECT 'Dados de exemplo - Subtasks:' as info;
SELECT id, title, status, created_at, completed_at, updated_at
FROM subtasks 
ORDER BY created_at DESC 
LIMIT 5;

-- 9. Comentários das funções
COMMENT ON FUNCTION update_card_completion_date IS 'Atualiza automaticamente a data de conclusão quando um card é marcado como concluído';
COMMENT ON FUNCTION update_subtask_completion_date IS 'Atualiza automaticamente a data de conclusão quando uma subtask é marcada como concluída';

