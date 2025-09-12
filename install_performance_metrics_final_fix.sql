-- =====================================================
-- INSTALAÇÃO FINAL CORRIGIDA DO SISTEMA DE MÉTRICAS
-- =====================================================

-- Este script remove TODAS as funções existentes e instala o sistema completo
-- Execute este script no Supabase SQL Editor

-- 1. REMOVER TODAS AS FUNÇÕES EXISTENTES COM ASSINATURAS ESPECÍFICAS
DO $$
BEGIN
    -- Remover todas as funções de métricas existentes com assinaturas específicas
    DROP FUNCTION IF EXISTS get_average_completion_time(date, date, integer) CASCADE;
    DROP FUNCTION IF EXISTS get_average_completion_time(date, date) CASCADE;
    DROP FUNCTION IF EXISTS get_average_completion_time(date) CASCADE;
    DROP FUNCTION IF EXISTS get_average_completion_time() CASCADE;
    
    DROP FUNCTION IF EXISTS get_completion_rate(date, date, integer) CASCADE;
    DROP FUNCTION IF EXISTS get_completion_rate(date, date) CASCADE;
    DROP FUNCTION IF EXISTS get_completion_rate(date) CASCADE;
    DROP FUNCTION IF EXISTS get_completion_rate() CASCADE;
    
    DROP FUNCTION IF EXISTS get_user_productivity(date, date, integer) CASCADE;
    DROP FUNCTION IF EXISTS get_user_productivity(date, date) CASCADE;
    DROP FUNCTION IF EXISTS get_user_productivity(date) CASCADE;
    DROP FUNCTION IF EXISTS get_user_productivity() CASCADE;
    
    DROP FUNCTION IF EXISTS get_productivity_trends(text, date, date, integer) CASCADE;
    DROP FUNCTION IF EXISTS get_productivity_trends(text, date, date) CASCADE;
    DROP FUNCTION IF EXISTS get_productivity_trends(text, date) CASCADE;
    DROP FUNCTION IF EXISTS get_productivity_trends(text) CASCADE;
    DROP FUNCTION IF EXISTS get_productivity_trends() CASCADE;
    
    DROP FUNCTION IF EXISTS get_project_performance(date, date) CASCADE;
    DROP FUNCTION IF EXISTS get_project_performance(date) CASCADE;
    DROP FUNCTION IF EXISTS get_project_performance() CASCADE;
    
    DROP FUNCTION IF EXISTS get_subtask_metrics(date, date, integer) CASCADE;
    DROP FUNCTION IF EXISTS get_subtask_metrics(date, date) CASCADE;
    DROP FUNCTION IF EXISTS get_subtask_metrics(date) CASCADE;
    DROP FUNCTION IF EXISTS get_subtask_metrics() CASCADE;
    
    DROP FUNCTION IF EXISTS get_monthly_report(text) CASCADE;
    DROP FUNCTION IF EXISTS get_monthly_report() CASCADE;
    
    RAISE NOTICE 'Todas as funções existentes foram removidas com sucesso';
END $$;

-- 2. VERIFICAR E ADICIONAR COLUNAS NECESSÁRIAS
DO $$
BEGIN
    -- Adicionar coluna completed_at se não existir
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'cards' AND column_name = 'completed_at') THEN
        ALTER TABLE cards ADD COLUMN completed_at TIMESTAMP WITH TIME ZONE;
        RAISE NOTICE 'Coluna completed_at adicionada à tabela cards';
    END IF;
    
    -- Adicionar coluna created_by se não existir
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'cards' AND column_name = 'created_by') THEN
        ALTER TABLE cards ADD COLUMN created_by INTEGER REFERENCES users(id);
        RAISE NOTICE 'Coluna created_by adicionada à tabela cards';
    END IF;
    
    -- Adicionar coluna completed_at se não existir
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'subtasks' AND column_name = 'completed_at') THEN
        ALTER TABLE subtasks ADD COLUMN completed_at TIMESTAMP WITH TIME ZONE;
        RAISE NOTICE 'Coluna completed_at adicionada à tabela subtasks';
    END IF;
END $$;

-- 3. CRIAR TRIGGERS PARA ATUALIZAR completed_at
-- Trigger para cards
CREATE OR REPLACE FUNCTION update_card_completed_at()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.status = 'done' AND OLD.status != 'done' THEN
        NEW.completed_at = NOW();
    ELSIF NEW.status != 'done' AND OLD.status = 'done' THEN
        NEW.completed_at = NULL;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_update_card_completed_at ON cards;
