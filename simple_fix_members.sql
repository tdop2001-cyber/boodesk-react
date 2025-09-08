-- Script simples para adicionar apenas a coluna members
-- Execute este SQL no Editor SQL do Supabase

-- Verificar se a coluna 'members' existe
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns 
WHERE table_name = 'cards' AND column_name = 'members';

-- Se não existir, adicionar
ALTER TABLE cards ADD COLUMN IF NOT EXISTS members JSONB DEFAULT '[]';

-- Atualizar registros existentes
UPDATE cards SET members = '[]' WHERE members IS NULL;

-- Verificar novamente
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns 
WHERE table_name = 'cards' AND column_name = 'members';

-- Testar inserção de um registro com members
SELECT id, title, members FROM cards LIMIT 3;
