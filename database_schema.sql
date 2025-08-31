-- Schema do Banco de Dados para o Sistema Kanban
-- Execute este SQL no Editor SQL do Supabase

-- Tabela de usuários
CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
  username VARCHAR(100) UNIQUE NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  role VARCHAR(50) DEFAULT 'user',
  cargo VARCHAR(100),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela de quadros
CREATE TABLE IF NOT EXISTS boards (
  id SERIAL PRIMARY KEY,
  board_id VARCHAR(100) UNIQUE NOT NULL,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  owner_id INTEGER REFERENCES users(id),
  color VARCHAR(7),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela de listas
CREATE TABLE IF NOT EXISTS lists (
  id SERIAL PRIMARY KEY,
  list_id VARCHAR(100) UNIQUE NOT NULL,
  board_id VARCHAR(100) REFERENCES boards(board_id),
  name VARCHAR(255) NOT NULL,
  position INTEGER DEFAULT 0,
  is_archived BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela de cards
CREATE TABLE IF NOT EXISTS cards (
  id SERIAL PRIMARY KEY,
  card_id VARCHAR(100) UNIQUE NOT NULL,
  board_id VARCHAR(100) REFERENCES boards(board_id),
  list_name VARCHAR(255),
  title VARCHAR(255) NOT NULL,
  description TEXT,
  status VARCHAR(50) DEFAULT 'todo',
  importance VARCHAR(20) DEFAULT 'medium',
  due_date TIMESTAMP WITH TIME ZONE,
  subject VARCHAR(255),
  goal TEXT,
  members JSONB DEFAULT '[]',
  creation_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  is_archived BOOLEAN DEFAULT FALSE,
  git_branch VARCHAR(255),
  git_commit VARCHAR(255),
  history JSONB DEFAULT '[]',
  dependencies JSONB DEFAULT '[]',
  recurrence VARCHAR(50),
  user_id INTEGER REFERENCES users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela de subtarefas
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

-- Tabela de atividades
CREATE TABLE IF NOT EXISTS activities (
  id SERIAL PRIMARY KEY,
  card_id VARCHAR(100) REFERENCES cards(card_id),
  user_id INTEGER REFERENCES users(id),
  action VARCHAR(100) NOT NULL,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela de chats
CREATE TABLE IF NOT EXISTS chats (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  chat_type VARCHAR(50) DEFAULT 'general',
  board_id INTEGER REFERENCES boards(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela de mensagens
CREATE TABLE IF NOT EXISTS chat_messages (
  id SERIAL PRIMARY KEY,
  chat_id INTEGER REFERENCES chats(id),
  user_id INTEGER REFERENCES users(id),
  message TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela de configurações
CREATE TABLE IF NOT EXISTS user_settings (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id),
  setting_key VARCHAR(255) NOT NULL,
  setting_value TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, setting_key)
);

-- Inserir dados de exemplo
INSERT INTO users (username, email, role, cargo) 
VALUES ('admin', 'admin@example.com', 'admin', 'Administrador')
ON CONFLICT (username) DO NOTHING;

-- Inserir quadro de exemplo
INSERT INTO boards (board_id, name, description, owner_id) 
VALUES ('sample-board-1', 'Projeto Exemplo', 'Quadro de exemplo para demonstração', 1)
ON CONFLICT (board_id) DO NOTHING;

-- Inserir listas de exemplo
INSERT INTO lists (list_id, board_id, name, position) VALUES
  ('list-1', 'sample-board-1', 'A Fazer', 1),
  ('list-2', 'sample-board-1', 'Em Progresso', 2),
  ('list-3', 'sample-board-1', 'Concluído', 3)
ON CONFLICT (list_id) DO NOTHING;

-- Inserir cards de exemplo
INSERT INTO cards (card_id, board_id, list_name, title, description, status, importance, subject, goal, members, git_branch, git_commit, dependencies, recurrence) VALUES
  ('card-1', 'sample-board-1', 'A Fazer', 'Implementar Sistema de Login', 'Desenvolver sistema completo de autenticação', 'pending', 'high', 'Desenvolvimento', 'Sistema funcional', '["admin"]', 'feature/login', 'initial', '[]', 'Nenhuma'),
  ('card-2', 'sample-board-1', 'Em Progresso', 'Configurar Banco de Dados', 'Configurar PostgreSQL com migrations', 'in_progress', 'high', 'Infraestrutura', 'Banco configurado', '["admin"]', 'feature/database', 'setup', '[]', 'Nenhuma')
ON CONFLICT (card_id) DO NOTHING;

-- Inserir subtarefas de exemplo
INSERT INTO subtasks (card_id, title, description, status, priority, importance, tags, completed, completed_at) VALUES
  ('card-1', 'Criar componentes de login', 'Implementar formulários de login e registro', 'completed', 'medium', 'Média', '["React", "UI/UX"]', true, NOW()),
  ('card-1', 'Implementar validação de formulários', 'Adicionar validação client-side e server-side', 'pending', 'high', 'Alta', '["Validação", "Segurança"]', false, NULL)
ON CONFLICT DO NOTHING;
