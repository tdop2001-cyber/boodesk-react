-- =====================================================
-- DIAGNÓSTICO COMPLETO DOS ERROS DE MÉTRICAS
-- =====================================================

-- Este script diagnostica todos os problemas relacionados às métricas

-- 1. VERIFICAR ESTRUTURA DAS TABELAS
DO $$
DECLARE
    v_boards_id_type TEXT;
    v_cards_board_id_type TEXT;
    v_cards_id_type TEXT;
    v_boards_name_exists BOOLEAN;
    v_boards_count INTEGER;
    v_cards_count INTEGER;
BEGIN
    RAISE NOTICE '=== DIAGNÓSTICO DAS TABELAS ===';
    
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
    
    -- Contar registros
    SELECT COUNT(*) INTO v_boards_count FROM boards;
    SELECT COUNT(*) INTO v_cards_count FROM cards;
    
    RAISE NOTICE 'Estrutura das tabelas:';
    RAISE NOTICE '  boards.id: % (registros: %)', v_boards_id_type, v_boards_count;
    RAISE NOTICE '  cards.board_id: % (registros: %)', v_cards_board_id_type, v_cards_count;
    RAISE NOTICE '  cards.id: %', v_cards_id_type;
    RAISE NOTICE '  boards.name existe: %', v_boards_name_exists;
    
    -- Verificar se há dados
    IF v_boards_count = 0 THEN
        RAISE NOTICE '⚠️ AVISO: Tabela boards está vazia!';
    END IF;
    
    IF v_cards_count = 0 THEN
        RAISE NOTICE '⚠️ AVISO: Tabela cards está vazia!';
    END IF;
    
END $$;

-- 2. VERIFICAR FUNÇÕES EXISTENTES
DO $$
DECLARE
    v_function_count INTEGER;
    v_function_list TEXT;
BEGIN
    RAISE NOTICE '=== DIAGNÓSTICO DAS FUNÇÕES ===';
    
    -- Contar funções de métricas
    SELECT COUNT(*) INTO v_function_count
    FROM information_schema.routines 
    WHERE routine_name IN ('get_project_performance', 'get_monthly_report', 'get_average_completion_time', 'get_completion_rate', 'get_user_productivity', 'get_productivity_trends', 'get_subtask_metrics')
    AND routine_type = 'FUNCTION';
    
    RAISE NOTICE 'Funções de métricas encontradas: %', v_function_count;
    
    -- Listar funções
    SELECT string_agg(routine_name || '(' || routine_definition, ', ') INTO v_function_list
    FROM information_schema.routines 
    WHERE routine_name IN ('get_project_performance', 'get_monthly_report', 'get_average_completion_time', 'get_completion_rate', 'get_user_productivity', 'get_productivity_trends', 'get_subtask_metrics')
    AND routine_type = 'FUNCTION';
    
    IF v_function_list IS NOT NULL THEN
        RAISE NOTICE 'Funções: %', v_function_list;
    END IF;
    
END $$;

-- 3. TESTAR JOIN ENTRE TABELAS
DO $$
DECLARE
    v_join_result INTEGER;
    v_error_message TEXT;
BEGIN
    RAISE NOTICE '=== TESTE DE JOIN ENTRE TABELAS ===';
    
    BEGIN
        -- Testar JOIN básico
        SELECT COUNT(*) INTO v_join_result
        FROM boards b
        LEFT JOIN cards c ON b.id = c.board_id;
        
        RAISE NOTICE '✅ JOIN básico funcionando: % registros', v_join_result;
        
    EXCEPTION
        WHEN OTHERS THEN
            v_error_message := SQLERRM;
            RAISE NOTICE '❌ ERRO no JOIN básico: %', v_error_message;
            
            -- Tentar com conversões explícitas
            BEGIN
                SELECT COUNT(*) INTO v_join_result
                FROM boards b
                LEFT JOIN cards c ON b.id::BIGINT = c.board_id::BIGINT;
                
                RAISE NOTICE '✅ JOIN com conversões explícitas funcionando: % registros', v_join_result;
                
            EXCEPTION
                WHEN OTHERS THEN
                    RAISE NOTICE '❌ ERRO mesmo com conversões explícitas: %', SQLERRM;
            END;
    END;
    
END $$;

-- 4. TESTAR FUNÇÃO get_project_performance
DO $$
DECLARE
    v_result RECORD;
    v_count INTEGER := 0;
    v_error_message TEXT;
BEGIN
    RAISE NOTICE '=== TESTE DA FUNÇÃO get_project_performance ===';
    
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
            v_error_message := SQLERRM;
            RAISE NOTICE '❌ ERRO na função get_project_performance: %', v_error_message;
            
            -- Verificar se é erro 42883
            IF v_error_message LIKE '%42883%' OR v_error_message LIKE '%operator does not exist%' THEN
                RAISE NOTICE '🔍 DIAGNÓSTICO: Erro 42883 detectado - problema de compatibilidade de tipos';
                RAISE NOTICE '💡 SOLUÇÃO: Execute fix_project_performance_final.sql';
            ELSIF v_error_message LIKE '%42804%' OR v_error_message LIKE '%cannot be cast automatically%' THEN
                RAISE NOTICE '🔍 DIAGNÓSTICO: Erro 42804 detectado - problema de conversão automática';
                RAISE NOTICE '💡 SOLUÇÃO: Execute fix_data_types_safe_conversion.sql';
            ELSIF v_error_message LIKE '%PGRST203%' OR v_error_message LIKE '%Could not choose the best candidate%' THEN
                RAISE NOTICE '🔍 DIAGNÓSTICO: Erro PGRST203 detectado - conflito de sobrecarga de função';
                RAISE NOTICE '💡 SOLUÇÃO: Execute fix_metrics_final_correction.sql';
            ELSE
                RAISE NOTICE '🔍 DIAGNÓSTICO: Erro não identificado - %', v_error_message;
            END IF;
    END;
    
END $$;

-- 5. VERIFICAR PERMISSÕES
DO $$
DECLARE
    v_permissions_count INTEGER;
BEGIN
    RAISE NOTICE '=== VERIFICAÇÃO DE PERMISSÕES ===';
    
    SELECT COUNT(*) INTO v_permissions_count
    FROM information_schema.routine_privileges 
    WHERE routine_name = 'get_project_performance' 
    AND grantee = 'authenticated';
    
    IF v_permissions_count > 0 THEN
        RAISE NOTICE '✅ Permissões para authenticated: OK';
    ELSE
        RAISE NOTICE '⚠️ Permissões para authenticated: FALTANDO';
    END IF;
    
END $$;

-- 6. RELATÓRIO FINAL
DO $$
BEGIN
    RAISE NOTICE '=== RELATÓRIO FINAL ===';
    RAISE NOTICE '📋 Diagnóstico concluído!';
    RAISE NOTICE '📝 Verifique as mensagens acima para identificar problemas específicos.';
    RAISE NOTICE '🔧 Execute os scripts de correção conforme indicado.';
    RAISE NOTICE '🧪 Teste usando test_metrics_fixes.html após as correções.';
END $$;





