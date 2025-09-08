-- Script seguro para corrigir a estrutura da tabela subtasks
-- Este script verifica a estrutura atual antes de fazer alterações

-- 1. Verificar se a coluna position já existe
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'subtasks' AND column_name = 'position') THEN
        ALTER TABLE subtasks ADD COLUMN position INTEGER DEFAULT 0;
        RAISE NOTICE 'Coluna position adicionada à tabela subtasks';
    ELSE
        RAISE NOTICE 'Coluna position já existe na tabela subtasks';
    END IF;
END $$;

-- 2. Verificar se a coluna members já existe
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'subtasks' AND column_name = 'members') THEN
        ALTER TABLE subtasks ADD COLUMN members JSONB DEFAULT '[]';
        RAISE NOTICE 'Coluna members adicionada à tabela subtasks';
    ELSE
        RAISE NOTICE 'Coluna members já existe na tabela subtasks';
    END IF;
END $$;

-- 3. Verificar se a coluna created_by já existe
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'subtasks' AND column_name = 'created_by') THEN
        ALTER TABLE subtasks ADD COLUMN created_by INTEGER REFERENCES users(id);
        RAISE NOTICE 'Coluna created_by adicionada à tabela subtasks';
    ELSE
        RAISE NOTICE 'Coluna created_by já existe na tabela subtasks';
    END IF;
END $$;

-- 4. Verificar o tipo da coluna card_id atual
DO $$ 
DECLARE
    card_id_type text;
BEGIN
    SELECT data_type INTO card_id_type 
    FROM information_schema.columns 
    WHERE table_name = 'subtasks' AND column_name = 'card_id';
    
    RAISE NOTICE 'Tipo atual da coluna card_id: %', card_id_type;
    
    -- Se card_id for VARCHAR, precisamos convertê-la para INTEGER
    IF card_id_type = 'character varying' THEN
        RAISE NOTICE 'Convertendo card_id de VARCHAR para INTEGER...';
        
        -- Adicionar coluna temporária
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                       WHERE table_name = 'subtasks' AND column_name = 'card_id_numeric') THEN
            ALTER TABLE subtasks ADD COLUMN card_id_numeric INTEGER;
            RAISE NOTICE 'Coluna card_id_numeric adicionada';
        END IF;
        
        -- Copiar dados convertendo VARCHAR para INTEGER
        UPDATE subtasks 
        SET card_id_numeric = cards.id 
        FROM cards 
        WHERE subtasks.card_id = cards.card_id;
        
        RAISE NOTICE 'Dados copiados de card_id para card_id_numeric';
        
        -- Remover a coluna antiga e renomear
        ALTER TABLE subtasks DROP COLUMN card_id;
        ALTER TABLE subtasks RENAME COLUMN card_id_numeric TO card_id;
        ALTER TABLE subtasks ALTER COLUMN card_id SET NOT NULL;
        ALTER TABLE subtasks ADD CONSTRAINT subtasks_card_id_fkey 
            FOREIGN KEY (card_id) REFERENCES cards(id);
        
        RAISE NOTICE 'Coluna card_id convertida para INTEGER com sucesso';
    ELSE
        RAISE NOTICE 'Coluna card_id já é do tipo correto: %', card_id_type;
    END IF;
END $$;

-- 5. Criar índices se não existirem
CREATE INDEX IF NOT EXISTS idx_subtasks_card_id ON subtasks(card_id);
CREATE INDEX IF NOT EXISTS idx_subtasks_status ON subtasks(status);
CREATE INDEX IF NOT EXISTS idx_subtasks_position ON subtasks(position);
CREATE INDEX IF NOT EXISTS idx_subtasks_created_by ON subtasks(created_by);

-- 6. Verificar estrutura final
SELECT 
    column_name, 
    data_type, 
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'subtasks' 
ORDER BY ordinal_position;

