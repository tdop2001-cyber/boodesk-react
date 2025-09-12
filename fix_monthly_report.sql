-- =====================================================
-- CORRIGIR FUNÇÃO get_monthly_report
-- =====================================================

-- Remover todas as funções existentes
DROP FUNCTION IF EXISTS get_monthly_report(text) CASCADE;
DROP FUNCTION IF EXISTS get_monthly_report() CASCADE;

-- Recriar a função com assinatura única
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

