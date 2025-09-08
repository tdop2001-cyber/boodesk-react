-- Script para testar persistência de preferências
-- Execute este script para verificar se as preferências estão sendo salvas

-- Verificar se há dados na tabela
SELECT 
    user_id,
    preferences,
    created_at,
    updated_at
FROM user_preferences
ORDER BY updated_at DESC;

-- Verificar estrutura da tabela
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'user_preferences'
ORDER BY ordinal_position;

-- Teste de inserção manual (substitua 'your-user-id' pelo ID real)
-- INSERT INTO user_preferences (user_id, preferences) 
-- VALUES ('your-user-id', '{"viewMode": "kanban", "filterType": "cards", "test": true}')
-- ON CONFLICT (user_id) DO UPDATE SET 
--     preferences = EXCLUDED.preferences,
--     updated_at = NOW();

-- Verificar se a inserção funcionou
-- SELECT * FROM user_preferences WHERE user_id = 'your-user-id';

-- Contar registros
SELECT COUNT(*) as total_preferences FROM user_preferences;
