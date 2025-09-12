-- =====================================================
-- INSTALAÇÃO FINAL DO SISTEMA DE MÉTRICAS DE PERFORMANCE
-- =====================================================

-- Este script instala o sistema completo de métricas de performance
-- Execute este script no Supabase SQL Editor

-- 0. REMOVER FUNÇÕES EXISTENTES (se existirem)
DO $$
BEGIN
    -- Remover todas as funções de métricas existentes
    DROP FUNCTION IF EXISTS get_average_completion_time(date, date, integer);
    DROP FUNCTION IF EXISTS get_completion_rate(date, date, integer);
    DROP FUNCTION IF EXISTS get_user_productivity(date, date, integer);
    DROP FUNCTION IF EXISTS get_productivity_trends(text, date, date, integer);
    DROP FUNCTION IF EXISTS get_project_performance(date, date);
    DROP FUNCTION IF EXISTS get_subtask_metrics(date, date, integer);
    DROP FUNCTION IF EXISTS get_monthly_report(text);
    
    RAISE NOTICE 'Funções existentes removidas com sucesso';
END $$;

-- 1. Verificar se as tabelas existem
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'cards') THEN
        RAISE EXCEPTION 'Tabela cards não encontrada. Execute primeiro o schema básico do banco.';
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'subtasks') THEN
        RAISE EXCEPTION 'Tabela subtasks não encontrada. Execute primeiro o schema básico do banco.';
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'users') THEN
        RAISE EXCEPTION 'Tabela users não encontrada. Execute primeiro o schema básico do banco.';
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'boards') THEN
        RAISE EXCEPTION 'Tabela boards não encontrada. Execute primeiro o schema básico do banco.';
    END IF;
    
    RAISE NOTICE 'Todas as tabelas necessárias foram encontradas.';
END $$;

-- 2. Adicionar colunas necessárias se não existirem
DO $$
BEGIN
    -- Adicionar coluna completed_at na tabela cards
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'cards' AND column_name = 'completed_at'
    ) THEN
        ALTER TABLE cards ADD COLUMN completed_at TIMESTAMP;
        RAISE NOTICE 'Coluna completed_at adicionada à tabela cards';
    END IF;
    
    -- Adicionar coluna created_by na tabela cards
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'cards' AND column_name = 'created_by'
    ) THEN
        ALTER TABLE cards ADD COLUMN created_by INTEGER REFERENCES users(id);
        RAISE NOTICE 'Coluna created_by adicionada à tabela cards';
    END IF;
    
    -- Adicionar coluna completed_at na tabela subtasks
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'subtasks' AND column_name = 'completed_at'
    ) THEN
        ALTER TABLE subtasks ADD COLUMN completed_at TIMESTAMP;
        RAISE NOTICE 'Coluna completed_at adicionada à tabela subtasks';
    END IF;
    
    -- Padronizar valores de status
    UPDATE cards SET status = 'done' WHERE status IN ('completed', 'concluido', 'finalizado');
    UPDATE cards SET status = 'progress' WHERE status IN ('in_progress', 'em_andamento', 'progresso');
    UPDATE cards SET status = 'todo' WHERE status IN ('to_do', 'a_fazer', 'pendente');
    
    RAISE NOTICE 'Valores de status padronizados';
END $$;

-- 3. Criar triggers para atualizar completed_at automaticamente
CREATE OR REPLACE FUNCTION update_card_completion_date()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.status = 'done' AND OLD.status != 'done' AND NEW.completed_at IS NULL THEN
        NEW.completed_at = NOW();
    END IF;
    
    IF OLD.status = 'done' AND NEW.status != 'done' THEN
        NEW.completed_at = NULL;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION update_subtask_completion_date()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.status = 'done' AND OLD.status != 'done' AND NEW.completed_at IS NULL THEN
        NEW.completed_at = NOW();
    END IF;
    
    IF OLD.status = 'done' AND NEW.status != 'done' THEN
        NEW.completed_at = NULL;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Aplicar triggers
