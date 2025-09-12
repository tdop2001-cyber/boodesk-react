-- =====================================================
-- CORREÇÃO DE COMPATIBILIDADE DE TIPOS DE DADOS
-- =====================================================

-- Este script corrige especificamente o erro 42883:
-- "operator does not exist: bigint = character varying"

-- 1. VERIFICAR E CORRIGIR TIPOS DE DADOS DAS TABELAS
DO $$
DECLARE
    v_boards_id_type TEXT;
    v_cards_board_id_type TEXT;
    v_cards_id_type TEXT;
BEGIN
    -- Verificar tipo da coluna boards.id
    SELECT data_type INTO v_boards_id_type
    FROM information_schema.columns 
    WHERE table_name = 'boards' AND column_name = 'id';
    
    -- Verificar tipo da coluna cards.board_id
    SELECT data_type INTO v_cards_board_id_type
    FROM information_schema.columns 
    WHERE table_name = 'cards' AND column_name = 'board_id';
    
    -- Verificar tipo da coluna cards.id
    SELECT data_type INTO v_cards_id_type
    FROM information_schema.columns 
    WHERE table_name = 'cards' AND column_name = 'id';
    
    RAISE NOTICE 'Tipos atuais: boards.id=%, cards.board_id=%, cards.id=%', 
        v_boards_id_type, v_cards_board_id_type, v_cards_id_type;
    
    -- Converter boards.id para BIGINT se necessário
    IF v_boards_id_type != 'bigint' THEN
        ALTER TABLE boards ALTER COLUMN id TYPE BIGINT USING id::BIGINT;
        RAISE NOTICE 'Coluna boards.id convertida para BIGINT';
    END IF;
    
    -- Converter cards.board_id para BIGINT se necessário
    IF v_cards_board_id_type != 'bigint' THEN
        ALTER TABLE cards ALTER COLUMN board_id TYPE BIGINT USING board_id::BIGINT;
        RAISE NOTICE 'Coluna cards.board_id convertida para BIGINT';
    END IF;
    
    -- Converter cards.id para BIGINT se necessário
    IF v_cards_id_type != 'bigint' THEN
        ALTER TABLE cards ALTER COLUMN id TYPE BIGINT USING id::BIGINT;
        RAISE NOTICE 'Coluna cards.id convertida para BIGINT';
    END IF;
    
    -- Verificar se existe coluna name na tabela boards
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'boards' AND column_name = 'name'
    ) THEN
        ALTER TABLE boards ADD COLUMN name VARCHAR(255) DEFAULT 'Board sem nome';
        RAISE NOTICE 'Coluna boards.name adicionada';
    END IF;
    
END $$;

-- 2. RECRIAR FUNÇÃO get_project_performance COM TIPOS CORRETOS
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
    
    -- Retornar performance por projeto com conversões explícitas
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

-- 3. TESTAR A FUNÇÃO CORRIGIDA
DO $$
DECLARE
    v_result RECORD;
    v_count INTEGER := 0;
BEGIN
    RAISE NOTICE 'Testando função get_project_performance corrigida...';
    
    -- Testar a função
    FOR v_result IN SELECT * FROM get_project_performance() LIMIT 5 LOOP
        v_count := v_count + 1;
        RAISE NOTICE 'Resultado %: board_id=%, board_name=%, total_cards=%', 
            v_count, v_result.board_id, v_result.board_name, v_result.total_cards;
    END LOOP;
    
    IF v_count = 0 THEN
        RAISE NOTICE 'Nenhum resultado encontrado (pode ser normal se não houver dados)';
    END IF;
    
    RAISE NOTICE 'Teste da função get_project_performance concluído com sucesso!';
    
EXCEPTION
    WHEN OTHERS THEN
        RAISE NOTICE 'Erro no teste: %', SQLERRM;
END $$;

-- 4. GRANT PERMISSÕES
GRANT EXECUTE ON FUNCTION get_project_performance(DATE, DATE) TO authenticated;

-- 5. VERIFICAR ESTRUTURA FINAL DAS TABELAS
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
    
    RAISE NOTICE 'Tipos finais: boards.id=%, cards.board_id=%, cards.id=%', 
        v_boards_id_type, v_cards_board_id_type, v_cards_id_type;
        
    RAISE NOTICE 'Correção de compatibilidade de tipos concluída!';
END $$;
