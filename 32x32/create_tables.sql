-- Criar tabelas básicas para o Boodesk
-- Execute este arquivo conectado ao banco boodesk_db

-- Tabela de usuários
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

-- Tabela de quadros
CREATE TABLE IF NOT EXISTS boards (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    color VARCHAR(7) DEFAULT '#0079BF',
    owner_id INTEGER REFERENCES users(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabela de cartões
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

-- Tabela de tarefas do Pomodoro
CREATE TABLE IF NOT EXISTS pomodoro_tasks (
    id SERIAL PRIMARY KEY,
    title VARCHAR(200) NOT NULL,
    description TEXT,
    status VARCHAR(20) DEFAULT 'pending',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Inserir usuário admin padrão
INSERT INTO users (username, email, password_hash, role, cargo) 
VALUES ('admin', 'admin@boodesk.com', 'admin_hash', 'admin', 'Administrador')
ON CONFLICT (username) DO NOTHING;

-- Conceder privilégios ao usuário boodesk_app
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO boodesk_app;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO boodesk_app;

-- Verificar criação
SELECT 'Tabelas criadas com sucesso!' as status;




