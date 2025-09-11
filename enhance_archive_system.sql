-- Melhorias no sistema de arquivamento
-- Execute este SQL no Editor SQL do Supabase

-- 1. Adicionar colunas de metadados para melhor organização
ALTER TABLE cards 
ADD COLUMN IF NOT EXISTS tags TEXT[] DEFAULT '{}',
ADD COLUMN IF NOT EXISTS estimated_hours DECIMAL(5,2),
ADD COLUMN IF NOT EXISTS actual_hours DECIMAL(5,2),
ADD COLUMN IF NOT EXISTS complexity VARCHAR(20) DEFAULT 'medium',
ADD COLUMN IF NOT EXISTS category VARCHAR(50);

-- 2. Criar tabela para categorias de cards
CREATE TABLE IF NOT EXISTS card_categories (
    id SERIAL PRIMARY KEY,
    name VARCHAR(50) NOT NULL UNIQUE,
    description TEXT,
    color VARCHAR(7) DEFAULT '#6B7280',
    icon VARCHAR(20) DEFAULT 'tag',
    created_at TIMESTAMP DEFAULT NOW(),
    created_by INTEGER REFERENCES users(id)
);

-- 3. Inserir categorias padrão
INSERT INTO card_categories (name, description, color, icon) VALUES
('Desenvolvimento', 'Cards relacionados a desenvolvimento de software', '#3B82F6', 'code'),
('Design', 'Cards relacionados a design e UX/UI', '#8B5CF6', 'palette'),
('Marketing', 'Cards relacionados a marketing e vendas', '#10B981', 'megaphone'),
('Suporte', 'Cards relacionados a suporte ao cliente', '#F59E0B', 'headphones'),
('Administrativo', 'Cards relacionados a tarefas administrativas', '#6B7280', 'file-text'),
('Reunião', 'Cards relacionados a reuniões e calls', '#EF4444', 'users'),
('Pesquisa', 'Cards relacionados a pesquisa e análise', '#06B6D4', 'search'),
('Teste', 'Cards relacionados a testes e QA', '#84CC16', 'check-circle')
ON CONFLICT (name) DO NOTHING;

-- 4. Criar tabela para tags personalizadas
CREATE TABLE IF NOT EXISTS custom_tags (
    id SERIAL PRIMARY KEY,
    name VARCHAR(30) NOT NULL,
    color VARCHAR(7) DEFAULT '#6B7280',
    created_at TIMESTAMP DEFAULT NOW(),
    created_by INTEGER REFERENCES users(id),
    UNIQUE(name, created_by)
);

