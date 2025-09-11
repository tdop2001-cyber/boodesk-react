-- Configuração de Cron Job para Arquivamento Automático
-- Execute este SQL no Editor SQL do Supabase

-- 1. Criar função para ser executada pelo cron
CREATE OR REPLACE FUNCTION cron_auto_archive()
RETURNS void AS $$
DECLARE
    result JSONB;
BEGIN
    -- Executar arquivamento automático
    SELECT execute_auto_archive_with_logging() INTO result;
    
    -- Log da execução do cron
    INSERT INTO archive_execution_log (
        executed_at,
        cards_archived,
        execution_duration_ms,
        status,
        details
    ) VALUES (
        NOW(),
        COALESCE((result->>'cards_archived')::integer, 0),
        COALESCE((result->>'execution_time_ms')::integer, 0),
        CASE WHEN (result->>'success')::boolean THEN 'success' ELSE 'error' END,
        jsonb_build_object(
            'execution_type', 'cron',
            'result', result
        )
    );
    
    -- Se houver erro, logar
    IF NOT (result->>'success')::boolean THEN
        RAISE WARNING 'Erro no arquivamento automático: %', result->>'error';
    END IF;
END;
$$ LANGUAGE plpgsql;

-- 2. Criar função para verificar saúde do sistema
CREATE OR REPLACE FUNCTION check_archive_system_health()
RETURNS JSONB AS $$
DECLARE
    result JSONB;
    last_execution RECORD;
    pending_cards INTEGER;
    active_settings INTEGER;
BEGIN
    -- Buscar última execução
    SELECT * INTO last_execution
    FROM archive_execution_log
    WHERE status = 'success'
    ORDER BY executed_at DESC
    LIMIT 1;
    
    -- Contar cards pendentes
    SELECT COUNT(*) INTO pending_cards
    FROM cards c
    JOIN archive_settings s ON (s.board_id IS NULL OR c.board_id = s.board_id)
    WHERE c.is_archived = false 
    AND c.status = 'done'
    AND c.completed_at IS NOT NULL
    AND s.auto_archive_enabled = true
    AND c.completed_at <= NOW() - INTERVAL '1 day' * s.archive_after_days;
    
    -- Contar configurações ativas
    SELECT COUNT(*) INTO active_settings
    FROM archive_settings 
    WHERE auto_archive_enabled = true;
    
    -- Determinar status de saúde
    result := jsonb_build_object(
        'health_status', CASE
            WHEN active_settings = 0 THEN 'inactive'
            WHEN last_execution.id IS NULL THEN 'no_executions'
            WHEN last_execution.executed_at < NOW() - INTERVAL '2 hours' THEN 'stale'
            WHEN pending_cards > 100 THEN 'overloaded'
            ELSE 'healthy'
        END,
        'active_settings', active_settings,
        'pending_cards', pending_cards,
        'last_execution', CASE 
            WHEN last_execution.id IS NOT NULL THEN
                jsonb_build_object(
                    'executed_at', last_execution.executed_at,
                    'cards_archived', last_execution.cards_archived,
                    'duration_ms', last_execution.execution_duration_ms
                )
            ELSE NULL
        END,
        'recommendations', CASE
            WHEN active_settings = 0 THEN 'Ativar configurações de arquivamento'
            WHEN last_execution.id IS NULL THEN 'Executar arquivamento manual'
            WHEN last_execution.executed_at < NOW() - INTERVAL '2 hours' THEN 'Verificar cron job'
            WHEN pending_cards > 100 THEN 'Executar arquivamento manual para limpar backlog'
            ELSE 'Sistema funcionando normalmente'
        END,
        'checked_at', NOW()
    );
    
    RETURN result;
END;
$$ LANGUAGE plpgsql;

-- 3. Criar função para limpeza de logs antigos
CREATE OR REPLACE FUNCTION cleanup_archive_logs()
RETURNS INTEGER AS $$
DECLARE
    deleted_count INTEGER;
