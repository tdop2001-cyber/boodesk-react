-- =====================================================
-- CORREÇÃO FINAL DOS ERROS DE MÉTRICAS
-- =====================================================

-- Este script corrige os problemas específicos identificados:
-- 1. Erro PGRST203: Conflito de sobrecarga de função get_monthly_report
-- 2. Erro 22003: Valor fora do range para tipo integer (board_id)

-- 1. REMOVER TODAS AS FUNÇÕES EXISTENTES PARA EVITAR CONFLITOS
DO $$
BEGIN
    -- Remover todas as versões das funções problemáticas
    DROP FUNCTION IF EXISTS get_monthly_report(text) CASCADE;
    DROP FUNCTION IF EXISTS get_monthly_report(date) CASCADE;
    DROP FUNCTION IF EXISTS get_monthly_report() CASCADE;
    
    DROP FUNCTION IF EXISTS get_project_performance(date, date) CASCADE;
    DROP FUNCTION IF EXISTS get_project_performance(date) CASCADE;
    DROP FUNCTION IF EXISTS get_project_performance() CASCADE;
    
    RAISE NOTICE 'Funções conflitantes removidas com sucesso';
END $$;

-- 2. CRIAR FUNÇÃO get_monthly_report COM ASSINATURA ÚNICA
CREATE OR REPLACE FUNCTION get_monthly_report(
    p_report_month TEXT DEFAULT NULL
)
RETURNS TABLE(
    metric_name VARCHAR(100),
    metric_description VARCHAR(255),
    metric_value NUMERIC,
    metric_unit VARCHAR(50)
) AS $$
DECLARE
    v_start_date DATE;
    v_end_date DATE;
    v_total_cards INTEGER;
    v_completed_cards INTEGER;
    v_completion_rate NUMERIC;
    v_avg_completion_days NUMERIC;
    v_total_subtasks INTEGER;
    v_completed_subtasks INTEGER;
    v_subtask_completion_rate NUMERIC;
BEGIN
    -- Definir período do relatório
    IF p_report_month IS NULL THEN
        v_start_date := DATE_TRUNC('month', CURRENT_DATE);
        v_end_date := DATE_TRUNC('month', CURRENT_DATE) + INTERVAL '1 month' - INTERVAL '1 day';
    ELSE
        v_start_date := TO_DATE(p_report_month, 'YYYY-MM');
        v_end_date := v_start_date + INTERVAL '1 month' - INTERVAL '1 day';
    END IF;
    
    -- Calcular métricas básicas
    SELECT 
        COUNT(*)::INTEGER,
        COUNT(CASE WHEN status = 'done' THEN 1 END)::INTEGER,
        CASE 
            WHEN COUNT(*) > 0 THEN 
                ROUND((COUNT(CASE WHEN status = 'done' THEN 1 END)::NUMERIC / COUNT(*)::NUMERIC) * 100, 2)
            ELSE 0 
        END,
        ROUND(AVG(CASE WHEN status = 'done' THEN EXTRACT(EPOCH FROM (COALESCE(completed_at, updated_at) - created_at)) / 86400 END)::NUMERIC, 2)
    INTO v_total_cards, v_completed_cards, v_completion_rate, v_avg_completion_days
    FROM cards
    WHERE created_at::DATE >= v_start_date
      AND created_at::DATE <= v_end_date
      AND is_archived = false;
    
    -- Calcular métricas de subtasks
    SELECT 
        COUNT(*)::INTEGER,
        COUNT(CASE WHEN s.status = 'done' THEN 1 END)::INTEGER,
        CASE 
            WHEN COUNT(*) > 0 THEN 
                ROUND((COUNT(CASE WHEN s.status = 'done' THEN 1 END)::NUMERIC / COUNT(*)::NUMERIC) * 100, 2)
            ELSE 0 
        END
    INTO v_total_subtasks, v_completed_subtasks, v_subtask_completion_rate
    FROM subtasks s
    JOIN cards c ON s.card_id = c.id
    WHERE s.created_at::DATE >= v_start_date
      AND s.created_at::DATE <= v_end_date
      AND c.is_archived = false;
    
    -- Retornar métricas
    RETURN QUERY
    SELECT 'Total de Cards'::VARCHAR(100), 'Número total de cards criados no período'::VARCHAR(255), v_total_cards::NUMERIC, 'cards'::VARCHAR(50)
    UNION ALL
    SELECT 'Cards Concluídos'::VARCHAR(100), 'Número de cards concluídos no período'::VARCHAR(255), v_completed_cards::NUMERIC, 'cards'::VARCHAR(50)
    UNION ALL
    SELECT 'Taxa de Conclusão'::VARCHAR(100), 'Percentual de cards concluídos'::VARCHAR(255), v_completion_rate::NUMERIC, '%'::VARCHAR(50)
    UNION ALL
    SELECT 'Tempo Médio de Conclusão'::VARCHAR(100), 'Tempo médio para conclusão de cards'::VARCHAR(255), v_avg_completion_days::NUMERIC, 'dias'::VARCHAR(50)
    UNION ALL
    SELECT 'Total de Subtasks'::VARCHAR(100), 'Número total de subtasks criadas no período'::VARCHAR(255), v_total_subtasks::NUMERIC, 'subtasks'::VARCHAR(50)
    UNION ALL
    SELECT 'Subtasks Concluídas'::VARCHAR(100), 'Número de subtasks concluídas no período'::VARCHAR(255), v_completed_subtasks::NUMERIC, 'subtasks'::VARCHAR(50)
    UNION ALL
    SELECT 'Taxa de Conclusão de Subtasks'::VARCHAR(100), 'Percentual de subtasks concluídas'::VARCHAR(255), v_subtask_completion_rate::NUMERIC, '%'::VARCHAR(50);
