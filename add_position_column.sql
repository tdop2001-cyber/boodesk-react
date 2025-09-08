-- Adicionar coluna position para rastrear ordem das subtarefas
ALTER TABLE subtasks ADD COLUMN IF NOT EXISTS position INTEGER DEFAULT 0;

-- Adicionar coluna members para rastrear membros das subtarefas
ALTER TABLE subtasks ADD COLUMN IF NOT EXISTS members JSONB DEFAULT '[]';

-- Adicionar coluna created_by para rastrear quem criou a subtarefa
ALTER TABLE subtasks ADD COLUMN IF NOT EXISTS created_by INTEGER REFERENCES users(id);

-- Atualizar a coluna card_id para usar INTEGER em vez de VARCHAR
-- Primeiro, vamos verificar se já existe uma coluna card_id_numeric
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'subtasks' AND column_name = 'card_id_numeric') THEN
        ALTER TABLE subtasks ADD COLUMN card_id_numeric INTEGER REFERENCES cards(id);
    END IF;
END $$;

-- Copiar dados da coluna card_id (VARCHAR) para card_id_numeric (INTEGER)
UPDATE subtasks 
SET card_id_numeric = cards.id 
FROM cards 
WHERE subtasks.card_id::text = cards.card_id::text;

-- Remover a coluna card_id antiga e renomear card_id_numeric
ALTER TABLE subtasks DROP COLUMN IF EXISTS card_id;
ALTER TABLE subtasks RENAME COLUMN card_id_numeric TO card_id;

-- Adicionar NOT NULL constraint na coluna card_id
ALTER TABLE subtasks ALTER COLUMN card_id SET NOT NULL;

-- Criar índice para melhorar performance
CREATE INDEX IF NOT EXISTS idx_subtasks_card_id ON subtasks(card_id);
CREATE INDEX IF NOT EXISTS idx_subtasks_status ON subtasks(status);
CREATE INDEX IF NOT EXISTS idx_subtasks_position ON subtasks(position);
