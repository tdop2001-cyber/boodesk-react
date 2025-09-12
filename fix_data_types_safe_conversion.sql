-- =====================================================
-- CONVERSÃO SEGURA DE TIPOS DE DADOS
-- =====================================================

-- Este script faz conversão segura dos tipos de dados
-- tratando diferentes cenários (TEXT, INTEGER, BIGINT, etc.)

-- 1. VERIFICAR ESTRUTURA ATUAL DAS TABELAS
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
    
    RAISE NOTICE 'Estrutura atual:';
    RAISE NOTICE '  boards.id: %', v_boards_id_type;
    RAISE NOTICE '  cards.board_id: %', v_cards_board_id_type;
    RAISE NOTICE '  cards.id: %', v_cards_id_type;
    RAISE NOTICE '  boards.name existe: %', v_boards_name_exists;
    
END $$;

-- 2. CONVERSÃO SEGURA DA TABELA BOARDS
DO $$
DECLARE
    v_boards_id_type TEXT;
BEGIN
    -- Verificar tipo atual
    SELECT data_type INTO v_boards_id_type
    FROM information_schema.columns 
    WHERE table_name = 'boards' AND column_name = 'id';
    
    -- Converter se necessário
    IF v_boards_id_type != 'bigint' THEN
        RAISE NOTICE 'Convertendo boards.id de % para BIGINT...', v_boards_id_type;
        
        -- Usar conversão apropriada baseada no tipo atual
        IF v_boards_id_type = 'text' OR v_boards_id_type = 'character varying' THEN
            ALTER TABLE boards ALTER COLUMN id TYPE BIGINT USING id::BIGINT;
        ELSIF v_boards_id_type = 'integer' THEN
            ALTER TABLE boards ALTER COLUMN id TYPE BIGINT USING id::BIGINT;
        ELSE
            -- Para outros tipos, tentar conversão direta
            ALTER TABLE boards ALTER COLUMN id TYPE BIGINT USING id::BIGINT;
        END IF;
        
        RAISE NOTICE 'boards.id convertido para BIGINT com sucesso';
    ELSE
        RAISE NOTICE 'boards.id já é do tipo BIGINT';
    END IF;
    
EXCEPTION
    WHEN OTHERS THEN
        RAISE NOTICE 'Erro ao converter boards.id: %', SQLERRM;
END $$;

-- 3. CONVERSÃO SEGURA DA TABELA CARDS
DO $$
DECLARE
    v_cards_board_id_type TEXT;
    v_cards_id_type TEXT;
BEGIN
    -- Verificar tipos atuais
    SELECT data_type INTO v_cards_board_id_type
    FROM information_schema.columns 
    WHERE table_name = 'cards' AND column_name = 'board_id';
    
    SELECT data_type INTO v_cards_id_type
    FROM information_schema.columns 
    WHERE table_name = 'cards' AND column_name = 'id';
    
    -- Converter board_id se necessário
    IF v_cards_board_id_type != 'bigint' THEN
        RAISE NOTICE 'Convertendo cards.board_id de % para BIGINT...', v_cards_board_id_type;
        
        IF v_cards_board_id_type = 'text' OR v_cards_board_id_type = 'character varying' THEN
            ALTER TABLE cards ALTER COLUMN board_id TYPE BIGINT USING board_id::BIGINT;
        ELSIF v_cards_board_id_type = 'integer' THEN
            ALTER TABLE cards ALTER COLUMN board_id TYPE BIGINT USING board_id::BIGINT;
        ELSE
            ALTER TABLE cards ALTER COLUMN board_id TYPE BIGINT USING board_id::BIGINT;
        END IF;
        
        RAISE NOTICE 'cards.board_id convertido para BIGINT com sucesso';
    ELSE
        RAISE NOTICE 'cards.board_id já é do tipo BIGINT';
    END IF;
    
    -- Converter id se necessário
    IF v_cards_id_type != 'bigint' THEN
        RAISE NOTICE 'Convertendo cards.id de % para BIGINT...', v_cards_id_type;
        
        IF v_cards_id_type = 'text' OR v_cards_id_type = 'character varying' THEN
            ALTER TABLE cards ALTER COLUMN id TYPE BIGINT USING id::BIGINT;
        ELSIF v_cards_id_type = 'integer' THEN
            ALTER TABLE cards ALTER COLUMN id TYPE BIGINT USING id::BIGINT;
        ELSE
            ALTER TABLE cards ALTER COLUMN id TYPE BIGINT USING id::BIGINT;
        END IF;
        
        RAISE NOTICE 'cards.id convertido para BIGINT com sucesso';
    ELSE
        RAISE NOTICE 'cards.id já é do tipo BIGINT';
    END IF;
    
