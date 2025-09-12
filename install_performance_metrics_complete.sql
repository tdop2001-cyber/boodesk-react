-- =====================================================
-- INSTALAÇÃO COMPLETA DO SISTEMA DE MÉTRICAS DE PERFORMANCE
-- =====================================================

-- Este script deve ser executado em ordem:
-- 1. Primeiro execute: fix_cards_table_for_metrics.sql
-- 2. Depois execute: create_performance_metrics.sql

-- Verificação inicial
SELECT 'Iniciando instalação do sistema de métricas de performance...' as status;

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

-- Verificar estrutura atual das tabelas
SELECT 'Estrutura atual da tabela cards:' as info;
SELECT column_name, data_type, is_nullable
FROM information_schema.columns 
WHERE table_name = 'cards' 
ORDER BY ordinal_position;

SELECT 'Estrutura atual da tabela subtasks:' as info;
SELECT column_name, data_type, is_nullable
FROM information_schema.columns 
WHERE table_name = 'subtasks' 
ORDER BY ordinal_position;

-- Instruções para o usuário
SELECT 'INSTRUÇÕES DE INSTALAÇÃO:' as info;
SELECT '1. Execute primeiro o arquivo: fix_cards_table_for_metrics.sql' as passo1;
SELECT '2. Execute depois o arquivo: create_performance_metrics.sql' as passo2;
SELECT '3. Execute o arquivo: test_performance_metrics.sql para testar' as passo3;

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

-- Verificar se as funções já existem
SELECT 'Verificação de funções existentes:' as info;
SELECT routine_name, routine_type
FROM information_schema.routines 
WHERE routine_name LIKE 'get_%' 
  AND routine_schema = 'public'
ORDER BY routine_name;

-- Instruções finais
SELECT 'PRÓXIMOS PASSOS:' as info;
SELECT '1. Se alguma coluna estiver faltando, execute: fix_cards_table_for_metrics.sql' as passo1;
SELECT '2. Execute: create_performance_metrics.sql para criar as funções' as passo2;
SELECT '3. Execute: test_performance_metrics.sql para testar o sistema' as passo3;
SELECT '4. Reinicie a aplicação para carregar as novas funcionalidades' as passo4;

