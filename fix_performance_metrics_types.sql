-- =====================================================
-- CORREÇÃO DE TIPOS DE DADOS PARA MÉTRICAS DE PERFORMANCE
-- =====================================================

-- Este script corrige problemas de incompatibilidade de tipos

-- 1. Verificar estrutura atual das tabelas
SELECT 'Estrutura atual da tabela users:' as info;
SELECT column_name, data_type, character_maximum_length, is_nullable
FROM information_schema.columns 
WHERE table_name = 'users' 
ORDER BY ordinal_position;

SELECT 'Estrutura atual da tabela boards:' as info;
SELECT column_name, data_type, character_maximum_length, is_nullable
FROM information_schema.columns 
WHERE table_name = 'boards' 
ORDER BY ordinal_position;

-- 2. Verificar se as funções existem e seus tipos de retorno
SELECT 'Tipos de retorno das funções:' as info;
SELECT 
    r.routine_name,
    p.data_type,
    p.character_maximum_length
FROM information_schema.routines r
JOIN information_schema.parameters p ON r.specific_name = p.specific_name
WHERE r.routine_name LIKE 'get_%' 
  AND r.routine_schema = 'public'
  AND p.parameter_mode = 'OUT'
ORDER BY r.routine_name, p.ordinal_position;

-- 3. Recriar as funções com tipos corretos
-- Função para produtividade por usuário
DROP FUNCTION IF EXISTS get_user_productivity(DATE, DATE, INTEGER);
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
        u.id::INTEGER as user_id,
        u.username::VARCHAR(100) as username,
        COALESCE(u.nome_completo, u.username)::VARCHAR(255) as nome_completo,
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

-- Função para tendências de produtividade
DROP FUNCTION IF EXISTS get_productivity_trends(TEXT, DATE, DATE, INTEGER);
CREATE OR REPLACE FUNCTION get_productivity_trends(
    p_period_type TEXT DEFAULT 'month',
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
        END::VARCHAR(50) as period_label,
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

-- Função para performance por projeto
DROP FUNCTION IF EXISTS get_project_performance(DATE, DATE);
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
        b.id::INTEGER as board_id,
        b.name::VARCHAR(255) as board_name,
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

-- Função para relatório mensal
DROP FUNCTION IF EXISTS get_monthly_report(DATE);
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
    month_start := DATE_TRUNC('month', p_report_month)::DATE;
    month_end := (DATE_TRUNC('month', p_report_month) + INTERVAL '1 month' - INTERVAL '1 day')::DATE;
    
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
    
    SELECT COUNT(*), COUNT(CASE WHEN status = 'done' THEN 1 END)
    INTO total_subtasks, completed_subtasks
    FROM subtasks s
    JOIN cards c ON c.id = s.card_id
    WHERE s.created_at::DATE >= month_start 
        AND s.created_at::DATE <= month_end
        AND c.is_archived = false;
    
    subtask_completion_rate := CASE WHEN total_subtasks > 0 THEN (completed_subtasks::NUMERIC / total_subtasks::NUMERIC) * 100 ELSE 0 END;
    
    SELECT COUNT(DISTINCT created_by)
    INTO active_users
    FROM cards 
    WHERE created_at::DATE >= month_start 
        AND created_at::DATE <= month_end
        AND is_archived = false;
    
    RETURN QUERY VALUES 
        ('Total de Cards'::VARCHAR(100), total_cards::NUMERIC, 'Total de cards criados no mês'::VARCHAR(255)),
        ('Cards Concluídos'::VARCHAR(100), completed_cards::NUMERIC, 'Cards finalizados no mês'::VARCHAR(255)),
        ('Taxa de Conclusão (%)'::VARCHAR(100), completion_rate, 'Percentual de cards concluídos'::VARCHAR(255)),
        ('Tempo Médio (dias)'::VARCHAR(100), COALESCE(avg_completion_days, 0), 'Tempo médio para conclusão'::VARCHAR(255)),
        ('Total de Subtasks'::VARCHAR(100), total_subtasks::NUMERIC, 'Total de subtasks criadas'::VARCHAR(255)),
        ('Subtasks Concluídas'::VARCHAR(100), completed_subtasks::NUMERIC, 'Subtasks finalizadas'::VARCHAR(255)),
        ('Taxa Subtasks (%)'::VARCHAR(100), subtask_completion_rate, 'Percentual de subtasks concluídas'::VARCHAR(255)),
        ('Usuários Ativos'::VARCHAR(100), active_users::NUMERIC, 'Usuários que criaram cards no mês'::VARCHAR(255));
END;
$$ LANGUAGE plpgsql;

-- 4. Testar as funções corrigidas
SELECT 'Teste das funções corrigidas:' as info;

SELECT 'Teste: get_user_productivity' as teste;
SELECT * FROM get_user_productivity() LIMIT 3;

SELECT 'Teste: get_productivity_trends' as teste;
SELECT * FROM get_productivity_trends('month') LIMIT 3;

SELECT 'Teste: get_project_performance' as teste;
SELECT * FROM get_project_performance() LIMIT 3;

SELECT 'Teste: get_monthly_report' as teste;
SELECT * FROM get_monthly_report();

-- 5. Verificar se as funções estão funcionando
SELECT 'Verificação final:' as info;
SELECT routine_name, routine_type
FROM information_schema.routines 
WHERE routine_name LIKE 'get_%' 
  AND routine_schema = 'public'
ORDER BY routine_name;
