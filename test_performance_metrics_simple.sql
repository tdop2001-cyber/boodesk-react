-- =====================================================
-- TESTE SIMPLES DAS FUNÇÕES DE MÉTRICAS DE PERFORMANCE
-- =====================================================

-- 1. Verificar se as funções existem
SELECT 'Verificação de funções existentes:' as info;
SELECT routine_name, routine_type
FROM information_schema.routines 
WHERE routine_name LIKE 'get_%' 
  AND routine_schema = 'public'
ORDER BY routine_name;

-- 2. Teste básico - tempo médio de conclusão
SELECT 'Teste: Tempo Médio de Conclusão' as teste;
SELECT * FROM get_average_completion_time();

-- 3. Teste básico - taxa de conclusão
SELECT 'Teste: Taxa de Conclusão' as teste;
SELECT * FROM get_completion_rate();

-- 4. Teste básico - produtividade por usuário
SELECT 'Teste: Produtividade por Usuário' as teste;
SELECT * FROM get_user_productivity();

-- 5. Teste básico - tendências de produtividade
SELECT 'Teste: Tendências de Produtividade (Mensal)' as teste;
SELECT * FROM get_productivity_trends('month');

-- 6. Teste básico - performance por projeto
SELECT 'Teste: Performance por Projeto' as teste;
SELECT * FROM get_project_performance();

-- 7. Teste básico - métricas de subtasks
SELECT 'Teste: Métricas de Subtasks' as teste;
SELECT * FROM get_subtask_metrics();

-- 8. Teste básico - relatório mensal
SELECT 'Teste: Relatório Mensal' as teste;
SELECT * FROM get_monthly_report();

-- 9. Verificar dados nas tabelas
SELECT 'Verificação: Dados nas Tabelas' as teste;
SELECT 
    'Cards' as tabela,
    COUNT(*) as total,
    COUNT(CASE WHEN status = 'done' THEN 1 END) as concluidos,
    COUNT(CASE WHEN status != 'done' THEN 1 END) as pendentes
FROM cards 
WHERE is_archived = false;

SELECT 
    'Subtasks' as tabela,
    COUNT(*) as total,
    COUNT(CASE WHEN status = 'done' THEN 1 END) as concluidas,
    COUNT(CASE WHEN status != 'done' THEN 1 END) as pendentes
FROM subtasks;

SELECT 
    'Users' as tabela,
    COUNT(*) as total
FROM users;

SELECT 
    'Boards' as tabela,
    COUNT(*) as total
FROM boards;

-- 10. Verificar estrutura das tabelas
SELECT 'Estrutura da tabela users:' as info;
SELECT column_name, data_type, character_maximum_length
FROM information_schema.columns 
WHERE table_name = 'users' 
ORDER BY ordinal_position;

SELECT 'Estrutura da tabela boards:' as info;
SELECT column_name, data_type, character_maximum_length
FROM information_schema.columns 
WHERE table_name = 'boards' 
ORDER BY ordinal_position;

-- 11. Teste com parâmetros nomeados
SELECT 'Teste: Com Parâmetros Nomeados' as teste;
SELECT * FROM get_average_completion_time(
    p_start_date := (CURRENT_DATE - INTERVAL '30 days')::DATE,
    p_end_date := CURRENT_DATE
);

-- 12. Verificar se há dados suficientes para teste
SELECT 'Verificação: Dados para Teste' as teste;
SELECT 
    'Cards com created_by' as info,
    COUNT(*) as total
FROM cards 
WHERE created_by IS NOT NULL;

SELECT 
    'Cards com status done' as info,
    COUNT(*) as total
FROM cards 
WHERE status = 'done';

SELECT 
    'Subtasks com status done' as info,
    COUNT(*) as total
FROM subtasks 
WHERE status = 'done';





