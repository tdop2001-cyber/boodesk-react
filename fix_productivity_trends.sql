-- =====================================================
-- CORRIGIR FUNÇÃO get_productivity_trends
-- =====================================================

-- Remover a função existente
DROP FUNCTION IF EXISTS get_productivity_trends(text, date, date, integer) CASCADE;

-- Recriar a função com GROUP BY correto
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

