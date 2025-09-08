-- Script para corrigir a estrutura da tabela users
-- Execute este script no seu banco de dados Supabase

-- Alterar o tamanho do campo estado para suportar códigos de 3 caracteres
ALTER TABLE users 
ALTER COLUMN estado TYPE VARCHAR(3);

-- Adicionar coluna is_active se não existir
ALTER TABLE users 
ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT true;

-- Adicionar coluna password_hash se não existir
ALTER TABLE users 
ADD COLUMN IF NOT EXISTS password_hash VARCHAR(255);

-- Atualizar usuários existentes para ter is_active = true
UPDATE users 
SET is_active = true 
WHERE is_active IS NULL;

-- Verificar se a tabela foi atualizada corretamente
SELECT column_name, data_type, character_maximum_length, is_nullable, column_default
FROM information_schema.columns 
WHERE table_name = 'users' 
AND column_name IN ('estado', 'is_active', 'password_hash');
