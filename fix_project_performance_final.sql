-- =====================================================
-- CORREÇÃO FINAL DA FUNÇÃO get_project_performance
-- =====================================================

-- Este script corrige definitivamente o erro 42883
-- "operator does not exist: bigint = character varying"

-- 1. REMOVER FUNÇÃO EXISTENTE
DROP FUNCTION IF EXISTS get_project_performance(DATE, DATE) CASCADE;

-- 2. VERIFICAR ESTRUTURA DAS TABELAS
DO $$
DECLARE
    v_boards_id_type TEXT;
    v_cards_board_id_type TEXT;
    v_cards_id_type TEXT;
    v_boards_name_exists BOOLEAN;
BEGIN
    -- Verificar tipos atuais
    SELECT data_type INTO v_boards_id_type
    FROM information_schema.columns 
    WHERE table_name = 'boards' AND column_name = 'id';
    
    SELECT data_type INTO v_cards_board_id_type
    FROM information_schema.columns 
    WHERE table_name = 'cards' AND column_name = 'board_id';
    
    SELECT data_type INTO v_cards_id_type
    FROM information_schema.columns 
    WHERE table_name = 'cards' AND column_name = 'id';
    
    -- Verificar se coluna name existe em boards
    SELECT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'boards' AND column_name = 'name'
    ) INTO v_boards_name_exists;
    
    RAISE NOTICE 'Estrutura atual das tabelas:';
    RAISE NOTICE '  boards.id: %', v_boards_id_type;
    RAISE NOTICE '  cards.board_id: %', v_cards_board_id_type;
    RAISE NOTICE '  cards.id: %', v_cards_id_type;
    RAISE NOTICE '  boards.name existe: %', v_boards_name_exists;
    
END $$;

-- 3. CRIAR FUNÇÃO get_project_performance COM CONVERSÕES EXPLÍCITAS
CREATE OR REPLACE FUNCTION get_project_performance(
    p_start_date DATE DEFAULT NULL,
    p_end_date DATE DEFAULT NULL
)
RETURNS TABLE(
    board_id BIGINT,
    board_name VARCHAR(255),
    total_cards INTEGER,
    completed_cards INTEGER,
    completion_rate NUMERIC,
    avg_completion_days NUMERIC
) AS $$
DECLARE
    v_start_date DATE;
    v_end_date DATE;
BEGIN
    -- Definir período
    IF p_start_date IS NULL THEN
        v_start_date := CURRENT_DATE - INTERVAL '30 days';
    ELSE
        v_start_date := p_start_date;
    END IF;
    
    IF p_end_date IS NULL THEN
        v_end_date := CURRENT_DATE;
    ELSE
        v_end_date := p_end_date;
    END IF;
    
    -- Retornar performance por projeto com conversões explícitas
    RETURN QUERY
    SELECT 
        b.id::BIGINT as board_id,
        COALESCE(b.name, 'Board sem nome')::VARCHAR(255) as board_name,
        COUNT(c.id)::INTEGER as total_cards,
        COUNT(CASE WHEN c.status = 'done' THEN 1 END)::INTEGER as completed_cards,
        CASE 
            WHEN COUNT(c.id) > 0 THEN 
                ROUND((COUNT(CASE WHEN c.status = 'done' THEN 1 END)::NUMERIC / COUNT(c.id)::NUMERIC) * 100, 2)
            ELSE 0 
        END as completion_rate,
        ROUND(AVG(CASE WHEN c.status = 'done' THEN EXTRACT(EPOCH FROM (COALESCE(c.completed_at, c.updated_at) - c.created_at)) / 86400 END)::NUMERIC, 2) as avg_completion_days
    FROM boards b
    LEFT JOIN cards c ON b.id::BIGINT = c.board_id::BIGINT
        AND c.created_at::DATE >= v_start_date 
        AND c.created_at::DATE <= v_end_date
        AND c.is_archived = false
    GROUP BY b.id::BIGINT, b.name
    ORDER BY b.name;
END;
$$ LANGUAGE plpgsql;