BEGIN
    -- Deletar logs de execução mais antigos que 30 dias
    DELETE FROM archive_execution_log
    WHERE executed_at < NOW() - INTERVAL '30 days';
    
    GET DIAGNOSTICS deleted_count = ROW_COUNT;
    
    -- Log da limpeza
    INSERT INTO archive_execution_log (
        executed_at,
        cards_archived,
        execution_duration_ms,
        status,
        details
    ) VALUES (
        NOW(),
        0,
        0,
        'cleanup',
        jsonb_build_object(
            'action', 'log_cleanup',
            'deleted_logs', deleted_count,
            'retention_days', 30
        )
    );
    
    RETURN deleted_count;
END;
$$ LANGUAGE plpgsql;

-- 4. Criar view para dashboard de monitoramento
CREATE OR REPLACE VIEW archive_dashboard AS
SELECT 
    'Sistema de Arquivamento' as system_name,
    CASE 
        WHEN COUNT(s.id) > 0 THEN 'ATIVO'
        ELSE 'INATIVO'
    END as status,
    COUNT(s.id) as total_settings,
    COUNT(DISTINCT s.board_id) as configured_boards,
    (
        SELECT COUNT(*) 
        FROM cards c
        WHERE c.is_archived = false 
        AND c.status = 'done'
        AND c.completed_at IS NOT NULL
    ) as cards_ready_for_archive,
    (
        SELECT COUNT(*) 
        FROM archive_execution_log
        WHERE executed_at >= NOW() - INTERVAL '24 hours'
        AND status = 'success'
    ) as successful_executions_24h,
    (
        SELECT SUM(cards_archived)
        FROM archive_execution_log
        WHERE executed_at >= NOW() - INTERVAL '24 hours'
        AND status = 'success'
    ) as cards_archived_24h,
    (
        SELECT executed_at
        FROM archive_execution_log
        WHERE status = 'success'
        ORDER BY executed_at DESC
        LIMIT 1
    ) as last_successful_execution,
    (
        SELECT check_archive_system_health()
    ) as health_status
FROM archive_settings s
WHERE s.auto_archive_enabled = true;

-- 5. Ativar todas as configurações de arquivamento
UPDATE archive_settings 
SET auto_archive_enabled = true 
WHERE auto_archive_enabled = false;

-- 6. Testar o sistema
SELECT 
    'Teste do sistema de arquivamento' as status,
    cron_auto_archive() as resultado;

-- 7. Verificar saúde do sistema
SELECT 
    'Verificação de saúde do sistema' as status,
    check_archive_system_health() as health_info;

-- 8. Mostrar dashboard
SELECT * FROM archive_dashboard;

-- 9. Configurar execução automática (comentado - descomente se necessário)
/*
-- Para configurar cron job no Supabase (requer extensão pg_cron)
-- Execute apenas se a extensão estiver disponível

-- Executar a cada 6 horas
SELECT cron.schedule('auto-archive-every-6h', '0 */6 * * *', 'SELECT cron_auto_archive();');

-- Executar limpeza de logs semanalmente
SELECT cron.schedule('cleanup-logs-weekly', '0 2 * * 0', 'SELECT cleanup_archive_logs();');

-- Verificar saúde do sistema diariamente
SELECT cron.schedule('health-check-daily', '0 8 * * *', 'SELECT check_archive_system_health();');
*/

-- 10. Instruções para configuração manual
SELECT 
    'Instruções para configuração' as tipo,
    'Para ativar execução automática contínua:' as instrucao
UNION ALL
SELECT 
    '1. Edge Function',
    'Deploy da função auto-archive no Supabase Edge Functions'
UNION ALL
SELECT 
    '2. Cron Job',
    'Configure cron job para chamar a Edge Function a cada 6 horas'
UNION ALL
SELECT 
    '3. Monitoramento',
    'Use a view archive_dashboard para monitorar o sistema'
UNION ALL
SELECT 
    '4. Teste Manual',
    'Execute: SELECT cron_auto_archive(); para testar'
UNION ALL
SELECT 
    '5. Verificação',
    'Execute: SELECT check_archive_system_health(); para verificar saúde';
