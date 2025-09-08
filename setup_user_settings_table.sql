-- Script para configurar a tabela user_settings e testar a funcionalidade
-- Execute este SQL no Editor SQL do Supabase

-- 1. Verificar se a tabela user_settings existe
SELECT 
    table_name, 
    column_name, 
    data_type, 
    is_nullable, 
    column_default
FROM information_schema.columns 
WHERE table_name = 'user_settings'
ORDER BY ordinal_position;

-- 2. Se a tabela não existir, criar ela
CREATE TABLE IF NOT EXISTS user_settings (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    setting_key VARCHAR(255) NOT NULL,
    setting_value TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, setting_key)
);

-- 3. Criar índices para melhor performance
CREATE INDEX IF NOT EXISTS idx_user_settings_user_id ON user_settings(user_id);
CREATE INDEX IF NOT EXISTS idx_user_settings_key ON user_settings(setting_key);
CREATE INDEX IF NOT EXISTS idx_user_settings_user_key ON user_settings(user_id, setting_key);

-- 4. Inserir dados de teste para verificar se está funcionando
INSERT INTO user_settings (user_id, setting_key, setting_value) VALUES
(1, 'boards_order', '[1,2,3]'),
(1, 'theme', 'dark'),
(1, 'language', 'pt-BR')
ON CONFLICT (user_id, setting_key) 
DO UPDATE SET 
    setting_value = EXCLUDED.setting_value,
    updated_at = NOW();

-- 5. Verificar se os dados foram inseridos corretamente
SELECT 
    user_id,
    setting_key,
    setting_value,
    created_at,
    updated_at
FROM user_settings
WHERE user_id = 1;

-- 6. Testar a funcionalidade de busca
SELECT 
    setting_key,
    setting_value
FROM user_settings
WHERE user_id = 1 AND setting_key = 'boards_order';

-- 7. Verificar se a função de upsert está funcionando
-- Simular uma atualização da ordem dos quadros
INSERT INTO user_settings (user_id, setting_key, setting_value) VALUES
(1, 'boards_order', '[3,1,2]')
ON CONFLICT (user_id, setting_key) 
DO UPDATE SET 
    setting_value = EXCLUDED.setting_value,
    updated_at = NOW();

-- 8. Verificar se a atualização funcionou
SELECT 
    user_id,
    setting_key,
    setting_value,
    updated_at
FROM user_settings
WHERE user_id = 1 AND setting_key = 'boards_order';

-- 9. Testar com diferentes usuários
INSERT INTO user_settings (user_id, setting_key, setting_value) VALUES
(2, 'boards_order', '[2,1,3]'),
(3, 'boards_order', '[3,2,1]')
ON CONFLICT (user_id, setting_key) 
DO UPDATE SET 
    setting_value = EXCLUDED.setting_value,
    updated_at = NOW();

-- 10. Verificar ordens de diferentes usuários
SELECT 
    u.username,
    us.setting_key,
    us.setting_value,
    us.updated_at
FROM user_settings us
JOIN users u ON u.id = us.user_id
WHERE us.setting_key = 'boards_order'
ORDER BY u.id;

-- 11. Verificar se há algum problema com a estrutura
SELECT 
    'Verificação da estrutura da tabela user_settings' as status,
    COUNT(*) as total_registros,
    COUNT(DISTINCT user_id) as usuarios_unicos,
    COUNT(DISTINCT setting_key) as tipos_configuracao
FROM user_settings;

