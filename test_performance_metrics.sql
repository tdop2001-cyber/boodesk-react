-- =====================================================
-- TESTE DAS FUNÇÕES DE MÉTRICAS DE PERFORMANCE
-- =====================================================

-- 1. Testar função de tempo médio de conclusão
SELECT 'Teste: Tempo Médio de Conclusão' as teste;
SELECT * FROM get_average_completion_time();

-- 2. Testar função de taxa de conclusão
SELECT 'Teste: Taxa de Conclusão' as teste;
SELECT * FROM get_completion_rate();

-- 3. Testar função de produtividade por usuário
SELECT 'Teste: Produtividade por Usuário' as teste;
SELECT * FROM get_user_productivity();

-- 4. Testar função de tendências de produtividade
SELECT 'Teste: Tendências de Produtividade (Mensal)' as teste;
SELECT * FROM get_productivity_trends('month');

SELECT 'Teste: Tendências de Produtividade (Semanal)' as teste;
SELECT * FROM get_productivity_trends('week');

-- 5. Testar função de performance por projeto
SELECT 'Teste: Performance por Projeto' as teste;
SELECT * FROM get_project_performance();

-- 6. Testar função de métricas de subtasks
SELECT 'Teste: Métricas de Subtasks' as teste;
SELECT * FROM get_subtask_metrics();

-- 7. Testar função de relatório mensal
SELECT 'Teste: Relatório Mensal' as teste;
SELECT * FROM get_monthly_report();

-- 8. Testar com filtros de data (últimos 30 dias)
SELECT 'Teste: Métricas dos Últimos 30 Dias' as teste;
SELECT 
    'Tempo Médio' as metrica,
    avg_completion_days,
    total_cards,
    completed_cards
FROM get_average_completion_time(
    p_start_date := (CURRENT_DATE - INTERVAL '30 days')::DATE,
    p_end_date := CURRENT_DATE
);

SELECT 
    'Taxa de Conclusão' as metrica,
    completion_rate,
    total_created,
    total_completed,
    pending_cards
FROM get_completion_rate(
    p_start_date := (CURRENT_DATE - INTERVAL '30 days')::DATE,
    p_end_date := CURRENT_DATE
);

-- 9. Testar com filtro de board específico
SELECT 'Teste: Métricas por Board (ID 1)' as teste;
SELECT 
    'Tempo Médio' as metrica,
    avg_completion_days,
    total_cards,
    completed_cards
FROM get_average_completion_time(
    p_board_id := 1
);

-- 10. Verificar se as tabelas têm dados suficientes
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

-- 11. Teste de performance das consultas
SELECT 'Teste: Performance das Consultas' as teste;
EXPLAIN ANALYZE SELECT * FROM get_average_completion_time();
EXPLAIN ANALYZE SELECT * FROM get_completion_rate();
EXPLAIN ANALYZE SELECT * FROM get_user_productivity();

-- 12. Verificar índices criados
SELECT 'Verificação: Índices Criados' as teste;
SELECT 
    schemaname,
    tablename,
    indexname,
    indexdef
FROM pg_indexes 
WHERE tablename IN ('cards', 'subtasks', 'users', 'boards')
ORDER BY tablename, indexname;
