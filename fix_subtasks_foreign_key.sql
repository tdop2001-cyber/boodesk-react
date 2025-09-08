-- Script para corrigir o problema de foreign key das subtarefas
-- Execute este SQL no Editor SQL do Supabase

-- 1. Verificar se a tabela subtasks foi criada corretamente
SELECT 
    'Verificando se a tabela subtasks foi criada' as status,
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'subtasks'
ORDER BY ordinal_position;

-- 2. Verificar quais cards existem na tabela cards
SELECT 
    'Verificando cards disponíveis' as status,
    id,
    title,
    created_at
FROM cards
ORDER BY id;

-- 3. Verificar se há subtarefas com card_id inválido
SELECT 
    'Verificando subtarefas com card_id inválido' as status,
    s.id as subtask_id,
    s.card_id,
    s.title as subtask_title,
    c.id as card_exists
FROM subtasks s
LEFT JOIN cards c ON c.id = s.card_id
WHERE c.id IS NULL;

-- 4. Remover subtarefas com card_id inválido (se houver)
DELETE FROM subtasks 
WHERE card_id NOT IN (SELECT id FROM cards);

-- 5. Verificar se a limpeza funcionou
SELECT 
    'Verificando subtarefas após limpeza' as status,
    COUNT(*) as total_subtasks
FROM subtasks;

-- 6. Inserir dados de teste com card_id válido
INSERT INTO subtasks (card_id, title, description, priority, due_date, status, members, created_by) 
SELECT 
    (SELECT MIN(id) FROM cards LIMIT 1), 
    'TESTE1', 
    'Primeira subtarefa de teste', 
    'medium', 
    '2025-09-30', 
    'todo', 
    '["1", "2"]', 
    1
WHERE EXISTS (SELECT 1 FROM cards LIMIT 1);

INSERT INTO subtasks (card_id, title, description, priority, due_date, status, members, created_by) 
SELECT 
    (SELECT MIN(id) FROM cards LIMIT 1), 
    'TESTE2', 
    'Segunda subtarefa de teste', 
    'high', 
    '2025-10-01', 
    'in_progress', 
    '["1"]', 
    1
WHERE EXISTS (SELECT 1 FROM cards LIMIT 1);

-- 7. Verificar se os dados foram inseridos corretamente
SELECT 
    'Verificação dos dados inseridos' as status,
    COUNT(*) as total_subtasks,
    COUNT(CASE WHEN status = 'todo' THEN 1 END) as subtasks_todo,
    COUNT(CASE WHEN status = 'in_progress' THEN 1 END) as subtasks_in_progress,
    COUNT(CASE WHEN status = 'completed' THEN 1 END) as subtasks_completed
FROM subtasks;

-- 8. Mostrar todas as subtarefas com informações do card
SELECT 
    'Todas as subtarefas criadas' as status,
    s.id,
    s.title,
    s.status,
    s.priority,
    s.members,
    s.created_by,
    c.title as card_title,
    c.id as card_id,
    u.username as created_by_username
FROM subtasks s
LEFT JOIN cards c ON c.id = s.card_id
LEFT JOIN users u ON u.id = s.created_by
ORDER BY s.created_at DESC;

-- 9. Verificar se o trigger está funcionando
SELECT 
    'Verificação do contador de subtarefas' as status,
    c.id as card_id,
    c.title as card_title,
    c.subtasks_count,
    COUNT(s.id) as subtasks_reais
FROM cards c
LEFT JOIN subtasks s ON s.card_id = c.id
GROUP BY c.id, c.title, c.subtasks_count
ORDER BY c.id;

-- 10. Teste de funcionalidade - buscar subtarefas por card
SELECT 
    'Teste de busca de subtarefas por card' as status,
    s.id,
    s.title,
    s.status,
    s.members,
    c.title as card_title,
    u.username as created_by_username
FROM subtasks s
LEFT JOIN cards c ON c.id = s.card_id
LEFT JOIN users u ON u.id = s.created_by
WHERE c.id IS NOT NULL
ORDER BY s.created_at DESC;

-- 11. Verificar foreign keys
SELECT 
    'Verificando foreign keys da tabela subtasks' as status,
    constraint_name,
    constraint_type,
    table_name
FROM information_schema.table_constraints 
WHERE table_name = 'subtasks' AND constraint_type = 'FOREIGN KEY';

