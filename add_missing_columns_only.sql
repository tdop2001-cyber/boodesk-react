-- Script simples para adicionar apenas as colunas que faltam
-- Sem mexer na estrutura existente da tabela subtasks

-- Adicionar coluna position se não existir
ALTER TABLE subtasks ADD COLUMN IF NOT EXISTS position INTEGER DEFAULT 0;

-- Adicionar coluna members se não existir  
ALTER TABLE subtasks ADD COLUMN IF NOT EXISTS members JSONB DEFAULT '[]';

-- Adicionar coluna created_by se não existir
ALTER TABLE subtasks ADD COLUMN IF NOT EXISTS created_by INTEGER REFERENCES users(id);

-- Criar índices para melhorar performance
CREATE INDEX IF NOT EXISTS idx_subtasks_position ON subtasks(position);
CREATE INDEX IF NOT EXISTS idx_subtasks_created_by ON subtasks(created_by);

-- Verificar estrutura final
SELECT 
    column_name, 
    data_type, 
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'subtasks' 
ORDER BY ordinal_position;

