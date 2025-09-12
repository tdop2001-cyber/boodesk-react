-- =====================================================
-- CORREÇÃO FINAL SIMPLES DAS MÉTRICAS DO DASHBOARD
-- =====================================================

-- Este script resolve definitivamente todos os problemas identificados:
-- 1. Prefixos "board-" nos board_id dos cards
-- 2. Incompatibilidade de tipos de dados
-- 3. Coluna is_archived inexistente na tabela boards

-- 1. VERIFICAR ESTRUTURA DAS TABELAS
SELECT 'VERIFICAÇÃO DE ESTRUTURA:' as info;
SELECT 
    table_name,
    column_name,
    data_type
FROM information_schema.columns 
WHERE table_name IN ('boards', 'cards') 
  AND column_name IN ('id', 'board_id', 'is_archived')
ORDER BY table_name, column_name;

-- 2. MOSTRAR EXEMPLOS DE DADOS PROBLEMÁTICOS
SELECT 'EXEMPLOS DE BOARD_ID COM PREFIXO:' as info;
SELECT 
    board_id,
    COUNT(*) as quantidade_cards
FROM cards 
WHERE board_id ~ '^board-'
GROUP BY board_id
ORDER BY quantidade_cards DESC
LIMIT 5;

-- 3. REMOVER FUNÇÃO EXISTENTE
DROP FUNCTION IF EXISTS get_project_performance(DATE, DATE) CASCADE;

-- 4. CRIAR FUNÇÃO CORRIGIDA E SIMPLIFICADA
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
    GROUP BY b.id, b.name
    ORDER BY 
        CASE WHEN COUNT(c.id) > 0 THEN 0 ELSE 1 END, -- Boards com cards primeiro
        completed_cards DESC, 
        completion_rate DESC;
        
    -- Log do resultado
    RAISE NOTICE 'Função get_project_performance executada com sucesso';
END;
$$ LANGUAGE plpgsql;

-- 5. TESTAR A FUNÇÃO
SELECT 'TESTE DA FUNÇÃO:' as info;
SELECT * FROM get_project_performance();

-- 6. VERIFICAR RESULTADO
SELECT 'VERIFICAÇÃO FINAL:' as info;
SELECT 
    COUNT(*) as total_boards_com_dados,
    SUM(total_cards) as total_cards_encontrados,
    SUM(completed_cards) as total_cards_concluidos,
    ROUND(AVG(completion_rate), 2) as taxa_media_conclusao
FROM get_project_performance();

-- 7. MOSTRAR RESULTADO DETALHADO
SELECT 'RESULTADO DETALHADO:' as info;
SELECT 
    board_name,
    total_cards,
    completed_cards,
    completion_rate || '%' as taxa_conclusao,
    COALESCE(avg_completion_days::TEXT, 'N/A') as tempo_medio_dias
FROM get_project_performance()
ORDER BY total_cards DESC;

-- 8. VERIFICAÇÃO DE DADOS
SELECT 'VERIFICAÇÃO DE DADOS:' as info;
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
WHERE board_id ~ '^board-' AND (is_archived = false OR is_archived IS NULL);