-- 5. Criar função para buscar cards arquivados com filtros avançados
CREATE OR REPLACE FUNCTION get_archived_cards_filtered(
    p_folder_id INTEGER DEFAULT NULL,
    p_board_id VARCHAR DEFAULT NULL,
    p_member_id INTEGER DEFAULT NULL,
    p_priority VARCHAR DEFAULT NULL,
    p_category VARCHAR DEFAULT NULL,
    p_tags TEXT[] DEFAULT NULL,
    p_date_from DATE DEFAULT NULL,
    p_date_to DATE DEFAULT NULL,
    p_limit INTEGER DEFAULT 50,
    p_offset INTEGER DEFAULT 0
)
RETURNS TABLE (
    id INTEGER,
    title VARCHAR,
    description TEXT,
    status VARCHAR,
    importance VARCHAR,
    created_at TIMESTAMP,
    completed_at TIMESTAMP,
    archived_at TIMESTAMP,
    is_archived BOOLEAN,
    list_name VARCHAR,
    board_id VARCHAR,
    archive_folder_id INTEGER,
    archived_by INTEGER,
    tags TEXT[],
    estimated_hours DECIMAL,
    actual_hours DECIMAL,
    complexity VARCHAR,
    category VARCHAR,
    archive_folder_name VARCHAR,
    archive_folder_color VARCHAR,
    archive_folder_icon VARCHAR,
    archived_by_username VARCHAR,
    archived_by_name VARCHAR,
    board_name VARCHAR
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        c.id,
        c.title,
        c.description,
        c.status,
        c.importance,
        c.created_at,
        c.completed_at,
        c.archived_at,
        c.is_archived,
        c.list_name,
        c.board_id,
        c.archive_folder_id,
        c.archived_by,
        c.tags,
        c.estimated_hours,
        c.actual_hours,
        c.complexity,
        c.category,
        af.name as archive_folder_name,
        af.color as archive_folder_color,
        af.icon as archive_folder_icon,
        COALESCE(u.username, 'Sistema') as archived_by_username,
        COALESCE(u.nome_completo, u.username, 'Sistema') as archived_by_name,
        COALESCE(b.name, 'Board não encontrado') as board_name
    FROM cards c
    LEFT JOIN archive_folders af ON c.archive_folder_id = af.id
    LEFT JOIN users u ON c.archived_by = u.id
    LEFT JOIN boards b ON c.board_id = b.board_id
    WHERE c.is_archived = true
    AND (p_folder_id IS NULL OR c.archive_folder_id = p_folder_id)
    AND (p_board_id IS NULL OR c.board_id = p_board_id)
    AND (p_member_id IS NULL OR c.archived_by = p_member_id)
    AND (p_priority IS NULL OR c.importance = p_priority)
    AND (p_category IS NULL OR c.category = p_category)
    AND (p_tags IS NULL OR c.tags && p_tags)
    AND (p_date_from IS NULL OR c.archived_at::date >= p_date_from)
    AND (p_date_to IS NULL OR c.archived_at::date <= p_date_to)
    ORDER BY c.archived_at DESC
    LIMIT p_limit
    OFFSET p_offset;
END;
$$ LANGUAGE plpgsql;

-- 6. Criar função para estatísticas de arquivamento
CREATE OR REPLACE FUNCTION get_archive_statistics(
    p_date_from DATE DEFAULT NULL,
    p_date_to DATE DEFAULT NULL
)
RETURNS TABLE (
    total_archived BIGINT,
    archived_this_month BIGINT,
    archived_this_week BIGINT,
    by_board JSONB,
    by_member JSONB,
    by_priority JSONB,
    by_category JSONB,
    by_month JSONB,
    average_archive_time_days DECIMAL,
    most_active_board VARCHAR,
    most_active_member VARCHAR
) AS $$
DECLARE
    v_date_from DATE;
    v_date_to DATE;
    v_this_month DATE;
    v_this_week DATE;
BEGIN
    -- Definir datas padrão se não fornecidas
    v_date_from := COALESCE(p_date_from, '1900-01-01'::date);
    v_date_to := COALESCE(p_date_to, CURRENT_DATE);
    v_this_month := date_trunc('month', CURRENT_DATE)::date;
    v_this_week := CURRENT_DATE - INTERVAL '7 days';
    
    RETURN QUERY
    WITH filtered_cards AS (
        SELECT * FROM cards 
        WHERE is_archived = true 
        AND archived_at::date BETWEEN v_date_from AND v_date_to
    ),
    stats AS (
        SELECT 
            COUNT(*) as total_archived,
            COUNT(*) FILTER (WHERE archived_at::date >= v_this_month) as archived_this_month,
            COUNT(*) FILTER (WHERE archived_at::date >= v_this_week) as archived_this_week,
            jsonb_object_agg(
                COALESCE(b.name, 'Sem Board'), 
                board_count
            ) as by_board,
            jsonb_object_agg(
                COALESCE(u.nome_completo, u.username, 'Sistema'), 
                member_count
            ) as by_member,
            jsonb_object_agg(
                COALESCE(importance, 'medium'), 
                priority_count
            ) as by_priority,
            jsonb_object_agg(
                COALESCE(category, 'Sem categoria'), 
                category_count
            ) as by_category,
            jsonb_object_agg(
                to_char(archived_at, 'YYYY-MM'), 
                month_count
            ) as by_month,
            AVG(
                CASE 
                    WHEN completed_at IS NOT NULL AND archived_at IS NOT NULL 
                    THEN EXTRACT(EPOCH FROM (archived_at - completed_at)) / 86400
                    ELSE NULL 
                END
            ) as average_archive_time_days
        FROM filtered_cards c
        LEFT JOIN boards b ON c.board_id = b.board_id
        LEFT JOIN users u ON c.archived_by = u.id
        LEFT JOIN (
            SELECT board_id, COUNT(*) as board_count
            FROM filtered_cards c
            LEFT JOIN boards b ON c.board_id = b.board_id
            GROUP BY board_id
        ) bc ON c.board_id = bc.board_id
        LEFT JOIN (
            SELECT archived_by, COUNT(*) as member_count
            FROM filtered_cards
            GROUP BY archived_by
        ) mc ON c.archived_by = mc.archived_by
        LEFT JOIN (
            SELECT importance, COUNT(*) as priority_count
            FROM filtered_cards
            GROUP BY importance
        ) pc ON c.importance = pc.importance
        LEFT JOIN (
            SELECT category, COUNT(*) as category_count
            FROM filtered_cards
            GROUP BY category
        ) cc ON c.category = cc.category
        LEFT JOIN (
            SELECT to_char(archived_at, 'YYYY-MM') as month, COUNT(*) as month_count
            FROM filtered_cards
            GROUP BY to_char(archived_at, 'YYYY-MM')
        ) mth ON to_char(c.archived_at, 'YYYY-MM') = mth.month
    )
    SELECT 
        s.total_archived,
        s.archived_this_month,
        s.archived_this_week,
        s.by_board,
        s.by_member,
        s.by_priority,
        s.by_category,
        s.by_month,
        s.average_archive_time_days,
        (SELECT b.name FROM boards b 
         JOIN (SELECT board_id, COUNT(*) as cnt FROM filtered_cards GROUP BY board_id) bc 
         ON b.board_id = bc.board_id 
         ORDER BY bc.cnt DESC LIMIT 1) as most_active_board,
        (SELECT COALESCE(u.nome_completo, u.username) FROM users u 
         JOIN (SELECT archived_by, COUNT(*) as cnt FROM filtered_cards GROUP BY archived_by) mc 
         ON u.id = mc.archived_by 
         ORDER BY mc.cnt DESC LIMIT 1) as most_active_member
    FROM stats s;
END;
$$ LANGUAGE plpgsql;

-- 7. Criar view para relatórios de produtividade
CREATE OR REPLACE VIEW archive_productivity_report AS
SELECT 
    DATE_TRUNC('month', c.archived_at) as month,
    COALESCE(b.name, 'Sem Board') as board_name,
    COALESCE(u.nome_completo, u.username, 'Sistema') as member_name,
    COUNT(*) as cards_archived,
    AVG(c.estimated_hours) as avg_estimated_hours,
    AVG(c.actual_hours) as avg_actual_hours,
    AVG(
        CASE 
            WHEN c.completed_at IS NOT NULL AND c.archived_at IS NOT NULL 
            THEN EXTRACT(EPOCH FROM (c.archived_at - c.completed_at)) / 86400
            ELSE NULL 
        END
    ) as avg_archive_delay_days
FROM cards c
LEFT JOIN boards b ON c.board_id = b.board_id
LEFT JOIN users u ON c.archived_by = u.id
WHERE c.is_archived = true
GROUP BY DATE_TRUNC('month', c.archived_at), b.name, u.nome_completo, u.username
ORDER BY month DESC, cards_archived DESC;

-- 8. Criar índices para melhor performance
CREATE INDEX IF NOT EXISTS idx_cards_archived_at ON cards(archived_at) WHERE is_archived = true;
CREATE INDEX IF NOT EXISTS idx_cards_archive_folder ON cards(archive_folder_id) WHERE is_archived = true;
CREATE INDEX IF NOT EXISTS idx_cards_archived_by ON cards(archived_by) WHERE is_archived = true;
CREATE INDEX IF NOT EXISTS idx_cards_board_archived ON cards(board_id) WHERE is_archived = true;
CREATE INDEX IF NOT EXISTS idx_cards_category ON cards(category);
CREATE INDEX IF NOT EXISTS idx_cards_tags ON cards USING GIN(tags);

-- 9. Verificar se tudo foi criado corretamente
SELECT 
    'Verificação das melhorias' as status,
    'Colunas adicionadas em cards' as item,
    CASE 
        WHEN EXISTS (
            SELECT 1 FROM information_schema.columns 
            WHERE table_name = 'cards' AND column_name IN ('tags', 'estimated_hours', 'actual_hours', 'complexity', 'category')
        ) THEN 'OK' 
        ELSE 'ERRO' 
    END as status_item;

SELECT 
    'Verificação das melhorias' as status,
    'Tabelas criadas' as item,
    CASE 
        WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'card_categories')
        AND EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'custom_tags')
        THEN 'OK' 
        ELSE 'ERRO' 
    END as status_item;

SELECT 
    'Verificação das melhorias' as status,
    'Funções criadas' as item,
    CASE 
        WHEN EXISTS (SELECT 1 FROM information_schema.routines WHERE routine_name = 'get_archived_cards_filtered')
        AND EXISTS (SELECT 1 FROM information_schema.routines WHERE routine_name = 'get_archive_statistics')
        THEN 'OK' 
        ELSE 'ERRO' 
    END as status_item;