DROP TRIGGER IF EXISTS trigger_update_card_completion_date ON cards;
CREATE TRIGGER trigger_update_card_completion_date
    BEFORE UPDATE ON cards
    FOR EACH ROW
    EXECUTE FUNCTION update_card_completion_date();

DROP TRIGGER IF EXISTS trigger_update_subtask_completion_date ON subtasks;
CREATE TRIGGER trigger_update_subtask_completion_date
    BEFORE UPDATE ON subtasks
    FOR EACH ROW
    EXECUTE FUNCTION update_subtask_completion_date();

-- 4. Criar funções de métricas de performance
-- Função para tempo médio de conclusão
CREATE OR REPLACE FUNCTION get_average_completion_time(
    p_start_date DATE DEFAULT NULL,
    p_end_date DATE DEFAULT NULL,
    p_board_id INTEGER DEFAULT NULL
)
RETURNS TABLE (
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
    WHERE 
        (p_start_date IS NULL OR c.created_at::DATE >= p_start_date)
        AND (p_end_date IS NULL OR c.created_at::DATE <= p_end_date)
        AND (p_board_id IS NULL OR c.board_id::INTEGER = p_board_id)
        AND c.is_archived = false;
END;
$$ LANGUAGE plpgsql;

-- Função para taxa de conclusão
CREATE OR REPLACE FUNCTION get_completion_rate(
    p_start_date DATE DEFAULT NULL,
    p_end_date DATE DEFAULT NULL,
    p_board_id INTEGER DEFAULT NULL
)
RETURNS TABLE (
    completion_rate NUMERIC,
    total_created INTEGER,
    total_completed INTEGER,
    pending_cards INTEGER
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        CASE 
            WHEN COUNT(*) > 0 THEN 
                ROUND((COUNT(CASE WHEN c.status = 'done' THEN 1 END)::NUMERIC / COUNT(*)::NUMERIC) * 100, 2)
            ELSE 0
        END as completion_rate,
        COUNT(*)::INTEGER as total_created,
        COUNT(CASE WHEN c.status = 'done' THEN 1 END)::INTEGER as total_completed,
        COUNT(CASE WHEN c.status != 'done' THEN 1 END)::INTEGER as pending_cards
    FROM cards c
    WHERE 
        (p_start_date IS NULL OR c.created_at::DATE >= p_start_date)
        AND (p_end_date IS NULL OR c.created_at::DATE <= p_end_date)
        AND (p_board_id IS NULL OR c.board_id::INTEGER = p_board_id)
        AND c.is_archived = false;
END;
$$ LANGUAGE plpgsql;

-- Função para produtividade por usuário
CREATE OR REPLACE FUNCTION get_user_productivity(
    p_start_date DATE DEFAULT NULL,
    p_end_date DATE DEFAULT NULL,
    p_board_id INTEGER DEFAULT NULL
)
RETURNS TABLE (
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
        u.id::INTEGER as user_id,
        u.username::VARCHAR(100) as username,
        COALESCE(u.nome_completo, u.username)::VARCHAR(255) as nome_completo,
        COUNT(c.id)::INTEGER as total_cards,
        COUNT(CASE WHEN c.status = 'done' THEN 1 END)::INTEGER as completed_cards,
        CASE 
            WHEN COUNT(c.id) > 0 THEN 
                ROUND((COUNT(CASE WHEN c.status = 'done' THEN 1 END)::NUMERIC / COUNT(c.id)::NUMERIC) * 100, 2)
            ELSE 0
        END as completion_rate,
        ROUND(AVG(CASE 
            WHEN c.status = 'done' THEN 
                EXTRACT(EPOCH FROM (COALESCE(c.completed_at, c.updated_at) - c.created_at)) / 86400
        END)::NUMERIC, 2) as avg_completion_days
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

-- Função para tendências de produtividade
CREATE OR REPLACE FUNCTION get_productivity_trends(
    p_period_type TEXT DEFAULT 'month',
    p_start_date DATE DEFAULT NULL,
    p_end_date DATE DEFAULT NULL,
    p_board_id INTEGER DEFAULT NULL
)
RETURNS TABLE (
    period_label VARCHAR(50),
    period_date DATE,
    total_created INTEGER,
    total_completed INTEGER,
    completion_rate NUMERIC,
    avg_completion_days NUMERIC
) AS $$
DECLARE
    date_trunc_format TEXT;
BEGIN
    CASE p_period_type
        WHEN 'day' THEN date_trunc_format := 'day';
        WHEN 'week' THEN date_trunc_format := 'week';
        WHEN 'month' THEN date_trunc_format := 'month';
        ELSE date_trunc_format := 'month';
    END CASE;

    RETURN QUERY
    SELECT 
        CASE p_period_type
            WHEN 'day' THEN TO_CHAR(DATE_TRUNC('day', c.created_at), 'DD/MM/YYYY')
            WHEN 'week' THEN 'Semana ' || TO_CHAR(DATE_TRUNC('week', c.created_at), 'WW/YYYY')
            WHEN 'month' THEN TO_CHAR(DATE_TRUNC('month', c.created_at), 'MM/YYYY')
            ELSE TO_CHAR(DATE_TRUNC('month', c.created_at), 'MM/YYYY')
        END::VARCHAR(50) as period_label,
        DATE_TRUNC(date_trunc_format, c.created_at)::DATE as period_date,
        COUNT(*)::INTEGER as total_created,
        COUNT(CASE WHEN c.status = 'done' THEN 1 END)::INTEGER as total_completed,
        CASE 
            WHEN COUNT(*) > 0 THEN 
                ROUND((COUNT(CASE WHEN c.status = 'done' THEN 1 END)::NUMERIC / COUNT(*)::NUMERIC) * 100, 2)
            ELSE 0
        END as completion_rate,
        ROUND(AVG(CASE 
            WHEN c.status = 'done' THEN 
                EXTRACT(EPOCH FROM (COALESCE(c.completed_at, c.updated_at) - c.created_at)) / 86400
        END)::NUMERIC, 2) as avg_completion_days
    FROM cards c
    WHERE 
        (p_start_date IS NULL OR c.created_at::DATE >= p_start_date)
        AND (p_end_date IS NULL OR c.created_at::DATE <= p_end_date)
        AND (p_board_id IS NULL OR c.board_id::INTEGER = p_board_id)
        AND c.is_archived = false
    GROUP BY DATE_TRUNC(date_trunc_format, c.created_at)
    ORDER BY period_date;
END;
$$ LANGUAGE plpgsql;

-- Função para performance por projeto
CREATE OR REPLACE FUNCTION get_project_performance(
    p_start_date DATE DEFAULT NULL,
    p_end_date DATE DEFAULT NULL
)
RETURNS TABLE (
    board_id INTEGER,
    board_name VARCHAR(255),
    total_cards INTEGER,
    completed_cards INTEGER,
    pending_cards INTEGER,
    completion_rate NUMERIC,
    avg_completion_days NUMERIC,
    total_members INTEGER
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        b.id::INTEGER as board_id,
        b.name::VARCHAR(255) as board_name,
        COUNT(c.id)::INTEGER as total_cards,
        COUNT(CASE WHEN c.status = 'done' THEN 1 END)::INTEGER as completed_cards,
        COUNT(CASE WHEN c.status != 'done' THEN 1 END)::INTEGER as pending_cards,
        CASE 
            WHEN COUNT(c.id) > 0 THEN 
                ROUND((COUNT(CASE WHEN c.status = 'done' THEN 1 END)::NUMERIC / COUNT(c.id)::NUMERIC) * 100, 2)
            ELSE 0
        END as completion_rate,
        ROUND(AVG(CASE 
            WHEN c.status = 'done' THEN 
                EXTRACT(EPOCH FROM (COALESCE(c.completed_at, c.updated_at) - c.created_at)) / 86400
        END)::NUMERIC, 2) as avg_completion_days,
        COUNT(DISTINCT c.created_by)::INTEGER as total_members
    FROM boards b
    LEFT JOIN cards c ON c.board_id::INTEGER = b.id
        AND (p_start_date IS NULL OR c.created_at::DATE >= p_start_date)
        AND (p_end_date IS NULL OR c.created_at::DATE <= p_end_date)
        AND c.is_archived = false
    GROUP BY b.id, b.name
    HAVING COUNT(c.id) > 0
    ORDER BY completed_cards DESC, completion_rate DESC;
END;
$$ LANGUAGE plpgsql;

-- Função para métricas de subtasks
CREATE OR REPLACE FUNCTION get_subtask_metrics(
    p_start_date DATE DEFAULT NULL,
    p_end_date DATE DEFAULT NULL,
    p_board_id INTEGER DEFAULT NULL
)
RETURNS TABLE (
    total_subtasks INTEGER,
    completed_subtasks INTEGER,
    pending_subtasks INTEGER,
    completion_rate NUMERIC,
    avg_completion_days NUMERIC
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        COUNT(s.id)::INTEGER as total_subtasks,
        COUNT(CASE WHEN s.status = 'done' THEN 1 END)::INTEGER as completed_subtasks,
        COUNT(CASE WHEN s.status != 'done' THEN 1 END)::INTEGER as pending_subtasks,
        CASE 
            WHEN COUNT(s.id) > 0 THEN 
                ROUND((COUNT(CASE WHEN s.status = 'done' THEN 1 END)::NUMERIC / COUNT(s.id)::NUMERIC) * 100, 2)
            ELSE 0
        END as completion_rate,
        ROUND(AVG(CASE 
            WHEN s.status = 'done' THEN 
                EXTRACT(EPOCH FROM (COALESCE(s.completed_at, s.updated_at) - s.created_at)) / 86400
        END)::NUMERIC, 2) as avg_completion_days
    FROM subtasks s
    JOIN cards c ON c.id = s.card_id
    WHERE 
        (p_start_date IS NULL OR s.created_at::DATE >= p_start_date)
        AND (p_end_date IS NULL OR s.created_at::DATE <= p_end_date)
        AND (p_board_id IS NULL OR c.board_id::INTEGER = p_board_id)
        AND c.is_archived = false;
END;
$$ LANGUAGE plpgsql;

-- Função para relatório mensal
CREATE OR REPLACE FUNCTION get_monthly_report(
    p_report_month DATE DEFAULT CURRENT_DATE
)
RETURNS TABLE (
    metric_name VARCHAR(100),
    metric_value NUMERIC,
    metric_description VARCHAR(255)
) AS $$
DECLARE
    month_start DATE;
    month_end DATE;
    total_cards INTEGER;
    completed_cards INTEGER;
    completion_rate NUMERIC;
    avg_completion_days NUMERIC;
    total_subtasks INTEGER;
    completed_subtasks INTEGER;
    subtask_completion_rate NUMERIC;
    active_users INTEGER;
BEGIN
    month_start := DATE_TRUNC('month', p_report_month)::DATE;
    month_end := (DATE_TRUNC('month', p_report_month) + INTERVAL '1 month' - INTERVAL '1 day')::DATE;
    
    SELECT COUNT(*), COUNT(CASE WHEN status = 'done' THEN 1 END)
    INTO total_cards, completed_cards
    FROM cards 
    WHERE created_at::DATE >= month_start 
        AND created_at::DATE <= month_end
        AND is_archived = false;
    
    completion_rate := CASE WHEN total_cards > 0 THEN (completed_cards::NUMERIC / total_cards::NUMERIC) * 100 ELSE 0 END;
    
    SELECT ROUND(AVG(EXTRACT(EPOCH FROM (COALESCE(completed_at, updated_at) - created_at)) / 86400)::NUMERIC, 2)
    INTO avg_completion_days
    FROM cards 
    WHERE status = 'done' 
        AND created_at::DATE >= month_start 
        AND created_at::DATE <= month_end
        AND is_archived = false;
    
    SELECT COUNT(*), COUNT(CASE WHEN status = 'done' THEN 1 END)
    INTO total_subtasks, completed_subtasks
    FROM subtasks s
    JOIN cards c ON c.id = s.card_id
    WHERE s.created_at::DATE >= month_start 
        AND s.created_at::DATE <= month_end
        AND c.is_archived = false;
    
    subtask_completion_rate := CASE WHEN total_subtasks > 0 THEN (completed_subtasks::NUMERIC / total_subtasks::NUMERIC) * 100 ELSE 0 END;
    
    SELECT COUNT(DISTINCT created_by)
    INTO active_users
    FROM cards 
    WHERE created_at::DATE >= month_start 
        AND created_at::DATE <= month_end
        AND is_archived = false;
    
    RETURN QUERY VALUES 
        ('Total de Cards'::VARCHAR(100), total_cards::NUMERIC, 'Total de cards criados no mês'::VARCHAR(255)),
        ('Cards Concluídos'::VARCHAR(100), completed_cards::NUMERIC, 'Cards finalizados no mês'::VARCHAR(255)),
        ('Taxa de Conclusão (%)'::VARCHAR(100), completion_rate, 'Percentual de cards concluídos'::VARCHAR(255)),
        ('Tempo Médio (dias)'::VARCHAR(100), COALESCE(avg_completion_days, 0), 'Tempo médio para conclusão'::VARCHAR(255)),
        ('Total de Subtasks'::VARCHAR(100), total_subtasks::NUMERIC, 'Total de subtasks criadas'::VARCHAR(255)),
        ('Subtasks Concluídas'::VARCHAR(100), completed_subtasks::NUMERIC, 'Subtasks finalizadas'::VARCHAR(255)),
        ('Taxa Subtasks (%)'::VARCHAR(100), subtask_completion_rate, 'Percentual de subtasks concluídas'::VARCHAR(255)),
        ('Usuários Ativos'::VARCHAR(100), active_users::NUMERIC, 'Usuários que criaram cards no mês'::VARCHAR(255));
END;
$$ LANGUAGE plpgsql;

-- 5. Criar índices para melhorar performance
CREATE INDEX IF NOT EXISTS idx_cards_created_at ON cards(created_at);
CREATE INDEX IF NOT EXISTS idx_cards_completed_at ON cards(completed_at);
CREATE INDEX IF NOT EXISTS idx_cards_status ON cards(status);
CREATE INDEX IF NOT EXISTS idx_cards_board_id ON cards(board_id);
CREATE INDEX IF NOT EXISTS idx_cards_created_by ON cards(created_by);
CREATE INDEX IF NOT EXISTS idx_subtasks_created_at ON subtasks(created_at);
CREATE INDEX IF NOT EXISTS idx_subtasks_completed_at ON subtasks(completed_at);
CREATE INDEX IF NOT EXISTS idx_subtasks_status ON subtasks(status);

-- 6. Atualizar completed_at para cards que já estão com status 'done'
UPDATE cards 
SET completed_at = updated_at 
WHERE status = 'done' AND completed_at IS NULL;

-- Atualizar completed_at para subtasks que já estão com status 'done'
UPDATE subtasks 
SET completed_at = updated_at 
WHERE status = 'done' AND completed_at IS NULL;

-- 7. Testar as funções
SELECT 'Teste das funções criadas:' as info;

SELECT 'Teste: get_average_completion_time' as teste;
SELECT * FROM get_average_completion_time();

SELECT 'Teste: get_completion_rate' as teste;
SELECT * FROM get_completion_rate();

SELECT 'Teste: get_user_productivity' as teste;
SELECT * FROM get_user_productivity() LIMIT 3;

SELECT 'Teste: get_productivity_trends' as teste;
SELECT * FROM get_productivity_trends('month') LIMIT 3;

SELECT 'Teste: get_project_performance' as teste;
SELECT * FROM get_project_performance() LIMIT 3;

SELECT 'Teste: get_subtask_metrics' as teste;
SELECT * FROM get_subtask_metrics();

SELECT 'Teste: get_monthly_report' as teste;
SELECT * FROM get_monthly_report();

-- 8. Verificação final
SELECT 'Instalação concluída com sucesso!' as status;
SELECT 'Funções criadas:' as info;
SELECT routine_name, routine_type
FROM information_schema.routines 
WHERE routine_name LIKE 'get_%' 
  AND routine_schema = 'public'
ORDER BY routine_name;
