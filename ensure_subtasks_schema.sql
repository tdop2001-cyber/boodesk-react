-- Script para garantir que a tabela subtasks tenha a estrutura correta
-- Execute este SQL no Editor SQL do Supabase

-- 1. Verificar e criar tabela subtasks se não existir
CREATE TABLE IF NOT EXISTS subtasks (
  id SERIAL PRIMARY KEY,
  card_id VARCHAR(100) REFERENCES cards(card_id),
  title VARCHAR(255) NOT NULL,
  description TEXT,
  status VARCHAR(50) DEFAULT 'todo',
  priority VARCHAR(20) DEFAULT 'medium',
  due_date TIMESTAMP WITH TIME ZONE,
  estimated_time VARCHAR(50),
  actual_time VARCHAR(50),
  importance VARCHAR(20) DEFAULT 'medium',
  tags JSONB DEFAULT '[]',
  category VARCHAR(100),
  completed BOOLEAN DEFAULT FALSE,
  completed_at TIMESTAMP WITH TIME ZONE,
  user_id INTEGER REFERENCES users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Adicionar colunas que podem estar faltando
DO $$ 
BEGIN
    -- Adicionar coluna completed se não existir
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'subtasks' AND column_name = 'completed'
    ) THEN
        ALTER TABLE subtasks ADD COLUMN completed BOOLEAN DEFAULT FALSE;
        RAISE NOTICE 'Coluna completed adicionada à tabela subtasks';
    END IF;

    -- Adicionar coluna completed_at se não existir
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'subtasks' AND column_name = 'completed_at'
    ) THEN
        ALTER TABLE subtasks ADD COLUMN completed_at TIMESTAMP WITH TIME ZONE;
        RAISE NOTICE 'Coluna completed_at adicionada à tabela subtasks';
    END IF;

    -- Adicionar coluna position se não existir
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'subtasks' AND column_name = 'position'
    ) THEN
        ALTER TABLE subtasks ADD COLUMN position INTEGER DEFAULT 0;
        RAISE NOTICE 'Coluna position adicionada à tabela subtasks';
    END IF;

    -- Adicionar coluna members se não existir
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'subtasks' AND column_name = 'members'
    ) THEN
        ALTER TABLE subtasks ADD COLUMN members JSONB DEFAULT '[]';
        RAISE NOTICE 'Coluna members adicionada à tabela subtasks';
    END IF;

    -- Adicionar coluna created_by se não existir
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'subtasks' AND column_name = 'created_by'
    ) THEN
        ALTER TABLE subtasks ADD COLUMN created_by INTEGER REFERENCES users(id);
        RAISE NOTICE 'Coluna created_by adicionada à tabela subtasks';
    END IF;
END $$;

-- 3. Atualizar valores existentes
UPDATE subtasks 
SET completed = (status = 'completed'),
    completed_at = CASE 
        WHEN status = 'completed' THEN updated_at 
        ELSE NULL 
    END
WHERE completed IS NULL OR (completed = FALSE AND status = 'completed');

-- 4. Criar índices para melhor performance
CREATE INDEX IF NOT EXISTS idx_subtasks_card_id ON subtasks(card_id);
CREATE INDEX IF NOT EXISTS idx_subtasks_status ON subtasks(status);
CREATE INDEX IF NOT EXISTS idx_subtasks_completed ON subtasks(completed);
CREATE INDEX IF NOT EXISTS idx_subtasks_created_by ON subtasks(created_by);

-- 5. Verificar estrutura final
SELECT 
    'Estrutura final da tabela subtasks' as status,
    column_name, 
    data_type, 
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'subtasks' 
ORDER BY ordinal_position;

