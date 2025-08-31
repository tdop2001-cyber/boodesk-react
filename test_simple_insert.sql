-- Script simples para testar inserção na tabela user_settings
-- Execute este script no seu banco de dados Supabase

-- 1. Testar inserção simples
INSERT INTO user_settings (user_id, setting_key, setting_value) 
VALUES (1, 'test', '{"test": "value"}')
ON CONFLICT (user_id, setting_key) 
DO UPDATE SET 
  setting_value = EXCLUDED.setting_value,
  updated_at = NOW();

-- 2. Verificar se foi inserido
SELECT * FROM user_settings WHERE user_id = 1 AND setting_key = 'test';

-- 3. Testar inserção de configuração real
INSERT INTO user_settings (user_id, setting_key, setting_value) 
VALUES (1, 'boardSettings', '{"defaultColumns":["A Fazer","Em Progresso","Concluído"],"autoSave":true}')
ON CONFLICT (user_id, setting_key) 
DO UPDATE SET 
  setting_value = EXCLUDED.setting_value,
  updated_at = NOW();

-- 4. Verificar todas as configurações do usuário 1
SELECT setting_key, setting_value FROM user_settings WHERE user_id = 1;
