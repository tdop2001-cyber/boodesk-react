-- Script para corrigir o sistema de tags
-- Execute este SQL no Editor SQL do Supabase

-- 1. Adicionar coluna 'type' na tabela custom_tags se não existir
ALTER TABLE custom_tags ADD COLUMN IF NOT EXISTS type VARCHAR(20) DEFAULT 'category';

-- 2. Adicionar coluna 'description' na tabela custom_tags se não existir
ALTER TABLE custom_tags ADD COLUMN IF NOT EXISTS description TEXT;

-- 3. Adicionar coluna tags na tabela cards se não existir
ALTER TABLE cards ADD COLUMN IF NOT EXISTS tags TEXT[] DEFAULT '{}';

-- 4. Adicionar coluna tags na tabela subtasks se não existir  
ALTER TABLE subtasks ADD COLUMN IF NOT EXISTS tags TEXT[] DEFAULT '{}';

-- 5. Criar tabela para categorias de cards se não existir
CREATE TABLE IF NOT EXISTS card_categories (
    id SERIAL PRIMARY KEY,
    name VARCHAR(50) NOT NULL UNIQUE,
    description TEXT,
    color VARCHAR(7) DEFAULT '#6B7280',
    icon VARCHAR(20) DEFAULT 'tag',
    created_at TIMESTAMP DEFAULT NOW(),
    created_by INTEGER REFERENCES users(id)
);

-- 6. Inserir categorias padrão
INSERT INTO card_categories (name, description, color, icon) VALUES
('Desenvolvimento', 'Cards relacionados a desenvolvimento de software', '#3B82F6', 'code'),
('Design', 'Cards relacionados a design e UX/UI', '#8B5CF6', 'palette'),
('Marketing', 'Cards relacionados a marketing e vendas', '#10B981', 'megaphone'),
('Suporte', 'Cards relacionados a suporte ao cliente', '#F59E0B', 'headphones'),
('Administrativo', 'Cards relacionados a tarefas administrativas', '#6B7280', 'file-text'),
('Reunião', 'Cards relacionados a reuniões e calls', '#EF4444', 'users'),
('Pesquisa', 'Cards relacionados a pesquisa e análise', '#06B6D4', 'search'),
('Teste', 'Cards relacionados a testes e QA', '#84CC16', 'check-circle'),
('Bug', 'Cards relacionados a correção de bugs', '#DC2626', 'bug'),
('Feature', 'Cards relacionados a novas funcionalidades', '#059669', 'star'),
('Documentação', 'Cards relacionados a documentação', '#7C3AED', 'file-text'),
('Refatoração', 'Cards relacionados a refatoração de código', '#EA580C', 'refresh-cw')
ON CONFLICT (name) DO NOTHING;

-- 7. Inserir tags padrão (apenas se não existirem)
INSERT INTO custom_tags (name, color, type, description) VALUES
('Urgente', '#DC2626', 'priority', 'Tarefa urgente que precisa ser priorizada'),
('Alta Prioridade', '#F59E0B', 'priority', 'Tarefa de alta prioridade'),
('Média Prioridade', '#3B82F6', 'priority', 'Tarefa de média prioridade'),
('Baixa Prioridade', '#6B7280', 'priority', 'Tarefa de baixa prioridade'),
('Bug', '#DC2626', 'category', 'Correção de bug'),
('Feature', '#059669', 'category', 'Nova funcionalidade'),
('Documentação', '#7C3AED', 'category', 'Documentação'),
('Teste', '#84CC16', 'category', 'Testes e QA'),
('Frontend', '#3B82F6', 'category', 'Desenvolvimento frontend'),
('Backend', '#8B5CF6', 'category', 'Desenvolvimento backend'),
('API', '#10B981', 'category', 'Desenvolvimento de API'),
('Database', '#F59E0B', 'category', 'Banco de dados'),
('UI/UX', '#EC4899', 'category', 'Interface e experiência do usuário'),
('Mobile', '#06B6D4', 'category', 'Desenvolvimento mobile'),
('DevOps', '#7C2D12', 'category', 'DevOps e infraestrutura')
ON CONFLICT (name, created_by) DO NOTHING;

