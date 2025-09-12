-- =====================================================
-- CORREÇÃO DEFINITIVA DAS MÉTRICAS DO DASHBOARD
-- =====================================================

-- Este script resolve o erro "operator does not exist: character varying = bigint"
-- e corrige definitivamente o problema das métricas por projeto

-- 1. VERIFICAR ESTRUTURA ATUAL DAS TABELAS
DO $$
DECLARE
    v_boards_id_type TEXT;
    v_cards_board_id_type TEXT;
BEGIN
    -- Verificar tipos atuais
    SELECT data_type INTO v_boards_id_type
    FROM information_schema.columns 
    WHERE table_name = 'boards' AND column_name = 'id';
    
    SELECT data_type INTO v_cards_board_id_type
    FROM information_schema.columns 
    WHERE table_name = 'cards' AND column_name = 'board_id';
    
    RAISE NOTICE 'Estrutura atual:';
    RAISE NOTICE '  boards.id: %', v_boards_id_type;
    RAISE NOTICE '  cards.board_id: %', v_cards_board_id_type;
END $$;

-- 2. REMOVER FUNÇÃO EXISTENTE
DROP FUNCTION IF EXISTS get_project_performance(DATE, DATE) CASCADE;

-- 3. CRIAR FUNÇÃO CORRIGIDA COM CONVERSÕES EXPLÍCITAS
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
    LEFT JOIN cards c ON 
        CASE 
            WHEN c.board_id ~ '^board-' THEN 
                REPLACE(c.board_id, 'board-', '')::BIGINT
            ELSE 
                c.board_id::BIGINT
        END = b.id::BIGINT
        AND (p_start_date IS NULL OR c.created_at::DATE >= p_start_date)
        AND (p_end_date IS NULL OR c.created_at::DATE <= p_end_date)
        AND (c.is_archived = false OR c.is_archived IS NULL)
    WHERE (b.is_archived = false OR b.is_archived IS NULL)
    GROUP BY b.id, b.name
    ORDER BY 
        CASE WHEN COUNT(c.id) > 0 THEN 0 ELSE 1 END, -- Boards com cards primeiro
        completed_cards DESC, 
        completion_rate DESC;
        
    -- Log do resultado
    RAISE NOTICE 'Função get_project_performance executada com sucesso';
END;
$$ LANGUAGE plpgsql;

-- 4. TESTAR A FUNÇÃO CORRIGIDA
SELECT 'TESTE DA FUNÇÃO CORRIGIDA:' as info;
SELECT * FROM get_project_performance();

-- 5. VERIFICAR RESULTADO
SELECT 'VERIFICAÇÃO FINAL:' as info;
SELECT 
    COUNT(*) as total_boards_com_dados,
    SUM(total_cards) as total_cards_encontrados,
    SUM(completed_cards) as total_cards_concluidos,
    ROUND(AVG(completion_rate), 2) as taxa_media_conclusao
FROM get_project_performance();

-- 6. TESTE COM FILTROS DE DATA (últimos 30 dias)
SELECT 'TESTE COM FILTRO DE DATA (últimos 30 dias):' as info;
SELECT * FROM get_project_performance(
    p_start_date => CURRENT_DATE - INTERVAL '30 days',
    p_end_date => CURRENT_DATE
);

-- 7. VERIFICAR SE HÁ DADOS VÁLIDOS
SELECT 'VERIFICAÇÃO DE DADOS VÁLIDOS:' as info;
SELECT 
    'Total de Boards' as metrica,
    COUNT(*)::TEXT as valor
FROM boards
WHERE is_archived = false OR is_archived IS NULL
UNION ALL
SELECT 
    'Total de Cards' as metrica,
    COUNT(*)::TEXT as valor
FROM cards
WHERE is_archived = false OR is_archived IS NULL
UNION ALL
SELECT 
    'Cards Concluídos' as metrica,
    COUNT(*)::TEXT as valor
FROM cards
WHERE status = 'done' AND (is_archived = false OR is_archived IS NULL)
UNION ALL
SELECT 
    'Boards com Cards' as metrica,
    COUNT(DISTINCT b.id)::TEXT as valor
FROM boards b
INNER JOIN cards c ON c.board_id::BIGINT = b.id::BIGINT
WHERE (b.is_archived = false OR b.is_archived IS NULL)
  AND (c.is_archived = false OR c.is_archived IS NULL);