-- 4. TESTAR A FUNÇÃO COM DIFERENTES CENÁRIOS
DO $$
DECLARE
    v_result RECORD;
    v_count INTEGER := 0;
    v_error_count INTEGER := 0;
BEGIN
    RAISE NOTICE 'Testando função get_project_performance...';
    
    -- Teste 1: Sem parâmetros
    BEGIN
        FOR v_result IN SELECT * FROM get_project_performance() LIMIT 3 LOOP
            v_count := v_count + 1;
            RAISE NOTICE 'Teste 1 - Resultado %: board_id=%, board_name=%, total_cards=%', 
                v_count, v_result.board_id, v_result.board_name, v_result.total_cards;
        END LOOP;
        RAISE NOTICE '✅ Teste 1 (sem parâmetros): OK';
    EXCEPTION
        WHEN OTHERS THEN
            v_error_count := v_error_count + 1;
            RAISE NOTICE '❌ Teste 1 (sem parâmetros): ERRO - %', SQLERRM;
    END;
    
    -- Teste 2: Com parâmetros de data
    BEGIN
        FOR v_result IN SELECT * FROM get_project_performance('2024-01-01', '2024-12-31') LIMIT 3 LOOP
            v_count := v_count + 1;
            RAISE NOTICE 'Teste 2 - Resultado %: board_id=%, board_name=%, total_cards=%', 
                v_count, v_result.board_id, v_result.board_name, v_result.total_cards;
        END LOOP;
        RAISE NOTICE '✅ Teste 2 (com parâmetros): OK';
    EXCEPTION
        WHEN OTHERS THEN
            v_error_count := v_error_count + 1;
            RAISE NOTICE '❌ Teste 2 (com parâmetros): ERRO - %', SQLERRM;
    END;
    
    -- Teste 3: Com parâmetros NULL
    BEGIN
        FOR v_result IN SELECT * FROM get_project_performance(NULL, NULL) LIMIT 3 LOOP
            v_count := v_count + 1;
            RAISE NOTICE 'Teste 3 - Resultado %: board_id=%, board_name=%, total_cards=%', 
                v_count, v_result.board_id, v_result.board_name, v_result.total_cards;
        END LOOP;
        RAISE NOTICE '✅ Teste 3 (parâmetros NULL): OK';
    EXCEPTION
        WHEN OTHERS THEN
            v_error_count := v_error_count + 1;
            RAISE NOTICE '❌ Teste 3 (parâmetros NULL): ERRO - %', SQLERRM;
    END;
    
    -- Relatório final
    IF v_error_count = 0 THEN
        RAISE NOTICE '🎉 Todos os testes passaram! Função get_project_performance funcionando corretamente.';
    ELSE
        RAISE NOTICE '⚠️ % de % testes falharam. Verifique os erros acima.', v_error_count, 3;
    END IF;
    
END $$;

-- 5. GRANT PERMISSÕES
GRANT EXECUTE ON FUNCTION get_project_performance(DATE, DATE) TO authenticated;

-- 6. VERIFICAR SE A FUNÇÃO FOI CRIADA CORRETAMENTE
DO $$
DECLARE
    v_function_exists BOOLEAN;
BEGIN
    SELECT EXISTS (
        SELECT 1 FROM information_schema.routines 
        WHERE routine_name = 'get_project_performance' 
        AND routine_type = 'FUNCTION'
    ) INTO v_function_exists;
    
    IF v_function_exists THEN
        RAISE NOTICE '✅ Função get_project_performance criada com sucesso!';
    ELSE
        RAISE NOTICE '❌ Erro: Função get_project_performance não foi criada!';
    END IF;
END $$;

-- 7. MENSAGEM FINAL
DO $$
BEGIN
    RAISE NOTICE '🔧 Correção final da função get_project_performance concluída!';
    RAISE NOTICE '📋 Próximos passos:';
    RAISE NOTICE '   1. Teste a função usando test_metrics_fixes.html';
    RAISE NOTICE '   2. Verifique se as métricas carregam na aplicação';
    RAISE NOTICE '   3. Monitore os logs para confirmar que não há mais erros 42883';
END $$;





