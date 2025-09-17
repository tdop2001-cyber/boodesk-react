-- =====================================================
-- CORRIGIR PROBLEMA DE BOARD_ID NAS FUNÇÕES
-- =====================================================

-- O problema é que c.board_id pode conter strings como "board-1757552645056"
-- mas estamos tentando fazer JOIN com b.id que é INTEGER

-- 1. Corrigir função get_project_performance
DROP FUNCTION IF EXISTS get_project_performance(date, date) CASCADE;

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
    LEFT JOIN cards c ON (
        -- Tentar converter board_id para integer, mas tratar erros
        CASE 
            WHEN c.board_id ~ '^[0-9]+$' THEN c.board_id::INTEGER = b.id
            WHEN c.board_id ~ '^board-[0-9]+$' THEN 
                TRIM(LEADING 'board-' FROM c.board_id)::INTEGER = b.id
            ELSE FALSE
        END
    )
    WHERE (p_start_date IS NULL OR c.created_at::DATE >= p_start_date)
      AND (p_end_date IS NULL OR c.created_at::DATE <= p_end_date)
      AND c.is_archived = false
    GROUP BY b.id, b.name
    HAVING COUNT(c.id) > 0
    ORDER BY completion_rate DESC, completed_cards DESC;
END;
$$ LANGUAGE plpgsql;

-- 2. Corrigir função get_average_completion_time
DROP FUNCTION IF EXISTS get_average_completion_time(date, date, integer) CASCADE;

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
      AND (
        p_board_id IS NULL OR 
        CASE 
            WHEN c.board_id ~ '^[0-9]+$' THEN c.board_id::INTEGER = p_board_id
            WHEN c.board_id ~ '^board-[0-9]+$' THEN 
                TRIM(LEADING 'board-' FROM c.board_id)::INTEGER = p_board_id
            ELSE FALSE
        END
      )
      AND c.is_archived = false;
END;
$$ LANGUAGE plpgsql;

-- 3. Corrigir função get_completion_rate
DROP FUNCTION IF EXISTS get_completion_rate(date, date, integer) CASCADE;

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
      AND (
        p_board_id IS NULL OR 
        CASE 
            WHEN c.board_id ~ '^[0-9]+$' THEN c.board_id::INTEGER = p_board_id
            WHEN c.board_id ~ '^board-[0-9]+$' THEN 
                TRIM(LEADING 'board-' FROM c.board_id)::INTEGER = p_board_id
            ELSE FALSE
        END
      )
      AND c.is_archived = false;
END;
$$ LANGUAGE plpgsql;

-- 4. Corrigir função get_user_productivity
DROP FUNCTION IF EXISTS get_user_productivity(date, date, integer) CASCADE;

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
        AND (
          p_board_id IS NULL OR 
          CASE 
              WHEN c.board_id ~ '^[0-9]+$' THEN c.board_id::INTEGER = p_board_id
              WHEN c.board_id ~ '^board-[0-9]+$' THEN 
                  TRIM(LEADING 'board-' FROM c.board_id)::INTEGER = p_board_id
              ELSE FALSE
          END
        )
        AND c.is_archived = false
    GROUP BY u.id, u.username, u.nome_completo
    HAVING COUNT(c.id) > 0
    ORDER BY completed_cards DESC, completion_rate DESC;
END;
$$ LANGUAGE plpgsql;

-- 5. Corrigir função get_productivity_trends
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
          AND (
            p_board_id IS NULL OR 
            CASE 
                WHEN c.board_id ~ '^[0-9]+$' THEN c.board_id::INTEGER = p_board_id
                WHEN c.board_id ~ '^board-[0-9]+$' THEN 
                    TRIM(LEADING 'board-' FROM c.board_id)::INTEGER = p_board_id
                ELSE FALSE
            END
          )
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

-- 6. Corrigir função get_subtask_metrics
DROP FUNCTION IF EXISTS get_subtask_metrics(date, date, integer) CASCADE;

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
      AND (
        p_board_id IS NULL OR 
        CASE 
            WHEN c.board_id ~ '^[0-9]+$' THEN c.board_id::INTEGER = p_board_id
            WHEN c.board_id ~ '^board-[0-9]+$' THEN 
                TRIM(LEADING 'board-' FROM c.board_id)::INTEGER = p_board_id
            ELSE FALSE
        END
      )
      AND c.is_archived = false;
END;
$$ LANGUAGE plpgsql;

-- 7. Testar as funções corrigidas
DO $$
DECLARE
    v_result RECORD;
    v_count INTEGER;
BEGIN
    RAISE NOTICE 'Testando funções corrigidas...';
    
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
        SELECT * INTO v_result FROM get_project_performance();
        RAISE NOTICE 'get_project_performance: OK';
    EXCEPTION
        WHEN OTHERS THEN
            RAISE NOTICE 'get_project_performance: ERRO - %', SQLERRM;
    END;
    
    RAISE NOTICE 'Teste das funções corrigidas concluído!';
END $$;





