-- Sistema de Arquivamento Automático Contínuo
-- Execute este SQL no Editor SQL do Supabase

-- 1. Criar função para verificar e executar arquivamento automático
CREATE OR REPLACE FUNCTION check_and_archive_cards()
RETURNS INTEGER AS $$
DECLARE
    archived_count INTEGER := 0;
    settings_record RECORD;
    card_record RECORD;
BEGIN
    -- Buscar todas as configurações ativas
    FOR settings_record IN 
        SELECT * FROM archive_settings 
        WHERE auto_archive_enabled = true
    LOOP
        -- Buscar cards que devem ser arquivados
        FOR card_record IN 
            SELECT c.* FROM cards c
            WHERE c.is_archived = false 
            AND c.status = 'done'
            AND c.completed_at IS NOT NULL
            AND c.completed_at <= NOW() - INTERVAL '1 day' * settings_record.archive_after_days
            AND (
                settings_record.board_id IS NULL 
                OR c.board_id = settings_record.board_id
            )
        LOOP
            -- Arquivar o card
            UPDATE cards 
            SET 
                is_archived = true,
                archived_at = NOW(),
                archived_by = card_record.user_id,
                archive_folder_id = COALESCE(settings_record.default_folder_id, 1)
            WHERE id = card_record.id;
            
            -- Inserir no histórico de arquivo
            INSERT INTO archived_cards (
                original_card_id,
                archive_folder_id,
                archived_by,
                archive_reason,
                auto_archived
            ) VALUES (
                card_record.id,
                COALESCE(settings_record.default_folder_id, 1),
                card_record.user_id,
                'Arquivamento automático após ' || settings_record.archive_after_days || ' dias',
                true
            );
            
            -- Inserir no histórico
            INSERT INTO archive_history (
                card_id,
                action,
                performed_by,
                archive_folder_id,
                details
            ) VALUES (
                card_record.id,
                'auto_archived',
                card_record.user_id,
                COALESCE(settings_record.default_folder_id, 1),
                jsonb_build_object(
                    'reason', 'Arquivamento automático',
                    'days_after_completion', settings_record.archive_after_days,
                    'settings_id', settings_record.id
                )
            );
            
            archived_count := archived_count + 1;
        END LOOP;
    END LOOP;
    
    -- Log da execução
    INSERT INTO archive_history (
        card_id,
        action,
        performed_by,
        details
    ) VALUES (
        NULL,
        'auto_archive_check',
        1, -- Sistema
        jsonb_build_object(
            'cards_archived', archived_count,
            'executed_at', NOW(),
            'execution_type', 'scheduled'
        )
    );
    
    RETURN archived_count;
END;
$$ LANGUAGE plpgsql;

-- 2. Criar tabela para controle de execução
CREATE TABLE IF NOT EXISTS archive_execution_log (
    id SERIAL PRIMARY KEY,
    executed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    cards_archived INTEGER DEFAULT 0,
    execution_duration_ms INTEGER,
    status VARCHAR(20) DEFAULT 'success',
    error_message TEXT,
    settings_checked INTEGER DEFAULT 0
);

-- 3. Criar função melhorada com logging
CREATE OR REPLACE FUNCTION execute_auto_archive_with_logging()
RETURNS JSONB AS $$
DECLARE
    start_time TIMESTAMP;
    end_time TIMESTAMP;
    duration_ms INTEGER;
    archived_count INTEGER;
    settings_count INTEGER;
    result JSONB;
BEGIN
    start_time := clock_timestamp();
    
    -- Contar configurações ativas
    SELECT COUNT(*) INTO settings_count
    FROM archive_settings 
    WHERE auto_archive_enabled = true;
    
    -- Executar arquivamento
    SELECT check_and_archive_cards() INTO archived_count;
    
    end_time := clock_timestamp();
    duration_ms := EXTRACT(EPOCH FROM (end_time - start_time)) * 1000;
    
    -- Log da execução
    INSERT INTO archive_execution_log (
        executed_at,
        cards_archived,
        execution_duration_ms,
        status,
        settings_checked
    ) VALUES (
        start_time,
        archived_count,
        duration_ms,
        'success',
        settings_count
    );
    
    -- Retornar resultado
    result := jsonb_build_object(
        'success', true,
        'cards_archived', archived_count,
        'settings_checked', settings_count,
        'execution_time_ms', duration_ms,
        'executed_at', start_time
    );
    
    RETURN result;
    
EXCEPTION
    WHEN OTHERS THEN
        -- Log do erro
        INSERT INTO archive_execution_log (
            executed_at,
            cards_archived,
            execution_duration_ms,
            status,
            error_message
        ) VALUES (
            clock_timestamp(),
            0,
            EXTRACT(EPOCH FROM (clock_timestamp() - start_time)) * 1000,
            'error',
            SQLERRM
        );
        
        -- Retornar erro
        result := jsonb_build_object(
            'success', false,
            'error', SQLERRM,
            'executed_at', clock_timestamp()
        );
        
        RETURN result;
