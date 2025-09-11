-- Script para testar o sistema de arquivamento
-- Execute este SQL no Editor SQL do Supabase

-- 1. Verificar se as tabelas existem
SELECT 
    'Verificação das tabelas' as status,
    table_name,
    CASE 
        WHEN table_name IN ('archive_folders', 'archived_cards', 'archive_settings', 'archive_history') 
        THEN 'OK' 
        ELSE 'FALTANDO' 
    END as status_tabela
FROM information_schema.tables 
WHERE table_name IN ('archive_folders', 'archived_cards', 'archive_settings', 'archive_history', 'cards')
ORDER BY table_name;

-- 2. Verificar se as colunas de arquivamento existem na tabela cards
SELECT 
    'Verificação das colunas em cards' as status,
    column_name,
    data_type,
    is_nullable
FROM information_schema.columns 
WHERE table_name = 'cards' 
AND column_name IN ('is_archived', 'archived_at', 'archived_by', 'archive_folder_id', 'completed_at')
ORDER BY column_name;

-- 3. Verificar se as pastas padrão foram criadas
SELECT 
    'Verificação das pastas padrão' as status,
    id,
    name,
    color,
    is_active
FROM archive_folders
ORDER BY id;

-- 4. Verificar se há cards concluídos que podem ser arquivados
SELECT 
    'Cards concluídos disponíveis para arquivamento' as status,
    COUNT(*) as total_cards_concluidos
FROM cards 
WHERE status = 'done' 
AND is_archived = false;

-- 5. Verificar se há cards já arquivados
SELECT 
    'Cards já arquivados' as status,
    COUNT(*) as total_cards_arquivados
FROM cards 
WHERE is_archived = true;

-- 6. Testar a função de arquivamento automático
SELECT 
    'Teste da função de arquivamento automático' as status,
    auto_archive_completed_cards() as resultado;

-- 7. Verificar estatísticas do banco
SELECT 
    'Estatísticas do banco' as status,
    get_database_stats() as stats;

-- 8. Mostrar configurações de limpeza (se existirem)
SELECT 
    'Configurações de limpeza' as status,
    cleanup_type,
    enabled,
    retention_days,
    last_cleanup,
    next_cleanup
FROM cleanup_settings
ORDER BY cleanup_type;
