-- =====================================================
-- TESTE SIMPLES DAS FUNÇÕES DE MÉTRICAS
-- =====================================================

-- Testar cada função individualmente
SELECT 'Testando get_average_completion_time...' as status;
SELECT * FROM get_average_completion_time();

SELECT 'Testando get_completion_rate...' as status;
SELECT * FROM get_completion_rate();

SELECT 'Testando get_user_productivity...' as status;
SELECT * FROM get_user_productivity();

SELECT 'Testando get_productivity_trends...' as status;
SELECT * FROM get_productivity_trends();

SELECT 'Testando get_project_performance...' as status;
SELECT * FROM get_project_performance();

SELECT 'Testando get_subtask_metrics...' as status;
SELECT * FROM get_subtask_metrics();

SELECT 'Testando get_monthly_report...' as status;
SELECT * FROM get_monthly_report();

