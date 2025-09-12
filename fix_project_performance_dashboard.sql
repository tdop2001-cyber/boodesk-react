-- =====================================================
-- CORREÇÃO DA FUNÇÃO get_project_performance PARA DASHBOARD
-- =====================================================

-- Este script corrige o problema onde o dashboard não mostra dados de performance por projeto
-- mesmo quando há cards no Kanban

-- 1. REMOVER FUNÇÃO EXISTENTE
DROP FUNCTION IF EXISTS get_project_performance(DATE, DATE) CASCADE;

-- 2. CRIAR FUNÇÃO CORRIGIDA
CREATE OR REPLACE FUNCTION get_project_performance(
    p_start_date DATE DEFAULT NULL,
    p_end_date DATE DEFAULT NULL
)
RETURNS TABLE (
    board_id BIGINT,
    board_name VARCHAR(255),
    total_cards INTEGER,
    completed_cards INTEGER,
    completion_rate NUMERIC,
    avg_completion_days NUMERIC
) AS $$
BEGIN
    -- Log para debug
    RAISE NOTICE 'Executando get_project_performance com parâmetros: start_date=%, end_date=%', p_start_date, p_end_date;
    
    RETURN QUERY
    SELECT 
        b.id::BIGINT as board_id,
        COALESCE(b.name, 'Board ' || b.id::TEXT)::VARCHAR(255) as board_name,
        COUNT(c.id)::INTEGER as total_cards,
        COUNT(CASE WHEN c.status = 'done' THEN 1 END)::INTEGER as completed_cards,
        CASE 
            WHEN COUNT(c.id) > 0 THEN 
                ROUND((COUNT(CASE WHEN c.status = 'done' THEN 1 END)::NUMERIC / COUNT(c.id)::NUMERIC) * 100, 2)
            ELSE 0 
        END as completion_rate,
        ROUND(AVG(CASE 
            WHEN c.status = 'done' AND c.completed_at IS NOT NULL THEN 
                EXTRACT(EPOCH FROM (c.completed_at - c.created_at)) / 86400
            WHEN c.status = 'done' AND c.completed_at IS NULL THEN 
                EXTRACT(EPOCH FROM (c.updated_at - c.created_at)) / 86400
        END)::NUMERIC, 2) as avg_completion_days
    FROM boards b
    LEFT JOIN cards c ON c.board_id::BIGINT = b.id::BIGINT
        AND (p_start_date IS NULL OR c.created_at::DATE >= p_start_date)
        AND (p_end_date IS NULL OR c.created_at::DATE <= p_end_date)
        AND c.is_archived = false
    WHERE b.is_archived = false OR b.is_archived IS NULL
    GROUP BY b.id, b.name
    ORDER BY 
        CASE WHEN COUNT(c.id) > 0 THEN 0 ELSE 1 END, -- Boards com cards primeiro
        completed_cards DESC, 
        completion_rate DESC;
        
    -- Log do resultado
    RAISE NOTICE 'Função get_project_performance executada com sucesso';
END;
$$ LANGUAGE plpgsql;

-- 3. TESTAR A FUNÇÃO
SELECT 'TESTE DA FUNÇÃO CORRIGIDA:' as info;
SELECT * FROM get_project_performance();

-- 4. VERIFICAR SE A FUNÇÃO ESTÁ FUNCIONANDO
SELECT 'VERIFICAÇÃO FINAL:' as info;
SELECT 
    COUNT(*) as total_boards_com_dados,
    SUM(total_cards) as total_cards_encontrados,
    SUM(completed_cards) as total_cards_concluidos
FROM get_project_performance();
