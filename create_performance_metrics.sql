-- =====================================================
-- SISTEMA DE MÉTRICAS DE PERFORMANCE E RELATÓRIOS
-- =====================================================

-- 1. Função para calcular tempo médio de conclusão
CREATE OR REPLACE FUNCTION get_average_completion_time(
    p_start_date DATE DEFAULT NULL,
    p_end_date DATE DEFAULT NULL,
    p_board_id INTEGER DEFAULT NULL
)
RETURNS TABLE (
    avg_completion_days NUMERIC,
    total_cards INTEGER,
    completed_cards INTEGER
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        ROUND(AVG(EXTRACT(EPOCH FROM (COALESCE(c.completed_at, c.updated_at) - c.created_at)) / 86400)::NUMERIC, 2) as avg_completion_days,
        COUNT(*)::INTEGER as total_cards,
        COUNT(CASE WHEN c.status = 'done' THEN 1 END)::INTEGER as completed_cards
    FROM cards c
    WHERE 
        (p_start_date IS NULL OR c.created_at::DATE >= p_start_date)
        AND (p_end_date IS NULL OR c.created_at::DATE <= p_end_date)
        AND (p_board_id IS NULL OR c.board_id::INTEGER = p_board_id)
        AND c.is_archived = false;
END;
$$ LANGUAGE plpgsql;

-- 2. Função para calcular taxa de conclusão
CREATE OR REPLACE FUNCTION get_completion_rate(
    p_start_date DATE DEFAULT NULL,
    p_end_date DATE DEFAULT NULL,
    p_board_id INTEGER DEFAULT NULL
)
RETURNS TABLE (
    completion_rate NUMERIC,
    total_created INTEGER,
    total_completed INTEGER,
    pending_cards INTEGER
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        CASE 
            WHEN COUNT(*) > 0 THEN 
                ROUND((COUNT(CASE WHEN c.status = 'done' THEN 1 END)::NUMERIC / COUNT(*)::NUMERIC) * 100, 2)
            ELSE 0
        END as completion_rate,
        COUNT(*)::INTEGER as total_created,
        COUNT(CASE WHEN c.status = 'done' THEN 1 END)::INTEGER as total_completed,
        COUNT(CASE WHEN c.status != 'done' THEN 1 END)::INTEGER as pending_cards
    FROM cards c
    WHERE 
        (p_start_date IS NULL OR c.created_at::DATE >= p_start_date)
        AND (p_end_date IS NULL OR c.created_at::DATE <= p_end_date)
        AND (p_board_id IS NULL OR c.board_id::INTEGER = p_board_id)
        AND c.is_archived = false;
END;
$$ LANGUAGE plpgsql;

-- 3. Função para produtividade por usuário
CREATE OR REPLACE FUNCTION get_user_productivity(
    p_start_date DATE DEFAULT NULL,
    p_end_date DATE DEFAULT NULL,
    p_board_id INTEGER DEFAULT NULL
)
RETURNS TABLE (
    user_id INTEGER,
    username VARCHAR(100),
    nome_completo VARCHAR(255),
    total_cards INTEGER,
    completed_cards INTEGER,
    completion_rate NUMERIC,
    avg_completion_days NUMERIC
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        u.id as user_id,
        u.username,
        u.nome_completo,
        COUNT(c.id)::INTEGER as total_cards,
        COUNT(CASE WHEN c.status = 'done' THEN 1 END)::INTEGER as completed_cards,
        CASE 
            WHEN COUNT(c.id) > 0 THEN 
                ROUND((COUNT(CASE WHEN c.status = 'done' THEN 1 END)::NUMERIC / COUNT(c.id)::NUMERIC) * 100, 2)
            ELSE 0
        END as completion_rate,
        ROUND(AVG(CASE 
            WHEN c.status = 'done' THEN 
                EXTRACT(EPOCH FROM (COALESCE(c.completed_at, c.updated_at) - c.created_at)) / 86400
        END)::NUMERIC, 2) as avg_completion_days
    FROM users u
    LEFT JOIN cards c ON c.created_by = u.id
        AND (p_start_date IS NULL OR c.created_at::DATE >= p_start_date)
        AND (p_end_date IS NULL OR c.created_at::DATE <= p_end_date)
        AND (p_board_id IS NULL OR c.board_id::INTEGER = p_board_id)
        AND c.is_archived = false
    GROUP BY u.id, u.username, u.nome_completo
    HAVING COUNT(c.id) > 0
    ORDER BY completed_cards DESC, completion_rate DESC;
END;
$$ LANGUAGE plpgsql;

-- 4. Função para análise de tendências (produtividade por período)
CREATE OR REPLACE FUNCTION get_productivity_trends(
    p_period_type TEXT DEFAULT 'month', -- 'day', 'week', 'month'
    p_start_date DATE DEFAULT NULL,
    p_end_date DATE DEFAULT NULL,
    p_board_id INTEGER DEFAULT NULL
)
RETURNS TABLE (
    period_label VARCHAR(50),
    period_date DATE,
    total_created INTEGER,
    total_completed INTEGER,
    completion_rate NUMERIC,
    avg_completion_days NUMERIC
) AS $$
DECLARE
    date_trunc_format TEXT;
BEGIN
    -- Definir formato de truncamento baseado no período
    CASE p_period_type
        WHEN 'day' THEN date_trunc_format := 'day';
        WHEN 'week' THEN date_trunc_format := 'week';
        WHEN 'month' THEN date_trunc_format := 'month';
        ELSE date_trunc_format := 'month';
    END CASE;

    RETURN QUERY
    SELECT 
        CASE p_period_type
            WHEN 'day' THEN TO_CHAR(DATE_TRUNC('day', c.created_at), 'DD/MM/YYYY')
            WHEN 'week' THEN 'Semana ' || TO_CHAR(DATE_TRUNC('week', c.created_at), 'WW/YYYY')
            WHEN 'month' THEN TO_CHAR(DATE_TRUNC('month', c.created_at), 'MM/YYYY')
            ELSE TO_CHAR(DATE_TRUNC('month', c.created_at), 'MM/YYYY')
        END as period_label,
        DATE_TRUNC(date_trunc_format, c.created_at)::DATE as period_date,
        COUNT(*)::INTEGER as total_created,
        COUNT(CASE WHEN c.status = 'done' THEN 1 END)::INTEGER as total_completed,
        CASE 
            WHEN COUNT(*) > 0 THEN 
                ROUND((COUNT(CASE WHEN c.status = 'done' THEN 1 END)::NUMERIC / COUNT(*)::NUMERIC) * 100, 2)
            ELSE 0
        END as completion_rate,
        ROUND(AVG(CASE 
            WHEN c.status = 'done' THEN 
                EXTRACT(EPOCH FROM (COALESCE(c.completed_at, c.updated_at) - c.created_at)) / 86400
        END)::NUMERIC, 2) as avg_completion_days
    FROM cards c
    WHERE 
        (p_start_date IS NULL OR c.created_at::DATE >= p_start_date)
        AND (p_end_date IS NULL OR c.created_at::DATE <= p_end_date)
        AND (p_board_id IS NULL OR c.board_id::INTEGER = p_board_id)
        AND c.is_archived = false
    GROUP BY DATE_TRUNC(date_trunc_format, c.created_at)
    ORDER BY period_date;
END;
$$ LANGUAGE plpgsql;

-- 5. Função para relatório por projeto/board
CREATE OR REPLACE FUNCTION get_project_performance(
    p_start_date DATE DEFAULT NULL,
    p_end_date DATE DEFAULT NULL
)
RETURNS TABLE (
    board_id INTEGER,
    board_name VARCHAR(255),
    total_cards INTEGER,
    completed_cards INTEGER,
    pending_cards INTEGER,
    completion_rate NUMERIC,
    avg_completion_days NUMERIC,
    total_members INTEGER
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        b.id as board_id,
        b.name as board_name,
        COUNT(c.id)::INTEGER as total_cards,
        COUNT(CASE WHEN c.status = 'done' THEN 1 END)::INTEGER as completed_cards,
        COUNT(CASE WHEN c.status != 'done' THEN 1 END)::INTEGER as pending_cards,
        CASE 
            WHEN COUNT(c.id) > 0 THEN 
                ROUND((COUNT(CASE WHEN c.status = 'done' THEN 1 END)::NUMERIC / COUNT(c.id)::NUMERIC) * 100, 2)
            ELSE 0
        END as completion_rate,
        ROUND(AVG(CASE 
            WHEN c.status = 'done' THEN 
                EXTRACT(EPOCH FROM (COALESCE(c.completed_at, c.updated_at) - c.created_at)) / 86400
        END)::NUMERIC, 2) as avg_completion_days,
        COUNT(DISTINCT c.created_by)::INTEGER as total_members
    FROM boards b
    LEFT JOIN cards c ON c.board_id::INTEGER = b.id
        AND (p_start_date IS NULL OR c.created_at::DATE >= p_start_date)
        AND (p_end_date IS NULL OR c.created_at::DATE <= p_end_date)
        AND c.is_archived = false
    GROUP BY b.id, b.name
    HAVING COUNT(c.id) > 0
    ORDER BY completed_cards DESC, completion_rate DESC;
END;
$$ LANGUAGE plpgsql;

-- 6. Função para métricas de subtasks
CREATE OR REPLACE FUNCTION get_subtask_metrics(
    p_start_date DATE DEFAULT NULL,
    p_end_date DATE DEFAULT NULL,
    p_board_id INTEGER DEFAULT NULL
)
RETURNS TABLE (
    total_subtasks INTEGER,
    completed_subtasks INTEGER,
    pending_subtasks INTEGER,
    completion_rate NUMERIC,
    avg_completion_days NUMERIC
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        COUNT(s.id)::INTEGER as total_subtasks,
        COUNT(CASE WHEN s.status = 'done' THEN 1 END)::INTEGER as completed_subtasks,
        COUNT(CASE WHEN s.status != 'done' THEN 1 END)::INTEGER as pending_subtasks,
        CASE 
            WHEN COUNT(s.id) > 0 THEN 
                ROUND((COUNT(CASE WHEN s.status = 'done' THEN 1 END)::NUMERIC / COUNT(s.id)::NUMERIC) * 100, 2)
            ELSE 0
        END as completion_rate,
        ROUND(AVG(CASE 
            WHEN s.status = 'done' THEN 
                EXTRACT(EPOCH FROM (COALESCE(s.completed_at, s.updated_at) - s.created_at)) / 86400
        END)::NUMERIC, 2) as avg_completion_days
    FROM subtasks s
    JOIN cards c ON c.id = s.card_id
    WHERE 
        (p_start_date IS NULL OR s.created_at::DATE >= p_start_date)
        AND (p_end_date IS NULL OR s.created_at::DATE <= p_end_date)
        AND (p_board_id IS NULL OR c.board_id::INTEGER = p_board_id)
        AND c.is_archived = false;
END;
$$ LANGUAGE plpgsql;

-- 7. Função para relatório mensal completo
CREATE OR REPLACE FUNCTION get_monthly_report(
    p_report_month DATE DEFAULT CURRENT_DATE
)
RETURNS TABLE (
    metric_name VARCHAR(100),
    metric_value NUMERIC,
    metric_description VARCHAR(255)
) AS $$
DECLARE
    month_start DATE;
    month_end DATE;
    total_cards INTEGER;
    completed_cards INTEGER;
    completion_rate NUMERIC;
    avg_completion_days NUMERIC;
    total_subtasks INTEGER;
    completed_subtasks INTEGER;
    subtask_completion_rate NUMERIC;
    active_users INTEGER;
BEGIN
    -- Definir início e fim do mês
    month_start := DATE_TRUNC('month', p_report_month)::DATE;
    month_end := (DATE_TRUNC('month', p_report_month) + INTERVAL '1 month' - INTERVAL '1 day')::DATE;
    
    -- Calcular métricas básicas
    SELECT COUNT(*), COUNT(CASE WHEN status = 'done' THEN 1 END)
    INTO total_cards, completed_cards
    FROM cards 
    WHERE created_at::DATE >= month_start 
        AND created_at::DATE <= month_end
        AND is_archived = false;
    
    completion_rate := CASE WHEN total_cards > 0 THEN (completed_cards::NUMERIC / total_cards::NUMERIC) * 100 ELSE 0 END;
    
    SELECT ROUND(AVG(EXTRACT(EPOCH FROM (COALESCE(completed_at, updated_at) - created_at)) / 86400)::NUMERIC, 2)
    INTO avg_completion_days
    FROM cards 
    WHERE status = 'done' 
        AND created_at::DATE >= month_start 
        AND created_at::DATE <= month_end
        AND is_archived = false;
    
    -- Calcular métricas de subtasks
    SELECT COUNT(*), COUNT(CASE WHEN status = 'done' THEN 1 END)
    INTO total_subtasks, completed_subtasks
    FROM subtasks s
    JOIN cards c ON c.id = s.card_id
    WHERE s.created_at::DATE >= month_start 
        AND s.created_at::DATE <= month_end
        AND c.is_archived = false;
    
    subtask_completion_rate := CASE WHEN total_subtasks > 0 THEN (completed_subtasks::NUMERIC / total_subtasks::NUMERIC) * 100 ELSE 0 END;
    
    -- Contar usuários ativos
    SELECT COUNT(DISTINCT created_by)
    INTO active_users
    FROM cards 
    WHERE created_at::DATE >= month_start 
        AND created_at::DATE <= month_end
        AND is_archived = false;
    
    -- Retornar métricas
    RETURN QUERY VALUES 
        ('Total de Cards', total_cards::NUMERIC, 'Total de cards criados no mês'),
        ('Cards Concluídos', completed_cards::NUMERIC, 'Cards finalizados no mês'),
        ('Taxa de Conclusão (%)', completion_rate, 'Percentual de cards concluídos'),
        ('Tempo Médio (dias)', COALESCE(avg_completion_days, 0), 'Tempo médio para conclusão'),
        ('Total de Subtasks', total_subtasks::NUMERIC, 'Total de subtasks criadas'),
        ('Subtasks Concluídas', completed_subtasks::NUMERIC, 'Subtasks finalizadas'),
        ('Taxa Subtasks (%)', subtask_completion_rate, 'Percentual de subtasks concluídas'),
        ('Usuários Ativos', active_users::NUMERIC, 'Usuários que criaram cards no mês');
END;
$$ LANGUAGE plpgsql;

-- 8. Criar índices para melhorar performance das consultas
CREATE INDEX IF NOT EXISTS idx_cards_created_at ON cards(created_at);
CREATE INDEX IF NOT EXISTS idx_cards_completed_at ON cards(completed_at);
CREATE INDEX IF NOT EXISTS idx_cards_status ON cards(status);
CREATE INDEX IF NOT EXISTS idx_cards_board_id ON cards(board_id);
CREATE INDEX IF NOT EXISTS idx_cards_created_by ON cards(created_by);
CREATE INDEX IF NOT EXISTS idx_subtasks_created_at ON subtasks(created_at);
CREATE INDEX IF NOT EXISTS idx_subtasks_completed_at ON subtasks(completed_at);
CREATE INDEX IF NOT EXISTS idx_subtasks_status ON subtasks(status);

-- 9. Comentários das funções
COMMENT ON FUNCTION get_average_completion_time IS 'Calcula tempo médio de conclusão de cards';
COMMENT ON FUNCTION get_completion_rate IS 'Calcula taxa de conclusão de cards';
COMMENT ON FUNCTION get_user_productivity IS 'Calcula produtividade por usuário';
COMMENT ON FUNCTION get_productivity_trends IS 'Analisa tendências de produtividade por período';
COMMENT ON FUNCTION get_project_performance IS 'Calcula performance por projeto/board';
COMMENT ON FUNCTION get_subtask_metrics IS 'Calcula métricas de subtasks';
COMMENT ON FUNCTION get_monthly_report IS 'Gera relatório mensal completo';