END;
$$ LANGUAGE plpgsql;

-- 3. CRIAR FUNÇÃO get_project_performance CORRIGIDA
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
    GROUP BY b.id, b.name
    ORDER BY b.name;
END;
$$ LANGUAGE plpgsql;

-- 4. VERIFICAR E CORRIGIR TIPOS DE DADOS NA TABELA BOARDS
DO $$
BEGIN
    -- Verificar se a coluna id da tabela boards é do tipo correto
    IF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'boards' 
        AND column_name = 'id' 
        AND data_type = 'integer'
    ) THEN
        -- Converter para BIGINT se necessário
        ALTER TABLE boards ALTER COLUMN id TYPE BIGINT;
        RAISE NOTICE 'Coluna boards.id convertida para BIGINT';
    END IF;
    
    -- Verificar se a coluna board_id da tabela cards é do tipo correto
    IF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'cards' 
        AND column_name = 'board_id' 
        AND data_type = 'integer'
    ) THEN
        -- Converter para BIGINT se necessário
        ALTER TABLE cards ALTER COLUMN board_id TYPE BIGINT;
        RAISE NOTICE 'Coluna cards.board_id convertida para BIGINT';
    END IF;
    
    -- Verificar se a coluna card_id da tabela subtasks é do tipo correto
    IF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'subtasks' 
        AND column_name = 'card_id' 
        AND data_type = 'integer'
    ) THEN
        -- Converter para BIGINT se necessário
        ALTER TABLE subtasks ALTER COLUMN card_id TYPE BIGINT;
        RAISE NOTICE 'Coluna subtasks.card_id convertida para BIGINT';
    END IF;
END $$;

-- 5. TESTAR AS FUNÇÕES CORRIGIDAS
DO $$
DECLARE
    v_result RECORD;
BEGIN
    RAISE NOTICE 'Testando funções corrigidas...';
    
    -- Testar get_monthly_report
    BEGIN
        SELECT * INTO v_result FROM get_monthly_report() LIMIT 1;
        RAISE NOTICE 'get_monthly_report: OK';
    EXCEPTION
        WHEN OTHERS THEN
            RAISE NOTICE 'get_monthly_report: ERRO - %', SQLERRM;
    END;
    
    -- Testar get_project_performance
    BEGIN
        SELECT * INTO v_result FROM get_project_performance() LIMIT 1;
        RAISE NOTICE 'get_project_performance: OK';
    EXCEPTION
        WHEN OTHERS THEN
            RAISE NOTICE 'get_project_performance: ERRO - %', SQLERRM;
    END;
    
    RAISE NOTICE 'Teste das funções corrigidas concluído!';
END $$;

-- 6. GRANT PERMISSÕES NECESSÁRIAS
GRANT EXECUTE ON FUNCTION get_monthly_report(TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION get_project_performance(DATE, DATE) TO authenticated;

-- 7. MENSAGEM FINAL
DO $$
BEGIN
    RAISE NOTICE 'Correção final das métricas concluída com sucesso!';
END $$;
