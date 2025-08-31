-- =====================================================
-- MIGRAÇÃO INICIAL - ESQUEMA COMPLETO DO BOODESK
-- =====================================================

-- Habilitar extensões necessárias
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- =====================================================
-- TABELA DE MEMBROS (EQUIPE)
-- =====================================================
CREATE TABLE IF NOT EXISTS members (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(100) UNIQUE,
    phone VARCHAR(20),
    role VARCHAR(50),
    department VARCHAR(50),
    avatar_url TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- =====================================================
-- TABELA DE USUÁRIOS
-- =====================================================
CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role VARCHAR(20) DEFAULT 'user' CHECK (role IN ('admin', 'manager', 'user')),
    cargo VARCHAR(100),
    member_id INTEGER REFERENCES members(id) ON DELETE SET NULL,
    profile_image_url TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    last_login TIMESTAMP
);

-- =====================================================
-- TABELA DE QUADROS
-- =====================================================
CREATE TABLE IF NOT EXISTS boards (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    owner_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    background_image_url TEXT,
    color VARCHAR(7) DEFAULT '#0079BF',
    is_archived BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- =====================================================
-- TABELA DE CARTÕES
-- =====================================================
CREATE TABLE IF NOT EXISTS cards (
    id SERIAL PRIMARY KEY,
    board_id INTEGER REFERENCES boards(id) ON DELETE CASCADE,
    list_name VARCHAR(50) NOT NULL,
    title VARCHAR(200) NOT NULL,
    description TEXT,
    status VARCHAR(20) DEFAULT 'to_do' CHECK (status IN ('to_do', 'in_progress', 'review', 'completed')),
    importance VARCHAR(20) DEFAULT 'Normal' CHECK (importance IN ('Baixa', 'Normal', 'Alta', 'Crítica')),
    due_date TIMESTAMP,
    subject VARCHAR(100),
    goal TEXT,
    git_branch VARCHAR(100),
    git_commit VARCHAR(100),
    recurrence VARCHAR(50),
    dependencies JSONB DEFAULT '[]',
    members JSONB DEFAULT '[]',
    attachments JSONB DEFAULT '[]',
    labels JSONB DEFAULT '[]',
    created_by INTEGER REFERENCES users(id) ON DELETE SET NULL,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    history JSONB DEFAULT '[]'
);

-- =====================================================
-- SISTEMA DE CHAT
-- =====================================================
CREATE TABLE IF NOT EXISTS chats (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    chat_type VARCHAR(20) NOT NULL CHECK (chat_type IN ('board', 'card', 'direct')),
    board_id INTEGER REFERENCES boards(id) ON DELETE CASCADE,
    card_id INTEGER REFERENCES cards(id) ON DELETE CASCADE,
    created_by INTEGER REFERENCES users(id) ON DELETE SET NULL,
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS chat_messages (
    id SERIAL PRIMARY KEY,
    chat_id INTEGER REFERENCES chats(id) ON DELETE CASCADE,
    sender_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
    message TEXT NOT NULL,
    message_type VARCHAR(20) DEFAULT 'text' CHECK (message_type IN ('text', 'file', 'system')),
    file_url TEXT,
    file_name VARCHAR(255),
    file_size INTEGER,
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS chat_participants (
    id SERIAL PRIMARY KEY,
    chat_id INTEGER REFERENCES chats(id) ON DELETE CASCADE,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    role VARCHAR(20) DEFAULT 'member' CHECK (role IN ('admin', 'moderator', 'member')),
    joined_at TIMESTAMP DEFAULT NOW(),
    UNIQUE(chat_id, user_id)
);

-- =====================================================
-- SISTEMA DE REUNIÕES
-- =====================================================
CREATE TABLE IF NOT EXISTS meetings (
    id SERIAL PRIMARY KEY,
    title VARCHAR(200) NOT NULL,
    description TEXT,
    date DATE NOT NULL,
    time TIME NOT NULL,
    duration INTEGER DEFAULT 60,
    platform VARCHAR(20) NOT NULL CHECK (platform IN ('zoom', 'teams', 'google_meet')),
    link TEXT,
    password VARCHAR(100),
    timezone VARCHAR(50) DEFAULT 'America/Sao_Paulo',
    created_by INTEGER REFERENCES users(id) ON DELETE SET NULL,
    created_at TIMESTAMP DEFAULT NOW(),
    google_event_id VARCHAR(100),
    association JSONB DEFAULT '{}',
    participants JSONB DEFAULT '[]',
    recording_url TEXT
);

-- =====================================================
-- SISTEMA DE NOTIFICAÇÕES
-- =====================================================
CREATE TABLE IF NOT EXISTS notifications (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    title VARCHAR(200) NOT NULL,
    message TEXT NOT NULL,
    notification_type VARCHAR(20) DEFAULT 'info' CHECK (notification_type IN ('info', 'warning', 'error', 'success')),
    is_read BOOLEAN DEFAULT FALSE,
    related_card_id INTEGER REFERENCES cards(id) ON DELETE CASCADE,
    related_board_id INTEGER REFERENCES boards(id) ON DELETE CASCADE,
    related_meeting_id INTEGER REFERENCES meetings(id) ON DELETE CASCADE,
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS chat_notifications (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    chat_id INTEGER REFERENCES chats(id) ON DELETE CASCADE,
    message_id INTEGER REFERENCES chat_messages(id) ON DELETE CASCADE,
    notification_type VARCHAR(20) DEFAULT 'message' CHECK (notification_type IN ('message', 'mention', 'system')),
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT NOW()
);

-- =====================================================
-- SISTEMA DE CONFIGURAÇÕES
-- =====================================================
CREATE TABLE IF NOT EXISTS user_settings (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    setting_key VARCHAR(100) NOT NULL,
    setting_value JSONB,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    UNIQUE(user_id, setting_key)
);

CREATE TABLE IF NOT EXISTS board_settings (
    id SERIAL PRIMARY KEY,
    board_id INTEGER REFERENCES boards(id) ON DELETE CASCADE,
    setting_key VARCHAR(100) NOT NULL,
    setting_value JSONB,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    UNIQUE(board_id, setting_key)
);

-- =====================================================
-- SISTEMA DE ATIVIDADES E LOGS
-- =====================================================
CREATE TABLE IF NOT EXISTS activity_logs (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
    action VARCHAR(100) NOT NULL,
    entity_type VARCHAR(50) NOT NULL,
    entity_id INTEGER,
    details JSONB,
    ip_address INET,
    user_agent TEXT,
    created_at TIMESTAMP DEFAULT NOW()
);

-- =====================================================
-- SISTEMA DE TEMPLATES
-- =====================================================
CREATE TABLE IF NOT EXISTS meeting_templates (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    title VARCHAR(200) NOT NULL,
    description TEXT,
    duration INTEGER DEFAULT 60,
    platform VARCHAR(20) DEFAULT 'google_meet',
    timezone VARCHAR(50) DEFAULT 'America/Sao_Paulo',
    created_by INTEGER REFERENCES users(id) ON DELETE SET NULL,
    is_public BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS email_templates (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    subject VARCHAR(200) NOT NULL,
    body TEXT NOT NULL,
    template_type VARCHAR(50) NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- =====================================================
-- ÍNDICES PARA PERFORMANCE
-- =====================================================

-- Índices para usuários
CREATE INDEX idx_users_username ON users(username);
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_role ON users(role);
CREATE INDEX idx_users_member_id ON users(member_id);

-- Índices para quadros
CREATE INDEX idx_boards_owner_id ON boards(owner_id);
CREATE INDEX idx_boards_is_archived ON boards(is_archived);

-- Índices para cartões
CREATE INDEX idx_cards_board_id ON cards(board_id);
CREATE INDEX idx_cards_list_name ON cards(list_name);
CREATE INDEX idx_cards_status ON cards(status);
CREATE INDEX idx_cards_importance ON cards(importance);
CREATE INDEX idx_cards_due_date ON cards(due_date);
CREATE INDEX idx_cards_created_by ON cards(created_by);
CREATE INDEX idx_cards_created_at ON cards(created_at);

-- Índices para chat
CREATE INDEX idx_chat_messages_chat_id ON chat_messages(chat_id);
CREATE INDEX idx_chat_messages_sender_id ON chat_messages(sender_id);
CREATE INDEX idx_chat_messages_created_at ON chat_messages(created_at);
CREATE INDEX idx_chat_participants_chat_id ON chat_participants(chat_id);
CREATE INDEX idx_chat_participants_user_id ON chat_participants(user_id);

-- Índices para reuniões
CREATE INDEX idx_meetings_date ON meetings(date);
CREATE INDEX idx_meetings_created_by ON meetings(created_by);
CREATE INDEX idx_meetings_platform ON meetings(platform);

-- Índices para notificações
CREATE INDEX idx_notifications_user_id ON notifications(user_id);
CREATE INDEX idx_notifications_is_read ON notifications(is_read);
CREATE INDEX idx_notifications_created_at ON notifications(created_at);
CREATE INDEX idx_chat_notifications_user_id ON chat_notifications(user_id);
CREATE INDEX idx_chat_notifications_is_read ON chat_notifications(is_read);

-- Índices para logs
CREATE INDEX idx_activity_logs_user_id ON activity_logs(user_id);
CREATE INDEX idx_activity_logs_entity_type ON activity_logs(entity_type);
CREATE INDEX idx_activity_logs_created_at ON activity_logs(created_at);

-- =====================================================
-- FUNÇÕES E TRIGGERS
-- =====================================================

-- Função para atualizar updated_at automaticamente
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers para updated_at
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_boards_updated_at BEFORE UPDATE ON boards
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_cards_updated_at BEFORE UPDATE ON cards
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_settings_updated_at BEFORE UPDATE ON user_settings
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_board_settings_updated_at BEFORE UPDATE ON board_settings
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_meeting_templates_updated_at BEFORE UPDATE ON meeting_templates
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_email_templates_updated_at BEFORE UPDATE ON email_templates
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Função para registrar atividade
CREATE OR REPLACE FUNCTION log_activity(
    p_user_id INTEGER,
    p_action VARCHAR(100),
    p_entity_type VARCHAR(50),
    p_entity_id INTEGER,
    p_details JSONB DEFAULT NULL
)
RETURNS VOID AS $$
BEGIN
    INSERT INTO activity_logs (user_id, action, entity_type, entity_id, details)
    VALUES (p_user_id, p_action, p_entity_type, p_entity_id, p_details);
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- DADOS INICIAIS
-- =====================================================

-- Inserir membros padrão
INSERT INTO members (name, email, role, department) VALUES
('Administrador Sistema', 'admin@boodesk.com', 'Administrador', 'TI'),
('Usuário Padrão', 'user@boodesk.com', 'Desenvolvedor', 'TI'),
('Gerente Projeto', 'manager@boodesk.com', 'Gerente', 'Gestão');

-- Inserir usuários padrão
INSERT INTO users (username, email, password_hash, role, cargo, member_id) VALUES
('admin', 'admin@boodesk.com', crypt('admin123', gen_salt('bf')), 'admin', 'Administrador', 1),
('user', 'user@boodesk.com', crypt('user123', gen_salt('bf')), 'user', 'Desenvolvedor', 2),
('manager', 'manager@boodesk.com', crypt('manager123', gen_salt('bf')), 'manager', 'Gerente', 3);

-- Inserir quadros padrão
INSERT INTO boards (name, description, owner_id) VALUES
('Quadro Principal', 'Quadro principal do projeto', 1),
('Backlog', 'Tarefas pendentes e ideias', 1),
('Sprint Atual', 'Tarefas da sprint atual', 1);

-- Inserir templates de email padrão
INSERT INTO email_templates (name, subject, body, template_type) VALUES
('card_created', 'Nova Tarefa Criada: {title}', 'Uma nova tarefa foi criada no quadro {board}. Título: {title}', 'card_notification'),
('card_updated', 'Tarefa Atualizada: {title}', 'A tarefa {title} foi atualizada no quadro {board}.', 'card_notification'),
('meeting_reminder', 'Lembrete: {title}', 'Você tem uma reunião em 15 minutos: {title}', 'meeting_notification');

-- Inserir templates de reunião padrão
INSERT INTO meeting_templates (name, title, description, duration, platform, is_public) VALUES
('Daily Standup', 'Daily Standup - Equipe', 'Reunião diária para alinhamento da equipe', 15, 'google_meet', true),
('Sprint Planning', 'Sprint Planning', 'Planejamento da sprint com toda a equipe', 60, 'google_meet', true),
('Sprint Review', 'Sprint Review', 'Apresentação dos resultados da sprint', 45, 'google_meet', true);

-- =====================================================
-- COMENTÁRIOS FINAIS
-- =====================================================

COMMENT ON TABLE users IS 'Tabela de usuários do sistema';
COMMENT ON TABLE boards IS 'Tabela de quadros/kanban boards';
COMMENT ON TABLE cards IS 'Tabela de cartões/tarefas';
COMMENT ON TABLE chats IS 'Tabela de chats do sistema';
COMMENT ON TABLE meetings IS 'Tabela de reuniões agendadas';
COMMENT ON TABLE notifications IS 'Tabela de notificações do sistema';

-- Finalizar migração
SELECT 'Migração inicial concluída com sucesso!' as status;
