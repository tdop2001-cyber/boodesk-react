-- Script para verificar a estrutura da tabela user_settings
-- Execute este script no seu banco de dados Supabase

-- 1. Verificar se a tabela existe
SELECT 
  CASE 
    WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'user_settings') 
    THEN '✅ Tabela user_settings existe'
    ELSE '❌ Tabela user_settings NÃO existe'
  END as status_tabela;

-- 2. Verificar a estrutura da tabela (se existir)
SELECT 
  column_name,
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns 
WHERE table_name = 'user_settings'
ORDER BY ordinal_position;

-- 3. Verificar se há dados na tabela
SELECT 
  CASE 
    WHEN EXISTS (SELECT 1 FROM user_settings LIMIT 1) 
    THEN '✅ Tabela tem dados'
    ELSE '❌ Tabela está vazia'
  END as status_dados;

-- 4. Contar registros
SELECT COUNT(*) as total_registros FROM user_settings;

-- 5. Verificar constraints
SELECT 
  constraint_name,
  constraint_type
FROM information_schema.table_constraints 
WHERE table_name = 'user_settings';

-- 6. Verificar índices
SELECT 
  indexname,
  indexdef
FROM pg_indexes 
WHERE tablename = 'user_settings';
