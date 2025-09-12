-- =====================================================
-- INSTALAÇÃO CORRIGIDA DO SISTEMA DE MÉTRICAS DE PERFORMANCE
-- =====================================================

-- Este script corrige o problema de ambiguidade de colunas
-- Execute os scripts nesta ordem:

-- 1. PRIMEIRO: Execute fix_cards_table_for_metrics.sql
-- 2. SEGUNDO: Execute create_performance_metrics.sql (versão corrigida)
-- 3. TERCEIRO: Execute test_performance_metrics.sql

-- Verificação inicial
SELECT 'Iniciando instalação corrigida do sistema de métricas...' as status;

-- Verificar se as tabelas existem
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

-- Verificar se as colunas necessárias existem
DO $$
DECLARE
    cards_has_completed_at BOOLEAN;
    cards_has_status BOOLEAN;
    cards_has_created_by BOOLEAN;
    subtasks_has_completed_at BOOLEAN;
    subtasks_has_status BOOLEAN;
BEGIN
    -- Verificar colunas da tabela cards
    SELECT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'cards' AND column_name = 'completed_at'
    ) INTO cards_has_completed_at;
    
    SELECT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'cards' AND column_name = 'status'
    ) INTO cards_has_status;
    
    SELECT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'cards' AND column_name = 'created_by'
    ) INTO cards_has_created_by;
    
    -- Verificar colunas da tabela subtasks
    SELECT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'subtasks' AND column_name = 'completed_at'
    ) INTO subtasks_has_completed_at;
    
    SELECT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'subtasks' AND column_name = 'status'
    ) INTO subtasks_has_status;
    
    -- Relatório de status
    RAISE NOTICE 'Status das colunas necessárias:';
    RAISE NOTICE 'cards.completed_at: %', CASE WHEN cards_has_completed_at THEN 'EXISTE' ELSE 'FALTANDO' END;
    RAISE NOTICE 'cards.status: %', CASE WHEN cards_has_status THEN 'EXISTE' ELSE 'FALTANDO' END;
    RAISE NOTICE 'cards.created_by: %', CASE WHEN cards_has_created_by THEN 'EXISTE' ELSE 'FALTANDO' END;
    RAISE NOTICE 'subtasks.completed_at: %', CASE WHEN subtasks_has_completed_at THEN 'EXISTE' ELSE 'FALTANDO' END;
    RAISE NOTICE 'subtasks.status: %', CASE WHEN subtasks_has_status THEN 'EXISTE' ELSE 'FALTANDO' END;
    
    -- Verificar se precisa executar a correção
    IF NOT cards_has_completed_at OR NOT cards_has_status OR NOT cards_has_created_by OR NOT subtasks_has_completed_at OR NOT subtasks_has_status THEN
        RAISE NOTICE 'ATENÇÃO: Execute primeiro o arquivo fix_cards_table_for_metrics.sql';
    ELSE
        RAISE NOTICE 'Todas as colunas necessárias existem. Pode prosseguir com create_performance_metrics.sql';
    END IF;
END $$;

-- Verificar se as funções já existem
SELECT 'Verificação de funções existentes:' as info;
SELECT routine_name, routine_type
FROM information_schema.routines 
WHERE routine_name LIKE 'get_%' 
  AND routine_schema = 'public'
ORDER BY routine_name;

-- Teste rápido das funções (se existirem)
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.routines WHERE routine_name = 'get_average_completion_time') THEN
        RAISE NOTICE 'Testando função get_average_completion_time...';
        PERFORM * FROM get_average_completion_time() LIMIT 1;
        RAISE NOTICE 'Função get_average_completion_time funcionando!';
    ELSE
        RAISE NOTICE 'Função get_average_completion_time não encontrada. Execute create_performance_metrics.sql';
    END IF;
    
    IF EXISTS (SELECT 1 FROM information_schema.routines WHERE routine_name = 'get_completion_rate') THEN
        RAISE NOTICE 'Testando função get_completion_rate...';
        PERFORM * FROM get_completion_rate() LIMIT 1;
        RAISE NOTICE 'Função get_completion_rate funcionando!';
    ELSE
        RAISE NOTICE 'Função get_completion_rate não encontrada. Execute create_performance_metrics.sql';
    END IF;
END $$;

-- Verificar dados de exemplo
SELECT 'Dados de exemplo - Cards:' as info;
SELECT COUNT(*) as total_cards,
       COUNT(CASE WHEN status = 'done' THEN 1 END) as completed_cards,
       COUNT(CASE WHEN status != 'done' THEN 1 END) as pending_cards
FROM cards 
WHERE is_archived = false;

SELECT 'Dados de exemplo - Subtasks:' as info;
SELECT COUNT(*) as total_subtasks,
       COUNT(CASE WHEN status = 'done' THEN 1 END) as completed_subtasks,
       COUNT(CASE WHEN status != 'done' THEN 1 END) as pending_subtasks
FROM subtasks;

-- Instruções finais
SELECT 'INSTRUÇÕES DE INSTALAÇÃO CORRIGIDA:' as info;
SELECT '1. Execute: fix_cards_table_for_metrics.sql (adiciona colunas necessárias)' as passo1;
SELECT '2. Execute: create_performance_metrics.sql (versão corrigida com prefixos p_)' as passo2;
SELECT '3. Execute: test_performance_metrics.sql (testa todas as funções)' as passo3;
SELECT '4. Reinicie a aplicação para carregar as novas funcionalidades' as passo4;

-- Verificar se há problemas de ambiguidade
SELECT 'Verificação de possíveis conflitos de nomes:' as info;
SELECT column_name, table_name
FROM information_schema.columns 
WHERE column_name IN ('start_date', 'end_date', 'board_id', 'period_type', 'report_month')
ORDER BY column_name, table_name;

