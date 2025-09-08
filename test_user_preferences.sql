-- Script de teste para verificar a tabela user_preferences
-- Execute este script após criar a tabela

-- Verificar se a tabela existe
SELECT 
    table_name, 
    column_name, 
    data_type, 
    is_nullable
FROM information_schema.columns 
WHERE table_name = 'user_preferences'
ORDER BY ordinal_position;

-- Verificar índices
SELECT 
    indexname, 
    indexdef
FROM pg_indexes 
WHERE tablename = 'user_preferences';

-- Verificar triggers
SELECT 
    trigger_name, 
    event_manipulation, 
    action_timing
FROM information_schema.triggers 
WHERE event_object_table = 'user_preferences';

-- Teste de inserção (substitua 'your-user-id' pelo ID real de um usuário)
-- INSERT INTO user_preferences (user_id, preferences) 
-- VALUES ('your-user-id', '{"viewMode": "kanban", "filterType": "all"}')
-- ON CONFLICT (user_id) DO UPDATE SET 
--     preferences = EXCLUDED.preferences,
--     updated_at = NOW();

-- Verificar dados (se houver)
SELECT * FROM user_preferences LIMIT 5;
