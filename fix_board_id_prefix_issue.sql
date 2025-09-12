-- =====================================================
-- CORREÇÃO DO PROBLEMA DO PREFIXO "board-"
-- =====================================================

-- Este script corrige o erro 22P02:
-- "invalid input syntax for type bigint: "board-1757552645056""

-- 1. VERIFICAR SE HÁ DADOS COM PREFIXO "board-"
DO $$
DECLARE
    v_boards_with_prefix INTEGER;
    v_cards_with_prefix INTEGER;
BEGIN
    RAISE NOTICE '=== VERIFICAÇÃO DE PREFIXOS "board-" ===';
    
    -- Verificar se há boards com prefixo
    SELECT COUNT(*) INTO v_boards_with_prefix
    FROM boards 
    WHERE id::TEXT LIKE 'board-%';
    
    -- Verificar se há cards com board_id com prefixo
    SELECT COUNT(*) INTO v_cards_with_prefix
    FROM cards 
    WHERE board_id::TEXT LIKE 'board-%';
    
    RAISE NOTICE 'Boards com prefixo "board-": %', v_boards_with_prefix;
    RAISE NOTICE 'Cards com board_id com prefixo "board-": %', v_cards_with_prefix;
    
    IF v_boards_with_prefix > 0 OR v_cards_with_prefix > 0 THEN
        RAISE NOTICE '⚠️ AVISO: Encontrados dados com prefixo "board-"';
        RAISE NOTICE '💡 SOLUÇÃO: Limpar prefixos ou ajustar código para lidar com eles';
    ELSE
        RAISE NOTICE '✅ Nenhum dado com prefixo "board-" encontrado';
    END IF;
    
END $$;

-- 2. CRIAR FUNÇÃO AUXILIAR PARA LIMPAR PREFIXOS
CREATE OR REPLACE FUNCTION clean_board_id(input_id TEXT)
RETURNS BIGINT AS $$
BEGIN
    -- Se contém prefixo "board-", remover
    IF input_id LIKE 'board-%' THEN
        RETURN REPLACE(input_id, 'board-', '')::BIGINT;
    ELSE
        RETURN input_id::BIGINT;
    END IF;
EXCEPTION
    WHEN OTHERS THEN
        -- Se não conseguir converter, retornar NULL
        RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- 3. ATUALIZAR FUNÇÃO get_project_performance PARA LIDAR COM PREFIXOS
DROP FUNCTION IF EXISTS get_project_performance(DATE, DATE) CASCADE;

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
    
    -- Retornar performance por projeto com tratamento de prefixos
    RETURN QUERY
    SELECT 
        clean_board_id(b.id::TEXT) as board_id,
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
    LEFT JOIN cards c ON clean_board_id(b.id::TEXT) = clean_board_id(c.board_id::TEXT)
        AND c.created_at::DATE >= v_start_date 
        AND c.created_at::DATE <= v_end_date
        AND c.is_archived = false
    WHERE clean_board_id(b.id::TEXT) IS NOT NULL
    GROUP BY clean_board_id(b.id::TEXT), b.name
    ORDER BY b.name;
END;
$$ LANGUAGE plpgsql;

-- 4. TESTAR A FUNÇÃO CORRIGIDA
DO $$
DECLARE
    v_result RECORD;
    v_count INTEGER := 0;
BEGIN
    RAISE NOTICE '=== TESTE DA FUNÇÃO CORRIGIDA ===';
    
    BEGIN
        -- Testar a função
        FOR v_result IN SELECT * FROM get_project_performance() LIMIT 3 LOOP
            v_count := v_count + 1;
            RAISE NOTICE 'Resultado %: board_id=%, board_name=%, total_cards=%', 
                v_count, v_result.board_id, v_result.board_name, v_result.total_cards;
        END LOOP;
        
        IF v_count = 0 THEN
            RAISE NOTICE '⚠️ Função executou mas não retornou dados (pode ser normal)';
        ELSE
            RAISE NOTICE '✅ Função get_project_performance funcionando corretamente!';
        END IF;
        
    EXCEPTION
        WHEN OTHERS THEN
            RAISE NOTICE '❌ ERRO na função: %', SQLERRM;
    END;
    
END $$;

-- 5. TESTAR FUNÇÃO AUXILIAR
DO $$
DECLARE
    v_test_result BIGINT;
BEGIN
    RAISE NOTICE '=== TESTE DA FUNÇÃO AUXILIAR ===';
    
    -- Testar com prefixo
    SELECT clean_board_id('board-1757552645056') INTO v_test_result;
    RAISE NOTICE 'clean_board_id("board-1757552645056") = %', v_test_result;
    
    -- Testar sem prefixo
    SELECT clean_board_id('1757552645056') INTO v_test_result;
    RAISE NOTICE 'clean_board_id("1757552645056") = %', v_test_result;
    
    -- Testar com valor inválido
    SELECT clean_board_id('invalid') INTO v_test_result;
    RAISE NOTICE 'clean_board_id("invalid") = %', v_test_result;
    
END $$;

-- 6. GRANT PERMISSÕES
GRANT EXECUTE ON FUNCTION get_project_performance(DATE, DATE) TO authenticated;
GRANT EXECUTE ON FUNCTION clean_board_id(TEXT) TO authenticated;

-- 7. MENSAGEM FINAL
DO $$
BEGIN
    RAISE NOTICE '🔧 Correção do problema do prefixo "board-" concluída!';
    RAISE NOTICE '📋 A função agora trata automaticamente IDs com prefixo "board-"';
    RAISE NOTICE '🧪 Teste na aplicação para confirmar que o erro 22P02 foi resolvido';
END $$;

