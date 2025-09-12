-- =====================================================
-- TESTE DIRETO DA FUNÇÃO get_project_performance
-- =====================================================

-- Este script testa diretamente se a função está funcionando

-- 1. VERIFICAR SE A FUNÇÃO EXISTE
SELECT 'VERIFICAÇÃO DA FUNÇÃO:' as info;
SELECT 
    routine_name,
    routine_type,
    data_type
FROM information_schema.routines 
WHERE routine_name = 'get_project_performance';

-- 2. TESTAR A FUNÇÃO SEM PARÂMETROS
SELECT 'TESTE SEM PARÂMETROS:' as info;
SELECT * FROM get_project_performance();

-- 3. TESTAR A FUNÇÃO COM PARÂMETROS
SELECT 'TESTE COM PARÂMETROS (últimos 30 dias):' as info;
SELECT * FROM get_project_performance(
    p_start_date => CURRENT_DATE - INTERVAL '30 days',
    p_end_date => CURRENT_DATE
);

-- 4. VERIFICAR DADOS BRUTOS DAS TABELAS
SELECT 'DADOS BRUTOS - BOARDS:' as info;
SELECT id, name, created_at FROM boards ORDER BY id;

SELECT 'DADOS BRUTOS - CARDS:' as info;
SELECT id, board_id, title, status, created_at FROM cards ORDER BY id LIMIT 10;

-- 5. TESTAR JOIN MANUAL
SELECT 'TESTE JOIN MANUAL:' as info;
SELECT 
    b.id as board_id,
    b.name as board_name,
    COUNT(c.id) as total_cards,
    COUNT(CASE WHEN c.status = 'done' THEN 1 END) as completed_cards
FROM boards b
LEFT JOIN cards c ON 
    CASE 
        WHEN c.board_id ~ '^board-' THEN 
            REPLACE(c.board_id, 'board-', '')::BIGINT
        WHEN c.board_id ~ '^[0-9]+$' THEN 
            c.board_id::BIGINT
        ELSE 
            NULL
    END = b.id::BIGINT
    AND (c.is_archived = false OR c.is_archived IS NULL)
GROUP BY b.id, b.name
ORDER BY b.id;

-- 6. VERIFICAR SE HÁ CARDS COM PREFIXO
SELECT 'CARDS COM PREFIXO board-:' as info;
SELECT 
    board_id,
    COUNT(*) as quantidade,
    MIN(created_at) as primeiro,
    MAX(created_at) as ultimo
FROM cards 
WHERE board_id ~ '^board-'
GROUP BY board_id
ORDER BY quantidade DESC;

-- 7. VERIFICAR SE HÁ CARDS SEM PREFIXO
SELECT 'CARDS SEM PREFIXO:' as info;
SELECT 
    board_id,
    COUNT(*) as quantidade,
    MIN(created_at) as primeiro,
    MAX(created_at) as ultimo
FROM cards 
WHERE board_id ~ '^[0-9]+$'
GROUP BY board_id
ORDER BY quantidade DESC;
