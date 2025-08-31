-- Script para limpar dados existentes da tabela user_settings
-- Execute este script no seu banco de dados Supabase

-- 1. Verificar dados existentes
SELECT 'Dados existentes antes da limpeza:' as info;
SELECT user_id, setting_key, setting_value FROM user_settings ORDER BY user_id, setting_key;

-- 2. Limpar todos os dados
DELETE FROM user_settings;

-- 3. Verificar se foi limpo
SELECT 'Dados após limpeza:' as info;
SELECT COUNT(*) as total_registros FROM user_settings;

-- 4. Resetar a sequência do ID (opcional)
ALTER SEQUENCE user_settings_id_seq RESTART WITH 1;

-- 5. Verificar estrutura da tabela
SELECT 'Estrutura da tabela:' as info;
SELECT column_name, data_type, is_nullable FROM information_schema.columns 
WHERE table_name = 'user_settings' ORDER BY ordinal_position;
