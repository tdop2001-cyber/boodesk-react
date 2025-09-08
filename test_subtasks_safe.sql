-- Script seguro para testar subtarefas
-- Execute este SQL no Editor SQL do Supabase

-- 1. Verificar se a tabela subtasks existe
SELECT 
    'Verificando se a tabela subtasks existe' as status,
    CASE 
        WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'subtasks')
        THEN 'EXISTE'
        ELSE 'NÃO EXISTE'
    END as tabela_status;

-- 2. Verificar estrutura da tabela subtasks
SELECT 
    'Estrutura da tabela subtasks' as status,
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'subtasks'
ORDER BY ordinal_position;

-- 3. Verificar quais cards existem
SELECT 
    'Cards disponíveis' as status,
    id,
    title,
    created_at
FROM cards
ORDER BY id
LIMIT 10;

-- 4. Verificar se há subtarefas existentes
SELECT 
    'Subtarefas existentes' as status,
    COUNT(*) as total_subtasks
FROM subtasks;

-- 5. Mostrar subtarefas existentes (se houver)
SELECT 
    'Subtarefas existentes' as status,
    s.id,
    s.title,
    s.status,
    s.card_id,
    c.title as card_title
FROM subtasks s
LEFT JOIN cards c ON c.id = s.card_id
ORDER BY s.created_at DESC
LIMIT 5;

-- 6. Inserir dados de teste apenas se houver cards
INSERT INTO subtasks (card_id, title, description, priority, due_date, status, members, created_by) 
SELECT 
    (SELECT MIN(id) FROM cards LIMIT 1), 
    'TESTE SEGURO', 
    'Subtarefa de teste criada com segurança', 
    'medium', 
    '2025-09-30', 
    'todo', 
    '["1"]', 
    1
WHERE EXISTS (SELECT 1 FROM cards LIMIT 1)
ON CONFLICT DO NOTHING;

-- 7. Verificar se a inserção funcionou
SELECT 
    'Verificação após inserção' as status,
    COUNT(*) as total_subtasks,
    COUNT(CASE WHEN title = 'TESTE SEGURO' THEN 1 END) as subtasks_teste
FROM subtasks;

-- 8. Mostrar todas as subtarefas
SELECT 
    'Todas as subtarefas' as status,
    s.id,
    s.title,
    s.status,
    s.priority,
    s.members,
    s.created_by,
    c.title as card_title,
    u.username as created_by_username
FROM subtasks s
LEFT JOIN cards c ON c.id = s.card_id
LEFT JOIN users u ON u.id = s.created_by
ORDER BY s.created_at DESC;

-- 9. Teste de busca por membros
SELECT 
    'Teste de busca por membros' as status,
    s.id,
    s.title,
    s.members,
    s.status
FROM subtasks s
WHERE s.members @> '["1"]'
ORDER BY s.created_at DESC;

-- 10. Verificar se o trigger está funcionando
SELECT 
    'Verificação do contador' as status,
    c.id as card_id,
    c.title as card_title,
    c.subtasks_count,
    COUNT(s.id) as subtasks_reais
FROM cards c
LEFT JOIN subtasks s ON s.card_id = c.id
WHERE c.id IN (SELECT DISTINCT card_id FROM subtasks)
GROUP BY c.id, c.title, c.subtasks_count
ORDER BY c.id;

