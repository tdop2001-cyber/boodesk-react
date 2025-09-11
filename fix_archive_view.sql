-- Corrigir a view de cards arquivados
-- Execute este SQL no Editor SQL do Supabase

-- 1. Remover a view existente se houver problemas
DROP VIEW IF EXISTS archived_cards_view;

-- 2. Criar uma view mais simples e robusta
CREATE OR REPLACE VIEW archived_cards_view AS
SELECT 
    c.id,
    c.title,
    c.description,
    c.status,
    c.importance as priority,
    c.created_at,
    c.completed_at,
    c.archived_at,
    c.is_archived,
    c.list_name as column_name,
    c.board_id,
    af.name as archive_folder_name,
    af.color as archive_folder_color,
    af.icon as archive_folder_icon,
    COALESCE(u.username, 'Sistema') as archived_by_username,
    COALESCE(u.nome_completo, u.username, 'Sistema') as archived_by_name,
    CASE 
        WHEN b.name IS NOT NULL THEN b.name
        ELSE 'Board não encontrado'
    END as board_name
FROM cards c
LEFT JOIN archive_folders af ON c.archive_folder_id = af.id
LEFT JOIN users u ON c.archived_by = u.id
LEFT JOIN boards b ON c.board_id = b.board_id
WHERE c.is_archived = true;

-- 3. Verificar se a view foi criada corretamente
SELECT 
    'Verificação da view criada' as status,
    COUNT(*) as view_exists
FROM information_schema.views 
WHERE table_name = 'archived_cards_view';

-- 4. Testar a view
SELECT 
    'Teste da view - cards arquivados' as status,
    COUNT(*) as total_archived_cards
FROM archived_cards_view;

-- 5. Mostrar estrutura da view
SELECT 
    column_name,
    data_type,
    is_nullable
FROM information_schema.columns 
WHERE table_name = 'archived_cards_view'
ORDER BY ordinal_position;
