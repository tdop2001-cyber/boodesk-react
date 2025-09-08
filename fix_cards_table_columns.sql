-- Script para corrigir a tabela cards adicionando colunas faltantes
-- Execute este SQL no Editor SQL do Supabase

-- Adicionar coluna 'members' se não existir
ALTER TABLE cards ADD COLUMN IF NOT EXISTS members JSONB DEFAULT '[]';

-- Adicionar coluna 'category' se não existir
ALTER TABLE cards ADD COLUMN IF NOT EXISTS category VARCHAR(50) DEFAULT 'Sem categoria';

-- Adicionar coluna 'goal' se não existir
ALTER TABLE cards ADD COLUMN IF NOT EXISTS goal VARCHAR(255) DEFAULT 'Sem objetivo';

-- Adicionar coluna 'importance' se não existir
ALTER TABLE cards ADD COLUMN IF NOT EXISTS importance VARCHAR(20) DEFAULT 'normal';

-- Adicionar coluna 'recurrence' se não existir
ALTER TABLE cards ADD COLUMN IF NOT EXISTS recurrence VARCHAR(50) DEFAULT 'Nenhuma';

-- Adicionar coluna 'git_branch' se não existir
ALTER TABLE cards ADD COLUMN IF NOT EXISTS git_branch VARCHAR(255) DEFAULT '';

-- Adicionar coluna 'git_commit' se não existir
ALTER TABLE cards ADD COLUMN IF NOT EXISTS git_commit VARCHAR(255) DEFAULT '';

-- Adicionar coluna 'git_pr' se não existir
ALTER TABLE cards ADD COLUMN IF NOT EXISTS git_pr VARCHAR(255) DEFAULT '';

-- Adicionar coluna 'tags' se não existir
ALTER TABLE cards ADD COLUMN IF NOT EXISTS tags JSONB DEFAULT '[]';

-- Adicionar coluna 'dependencies' se não existir
ALTER TABLE cards ADD COLUMN IF NOT EXISTS dependencies JSONB DEFAULT '[]';

-- Adicionar coluna 'subtasks' se não existir
ALTER TABLE cards ADD COLUMN IF NOT EXISTS subtasks JSONB DEFAULT '[]';

-- Atualizar registros existentes para ter valores padrão
UPDATE cards SET 
  members = '[]',
  category = 'Sem categoria',
  goal = 'Sem objetivo',
  importance = 'normal',
  recurrence = 'Nenhuma',
  git_branch = '',
  git_commit = '',
  git_pr = '',
  tags = '[]',
  dependencies = '[]',
  subtasks = '[]'
WHERE 
  members IS NULL OR 
  category IS NULL OR 
  goal IS NULL OR 
  importance IS NULL OR 
  recurrence IS NULL OR 
  git_branch IS NULL OR 
  git_commit IS NULL OR 
  git_pr IS NULL OR 
  tags IS NULL OR 
  dependencies IS NULL OR 
  subtasks IS NULL;

-- Verificar a estrutura final da tabela
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns 
WHERE table_name = 'cards'
ORDER BY ordinal_position;

-- Verificar alguns registros para confirmar
SELECT id, title, members, category, goal, importance FROM cards LIMIT 5;
