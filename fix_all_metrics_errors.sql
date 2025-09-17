-- =====================================================
-- CORRIGIR TODOS OS PROBLEMAS DAS FUNÇÕES DE MÉTRICAS
-- =====================================================

-- 1. Corrigir função get_productivity_trends (problema de GROUP BY)
DROP FUNCTION IF EXISTS get_productivity_trends(text, date, date, integer) CASCADE;

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
    SELECT 
        CASE 
            WHEN p_period_type = 'day' THEN TO_CHAR(c.created_at, 'YYYY-MM-DD')::VARCHAR(50)
            WHEN p_period_type = 'week' THEN TO_CHAR(c.created_at, 'YYYY-"W"WW')::VARCHAR(50)
            ELSE TO_CHAR(c.created_at, 'YYYY-MM')::VARCHAR(50)
        END as period_label,
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
      AND c.is_archived = false
    GROUP BY 
        CASE 
            WHEN p_period_type = 'day' THEN TO_CHAR(c.created_at, 'YYYY-MM-DD')
            WHEN p_period_type = 'week' THEN TO_CHAR(c.created_at, 'YYYY-"W"WW')
            ELSE TO_CHAR(c.created_at, 'YYYY-MM')
        END
    ORDER BY period_label;
END;
$$ LANGUAGE plpgsql;

-- 2. Corrigir função get_monthly_report (múltiplas assinaturas)
DROP FUNCTION IF EXISTS get_monthly_report(text) CASCADE;
DROP FUNCTION IF EXISTS get_monthly_report() CASCADE;

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

-- 3. Testar as funções corrigidas
DO $$
DECLARE
    v_result RECORD;
    v_count INTEGER;
BEGIN
    RAISE NOTICE 'Testando funções corrigidas...';
    
    -- Testar função de tendências
    BEGIN
        SELECT COUNT(*) INTO v_count FROM get_productivity_trends();
        RAISE NOTICE 'get_productivity_trends: OK - % períodos', v_count;
    EXCEPTION
        WHEN OTHERS THEN
            RAISE NOTICE 'get_productivity_trends: ERRO - %', SQLERRM;
    END;
    
    -- Testar função de relatório mensal
    BEGIN
        SELECT COUNT(*) INTO v_count FROM get_monthly_report();
        RAISE NOTICE 'get_monthly_report: OK - % métricas', v_count;
    EXCEPTION
        WHEN OTHERS THEN
            RAISE NOTICE 'get_monthly_report: ERRO - %', SQLERRM;
    END;
    
    RAISE NOTICE 'Teste das funções corrigidas concluído!';
END $$;





