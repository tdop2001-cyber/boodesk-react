-- Script para resolver erro da tabela MESAS
-- Este script cria a tabela MESAS se ela não existir

-- Verificar se a tabela MESAS existe e criar se necessário
DO $$
BEGIN
    -- Verificar se a tabela MESAS existe
    IF NOT EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'mesas') THEN
        -- Criar tabela MESAS
        CREATE TABLE mesas (
            id SERIAL PRIMARY KEY,
            numero INTEGER UNIQUE NOT NULL,
            capacidade INTEGER DEFAULT 4,
            status VARCHAR(20) DEFAULT 'disponivel',
            created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
            updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );
        
        -- Inserir algumas mesas de exemplo
        INSERT INTO mesas (numero, capacidade, status) VALUES
        (1, 4, 'disponivel'),
        (2, 2, 'disponivel'),
        (3, 6, 'disponivel'),
        (4, 4, 'disponivel'),
        (5, 8, 'disponivel');
        
        RAISE NOTICE 'Tabela MESAS criada com sucesso!';
    ELSE
        RAISE NOTICE 'Tabela MESAS já existe.';
    END IF;
END $$;

-- Verificar se a tabela COMANDAS existe e criar se necessário
DO $$
BEGIN
    IF NOT EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'comandas') THEN
        -- Criar tabela COMANDAS
        CREATE TABLE comandas (
            id SERIAL PRIMARY KEY,
            mesa_id INTEGER REFERENCES mesas(id),
            numero VARCHAR(20) UNIQUE NOT NULL,
            status VARCHAR(20) DEFAULT 'aberta',
            total DECIMAL(10,2) DEFAULT 0.00,
            created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
            updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );
        
        RAISE NOTICE 'Tabela COMANDAS criada com sucesso!';
    ELSE
        RAISE NOTICE 'Tabela COMANDAS já existe.';
    END IF;
END $$;

-- Mensagem de confirmação
SELECT 'Sistema de mesas e comandas criado/atualizado com sucesso!' AS STATUS;




