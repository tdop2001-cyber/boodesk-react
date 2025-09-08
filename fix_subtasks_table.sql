-- Script corrigido para criar a tabela de subtarefas
-- Execute este SQL no Editor SQL do Supabase

-- 1. Verificar se a tabela subtasks existe
SELECT 
    'Verificando se a tabela subtasks existe' as status,
    table_name,
    column_name,
    data_type,
    is_nullable
FROM information_schema.columns 
WHERE table_name = 'subtasks'
ORDER BY ordinal_position;

-- 2. Criar tabela de subtarefas se não existir
CREATE TABLE IF NOT EXISTS subtasks (
    id SERIAL PRIMARY KEY,
    card_id INTEGER NOT NULL,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    priority VARCHAR(50) DEFAULT 'normal',
    due_date DATE,
    status VARCHAR(50) DEFAULT 'todo',
    position INTEGER DEFAULT 0,
    members JSONB DEFAULT '[]',
    created_by INTEGER NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Adicionar foreign keys se não existirem
DO $$
BEGIN
    -- Foreign key para cards
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'subtasks_card_id_fkey'
    ) THEN
        ALTER TABLE subtasks 
        ADD CONSTRAINT subtasks_card_id_fkey 
        FOREIGN KEY (card_id) REFERENCES cards(id) ON DELETE CASCADE;
    END IF;
    
    -- Foreign key para users
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'subtasks_created_by_fkey'
    ) THEN
        ALTER TABLE subtasks 
        ADD CONSTRAINT subtasks_created_by_fkey 
        FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE CASCADE;
    END IF;
END $$;

-- 4. Criar índices para melhor performance
CREATE INDEX IF NOT EXISTS idx_subtasks_card_id ON subtasks(card_id);
CREATE INDEX IF NOT EXISTS idx_subtasks_status ON subtasks(status);
CREATE INDEX IF NOT EXISTS idx_subtasks_created_by ON subtasks(created_by);
CREATE INDEX IF NOT EXISTS idx_subtasks_members ON subtasks USING GIN(members);

-- 5. Adicionar coluna de subtarefas na tabela cards se não existir
ALTER TABLE cards ADD COLUMN IF NOT EXISTS subtasks_count INTEGER DEFAULT 0;

-- 6. Criar função para atualizar contador de subtarefas
CREATE OR REPLACE FUNCTION update_subtasks_count()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        UPDATE cards 
        SET subtasks_count = subtasks_count + 1,
            updated_at = NOW()
        WHERE id = NEW.card_id;
        RETURN NEW;
    ELSIF TG_OP = 'DELETE' THEN
        UPDATE cards 
        SET subtasks_count = subtasks_count - 1,
            updated_at = NOW()
        WHERE id = OLD.card_id;
        RETURN OLD;
    ELSIF TG_OP = 'UPDATE' THEN
        -- Se mudou o card_id, atualizar ambos os cards
        IF OLD.card_id != NEW.card_id THEN
            UPDATE cards 
            SET subtasks_count = subtasks_count - 1,
                updated_at = NOW()
            WHERE id = OLD.card_id;
            
            UPDATE cards 
            SET subtasks_count = subtasks_count + 1,
                updated_at = NOW()
            WHERE id = NEW.card_id;
        END IF;
        RETURN NEW;
    END IF;
    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- 7. Criar trigger para atualizar contador automaticamente
DROP TRIGGER IF EXISTS trigger_update_subtasks_count ON subtasks;
CREATE TRIGGER trigger_update_subtasks_count
    AFTER INSERT OR UPDATE OR DELETE ON subtasks
    FOR EACH ROW EXECUTE FUNCTION update_subtasks_count();

-- 8. Verificar estrutura da tabela criada
SELECT 
    'Estrutura da tabela subtasks' as status,
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'subtasks'
ORDER BY ordinal_position;

-- 9. Verificar se há cards para testar
SELECT 
    'Verificando cards disponíveis' as status,
    COUNT(*) as total_cards,
    MIN(id) as primeiro_card_id,
    MAX(id) as ultimo_card_id
FROM cards;

-- 10. Inserir dados de teste apenas se houver cards
INSERT INTO subtasks (card_id, title, description, priority, due_date, status, members, created_by) 
SELECT 
    (SELECT MIN(id) FROM cards LIMIT 1), 
    'TESTE1', 
    'Sem descrição', 
    'medium', 
    '2025-09-25', 
    'todo', 
    '["1", "2"]', 
    1
WHERE EXISTS (SELECT 1 FROM cards LIMIT 1)
ON CONFLICT DO NOTHING;

INSERT INTO subtasks (card_id, title, description, priority, due_date, status, members, created_by) 
SELECT 
    (SELECT MIN(id) FROM cards LIMIT 1), 
    'TESTE2', 
    'Sem descrição', 
    'medium', 
    '2025-09-25', 
    'in_progress', 
    '["1"]', 
    1
WHERE EXISTS (SELECT 1 FROM cards LIMIT 1)
ON CONFLICT DO NOTHING;

-- 11. Verificar se os dados foram inseridos
SELECT 
    'Verificação da tabela subtasks' as status,
    COUNT(*) as total_subtasks,
    COUNT(DISTINCT card_id) as cards_com_subtasks,
    COUNT(DISTINCT created_by) as usuarios_unicos,
    COUNT(CASE WHEN status = 'todo' THEN 1 END) as subtasks_todo,
    COUNT(CASE WHEN status = 'in_progress' THEN 1 END) as subtasks_in_progress,
    COUNT(CASE WHEN status = 'completed' THEN 1 END) as subtasks_completed
FROM subtasks;

-- 12. Verificar se o trigger está funcionando
SELECT 
    'Verificação do contador de subtarefas' as status,
    c.id as card_id,
    c.title as card_title,
    c.subtasks_count,
    COUNT(s.id) as subtasks_reais
FROM cards c
LEFT JOIN subtasks s ON s.card_id = c.id
GROUP BY c.id, c.title, c.subtasks_count
ORDER BY c.id;

-- 13. Teste de funcionalidade - buscar subtarefas
SELECT 
    'Teste de busca de subtarefas' as status,
    s.id,
    s.title,
    s.status,
    s.members,
    c.title as card_title,
    u.username as created_by_username
FROM subtasks s
LEFT JOIN cards c ON c.id = s.card_id
LEFT JOIN users u ON u.id = s.created_by
ORDER BY s.created_at DESC;

