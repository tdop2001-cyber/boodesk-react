-- Script para recriar a tabela subtasks do zero
-- Execute este SQL no Editor SQL do Supabase

-- 1. Verificar se a tabela subtasks existe
SELECT 
    'Verificando se a tabela subtasks existe' as status,
    table_name,
    table_type
FROM information_schema.tables 
WHERE table_name = 'subtasks';

-- 2. Remover a tabela subtasks se existir (CUIDADO: isso apagará todos os dados!)
DROP TABLE IF EXISTS subtasks CASCADE;

-- 3. Criar a tabela subtasks do zero
CREATE TABLE subtasks (
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

-- 4. Adicionar foreign keys
ALTER TABLE subtasks 
ADD CONSTRAINT subtasks_card_id_fkey 
FOREIGN KEY (card_id) REFERENCES cards(id) ON DELETE CASCADE;

ALTER TABLE subtasks 
ADD CONSTRAINT subtasks_created_by_fkey 
FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE CASCADE;

-- 5. Criar índices
CREATE INDEX idx_subtasks_card_id ON subtasks(card_id);
CREATE INDEX idx_subtasks_status ON subtasks(status);
CREATE INDEX idx_subtasks_created_by ON subtasks(created_by);
CREATE INDEX idx_subtasks_members ON subtasks USING GIN(members);

-- 6. Adicionar coluna subtasks_count na tabela cards se não existir
ALTER TABLE cards ADD COLUMN IF NOT EXISTS subtasks_count INTEGER DEFAULT 0;

-- 7. Criar função para atualizar contador
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

-- 8. Criar trigger
CREATE TRIGGER trigger_update_subtasks_count
    AFTER INSERT OR UPDATE OR DELETE ON subtasks
    FOR EACH ROW EXECUTE FUNCTION update_subtasks_count();

-- 9. Verificar estrutura da tabela criada
SELECT 
    'Estrutura da tabela subtasks criada' as status,
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'subtasks'
ORDER BY ordinal_position;

-- 10. Verificar foreign keys
SELECT 
    'Foreign keys da tabela subtasks' as status,
    constraint_name,
    constraint_type
FROM information_schema.table_constraints 
WHERE table_name = 'subtasks' AND constraint_type = 'FOREIGN KEY';

-- 11. Inserir dados de teste
INSERT INTO subtasks (card_id, title, description, priority, due_date, status, members, created_by) 
SELECT 
    (SELECT MIN(id) FROM cards LIMIT 1), 
    'TESTE1', 
    'Primeira subtarefa de teste', 
    'medium', 
    '2025-09-30', 
    'todo', 
    '["1", "2"]', 
    1
WHERE EXISTS (SELECT 1 FROM cards LIMIT 1);

INSERT INTO subtasks (card_id, title, description, priority, due_date, status, members, created_by) 
SELECT 
    (SELECT MIN(id) FROM cards LIMIT 1), 
    'TESTE2', 
    'Segunda subtarefa de teste', 
    'high', 
    '2025-10-01', 
    'in_progress', 
    '["1"]', 
    1
WHERE EXISTS (SELECT 1 FROM cards LIMIT 1);

-- 12. Verificar se os dados foram inseridos
SELECT 
    'Verificação dos dados inseridos' as status,
    COUNT(*) as total_subtasks,
    COUNT(CASE WHEN status = 'todo' THEN 1 END) as subtasks_todo,
    COUNT(CASE WHEN status = 'in_progress' THEN 1 END) as subtasks_in_progress,
    COUNT(CASE WHEN status = 'completed' THEN 1 END) as subtasks_completed
FROM subtasks;

-- 13. Mostrar todas as subtarefas
SELECT 
    'Todas as subtarefas criadas' as status,
    s.id,
    s.title,
    s.status,
    s.priority,
    s.members,
    s.created_by,
    c.title as card_title,
    u.username as created_by_username
FROM subtasks s
LEFT JOIN cards c ON c.id = s.card_id
LEFT JOIN users u ON u.id = s.created_by
ORDER BY s.created_at DESC;

-- 14. Verificar se o trigger está funcionando
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

