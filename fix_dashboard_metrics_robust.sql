-- =====================================================
-- CORREÇÃO ROBUSTA DAS MÉTRICAS DO DASHBOARD
-- =====================================================

-- Este script resolve definitivamente o problema dos prefixos "board-" 
-- nos board_id dos cards e corrige as métricas por projeto

-- 1. VERIFICAR ESTRUTURA E DADOS PROBLEMÁTICOS
DO $$
DECLARE
    v_boards_id_type TEXT;
    v_cards_board_id_type TEXT;
    v_problematic_cards INTEGER;
BEGIN
    -- Verificar tipos atuais
    SELECT data_type INTO v_boards_id_type
    FROM information_schema.columns 
    WHERE table_name = 'boards' AND column_name = 'id';
    
    SELECT data_type INTO v_cards_board_id_type
    FROM information_schema.columns 
    WHERE table_name = 'cards' AND column_name = 'board_id';
    
    -- Contar cards com prefixos problemáticos
    SELECT COUNT(*) INTO v_problematic_cards
    FROM cards 
    WHERE board_id ~ '^board-';
    
    RAISE NOTICE 'Estrutura atual:';
    RAISE NOTICE '  boards.id: %', v_boards_id_type;
    RAISE NOTICE '  cards.board_id: %', v_cards_board_id_type;
    RAISE NOTICE '  Cards com prefixo "board-": %', v_problematic_cards;
END $$;

-- 2. MOSTRAR EXEMPLOS DE DADOS PROBLEMÁTICOS
SELECT 'EXEMPLOS DE BOARD_ID PROBLEMÁTICOS:' as info;
SELECT 
    board_id,
    COUNT(*) as quantidade_cards,
    MIN(created_at) as primeiro_card,
    MAX(created_at) as ultimo_card
FROM cards 
WHERE board_id ~ '^board-'
GROUP BY board_id
ORDER BY quantidade_cards DESC
LIMIT 10;

-- 3. VERIFICAR BOARDS CORRESPONDENTES
SELECT 'BOARDS CORRESPONDENTES:' as info;
SELECT 
    b.id as board_id,
    b.name as board_name,
    COUNT(c.id) as total_cards_com_prefixo
FROM boards b
INNER JOIN cards c ON 
    CASE 
        WHEN c.board_id ~ '^board-' THEN 
            REPLACE(c.board_id, 'board-', '')::BIGINT
        ELSE 
            c.board_id::BIGINT
    END = b.id::BIGINT
WHERE c.board_id ~ '^board-'
GROUP BY b.id, b.name
ORDER BY total_cards_com_prefixo DESC;

-- 4. REMOVER FUNÇÃO EXISTENTE
DROP FUNCTION IF EXISTS get_project_performance(DATE, DATE) CASCADE;

-- 5. CRIAR FUNÇÃO ROBUSTA QUE LIDA COM PREFIXOS
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
            WHEN c.board_id ~ '^[0-9]+$' THEN 
                c.board_id::BIGINT
            ELSE 
                NULL -- Ignorar valores inválidos
        END = b.id::BIGINT
        AND (p_start_date IS NULL OR c.created_at::DATE >= p_start_date)
        AND (p_end_date IS NULL OR c.created_at::DATE <= p_end_date)
        AND (c.is_archived = false OR c.is_archived IS NULL)
    WHERE 1=1 -- Sem filtro de is_archived para boards (coluna não existe)
    GROUP BY b.id, b.name
    ORDER BY 
        CASE WHEN COUNT(c.id) > 0 THEN 0 ELSE 1 END, -- Boards com cards primeiro
        completed_cards DESC, 
        completion_rate DESC;
        
    -- Log do resultado
    RAISE NOTICE 'Função get_project_performance executada com sucesso';
END;
$$ LANGUAGE plpgsql;

-- 6. TESTAR A FUNÇÃO CORRIGIDA
SELECT 'TESTE DA FUNÇÃO CORRIGIDA:' as info;
SELECT * FROM get_project_performance();

-- 7. VERIFICAR RESULTADO
SELECT 'VERIFICAÇÃO FINAL:' as info;
SELECT 
    COUNT(*) as total_boards_com_dados,
    SUM(total_cards) as total_cards_encontrados,
    SUM(completed_cards) as total_cards_concluidos,
    ROUND(AVG(completion_rate), 2) as taxa_media_conclusao
FROM get_project_performance();

-- 8. TESTE COM FILTROS DE DATA (últimos 30 dias)
SELECT 'TESTE COM FILTRO DE DATA (últimos 30 dias):' as info;
SELECT * FROM get_project_performance(
    p_start_date => CURRENT_DATE - INTERVAL '30 days',
    p_end_date => CURRENT_DATE
);

-- 9. VERIFICAR SE HÁ DADOS VÁLIDOS
SELECT 'VERIFICAÇÃO DE DADOS VÁLIDOS:' as info;
SELECT 
    'Total de Boards' as metrica,
    COUNT(*)::TEXT as valor
FROM boards
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
    'Cards com Prefixo board-' as metrica,
    COUNT(*)::TEXT as valor
FROM cards
WHERE board_id ~ '^board-' AND (is_archived = false OR is_archived IS NULL)
UNION ALL
SELECT 
    'Boards com Cards (após correção)' as metrica,
    COUNT(DISTINCT b.id)::TEXT as valor
FROM boards b
INNER JOIN cards c ON 
    CASE 
        WHEN c.board_id ~ '^board-' THEN 
            REPLACE(c.board_id, 'board-', '')::BIGINT
        WHEN c.board_id ~ '^[0-9]+$' THEN 
            c.board_id::BIGINT
        ELSE 
            NULL
    END = b.id::BIGINT
WHERE (c.is_archived = false OR c.is_archived IS NULL);

-- 10. MOSTRAR RESULTADO FINAL DETALHADO
SELECT 'RESULTADO FINAL DETALHADO:' as info;
SELECT 
    board_name,
    total_cards,
    completed_cards,
    completion_rate || '%' as taxa_conclusao,
    COALESCE(avg_completion_days::TEXT, 'N/A') as tempo_medio_dias
FROM get_project_performance()
ORDER BY total_cards DESC;