-- 8. Criar função para buscar tags disponíveis
CREATE OR REPLACE FUNCTION get_available_tags(user_id_param INTEGER DEFAULT NULL)
RETURNS TABLE (
    id INTEGER,
    name VARCHAR(50),
    color VARCHAR(7),
    type VARCHAR(20),
    description TEXT,
    created_by INTEGER
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        ct.id,
        ct.name,
        ct.color,
        ct.type,
        ct.description,
        ct.created_by
    FROM custom_tags ct
    WHERE ct.created_by = user_id_param OR ct.created_by IS NULL
    ORDER BY ct.type, ct.name;
END;
$$ LANGUAGE plpgsql;

-- 9. Criar função para buscar categorias disponíveis
CREATE OR REPLACE FUNCTION get_available_categories()
RETURNS TABLE (
    id INTEGER,
    name VARCHAR(50),
    description TEXT,
    color VARCHAR(7),
    icon VARCHAR(20)
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        cc.id,
        cc.name,
        cc.description,
        cc.color,
        cc.icon
    FROM card_categories cc
    ORDER BY cc.name;
END;
$$ LANGUAGE plpgsql;

-- 10. Criar função para adicionar tag a um card
CREATE OR REPLACE FUNCTION add_tag_to_card(
    card_id_param VARCHAR(255),
    tag_name_param VARCHAR(50)
)
RETURNS BOOLEAN AS $$
DECLARE
    current_tags TEXT[];
BEGIN
    -- Buscar tags atuais do card
    SELECT tags INTO current_tags FROM cards WHERE card_id = card_id_param;
    
    -- Se tags é NULL, inicializar como array vazio
    IF current_tags IS NULL THEN
        current_tags := '{}';
    END IF;
    
    -- Adicionar nova tag se não existir
    IF NOT (tag_name_param = ANY(current_tags)) THEN
        current_tags := current_tags || tag_name_param;
        UPDATE cards SET tags = current_tags WHERE card_id = card_id_param;
        RETURN TRUE;
    END IF;
    
    RETURN FALSE;
END;
$$ LANGUAGE plpgsql;

-- 11. Criar função para remover tag de um card
CREATE OR REPLACE FUNCTION remove_tag_from_card(
    card_id_param VARCHAR(255),
    tag_name_param VARCHAR(50)
)
RETURNS BOOLEAN AS $$
DECLARE
    current_tags TEXT[];
    new_tags TEXT[];
BEGIN
    -- Buscar tags atuais do card
    SELECT tags INTO current_tags FROM cards WHERE card_id = card_id_param;
    
    -- Se tags é NULL, retornar FALSE
    IF current_tags IS NULL THEN
        RETURN FALSE;
    END IF;
    
    -- Remover tag se existir
    SELECT array_agg(tag) INTO new_tags 
    FROM unnest(current_tags) AS tag 
    WHERE tag != tag_name_param;
    
    -- Se new_tags é NULL (array vazio), definir como array vazio
    IF new_tags IS NULL THEN
        new_tags := '{}';
    END IF;
    
    UPDATE cards SET tags = new_tags WHERE card_id = card_id_param;
    RETURN TRUE;
END;
$$ LANGUAGE plpgsql;

-- 12. Criar função para adicionar tag a uma subtask
CREATE OR REPLACE FUNCTION add_tag_to_subtask(
    subtask_id_param INTEGER,
    tag_name_param VARCHAR(50)
)
RETURNS BOOLEAN AS $$
DECLARE
    current_tags TEXT[];
BEGIN
    -- Buscar tags atuais da subtask
    SELECT tags INTO current_tags FROM subtasks WHERE id = subtask_id_param;
    
    -- Se tags é NULL, inicializar como array vazio
    IF current_tags IS NULL THEN
        current_tags := '{}';
    END IF;
    
    -- Adicionar nova tag se não existir
    IF NOT (tag_name_param = ANY(current_tags)) THEN
        current_tags := current_tags || tag_name_param;
        UPDATE subtasks SET tags = current_tags WHERE id = subtask_id_param;
        RETURN TRUE;
    END IF;
    
    RETURN FALSE;
END;
$$ LANGUAGE plpgsql;

-- 13. Criar função para remover tag de uma subtask
CREATE OR REPLACE FUNCTION remove_tag_from_subtask(
    subtask_id_param INTEGER,
    tag_name_param VARCHAR(50)
)
RETURNS BOOLEAN AS $$
DECLARE
    current_tags TEXT[];
    new_tags TEXT[];
BEGIN
    -- Buscar tags atuais da subtask
    SELECT tags INTO current_tags FROM subtasks WHERE id = subtask_id_param;
    
    -- Se tags é NULL, retornar FALSE
    IF current_tags IS NULL THEN
        RETURN FALSE;
    END IF;
    
    -- Remover tag se existir
    SELECT array_agg(tag) INTO new_tags 
    FROM unnest(current_tags) AS tag 
    WHERE tag != tag_name_param;
    
    -- Se new_tags é NULL (array vazio), definir como array vazio
    IF new_tags IS NULL THEN
        new_tags := '{}';
    END IF;
    
    UPDATE subtasks SET tags = new_tags WHERE id = subtask_id_param;
    RETURN TRUE;
END;
$$ LANGUAGE plpgsql;

-- 14. Criar função para buscar cards por tag
CREATE OR REPLACE FUNCTION get_cards_by_tag(
    tag_name_param VARCHAR(50),
    user_id_param INTEGER DEFAULT NULL
)
RETURNS TABLE (
    id INTEGER,
    card_id VARCHAR(255),
    title VARCHAR(255),
    description TEXT,
    status VARCHAR(50),
    importance VARCHAR(20),
    tags TEXT[],
    board_id VARCHAR(255),
    list_name VARCHAR(255),
    created_at TIMESTAMP,
    updated_at TIMESTAMP
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        c.id,
        c.card_id,
        c.title,
        c.description,
        c.status,
        c.importance,
        c.tags,
        c.board_id,
        c.list_name,
        c.created_at,
        c.updated_at
    FROM cards c
    WHERE tag_name_param = ANY(c.tags)
    AND (user_id_param IS NULL OR c.user_id = user_id_param)
    AND c.is_archived = FALSE
    ORDER BY c.updated_at DESC;
END;
$$ LANGUAGE plpgsql;

-- 15. Criar função para buscar subtasks por tag
CREATE OR REPLACE FUNCTION get_subtasks_by_tag(
    tag_name_param VARCHAR(50),
    user_id_param INTEGER DEFAULT NULL
)
RETURNS TABLE (
    id INTEGER,
    card_id VARCHAR(255),
    title VARCHAR(255),
    description TEXT,
    status VARCHAR(50),
    priority VARCHAR(20),
    tags TEXT[],
    created_at TIMESTAMP,
    updated_at TIMESTAMP
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        s.id,
        s.card_id,
        s.title,
        s.description,
        s.status,
        s.priority,
        s.tags,
        s.created_at,
        s.updated_at
    FROM subtasks s
    WHERE tag_name_param = ANY(s.tags)
    AND (user_id_param IS NULL OR s.user_id = user_id_param)
    ORDER BY s.updated_at DESC;
END;
$$ LANGUAGE plpgsql;

-- 16. Atualizar registros existentes para ter arrays de tags vazios
UPDATE cards SET tags = '{}' WHERE tags IS NULL;
UPDATE subtasks SET tags = '{}' WHERE tags IS NULL;

-- 17. Criar índices para melhor performance
CREATE INDEX IF NOT EXISTS idx_cards_tags ON cards USING GIN (tags);
CREATE INDEX IF NOT EXISTS idx_subtasks_tags ON subtasks USING GIN (tags);
CREATE INDEX IF NOT EXISTS idx_custom_tags_name ON custom_tags (name);
CREATE INDEX IF NOT EXISTS idx_custom_tags_created_by ON custom_tags (created_by);

-- Mensagem de sucesso
SELECT 'Sistema de tags corrigido com sucesso!' as message;
