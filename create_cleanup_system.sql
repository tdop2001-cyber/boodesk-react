-- Sistema de Limpeza Automática do Banco de Dados
-- Execute este SQL no Editor SQL do Supabase

-- 1. Criar tabela de configurações de limpeza
CREATE TABLE IF NOT EXISTS cleanup_settings (
    id SERIAL PRIMARY KEY,
    cleanup_type VARCHAR(50) NOT NULL, -- 'archived_cards', 'old_logs', 'temp_files', 'old_sessions'
    enabled BOOLEAN DEFAULT true,
    retention_days INTEGER DEFAULT 365,
    last_cleanup TIMESTAMP WITH TIME ZONE,
    next_cleanup TIMESTAMP WITH TIME ZONE,
    cleanup_count INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Criar tabela de histórico de limpezas
CREATE TABLE IF NOT EXISTS cleanup_history (
    id SERIAL PRIMARY KEY,
    cleanup_type VARCHAR(50) NOT NULL,
    executed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    items_deleted INTEGER DEFAULT 0,
    size_freed_mb DECIMAL(10,2) DEFAULT 0,
    execution_time_ms INTEGER DEFAULT 0,
    status VARCHAR(20) DEFAULT 'success', -- 'success', 'error', 'partial'
    error_message TEXT,
    details JSONB DEFAULT '{}'
);

-- 3. Função para limpar cards arquivados antigos
CREATE OR REPLACE FUNCTION cleanup_old_archived_cards()
RETURNS JSONB AS $$
DECLARE
    retention_days INTEGER;
    deleted_count INTEGER := 0;
    start_time TIMESTAMP;
    end_time TIMESTAMP;
    execution_time INTEGER;
    result JSONB;
BEGIN
    start_time := clock_timestamp();
    
    -- Buscar configuração de retenção
    SELECT COALESCE(retention_days, 365) INTO retention_days
    FROM cleanup_settings 
    WHERE cleanup_type = 'archived_cards' AND enabled = true;
    
    -- Se não há configuração, usar padrão de 2 anos
    IF retention_days IS NULL THEN
        retention_days := 730; -- 2 anos
    END IF;
    
    -- Deletar cards arquivados antigos
    WITH deleted_cards AS (
        DELETE FROM cards 
        WHERE is_archived = true 
        AND archived_at < NOW() - INTERVAL '1 day' * retention_days
        RETURNING id, archived_at
    )
    SELECT COUNT(*) INTO deleted_count FROM deleted_cards;
    
    -- Deletar registros relacionados
    DELETE FROM archived_cards 
    WHERE archived_at < NOW() - INTERVAL '1 day' * retention_days;
    
    DELETE FROM archive_history 
    WHERE performed_at < NOW() - INTERVAL '1 day' * retention_days;
    
    end_time := clock_timestamp();
    execution_time := EXTRACT(EPOCH FROM (end_time - start_time)) * 1000;
    
    -- Registrar histórico
    INSERT INTO cleanup_history (
        cleanup_type,
        items_deleted,
        execution_time_ms,
        details
    ) VALUES (
        'archived_cards',
        deleted_count,
        execution_time,
        jsonb_build_object(
            'retention_days', retention_days,
            'deleted_archived_cards', deleted_count
        )
    );
    
    -- Atualizar configurações
    UPDATE cleanup_settings 
    SET 
        last_cleanup = NOW(),
        next_cleanup = NOW() + INTERVAL '7 days',
        cleanup_count = cleanup_count + 1,
        updated_at = NOW()
    WHERE cleanup_type = 'archived_cards';
    
    result := jsonb_build_object(
        'success', true,
        'deleted_count', deleted_count,
        'execution_time_ms', execution_time,
        'retention_days', retention_days
    );
    
    RETURN result;
END;
$$ LANGUAGE plpgsql;

-- 4. Função para limpar logs antigos
CREATE OR REPLACE FUNCTION cleanup_old_logs()
RETURNS JSONB AS $$
DECLARE
    retention_days INTEGER;
    deleted_count INTEGER := 0;
    start_time TIMESTAMP;
    end_time TIMESTAMP;
    execution_time INTEGER;
    result JSONB;
BEGIN
    start_time := clock_timestamp();
    
    -- Buscar configuração de retenção
    SELECT COALESCE(retention_days, 90) INTO retention_days
    FROM cleanup_settings 
    WHERE cleanup_type = 'old_logs' AND enabled = true;
    
    -- Se não há configuração, usar padrão de 3 meses
    IF retention_days IS NULL THEN
        retention_days := 90;
    END IF;
    
    -- Deletar logs antigos (se a tabela existir)
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'activity_logs') THEN
        EXECUTE format('
            WITH deleted_logs AS (
                DELETE FROM activity_logs 
                WHERE created_at < NOW() - INTERVAL ''1 day'' * %s
                RETURNING id
            )
            SELECT COUNT(*) FROM deleted_logs
        ', retention_days) INTO deleted_count;
    END IF;
    
    -- Deletar histórico de limpeza antigo
    DELETE FROM cleanup_history 
    WHERE executed_at < NOW() - INTERVAL '1 day' * (retention_days * 2);
    
    end_time := clock_timestamp();
    execution_time := EXTRACT(EPOCH FROM (end_time - start_time)) * 1000;
    
    -- Registrar histórico
    INSERT INTO cleanup_history (
        cleanup_type,
        items_deleted,
        execution_time_ms,
        details
    ) VALUES (
        'old_logs',
        deleted_count,
        execution_time,
        jsonb_build_object(
            'retention_days', retention_days,
            'deleted_logs', deleted_count
        )
    );
    
    -- Atualizar configurações
    UPDATE cleanup_settings 
    SET 
        last_cleanup = NOW(),
        next_cleanup = NOW() + INTERVAL '1 day',
        cleanup_count = cleanup_count + 1,
        updated_at = NOW()
    WHERE cleanup_type = 'old_logs';
    
    result := jsonb_build_object(
        'success', true,
        'deleted_count', deleted_count,
        'execution_time_ms', execution_time,
        'retention_days', retention_days
    );
    
    RETURN result;
END;
$$ LANGUAGE plpgsql;

-- 5. Função para limpar sessões antigas
CREATE OR REPLACE FUNCTION cleanup_old_sessions()
RETURNS JSONB AS $$
DECLARE
    retention_days INTEGER;
    deleted_count INTEGER := 0;
    start_time TIMESTAMP;
    end_time TIMESTAMP;
    execution_time INTEGER;
    result JSONB;
BEGIN
    start_time := clock_timestamp();
    
    -- Buscar configuração de retenção
    SELECT COALESCE(retention_days, 30) INTO retention_days
    FROM cleanup_settings 
    WHERE cleanup_type = 'old_sessions' AND enabled = true;
    
    -- Se não há configuração, usar padrão de 1 mês
    IF retention_days IS NULL THEN
        retention_days := 30;
    END IF;
    
    -- Deletar sessões antigas (se a tabela existir)
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'user_sessions') THEN
        EXECUTE format('
            WITH deleted_sessions AS (
                DELETE FROM user_sessions 
                WHERE last_activity < NOW() - INTERVAL ''1 day'' * %s
                RETURNING id
            )
            SELECT COUNT(*) FROM deleted_sessions
        ', retention_days) INTO deleted_count;
    END IF;
    
    end_time := clock_timestamp();
    execution_time := EXTRACT(EPOCH FROM (end_time - start_time)) * 1000;
    
    -- Registrar histórico
    INSERT INTO cleanup_history (
        cleanup_type,
        items_deleted,
        execution_time_ms,
        details
    ) VALUES (
        'old_sessions',
        deleted_count,
        execution_time,
        jsonb_build_object(
            'retention_days', retention_days,
            'deleted_sessions', deleted_count
        )
    );
    
    -- Atualizar configurações
    UPDATE cleanup_settings 
    SET 
        last_cleanup = NOW(),
        next_cleanup = NOW() + INTERVAL '1 day',
        cleanup_count = cleanup_count + 1,
        updated_at = NOW()
    WHERE cleanup_type = 'old_sessions';
    
    result := jsonb_build_object(
        'success', true,
        'deleted_count', deleted_count,
        'execution_time_ms', execution_time,
        'retention_days', retention_days
    );
    
    RETURN result;
END;
$$ LANGUAGE plpgsql;

-- 6. Função principal de limpeza que executa todas as limpezas
CREATE OR REPLACE FUNCTION execute_cleanup_all()
RETURNS JSONB AS $$
DECLARE
    result JSONB := '{}';
    archived_result JSONB;
    logs_result JSONB;
    sessions_result JSONB;
    total_deleted INTEGER := 0;
    total_time INTEGER := 0;
BEGIN
    -- Executar limpeza de cards arquivados
    SELECT cleanup_old_archived_cards() INTO archived_result;
    total_deleted := total_deleted + COALESCE((archived_result->>'deleted_count')::INTEGER, 0);
    total_time := total_time + COALESCE((archived_result->>'execution_time_ms')::INTEGER, 0);
    
    -- Executar limpeza de logs
    SELECT cleanup_old_logs() INTO logs_result;
    total_deleted := total_deleted + COALESCE((logs_result->>'deleted_count')::INTEGER, 0);
    total_time := total_time + COALESCE((logs_result->>'execution_time_ms')::INTEGER, 0);
    
    -- Executar limpeza de sessões
    SELECT cleanup_old_sessions() INTO sessions_result;
    total_deleted := total_deleted + COALESCE((sessions_result->>'deleted_count')::INTEGER, 0);
    total_time := total_time + COALESCE((sessions_result->>'execution_time_ms')::INTEGER, 0);
    
    result := jsonb_build_object(
        'success', true,
        'total_deleted', total_deleted,
        'total_execution_time_ms', total_time,
        'archived_cards', archived_result,
        'logs', logs_result,
        'sessions', sessions_result,
        'executed_at', NOW()
    );
    
    RETURN result;
END;
$$ LANGUAGE plpgsql;

-- 7. Função para obter estatísticas de uso do banco
CREATE OR REPLACE FUNCTION get_database_stats()
RETURNS JSONB AS $$
DECLARE
    result JSONB;
    total_cards INTEGER;
    archived_cards INTEGER;
    total_size_mb DECIMAL;
    archived_size_mb DECIMAL;
BEGIN
    -- Contar cards
    SELECT COUNT(*) INTO total_cards FROM cards;
    SELECT COUNT(*) INTO archived_cards FROM cards WHERE is_archived = true;
    
    -- Estimar tamanho (aproximado)
    SELECT 
        pg_size_pretty(pg_total_relation_size('cards'))::TEXT,
        pg_size_pretty(pg_relation_size('cards'))::TEXT
    INTO total_size_mb, archived_size_mb;
    
    result := jsonb_build_object(
        'total_cards', total_cards,
        'archived_cards', archived_cards,
        'active_cards', total_cards - archived_cards,
        'archive_percentage', CASE 
            WHEN total_cards > 0 THEN ROUND((archived_cards::DECIMAL / total_cards) * 100, 2)
            ELSE 0 
        END,
        'total_size', total_size_mb,
        'table_size', archived_size_mb,
        'last_updated', NOW()
    );
    
    RETURN result;
END;
$$ LANGUAGE plpgsql;

-- 8. Inserir configurações padrão
INSERT INTO cleanup_settings (cleanup_type, enabled, retention_days, next_cleanup) VALUES
('archived_cards', true, 730, NOW() + INTERVAL '7 days'), -- 2 anos
('old_logs', true, 90, NOW() + INTERVAL '1 day'),         -- 3 meses
('old_sessions', true, 30, NOW() + INTERVAL '1 day')      -- 1 mês
ON CONFLICT (cleanup_type) DO NOTHING;

-- 9. Criar índices para performance
CREATE INDEX IF NOT EXISTS idx_cleanup_history_type ON cleanup_history(cleanup_type);
CREATE INDEX IF NOT EXISTS idx_cleanup_history_executed_at ON cleanup_history(executed_at);
CREATE INDEX IF NOT EXISTS idx_cards_archived_at ON cards(archived_at) WHERE is_archived = true;

-- 10. Criar view para monitoramento
CREATE OR REPLACE VIEW cleanup_monitoring AS
SELECT 
    cs.cleanup_type,
    cs.enabled,
    cs.retention_days,
    cs.last_cleanup,
    cs.next_cleanup,
    cs.cleanup_count,
    ch.items_deleted as last_deleted_count,
    ch.execution_time_ms as last_execution_time,
    ch.status as last_status,
    CASE 
        WHEN cs.next_cleanup < NOW() THEN 'overdue'
        WHEN cs.next_cleanup < NOW() + INTERVAL '1 day' THEN 'due_soon'
        ELSE 'scheduled'
    END as status
FROM cleanup_settings cs
LEFT JOIN LATERAL (
    SELECT items_deleted, execution_time_ms, status
    FROM cleanup_history 
    WHERE cleanup_type = cs.cleanup_type 
    ORDER BY executed_at DESC 
    LIMIT 1
) ch ON true;

-- 11. Testar as funções
SELECT 'Configurações de limpeza criadas com sucesso!' as status;

-- 12. Mostrar configurações atuais
SELECT * FROM cleanup_monitoring;

-- 13. Mostrar estatísticas do banco
SELECT get_database_stats() as database_stats;
