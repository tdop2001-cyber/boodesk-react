-- Script para configurar o banco Boodesk no PostgreSQL
-- Execute este arquivo conectado como usuário postgres

-- 1. Criar banco de dados
CREATE DATABASE boodesk_db;

-- 2. Criar usuário para a aplicação
CREATE USER boodesk_app WITH PASSWORD 'boodesk123';

-- 3. Conceder privilégios
GRANT ALL PRIVILEGES ON DATABASE boodesk_db TO boodesk_app;

-- 4. Conectar ao banco boodesk_db
\c boodesk_db

-- 5. Criar tabelas básicas
CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(100),
    password_hash VARCHAR(255),
    role VARCHAR(20) DEFAULT 'user',
    cargo VARCHAR(50) DEFAULT 'Usuário',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS boards (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    color VARCHAR(7) DEFAULT '#0079BF',
    owner_id INTEGER REFERENCES users(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS cards (
    id SERIAL PRIMARY KEY,
    board_id INTEGER REFERENCES boards(id),
    title VARCHAR(200) NOT NULL,
    description TEXT,
    status VARCHAR(20) DEFAULT 'to_do',
    importance VARCHAR(20) DEFAULT 'medium',
    due_date DATE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS pomodoro_tasks (
    id SERIAL PRIMARY KEY,
    title VARCHAR(200) NOT NULL,
    description TEXT,
    status VARCHAR(20) DEFAULT 'pending',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 6. Inserir usuário admin padrão
INSERT INTO users (username, email, password_hash, role, cargo) 
VALUES ('admin', 'admin@boodesk.com', 'admin_hash', 'admin', 'Administrador')
ON CONFLICT (username) DO NOTHING;

-- 7. Conceder privilégios nas tabelas
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO boodesk_app;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO boodesk_app;

-- 8. Verificar configuração
SELECT 'Banco configurado com sucesso!' as status;

