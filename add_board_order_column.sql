-- Script para adicionar coluna board_order na tabela user_preferences
-- 
-- Este script adiciona uma coluna para armazenar a ordem personalizada dos quadros por usuário
-- 
-- Como usar:
-- 1. Conecte-se ao seu banco Supabase
-- 2. Execute este script no SQL Editor

-- Verificar se a coluna board_order já existe
DO $$ 
BEGIN
    -- Tentar adicionar a coluna board_order se ela não existir
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_name = 'user_preferences' 
        AND column_name = 'board_order'
    ) THEN
        -- Adicionar coluna board_order como array de inteiros
        ALTER TABLE user_preferences 
        ADD COLUMN board_order INTEGER[] DEFAULT '{}';
        
        -- Adicionar comentário explicativo
        COMMENT ON COLUMN user_preferences.board_order IS 'Array com a ordem personalizada dos IDs dos quadros para este usuário';
        
        RAISE NOTICE 'Coluna board_order adicionada com sucesso!';
    ELSE
        RAISE NOTICE 'Coluna board_order já existe!';
    END IF;
END $$;

-- Verificar a estrutura da tabela user_preferences
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'user_preferences' 
ORDER BY ordinal_position;

-- Exemplo de como a coluna será usada:
-- INSERT INTO user_preferences (user_id, board_order) 
-- VALUES ('1', ARRAY[3, 1, 2]) 
-- ON CONFLICT (user_id) 
-- DO UPDATE SET board_order = EXCLUDED.board_order;

-- Para consultar a ordem dos quadros de um usuário:
-- SELECT board_order FROM user_preferences WHERE user_id = '1';
