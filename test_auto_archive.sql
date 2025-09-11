-- Script para testar o sistema de arquivamento automático
-- Execute este SQL no Editor SQL do Supabase

-- 1. Verificar se as tabelas necessárias existem
SELECT 
    'Verificação das tabelas' as status,
    table_name,
    CASE 
        WHEN table_name IN ('archive_folders', 'archive_settings', 'archived_cards', 'archive_history') 
        THEN 'OK' 
        ELSE 'FALTANDO' 
    END as status_tabela
FROM information_schema.tables 
WHERE table_name IN ('archive_folders', 'archive_settings', 'archived_cards', 'archive_history', 'cards')
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

-- 3. Verificar se a função de arquivamento automático existe
SELECT 
    'Verificação da função' as status,
    routine_name,
    routine_type,
    CASE 
        WHEN routine_name = 'auto_archive_completed_cards' 
        THEN 'OK' 
        ELSE 'FALTANDO' 
    END as status_funcao
FROM information_schema.routines 
WHERE routine_name = 'auto_archive_completed_cards';

-- 4. Verificar se há pastas de arquivo criadas
SELECT 
    'Verificação das pastas' as status,
    id,
    name,
    color,
    is_active
FROM archive_folders
ORDER BY id;

-- 5. Verificar configurações de arquivamento automático
SELECT 
    'Verificação das configurações' as status,
    id,
    board_id,
    auto_archive_enabled,
    archive_after_days,
    default_folder_id,
    created_at
FROM archive_settings
ORDER BY id;

-- 6. Verificar se há cards concluídos que podem ser arquivados
SELECT 
    'Cards concluídos disponíveis' as status,
    COUNT(*) as total_cards_concluidos,
    COUNT(*) FILTER (WHERE is_archived = false) as nao_arquivados,
    COUNT(*) FILTER (WHERE is_archived = true) as ja_arquivados
FROM cards 
WHERE status = 'done';

-- 7. Mostrar cards concluídos não arquivados com data de conclusão
SELECT 
    'Cards concluídos não arquivados' as status,
    id,
    title,
    status,
    completed_at,
    is_archived,
    CASE 
        WHEN completed_at IS NOT NULL 
        THEN EXTRACT(DAYS FROM (NOW() - completed_at))::integer
        ELSE NULL 
    END as dias_desde_conclusao
FROM cards 
WHERE status = 'done' 
AND is_archived = false
AND completed_at IS NOT NULL
ORDER BY completed_at DESC
LIMIT 10;

-- 8. Testar a função de arquivamento automático
SELECT 
    'Teste da função de arquivamento automático' as status,
    auto_archive_completed_cards() as cards_arquivados;

-- 9. Verificar se cards foram arquivados após o teste
SELECT 
    'Verificação pós-teste' as status,
    COUNT(*) as total_arquivados,
    COUNT(*) FILTER (WHERE auto_archived = true) as auto_arquivados,
    COUNT(*) FILTER (WHERE auto_archived = false) as manuais
FROM archived_cards;

-- 10. Mostrar histórico de arquivamento recente
SELECT 
    'Histórico recente de arquivamento' as status,
    ah.id,
    ah.card_id,
    ah.action,
    ah.performed_by,
    ah.performed_at,
    ah.details
FROM archive_history ah
ORDER BY ah.performed_at DESC
LIMIT 10;

-- 11. Verificar configurações atuais
SELECT 
    'Configurações atuais de arquivamento' as status,
    CASE 
        WHEN auto_archive_enabled THEN 'ATIVADO'
        ELSE 'DESATIVADO'
    END as status_arquivamento,
    archive_after_days as dias_para_arquivar,
    af.name as pasta_padrao
FROM archive_settings s
LEFT JOIN archive_folders af ON s.default_folder_id = af.id
WHERE s.board_id IS NULL; -- Configuração global

-- 12. Simular criação de um card concluído para teste
-- (Descomente as linhas abaixo se quiser criar um card de teste)
/*
INSERT INTO cards (title, description, status, board_id, list_name, user_id, completed_at)
VALUES (
    'Card de Teste - Arquivamento Automático',
    'Este é um card criado para testar o arquivamento automático',
    'done',
    'test-board',
    'Concluído',
    1,
    NOW() - INTERVAL '35 days' -- 35 dias atrás para ser arquivado
);
*/

-- 13. Verificar se há cards que deveriam ser arquivados mas não foram
SELECT 
    'Cards que deveriam ser arquivados' as status,
    c.id,
    c.title,
    c.completed_at,
    EXTRACT(DAYS FROM (NOW() - c.completed_at))::integer as dias_desde_conclusao,
    s.archive_after_days as limite_configurado,
    CASE 
        WHEN EXTRACT(DAYS FROM (NOW() - c.completed_at)) >= s.archive_after_days 
        THEN 'DEVERIA SER ARQUIVADO'
        ELSE 'AINDA DENTRO DO PRAZO'
    END as status_arquivamento
FROM cards c
LEFT JOIN archive_settings s ON s.board_id IS NULL -- Configuração global
WHERE c.status = 'done'
AND c.is_archived = false
AND c.completed_at IS NOT NULL
AND s.auto_archive_enabled = true
ORDER BY c.completed_at ASC;
