-- Script para corrigir e configurar a tabela user_settings
-- Execute este SQL no Editor SQL do Supabase

-- 1. Verificar se a tabela user_settings existe
SELECT 
    'Verificando estrutura da tabela user_settings' as status,
    table_name,
    column_name,
    data_type,
    is_nullable
FROM information_schema.columns 
WHERE table_name = 'user_settings'
ORDER BY ordinal_position;

-- 2. Se a tabela não existir, criar ela
CREATE TABLE IF NOT EXISTS user_settings (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL,
    setting_key VARCHAR(255) NOT NULL,
    setting_value TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, setting_key)
);

-- 3. Adicionar foreign key se não existir
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'user_settings_user_id_fkey'
    ) THEN
        ALTER TABLE user_settings 
        ADD CONSTRAINT user_settings_user_id_fkey 
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE;
    END IF;
END $$;

-- 4. Criar índices para melhor performance
CREATE INDEX IF NOT EXISTS idx_user_settings_user_id ON user_settings(user_id);
CREATE INDEX IF NOT EXISTS idx_user_settings_key ON user_settings(setting_key);
CREATE INDEX IF NOT EXISTS idx_user_settings_user_key ON user_settings(user_id, setting_key);

-- 5. Inserir dados de teste
INSERT INTO user_settings (user_id, setting_key, setting_value) VALUES
(1, 'boards_order', '[1,2,3]'),
(1, 'theme', 'light'),
(1, 'language', 'pt-BR')
ON CONFLICT (user_id, setting_key) 
DO UPDATE SET 
    setting_value = EXCLUDED.setting_value,
    updated_at = NOW();

-- 6. Verificar se os dados foram inseridos
SELECT 
    'Dados inseridos na tabela user_settings' as status,
    user_id,
    setting_key,
    setting_value,
    created_at,
    updated_at
FROM user_settings
ORDER BY user_id, setting_key;

-- 7. Testar a funcionalidade de upsert
INSERT INTO user_settings (user_id, setting_key, setting_value) VALUES
(1, 'boards_order', '[3,1,2]')
ON CONFLICT (user_id, setting_key) 
DO UPDATE SET 
    setting_value = EXCLUDED.setting_value,
    updated_at = NOW();

-- 8. Verificar se a atualização funcionou
SELECT 
    'Teste de atualização' as status,
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

-- 10. Verificar todas as configurações
SELECT 
    'Todas as configurações salvas' as status,
    u.username,
    us.setting_key,
    us.setting_value,
    us.updated_at
FROM user_settings us
LEFT JOIN users u ON u.id = us.user_id
ORDER BY us.user_id, us.setting_key;

-- 11. Verificar permissões da tabela
SELECT 
    'Verificação de permissões' as status,
    schemaname,
    tablename,
    tableowner,
    hasindexes,
    hasrules,
    hastriggers
FROM pg_tables 
WHERE tablename = 'user_settings';

-- 12. Verificar se há algum problema com a estrutura
SELECT 
    'Verificação final da estrutura' as status,
    COUNT(*) as total_registros,
    COUNT(DISTINCT user_id) as usuarios_unicos,
    COUNT(DISTINCT setting_key) as tipos_configuracao,
    MIN(created_at) as primeiro_registro,
    MAX(updated_at) as ultima_atualizacao
FROM user_settings;