CREATE TRIGGER trigger_update_card_completed_at
    BEFORE UPDATE ON cards
    FOR EACH ROW
    EXECUTE FUNCTION update_card_completed_at();

-- Trigger para subtasks
CREATE OR REPLACE FUNCTION update_subtask_completed_at()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.status = 'done' AND OLD.status != 'done' THEN
        NEW.completed_at = NOW();
    ELSIF NEW.status != 'done' AND OLD.status = 'done' THEN
        NEW.completed_at = NULL;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_update_subtask_completed_at ON subtasks;
CREATE TRIGGER trigger_update_subtask_completed_at
    BEFORE UPDATE ON subtasks
    FOR EACH ROW
    EXECUTE FUNCTION update_subtask_completed_at();

-- 4. CRIAR FUNÇÕES DE MÉTRICAS COM TIPOS CORRETOS

-- Função 1: Tempo médio de conclusão
CREATE OR REPLACE FUNCTION get_average_completion_time(
    p_start_date DATE DEFAULT NULL,
    p_end_date DATE DEFAULT NULL,
    p_board_id INTEGER DEFAULT NULL
)
RETURNS TABLE(
    avg_completion_days NUMERIC,
    total_cards INTEGER,
    completed_cards INTEGER
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        ROUND(AVG(EXTRACT(EPOCH FROM (COALESCE(c.completed_at, c.updated_at) - c.created_at)) / 86400)::NUMERIC, 2) as avg_completion_days,
        COUNT(*)::INTEGER as total_cards,
        COUNT(CASE WHEN c.status = 'done' THEN 1 END)::INTEGER as completed_cards
    FROM cards c
    WHERE (p_start_date IS NULL OR c.created_at::DATE >= p_start_date)
      AND (p_end_date IS NULL OR c.created_at::DATE <= p_end_date)
      AND (p_board_id IS NULL OR c.board_id::INTEGER = p_board_id)
      AND c.is_archived = false;
END;
$$ LANGUAGE plpgsql;

-- Função 2: Taxa de conclusão
CREATE OR REPLACE FUNCTION get_completion_rate(
    p_start_date DATE DEFAULT NULL,
    p_end_date DATE DEFAULT NULL,
    p_board_id INTEGER DEFAULT NULL
)
RETURNS TABLE(
    total_cards INTEGER,
    completed_cards INTEGER,
    completion_rate NUMERIC
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        COUNT(*)::INTEGER as total_cards,
        COUNT(CASE WHEN c.status = 'done' THEN 1 END)::INTEGER as completed_cards,
        CASE 
            WHEN COUNT(*) > 0 THEN 
                ROUND((COUNT(CASE WHEN c.status = 'done' THEN 1 END)::NUMERIC / COUNT(*)::NUMERIC) * 100, 2)
            ELSE 0 
        END as completion_rate
    FROM cards c
    WHERE (p_start_date IS NULL OR c.created_at::DATE >= p_start_date)
      AND (p_end_date IS NULL OR c.created_at::DATE <= p_end_date)
      AND (p_board_id IS NULL OR c.board_id::INTEGER = p_board_id)
      AND c.is_archived = false;
END;
$$ LANGUAGE plpgsql;

-- Função 3: Produtividade por usuário
CREATE OR REPLACE FUNCTION get_user_productivity(
    p_start_date DATE DEFAULT NULL,
    p_end_date DATE DEFAULT NULL,
    p_board_id INTEGER DEFAULT NULL
)
RETURNS TABLE(
    user_id INTEGER,
    username VARCHAR(100),
    nome_completo VARCHAR(255),
    total_cards INTEGER,
    completed_cards INTEGER,
    completion_rate NUMERIC,
    avg_completion_days NUMERIC
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        u.id as user_id,
        u.username::VARCHAR(100),
        u.nome_completo::VARCHAR(255),
        COUNT(c.id)::INTEGER as total_cards,
        COUNT(CASE WHEN c.status = 'done' THEN 1 END)::INTEGER as completed_cards,
        CASE 
            WHEN COUNT(c.id) > 0 THEN 
                ROUND((COUNT(CASE WHEN c.status = 'done' THEN 1 END)::NUMERIC / COUNT(c.id)::NUMERIC) * 100, 2)
            ELSE 0 
        END as completion_rate,
        ROUND(AVG(CASE WHEN c.status = 'done' THEN EXTRACT(EPOCH FROM (COALESCE(c.completed_at, c.updated_at) - c.created_at)) / 86400 END)::NUMERIC, 2) as avg_completion_days
    FROM users u
    LEFT JOIN cards c ON c.created_by = u.id 
        AND (p_start_date IS NULL OR c.created_at::DATE >= p_start_date)
        AND (p_end_date IS NULL OR c.created_at::DATE <= p_end_date)
        AND (p_board_id IS NULL OR c.board_id::INTEGER = p_board_id)
        AND c.is_archived = false
    GROUP BY u.id, u.username, u.nome_completo
    HAVING COUNT(c.id) > 0
    ORDER BY completed_cards DESC, completion_rate DESC;
END;
$$ LANGUAGE plpgsql;

-- Função 4: Tendências de produtividade
CREATE OR REPLACE FUNCTION get_productivity_trends(
    p_period_type TEXT DEFAULT 'month',
    p_start_date DATE DEFAULT NULL,
    p_end_date DATE DEFAULT NULL,
    p_board_id INTEGER DEFAULT NULL
)
RETURNS TABLE(
    period_label VARCHAR(50),
    total_cards INTEGER,
    completed_cards INTEGER,
    completion_rate NUMERIC
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        CASE 
            WHEN p_period_type = 'day' THEN TO_CHAR(c.created_at, 'YYYY-MM-DD')::VARCHAR(50)
            WHEN p_period_type = 'week' THEN TO_CHAR(c.created_at, 'YYYY-"W"WW')::VARCHAR(50)
            ELSE TO_CHAR(c.created_at, 'YYYY-MM')::VARCHAR(50)
        END as period_label,
        COUNT(*)::INTEGER as total_cards,
        COUNT(CASE WHEN c.status = 'done' THEN 1 END)::INTEGER as completed_cards,
        CASE 
            WHEN COUNT(*) > 0 THEN 
                ROUND((COUNT(CASE WHEN c.status = 'done' THEN 1 END)::NUMERIC / COUNT(*)::NUMERIC) * 100, 2)
            ELSE 0 
        END as completion_rate
    FROM cards c
    WHERE (p_start_date IS NULL OR c.created_at::DATE >= p_start_date)
      AND (p_end_date IS NULL OR c.created_at::DATE <= p_end_date)
      AND (p_board_id IS NULL OR c.board_id::INTEGER = p_board_id)
      AND c.is_archived = false
    GROUP BY 
        CASE 
            WHEN p_period_type = 'day' THEN TO_CHAR(c.created_at, 'YYYY-MM-DD')
            WHEN p_period_type = 'week' THEN TO_CHAR(c.created_at, 'YYYY-"W"WW')
            ELSE TO_CHAR(c.created_at, 'YYYY-MM')
        END
    ORDER BY period_label;
END;
$$ LANGUAGE plpgsql;

-- Função 5: Performance por projeto
CREATE OR REPLACE FUNCTION get_project_performance(
    p_start_date DATE DEFAULT NULL,
    p_end_date DATE DEFAULT NULL
)
RETURNS TABLE(
    board_id INTEGER,
    board_name VARCHAR(255),
    total_cards INTEGER,
    completed_cards INTEGER,
    completion_rate NUMERIC,
    avg_completion_days NUMERIC
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        b.id as board_id,
        b.name::VARCHAR(255) as board_name,
        COUNT(c.id)::INTEGER as total_cards,
        COUNT(CASE WHEN c.status = 'done' THEN 1 END)::INTEGER as completed_cards,
        CASE 
            WHEN COUNT(c.id) > 0 THEN 
                ROUND((COUNT(CASE WHEN c.status = 'done' THEN 1 END)::NUMERIC / COUNT(c.id)::NUMERIC) * 100, 2)
            ELSE 0 
        END as completion_rate,
        ROUND(AVG(CASE WHEN c.status = 'done' THEN EXTRACT(EPOCH FROM (COALESCE(c.completed_at, c.updated_at) - c.created_at)) / 86400 END)::NUMERIC, 2) as avg_completion_days
    FROM boards b
    LEFT JOIN cards c ON c.board_id::INTEGER = b.id 
        AND (p_start_date IS NULL OR c.created_at::DATE >= p_start_date)
        AND (p_end_date IS NULL OR c.created_at::DATE <= p_end_date)
        AND c.is_archived = false
    GROUP BY b.id, b.name
    HAVING COUNT(c.id) > 0
    ORDER BY completion_rate DESC, completed_cards DESC;
END;
$$ LANGUAGE plpgsql;

-- Função 6: Métricas de subtasks
CREATE OR REPLACE FUNCTION get_subtask_metrics(
    p_start_date DATE DEFAULT NULL,
    p_end_date DATE DEFAULT NULL,
    p_board_id INTEGER DEFAULT NULL
)
RETURNS TABLE(
    total_subtasks INTEGER,
    completed_subtasks INTEGER,
    completion_rate NUMERIC,
    avg_completion_days NUMERIC
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        COUNT(*)::INTEGER as total_subtasks,
        COUNT(CASE WHEN s.status = 'done' THEN 1 END)::INTEGER as completed_subtasks,
        CASE 
            WHEN COUNT(*) > 0 THEN 
                ROUND((COUNT(CASE WHEN s.status = 'done' THEN 1 END)::NUMERIC / COUNT(*)::NUMERIC) * 100, 2)
            ELSE 0 
        END as completion_rate,
        ROUND(AVG(CASE WHEN s.status = 'done' THEN EXTRACT(EPOCH FROM (COALESCE(s.completed_at, s.updated_at) - s.created_at)) / 86400 END)::NUMERIC, 2) as avg_completion_days
    FROM subtasks s
    JOIN cards c ON s.card_id = c.id
    WHERE (p_start_date IS NULL OR s.created_at::DATE >= p_start_date)
      AND (p_end_date IS NULL OR s.created_at::DATE <= p_end_date)
      AND (p_board_id IS NULL OR c.board_id::INTEGER = p_board_id)
      AND c.is_archived = false;
END;
$$ LANGUAGE plpgsql;

-- Função 7: Relatório mensal
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

-- 5. CRIAR ÍNDICES PARA PERFORMANCE
CREATE INDEX IF NOT EXISTS idx_cards_status_created_at ON cards(status, created_at) WHERE is_archived = false;
CREATE INDEX IF NOT EXISTS idx_cards_board_id_created_at ON cards(board_id, created_at) WHERE is_archived = false;
CREATE INDEX IF NOT EXISTS idx_cards_created_by_created_at ON cards(created_by, created_at) WHERE is_archived = false;
CREATE INDEX IF NOT EXISTS idx_cards_completed_at ON cards(completed_at) WHERE is_archived = false;
CREATE INDEX IF NOT EXISTS idx_subtasks_status_created_at ON subtasks(status, created_at);
CREATE INDEX IF NOT EXISTS idx_subtasks_completed_at ON subtasks(completed_at);

-- 6. TESTAR AS FUNÇÕES
DO $$
DECLARE
    v_result RECORD;
    v_count INTEGER;
BEGIN
    RAISE NOTICE 'Testando funções de métricas...';
    
    -- Testar função de tempo médio
    SELECT * INTO v_result FROM get_average_completion_time();
    RAISE NOTICE 'Tempo médio de conclusão: % dias', v_result.avg_completion_days;
    
    -- Testar função de taxa de conclusão
    SELECT * INTO v_result FROM get_completion_rate();
    RAISE NOTICE 'Taxa de conclusão: %', v_result.completion_rate;
    
    -- Testar função de relatório mensal
    SELECT COUNT(*) INTO v_count FROM get_monthly_report(NULL::TEXT);
    RAISE NOTICE 'Relatório mensal: % métricas geradas', v_count;
    
    RAISE NOTICE 'Todas as funções foram testadas com sucesso!';
END $$;

-- 7. MENSAGEM FINAL
DO $$
BEGIN
    RAISE NOTICE '=====================================================';
    RAISE NOTICE 'SISTEMA DE MÉTRICAS DE PERFORMANCE INSTALADO COM SUCESSO!';
    RAISE NOTICE '=====================================================';
    RAISE NOTICE 'Funções disponíveis:';
    RAISE NOTICE '- get_average_completion_time(start_date, end_date, board_id)';
    RAISE NOTICE '- get_completion_rate(start_date, end_date, board_id)';
    RAISE NOTICE '- get_user_productivity(start_date, end_date, board_id)';
    RAISE NOTICE '- get_productivity_trends(period_type, start_date, end_date, board_id)';
    RAISE NOTICE '- get_project_performance(start_date, end_date)';
    RAISE NOTICE '- get_subtask_metrics(start_date, end_date, board_id)';
    RAISE NOTICE '- get_monthly_report(report_month)';
    RAISE NOTICE '=====================================================';
END $$;

