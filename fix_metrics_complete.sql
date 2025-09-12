-- =====================================================
-- CORREÇÃO COMPLETA DAS FUNÇÕES DE MÉTRICAS
-- =====================================================

-- Este script remove TODAS as funções e as recria do zero
-- Execute este script no Supabase SQL Editor

-- 1. REMOVER TODAS AS FUNÇÕES EXISTENTES
DO $$
DECLARE
    func_record RECORD;
BEGIN
    -- Remover todas as funções de métricas existentes
    FOR func_record IN 
        SELECT routine_name, specific_name 
        FROM information_schema.routines 
        WHERE routine_schema = 'public' 
        AND routine_name IN (
            'get_average_completion_time',
            'get_completion_rate', 
            'get_user_productivity',
            'get_productivity_trends',
            'get_project_performance',
            'get_subtask_metrics',
            'get_monthly_report'
        )
    LOOP
        EXECUTE 'DROP FUNCTION IF EXISTS ' || func_record.specific_name || ' CASCADE';
        RAISE NOTICE 'Função removida: %', func_record.routine_name;
    END LOOP;
    
    RAISE NOTICE 'Todas as funções existentes foram removidas';
END $$;

-- 2. RECRIAR TODAS AS FUNÇÕES COM CÓDIGO CORRETO

