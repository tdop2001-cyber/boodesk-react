-- Script para verificar e corrigir a tabela cards
-- Execute este SQL no Editor SQL do Supabase

-- Verificar se a coluna 'members' existe na tabela 'cards'
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns 
WHERE table_name = 'cards' AND column_name = 'members';

-- Se a coluna não existir, adicionar ela
ALTER TABLE cards ADD COLUMN IF NOT EXISTS members JSONB DEFAULT '[]';

-- Verificar a estrutura atual da tabela cards
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns 
WHERE table_name = 'cards'
ORDER BY ordinal_position;

-- Atualizar cards existentes para ter array vazio de membros
UPDATE cards SET members = '[]' WHERE members IS NULL;

-- Verificar alguns cards para ver se o campo members está funcionando
SELECT id, title, members FROM cards LIMIT 5;
