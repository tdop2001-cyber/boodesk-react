-- Script para atualizar as tabelas do Boodesk
-- Execute este arquivo conectado ao banco boodesk_db

-- 1. Adicionar coluna is_archived na tabela boards
ALTER TABLE boards ADD COLUMN IF NOT EXISTS is_archived BOOLEAN DEFAULT FALSE;

-- 2. Criar tabela lists se não existir
CREATE TABLE IF NOT EXISTS lists (
    id SERIAL PRIMARY KEY,
    board_id INTEGER REFERENCES boards(id),
    name VARCHAR(100) NOT NULL,
    position INTEGER DEFAULT 0,
    is_archived BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 3. Adicionar colunas que podem estar faltando na tabela cards
ALTER TABLE cards ADD COLUMN IF NOT EXISTS list_id INTEGER REFERENCES lists(id);
ALTER TABLE cards ADD COLUMN IF NOT EXISTS position INTEGER DEFAULT 0;
ALTER TABLE cards ADD COLUMN IF NOT EXISTS is_archived BOOLEAN DEFAULT FALSE;
ALTER TABLE cards ADD COLUMN IF NOT EXISTS assignee_id INTEGER REFERENCES users(id);
ALTER TABLE cards ADD COLUMN IF NOT EXISTS created_by INTEGER REFERENCES users(id);

-- 4. Criar tabela comments se não existir
CREATE TABLE IF NOT EXISTS comments (
    id SERIAL PRIMARY KEY,
    card_id INTEGER REFERENCES cards(id),
    user_id INTEGER REFERENCES users(id),
    content TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 5. Criar tabela attachments se não existir
CREATE TABLE IF NOT EXISTS attachments (
    id SERIAL PRIMARY KEY,
    card_id INTEGER REFERENCES cards(id),
    filename VARCHAR(255) NOT NULL,
    file_path TEXT NOT NULL,
    file_size INTEGER,
    mime_type VARCHAR(100),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 6. Conceder privilégios nas novas tabelas
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO boodesk_app;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO boodesk_app;

-- 7. Verificar atualização
SELECT 'Tabelas atualizadas com sucesso!' as status;