-- Função 1: Tempo médio de conclusão
CREATE OR REPLACE FUNCTION get_average_completion_time(
    p_start_date DATE DEFAULT NULL,
    p_end_date DATE DEFAULT NULL,
    p_board_id INTEGER DEFAULT NULL
)
RETURNS TABLE(
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
    WHERE (p_start_date IS NULL OR c.created_at::DATE >= p_start_date)
      AND (p_end_date IS NULL OR c.created_at::DATE <= p_end_date)
      AND (p_board_id IS NULL OR c.board_id::INTEGER = p_board_id)
      AND c.is_archived = false;
END;
$$ LANGUAGE plpgsql;

-- Função 2: Taxa de conclusão
CREATE OR REPLACE FUNCTION get_completion_rate(
    p_start_date DATE DEFAULT NULL,
    p_end_date DATE DEFAULT NULL,
    p_board_id INTEGER DEFAULT NULL
)
RETURNS TABLE(
    total_cards INTEGER,
    completed_cards INTEGER,
    completion_rate NUMERIC
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        COUNT(*)::INTEGER as total_cards,
        COUNT(CASE WHEN c.status = 'done' THEN 1 END)::INTEGER as completed_cards,
        CASE 
            WHEN COUNT(*) > 0 THEN 
                ROUND((COUNT(CASE WHEN c.status = 'done' THEN 1 END)::NUMERIC / COUNT(*)::NUMERIC) * 100, 2)
            ELSE 0 
        END as completion_rate
    FROM cards c
    WHERE (p_start_date IS NULL OR c.created_at::DATE >= p_start_date)
      AND (p_end_date IS NULL OR c.created_at::DATE <= p_end_date)
      AND (p_board_id IS NULL OR c.board_id::INTEGER = p_board_id)
      AND c.is_archived = false;
END;
$$ LANGUAGE plpgsql;

-- Função 3: Produtividade por usuário
CREATE OR REPLACE FUNCTION get_user_productivity(
    p_start_date DATE DEFAULT NULL,
    p_end_date DATE DEFAULT NULL,
    p_board_id INTEGER DEFAULT NULL
)
RETURNS TABLE(
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
        u.username::VARCHAR(100),
        u.nome_completo::VARCHAR(255),
        COUNT(c.id)::INTEGER as total_cards,
        COUNT(CASE WHEN c.status = 'done' THEN 1 END)::INTEGER as completed_cards,
        CASE 
            WHEN COUNT(c.id) > 0 THEN 
                ROUND((COUNT(CASE WHEN c.status = 'done' THEN 1 END)::NUMERIC / COUNT(c.id)::NUMERIC) * 100, 2)
            ELSE 0 
        END as completion_rate,
        ROUND(AVG(CASE WHEN c.status = 'done' THEN EXTRACT(EPOCH FROM (COALESCE(c.completed_at, c.updated_at) - c.created_at)) / 86400 END)::NUMERIC, 2) as avg_completion_days
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

-- Função 4: Tendências de produtividade (CORRIGIDA)
CREATE OR REPLACE FUNCTION get_productivity_trends(
    p_period_type TEXT DEFAULT 'month',
    p_start_date DATE DEFAULT NULL,
    p_end_date DATE DEFAULT NULL,
    p_board_id INTEGER DEFAULT NULL
)
RETURNS TABLE(
    period_label VARCHAR(50),
    total_cards INTEGER,
    completed_cards INTEGER,
    completion_rate NUMERIC
) AS $$
BEGIN
    RETURN QUERY
    WITH period_data AS (
        SELECT 
            CASE 
                WHEN p_period_type = 'day' THEN TO_CHAR(c.created_at, 'YYYY-MM-DD')
                WHEN p_period_type = 'week' THEN TO_CHAR(c.created_at, 'YYYY-"W"WW')
                ELSE TO_CHAR(c.created_at, 'YYYY-MM')
            END as period_key,
            COUNT(*) as total_count,
            COUNT(CASE WHEN c.status = 'done' THEN 1 END) as completed_count
        FROM cards c
        WHERE (p_start_date IS NULL OR c.created_at::DATE >= p_start_date)
          AND (p_end_date IS NULL OR c.created_at::DATE <= p_end_date)
          AND (p_board_id IS NULL OR c.board_id::INTEGER = p_board_id)
          AND c.is_archived = false
        GROUP BY 
            CASE 
                WHEN p_period_type = 'day' THEN TO_CHAR(c.created_at, 'YYYY-MM-DD')
                WHEN p_period_type = 'week' THEN TO_CHAR(c.created_at, 'YYYY-"W"WW')
                ELSE TO_CHAR(c.created_at, 'YYYY-MM')
            END
    )
    SELECT 
        pd.period_key::VARCHAR(50) as period_label,
        pd.total_count::INTEGER as total_cards,
        pd.completed_count::INTEGER as completed_cards,
        CASE 
            WHEN pd.total_count > 0 THEN 
                ROUND((pd.completed_count::NUMERIC / pd.total_count::NUMERIC) * 100, 2)
            ELSE 0 
        END as completion_rate
    FROM period_data pd
    ORDER BY pd.period_key;
END;
$$ LANGUAGE plpgsql;

-- Função 5: Performance por projeto
CREATE OR REPLACE FUNCTION get_project_performance(
    p_start_date DATE DEFAULT NULL,
    p_end_date DATE DEFAULT NULL
)
RETURNS TABLE(
    board_id INTEGER,
    board_name VARCHAR(255),
    total_cards INTEGER,
    completed_cards INTEGER,
    completion_rate NUMERIC,
    avg_completion_days NUMERIC
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        b.id as board_id,
        b.name::VARCHAR(255) as board_name,
        COUNT(c.id)::INTEGER as total_cards,
        COUNT(CASE WHEN c.status = 'done' THEN 1 END)::INTEGER as completed_cards,
        CASE 
            WHEN COUNT(c.id) > 0 THEN 
                ROUND((COUNT(CASE WHEN c.status = 'done' THEN 1 END)::NUMERIC / COUNT(c.id)::NUMERIC) * 100, 2)
            ELSE 0 
        END as completion_rate,
        ROUND(AVG(CASE WHEN c.status = 'done' THEN EXTRACT(EPOCH FROM (COALESCE(c.completed_at, c.updated_at) - c.created_at)) / 86400 END)::NUMERIC, 2) as avg_completion_days
    FROM boards b
    LEFT JOIN cards c ON c.board_id::INTEGER = b.id 
        AND (p_start_date IS NULL OR c.created_at::DATE >= p_start_date)
        AND (p_end_date IS NULL OR c.created_at::DATE <= p_end_date)
        AND c.is_archived = false
    GROUP BY b.id, b.name
    HAVING COUNT(c.id) > 0
    ORDER BY completion_rate DESC, completed_cards DESC;
END;
$$ LANGUAGE plpgsql;

-- Função 6: Métricas de subtasks
CREATE OR REPLACE FUNCTION get_subtask_metrics(
    p_start_date DATE DEFAULT NULL,
    p_end_date DATE DEFAULT NULL,
    p_board_id INTEGER DEFAULT NULL
)
RETURNS TABLE(
    total_subtasks INTEGER,
    completed_subtasks INTEGER,
    completion_rate NUMERIC,
    avg_completion_days NUMERIC
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        COUNT(*)::INTEGER as total_subtasks,
        COUNT(CASE WHEN s.status = 'done' THEN 1 END)::INTEGER as completed_subtasks,
        CASE 
            WHEN COUNT(*) > 0 THEN 
                ROUND((COUNT(CASE WHEN s.status = 'done' THEN 1 END)::NUMERIC / COUNT(*)::NUMERIC) * 100, 2)
            ELSE 0 
        END as completion_rate,
        ROUND(AVG(CASE WHEN s.status = 'done' THEN EXTRACT(EPOCH FROM (COALESCE(s.completed_at, s.updated_at) - s.created_at)) / 86400 END)::NUMERIC, 2) as avg_completion_days
    FROM subtasks s
    JOIN cards c ON s.card_id = c.id
    WHERE (p_start_date IS NULL OR s.created_at::DATE >= p_start_date)
      AND (p_end_date IS NULL OR s.created_at::DATE <= p_end_date)
      AND (p_board_id IS NULL OR c.board_id::INTEGER = p_board_id)
      AND c.is_archived = false;
END;
$$ LANGUAGE plpgsql;

-- Função 7: Relatório mensal (CORRIGIDA)
CREATE OR REPLACE FUNCTION get_monthly_report(
    p_report_month TEXT DEFAULT NULL
)
RETURNS TABLE(
    metric_name VARCHAR(100),
    metric_description VARCHAR(255),
    metric_value NUMERIC,
    metric_unit VARCHAR(50)
) AS $$
DECLARE
    v_start_date DATE;
    v_end_date DATE;
    v_total_cards INTEGER;
    v_completed_cards INTEGER;
    v_completion_rate NUMERIC;
    v_avg_completion_days NUMERIC;
    v_total_subtasks INTEGER;
    v_completed_subtasks INTEGER;
    v_subtask_completion_rate NUMERIC;
BEGIN
    -- Definir período do relatório
    IF p_report_month IS NULL THEN
        v_start_date := DATE_TRUNC('month', CURRENT_DATE);
        v_end_date := DATE_TRUNC('month', CURRENT_DATE) + INTERVAL '1 month' - INTERVAL '1 day';
    ELSE
        v_start_date := TO_DATE(p_report_month, 'YYYY-MM');
        v_end_date := v_start_date + INTERVAL '1 month' - INTERVAL '1 day';
    END IF;
    
    -- Calcular métricas básicas
    SELECT 
        COUNT(*)::INTEGER,
        COUNT(CASE WHEN status = 'done' THEN 1 END)::INTEGER,
        CASE 
            WHEN COUNT(*) > 0 THEN 
                ROUND((COUNT(CASE WHEN status = 'done' THEN 1 END)::NUMERIC / COUNT(*)::NUMERIC) * 100, 2)
            ELSE 0 
        END,
        ROUND(AVG(CASE WHEN status = 'done' THEN EXTRACT(EPOCH FROM (COALESCE(completed_at, updated_at) - created_at)) / 86400 END)::NUMERIC, 2)
    INTO v_total_cards, v_completed_cards, v_completion_rate, v_avg_completion_days
    FROM cards
    WHERE created_at::DATE >= v_start_date
      AND created_at::DATE <= v_end_date
      AND is_archived = false;
    
    -- Calcular métricas de subtasks
    SELECT 
        COUNT(*)::INTEGER,
        COUNT(CASE WHEN s.status = 'done' THEN 1 END)::INTEGER,
        CASE 
            WHEN COUNT(*) > 0 THEN 
                ROUND((COUNT(CASE WHEN s.status = 'done' THEN 1 END)::NUMERIC / COUNT(*)::NUMERIC) * 100, 2)
            ELSE 0 
        END
    INTO v_total_subtasks, v_completed_subtasks, v_subtask_completion_rate
    FROM subtasks s
    JOIN cards c ON s.card_id = c.id
    WHERE s.created_at::DATE >= v_start_date
      AND s.created_at::DATE <= v_end_date
      AND c.is_archived = false;
    
    -- Retornar métricas
    RETURN QUERY
    SELECT 'Total de Cards'::VARCHAR(100), 'Número total de cards criados no período'::VARCHAR(255), v_total_cards::NUMERIC, 'cards'::VARCHAR(50)
    UNION ALL
    SELECT 'Cards Concluídos'::VARCHAR(100), 'Número de cards concluídos no período'::VARCHAR(255), v_completed_cards::NUMERIC, 'cards'::VARCHAR(50)
    UNION ALL
    SELECT 'Taxa de Conclusão'::VARCHAR(100), 'Percentual de cards concluídos'::VARCHAR(255), v_completion_rate::NUMERIC, '%'::VARCHAR(50)
    UNION ALL
    SELECT 'Tempo Médio de Conclusão'::VARCHAR(100), 'Tempo médio para conclusão de cards'::VARCHAR(255), v_avg_completion_days::NUMERIC, 'dias'::VARCHAR(50)
    UNION ALL
    SELECT 'Total de Subtasks'::VARCHAR(100), 'Número total de subtasks criadas no período'::VARCHAR(255), v_total_subtasks::NUMERIC, 'subtasks'::VARCHAR(50)
    UNION ALL
    SELECT 'Subtasks Concluídas'::VARCHAR(100), 'Número de subtasks concluídas no período'::VARCHAR(255), v_completed_subtasks::NUMERIC, 'subtasks'::VARCHAR(50)
    UNION ALL
    SELECT 'Taxa de Conclusão de Subtasks'::VARCHAR(100), 'Percentual de subtasks concluídas'::VARCHAR(255), v_subtask_completion_rate::NUMERIC, '%'::VARCHAR(50);
END;
$$ LANGUAGE plpgsql;

-- 3. TESTAR TODAS AS FUNÇÕES
DO $$
DECLARE
    v_result RECORD;
    v_count INTEGER;
BEGIN
    RAISE NOTICE 'Testando todas as funções...';
    
    -- Testar cada função
    BEGIN
        SELECT * INTO v_result FROM get_average_completion_time();
        RAISE NOTICE 'get_average_completion_time: OK';
    EXCEPTION
        WHEN OTHERS THEN
            RAISE NOTICE 'get_average_completion_time: ERRO - %', SQLERRM;
    END;
    
    BEGIN
        SELECT * INTO v_result FROM get_completion_rate();
        RAISE NOTICE 'get_completion_rate: OK';
    EXCEPTION
        WHEN OTHERS THEN
            RAISE NOTICE 'get_completion_rate: ERRO - %', SQLERRM;
    END;
    
    BEGIN
        SELECT COUNT(*) INTO v_count FROM get_user_productivity();
        RAISE NOTICE 'get_user_productivity: OK - % usuários', v_count;
    EXCEPTION
        WHEN OTHERS THEN
            RAISE NOTICE 'get_user_productivity: ERRO - %', SQLERRM;
    END;
    
    BEGIN
        SELECT COUNT(*) INTO v_count FROM get_productivity_trends();
        RAISE NOTICE 'get_productivity_trends: OK - % períodos', v_count;
    EXCEPTION
        WHEN OTHERS THEN
            RAISE NOTICE 'get_productivity_trends: ERRO - %', SQLERRM;
    END;
    
    BEGIN
        SELECT COUNT(*) INTO v_count FROM get_project_performance();
        RAISE NOTICE 'get_project_performance: OK - % projetos', v_count;
    EXCEPTION
        WHEN OTHERS THEN
            RAISE NOTICE 'get_project_performance: ERRO - %', SQLERRM;
    END;
    
    BEGIN
        SELECT * INTO v_result FROM get_subtask_metrics();
        RAISE NOTICE 'get_subtask_metrics: OK';
    EXCEPTION
        WHEN OTHERS THEN
            RAISE NOTICE 'get_subtask_metrics: ERRO - %', SQLERRM;
    END;
    
    BEGIN
        SELECT COUNT(*) INTO v_count FROM get_monthly_report();
        RAISE NOTICE 'get_monthly_report: OK - % métricas', v_count;
    EXCEPTION
        WHEN OTHERS THEN
            RAISE NOTICE 'get_monthly_report: ERRO - %', SQLERRM;
    END;
    
    RAISE NOTICE 'Teste de todas as funções concluído!';
END $$;

