-- =====================================================
-- TESTE DAS FUNÇÕES RPC
-- =====================================================

-- Testar se as funções existem e estão funcionando
DO $$
DECLARE
    v_result RECORD;
    v_count INTEGER;
BEGIN
    RAISE NOTICE 'Testando funções RPC...';
    
    -- Testar função de tempo médio
    BEGIN
        SELECT * INTO v_result FROM get_average_completion_time();
        RAISE NOTICE 'get_average_completion_time: OK - % dias', v_result.avg_completion_days;
    EXCEPTION
        WHEN OTHERS THEN
            RAISE NOTICE 'get_average_completion_time: ERRO - %', SQLERRM;
    END;
    
    -- Testar função de taxa de conclusão
    BEGIN
        SELECT * INTO v_result FROM get_completion_rate();
        RAISE NOTICE 'get_completion_rate: OK - %', v_result.completion_rate;
    EXCEPTION
        WHEN OTHERS THEN
            RAISE NOTICE 'get_completion_rate: ERRO - %', SQLERRM;
    END;
    
    -- Testar função de produtividade por usuário
    BEGIN
        SELECT COUNT(*) INTO v_count FROM get_user_productivity();
        RAISE NOTICE 'get_user_productivity: OK - % usuários', v_count;
    EXCEPTION
        WHEN OTHERS THEN
            RAISE NOTICE 'get_user_productivity: ERRO - %', SQLERRM;
    END;
    
    -- Testar função de tendências
    BEGIN
        SELECT COUNT(*) INTO v_count FROM get_productivity_trends();
        RAISE NOTICE 'get_productivity_trends: OK - % períodos', v_count;
    EXCEPTION
        WHEN OTHERS THEN
            RAISE NOTICE 'get_productivity_trends: ERRO - %', SQLERRM;
    END;
    
    -- Testar função de performance por projeto
    BEGIN
        SELECT COUNT(*) INTO v_count FROM get_project_performance();
        RAISE NOTICE 'get_project_performance: OK - % projetos', v_count;
    EXCEPTION
        WHEN OTHERS THEN
            RAISE NOTICE 'get_project_performance: ERRO - %', SQLERRM;
    END;
    
    -- Testar função de métricas de subtasks
    BEGIN
        SELECT * INTO v_result FROM get_subtask_metrics();
        RAISE NOTICE 'get_subtask_metrics: OK - % subtasks', v_result.total_subtasks;
    EXCEPTION
        WHEN OTHERS THEN
            RAISE NOTICE 'get_subtask_metrics: ERRO - %', SQLERRM;
    END;
    
    -- Testar função de relatório mensal
    BEGIN
        SELECT COUNT(*) INTO v_count FROM get_monthly_report();
        RAISE NOTICE 'get_monthly_report: OK - % métricas', v_count;
    EXCEPTION
        WHEN OTHERS THEN
            RAISE NOTICE 'get_monthly_report: ERRO - %', SQLERRM;
    END;
    
    RAISE NOTICE 'Teste das funções RPC concluído!';
END $$;

