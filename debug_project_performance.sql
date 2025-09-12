-- =====================================================
-- DIAGNÓSTICO DO PROBLEMA DE PERFORMANCE POR PROJETO
-- =====================================================

-- 1. VERIFICAR ESTRUTURA DAS TABELAS
SELECT 
    'boards' as tabela,
    column_name,
    data_type,
    is_nullable
FROM information_schema.columns 
WHERE table_name = 'boards' 
ORDER BY ordinal_position;

SELECT 
    'cards' as tabela,
    column_name,
    data_type,
    is_nullable
FROM information_schema.columns 
WHERE table_name = 'cards' 
ORDER BY ordinal_position;

-- 2. VERIFICAR DADOS NAS TABELAS
SELECT 'BOARDS:' as info;
SELECT id, name, board_id, created_at FROM boards ORDER BY id;

SELECT 'CARDS:' as info;
SELECT id, board_id, title, status, created_at FROM cards ORDER BY id LIMIT 10;

-- 3. VERIFICAR RELACIONAMENTO ENTRE BOARDS E CARDS
SELECT 'RELACIONAMENTO BOARDS-CARDS:' as info;
SELECT 
    b.id as board_id,
    b.name as board_name,
    b.board_id as board_board_id,
    COUNT(c.id) as total_cards,
    COUNT(CASE WHEN c.status = 'done' THEN 1 END) as completed_cards
FROM boards b
LEFT JOIN cards c ON 
    CASE 
        WHEN c.board_id ~ '^board-' THEN 
            REPLACE(c.board_id, 'board-', '')::BIGINT
        ELSE 
            c.board_id::BIGINT
    END = b.id::BIGINT
GROUP BY b.id, b.name, b.board_id
ORDER BY b.id;

-- 4. TESTAR A FUNÇÃO get_project_performance
SELECT 'TESTE FUNÇÃO get_project_performance:' as info;
SELECT * FROM get_project_performance();

-- 5. VERIFICAR SE HÁ CARDS SEM BOARD VÁLIDO
SELECT 'CARDS SEM BOARD VÁLIDO:' as info;
SELECT 
    c.id,
    c.board_id,
    c.title,
    c.status,
    CASE 
        WHEN b.id IS NULL THEN 'SEM BOARD'
        ELSE 'COM BOARD'
    END as status_board
FROM cards c
LEFT JOIN boards b ON b.id::BIGINT = c.board_id::BIGINT
WHERE b.id IS NULL
LIMIT 10;

-- 6. VERIFICAR SE HÁ BOARDS SEM CARDS
SELECT 'BOARDS SEM CARDS:' as info;
SELECT 
    b.id,
    b.name,
    b.board_id,
    COUNT(c.id) as total_cards
FROM boards b
LEFT JOIN cards c ON 
    CASE 
        WHEN c.board_id ~ '^board-' THEN 
            REPLACE(c.board_id, 'board-', '')::BIGINT
        ELSE 
            c.board_id::BIGINT
    END = b.id::BIGINT
GROUP BY b.id, b.name, b.board_id
HAVING COUNT(c.id) = 0;

-- 7. VERIFICAR TIPOS DE DADOS E CONVERSÕES
SELECT 'VERIFICAÇÃO DE TIPOS:' as info;
SELECT 
    'boards.id' as campo,
    pg_typeof(id) as tipo,
    MIN(id) as min_valor,
    MAX(id) as max_valor
FROM boards
UNION ALL
SELECT 
    'cards.board_id' as campo,
    pg_typeof(board_id) as tipo,
    MIN(board_id) as min_valor,
    MAX(board_id) as max_valor
FROM cards
WHERE board_id IS NOT NULL;