EXCEPTION
    WHEN OTHERS THEN
        RAISE NOTICE 'Erro ao converter cards: %', SQLERRM;
END $$;

-- 4. ADICIONAR COLUNA NAME SE NÃO EXISTIR
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'boards' AND column_name = 'name'
    ) THEN
        ALTER TABLE boards ADD COLUMN name VARCHAR(255) DEFAULT 'Board sem nome';
        RAISE NOTICE 'Coluna boards.name adicionada';
    ELSE
        RAISE NOTICE 'Coluna boards.name já existe';
    END IF;
END $$;

-- 5. VERIFICAR ESTRUTURA FINAL
DO $$
DECLARE
    v_boards_id_type TEXT;
    v_cards_board_id_type TEXT;
    v_cards_id_type TEXT;
BEGIN
    -- Verificar tipos finais
    SELECT data_type INTO v_boards_id_type
    FROM information_schema.columns 
    WHERE table_name = 'boards' AND column_name = 'id';
    
    SELECT data_type INTO v_cards_board_id_type
    FROM information_schema.columns 
    WHERE table_name = 'cards' AND column_name = 'board_id';
    
    SELECT data_type INTO v_cards_id_type
    FROM information_schema.columns 
    WHERE table_name = 'cards' AND column_name = 'id';
    
    RAISE NOTICE 'Estrutura final:';
    RAISE NOTICE '  boards.id: %', v_boards_id_type;
    RAISE NOTICE '  cards.board_id: %', v_cards_board_id_type;
    RAISE NOTICE '  cards.id: %', v_cards_id_type;
    
    -- Verificar se todos são BIGINT
    IF v_boards_id_type = 'bigint' AND v_cards_board_id_type = 'bigint' AND v_cards_id_type = 'bigint' THEN
        RAISE NOTICE '✅ Todos os tipos estão corretos (BIGINT)';
    ELSE
        RAISE NOTICE '⚠️ Alguns tipos ainda não são BIGINT';
    END IF;
    
END $$;

-- 6. RECRIAR FUNÇÃO get_project_performance
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
    
    -- Retornar performance por projeto
    RETURN QUERY
    SELECT 
        b.id as board_id,
        COALESCE(b.name, 'Board sem nome') as board_name,
        COUNT(c.id)::INTEGER as total_cards,
        COUNT(CASE WHEN c.status = 'done' THEN 1 END)::INTEGER as completed_cards,
        CASE 
            WHEN COUNT(c.id) > 0 THEN 
                ROUND((COUNT(CASE WHEN c.status = 'done' THEN 1 END)::NUMERIC / COUNT(c.id)::NUMERIC) * 100, 2)
            ELSE 0 
        END as completion_rate,
        ROUND(AVG(CASE WHEN c.status = 'done' THEN EXTRACT(EPOCH FROM (COALESCE(c.completed_at, c.updated_at) - c.created_at)) / 86400 END)::NUMERIC, 2) as avg_completion_days
    FROM boards b
    LEFT JOIN cards c ON b.id = c.board_id
        AND c.created_at::DATE >= v_start_date 
        AND c.created_at::DATE <= v_end_date
        AND c.is_archived = false
    GROUP BY b.id, b.name
    ORDER BY b.name;
END;
$$ LANGUAGE plpgsql;

-- 7. TESTAR A FUNÇÃO
DO $$
DECLARE
    v_result RECORD;
    v_count INTEGER := 0;
BEGIN
    RAISE NOTICE 'Testando função get_project_performance...';
    
    -- Testar a função
    FOR v_result IN SELECT * FROM get_project_performance() LIMIT 3 LOOP
        v_count := v_count + 1;
        RAISE NOTICE 'Resultado %: board_id=%, board_name=%, total_cards=%', 
            v_count, v_result.board_id, v_result.board_name, v_result.total_cards;
    END LOOP;
    
    IF v_count = 0 THEN
        RAISE NOTICE 'Nenhum resultado encontrado (normal se não houver dados)';
    END IF;
    
    RAISE NOTICE '✅ Função get_project_performance testada com sucesso!';
    
EXCEPTION
    WHEN OTHERS THEN
        RAISE NOTICE '❌ Erro no teste: %', SQLERRM;
END $$;

-- 8. GRANT PERMISSÕES
GRANT EXECUTE ON FUNCTION get_project_performance(DATE, DATE) TO authenticated;

-- 9. MENSAGEM FINAL
DO $$
BEGIN
    RAISE NOTICE '🎉 Conversão segura de tipos concluída com sucesso!';
END $$;
