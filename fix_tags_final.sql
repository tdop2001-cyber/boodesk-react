-- Script final para corrigir o sistema de tags
-- Execute este SQL no Editor SQL do Supabase

-- 1. Garantir que a coluna tags existe na tabela cards
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_name = 'cards' 
        AND column_name = 'tags'
    ) THEN
        ALTER TABLE cards ADD COLUMN tags TEXT[] DEFAULT '{}';
        RAISE NOTICE 'Coluna tags adicionada à tabela cards';
    ELSE
        RAISE NOTICE 'Coluna tags já existe na tabela cards';
    END IF;
END $$;

-- 2. Garantir que a coluna tags existe na tabela subtasks
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_name = 'subtasks' 
        AND column_name = 'tags'
    ) THEN
        ALTER TABLE subtasks ADD COLUMN tags TEXT[] DEFAULT '{}';
        RAISE NOTICE 'Coluna tags adicionada à tabela subtasks';
    ELSE
        RAISE NOTICE 'Coluna tags já existe na tabela subtasks';
    END IF;
END $$;

-- 3. Atualizar cards existentes que não têm tags definidas
UPDATE cards 
SET tags = '{}' 
WHERE tags IS NULL;

-- 4. Atualizar subtasks existentes que não têm tags definidas
UPDATE subtasks 
SET tags = '{}' 
WHERE tags IS NULL;

-- 5. Criar função para adicionar tags a um card
CREATE OR REPLACE FUNCTION add_tags_to_card(
    card_id_param VARCHAR(100),
    new_tags TEXT[]
) RETURNS BOOLEAN AS $$
BEGIN
    UPDATE cards 
    SET tags = COALESCE(tags, '[]'::jsonb) || to_jsonb(new_tags),
        updated_at = NOW()
    WHERE card_id = card_id_param;
    
    RETURN FOUND;
END;
$$ LANGUAGE plpgsql;

-- 6. Criar função para remover tags de um card
CREATE OR REPLACE FUNCTION remove_tags_from_card(
    card_id_param VARCHAR(100),
    tags_to_remove TEXT[]
) RETURNS BOOLEAN AS $$
DECLARE
    current_tags JSONB;
    tag_to_remove TEXT;
BEGIN
    -- Buscar tags atuais
    SELECT tags INTO current_tags FROM cards WHERE card_id = card_id_param;
    
    -- Remover cada tag
    FOREACH tag_to_remove IN ARRAY tags_to_remove
    LOOP
        current_tags := current_tags - tag_to_remove;
    END LOOP;
    
    -- Atualizar o card
    UPDATE cards 
    SET tags = current_tags,
        updated_at = NOW()
    WHERE card_id = card_id_param;
    
    RETURN FOUND;
END;
$$ LANGUAGE plpgsql;

-- 7. Criar função para buscar cards por tag
CREATE OR REPLACE FUNCTION get_cards_by_tag(
    tag_name_param TEXT,
    user_id_param INTEGER DEFAULT NULL
) RETURNS TABLE (
    id INTEGER,
    card_id VARCHAR(100),
    title VARCHAR(255),
    description TEXT,
    tags JSONB,
    status VARCHAR(50),
    importance VARCHAR(20),
    created_at TIMESTAMP WITH TIME ZONE,
    updated_at TIMESTAMP WITH TIME ZONE
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        c.id,
        c.card_id,
        c.title,
        c.description,
        c.tags,
        c.status,
        c.importance,
        c.created_at,
        c.updated_at
    FROM cards c
    WHERE c.tags ? tag_name_param
    AND c.is_archived = false
    AND (user_id_param IS NULL OR c.user_id = user_id_param)
    ORDER BY c.updated_at DESC;
END;
$$ LANGUAGE plpgsql;

-- 8. Inserir algumas tags de exemplo em cards existentes (opcional)
-- Descomente as linhas abaixo se quiser adicionar tags de exemplo
/*
UPDATE cards 
SET tags = ARRAY['API', 'Frontend'] 
WHERE title ILIKE '%login%' OR title ILIKE '%autenticação%';

UPDATE cards 
SET tags = ARRAY['Backend', 'Database'] 
WHERE title ILIKE '%banco%' OR title ILIKE '%database%';

UPDATE cards 
SET tags = ARRAY['Documentação'] 
WHERE title ILIKE '%document%' OR title ILIKE '%doc%';
*/

-- 9. Verificar a estrutura final das tabelas
SELECT 
    'cards' as tabela,
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'cards' 
AND column_name = 'tags'

UNION ALL

SELECT 
    'subtasks' as tabela,
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'subtasks' 
AND column_name = 'tags'

ORDER BY tabela, column_name;

-- 10. Verificar cards com tags
SELECT 
    id,
    title,
    tags,
    jsonb_array_length(tags) as num_tags
FROM cards 
WHERE tags IS NOT NULL 
AND jsonb_array_length(tags) > 0
ORDER BY updated_at DESC
LIMIT 10;