END;
$$ LANGUAGE plpgsql;

-- 4. Criar função para monitoramento
CREATE OR REPLACE FUNCTION get_archive_system_status()
RETURNS JSONB AS $$
DECLARE
    result JSONB;
    active_settings INTEGER;
    total_cards_pending INTEGER;
    last_execution RECORD;
    next_cards_to_archive INTEGER;
BEGIN
    -- Contar configurações ativas
    SELECT COUNT(*) INTO active_settings
    FROM archive_settings 
    WHERE auto_archive_enabled = true;
    
    -- Contar cards que podem ser arquivados
    SELECT COUNT(*) INTO total_cards_pending
    FROM cards c
    JOIN archive_settings s ON (s.board_id IS NULL OR c.board_id = s.board_id)
    WHERE c.is_archived = false 
    AND c.status = 'done'
    AND c.completed_at IS NOT NULL
    AND s.auto_archive_enabled = true
    AND c.completed_at <= NOW() - INTERVAL '1 day' * s.archive_after_days;
    
    -- Contar cards que serão arquivados na próxima execução
    SELECT COUNT(*) INTO next_cards_to_archive
    FROM cards c
    JOIN archive_settings s ON (s.board_id IS NULL OR c.board_id = s.board_id)
    WHERE c.is_archived = false 
    AND c.status = 'done'
    AND c.completed_at IS NOT NULL
    AND s.auto_archive_enabled = true
    AND c.completed_at <= NOW() - INTERVAL '1 day' * s.archive_after_days;
    
    -- Última execução
    SELECT * INTO last_execution
    FROM archive_execution_log
    ORDER BY executed_at DESC
    LIMIT 1;
    
    -- Montar resultado
    result := jsonb_build_object(
        'system_status', CASE WHEN active_settings > 0 THEN 'active' ELSE 'inactive' END,
        'active_settings', active_settings,
        'cards_pending_archive', total_cards_pending,
        'next_execution_will_archive', next_cards_to_archive,
        'last_execution', CASE 
            WHEN last_execution.id IS NOT NULL THEN
                jsonb_build_object(
                    'executed_at', last_execution.executed_at,
                    'cards_archived', last_execution.cards_archived,
                    'duration_ms', last_execution.execution_duration_ms,
                    'status', last_execution.status
                )
            ELSE NULL
        END,
        'recommendations', CASE
            WHEN active_settings = 0 THEN 'Ativar pelo menos uma configuração de arquivamento'
            WHEN total_cards_pending > 0 THEN 'Executar arquivamento manual para processar cards pendentes'
            ELSE 'Sistema funcionando normalmente'
        END
    );
    
    RETURN result;
END;
$$ LANGUAGE plpgsql;

-- 5. Criar view para monitoramento em tempo real
CREATE OR REPLACE VIEW archive_system_monitor AS
SELECT 
    'Sistema de Arquivamento Automático' as system_name,
    CASE 
        WHEN COUNT(s.id) > 0 THEN 'ATIVO'
        ELSE 'INATIVO'
    END as status,
    COUNT(s.id) as active_settings,
    COUNT(DISTINCT s.board_id) as configured_boards,
    COALESCE(SUM(s.archive_after_days), 0) as total_days_config,
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
    ) as executions_last_24h,
    (
        SELECT SUM(cards_archived)
        FROM archive_execution_log
        WHERE executed_at >= NOW() - INTERVAL '24 hours'
    ) as cards_archived_last_24h
FROM archive_settings s
WHERE s.auto_archive_enabled = true;

-- 6. Ativar arquivamento automático global
-- Primeiro, verificar se já existe configuração global
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM archive_settings WHERE board_id IS NULL) THEN
        INSERT INTO archive_settings (board_id, auto_archive_enabled, archive_after_days, default_folder_id, created_by) 
        VALUES (NULL, true, 30, 1, 1);
    ELSE
        UPDATE archive_settings 
        SET auto_archive_enabled = true,
            archive_after_days = 30,
            updated_at = NOW()
        WHERE board_id IS NULL;
    END IF;
END $$;

-- 7. Testar o sistema
SELECT 
    'Teste do sistema de arquivamento automático' as status,
    execute_auto_archive_with_logging() as resultado;

-- 8. Verificar status do sistema
SELECT 
    'Status do sistema' as status,
    get_archive_system_status() as system_info;

-- 9. Mostrar monitoramento
SELECT * FROM archive_system_monitor;

-- 10. Verificar logs de execução
SELECT 
    'Logs de execução recentes' as status,
    executed_at,
    cards_archived,
    execution_duration_ms,
    status as execution_status,
    settings_checked
FROM archive_execution_log
ORDER BY executed_at DESC
LIMIT 10;
