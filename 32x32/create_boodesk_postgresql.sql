-- =====================================================
-- BANCO DE DADOS BOODESK - POSTGRESQL VERSION
-- =====================================================

-- Habilitar extensões úteis
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";

-- =====================================================
-- TABELA DE USUÁRIOS (PRINCIPAL)
-- =====================================================
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(100) UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    role user_role DEFAULT 'user',
    cargo VARCHAR(50) DEFAULT 'Usuário',
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    last_login TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- =====================================================
-- TABELA DE MEMBROS (EQUIPE)
-- =====================================================
CREATE TABLE members (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    cargo VARCHAR(50) DEFAULT 'Usuário',
    username VARCHAR(50) UNIQUE,
    email VARCHAR(100),
    role user_role DEFAULT 'user',
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- =====================================================
-- TABELA DE QUADROS (BOARDS)
-- =====================================================
CREATE TABLE boards (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    owner_id INTEGER NOT NULL,
    is_archived BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (owner_id) REFERENCES users(id) ON DELETE CASCADE
);

-- =====================================================
-- TABELA DE MEMBROS DOS QUADROS
-- =====================================================
CREATE TABLE board_members (
    id SERIAL PRIMARY KEY,
    board_id INTEGER NOT NULL,
    user_id INTEGER NOT NULL,
    role board_role DEFAULT 'member',
    added_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (board_id) REFERENCES boards(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    UNIQUE(board_id, user_id)
);

-- =====================================================
-- TABELA DE LISTAS (COLUNAS DOS QUADROS)
-- =====================================================
CREATE TABLE lists (
    id SERIAL PRIMARY KEY,
    board_id INTEGER NOT NULL,
    name VARCHAR(100) NOT NULL,
    position INTEGER DEFAULT 0,
    is_archived BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (board_id) REFERENCES boards(id) ON DELETE CASCADE
);

-- =====================================================
-- TABELA DE CARDS (TAREFAS)
-- =====================================================
CREATE TABLE cards (
    id SERIAL PRIMARY KEY,
    card_id UUID UNIQUE DEFAULT uuid_generate_v4(),
    title VARCHAR(200) NOT NULL,
    description TEXT,
    list_id INTEGER NOT NULL,
    board_id INTEGER NOT NULL,
    importance card_importance DEFAULT 'Normal',
    category VARCHAR(100),
    goal VARCHAR(100),
    due_date DATE,
    due_time TIME,
    recurrence card_recurrence DEFAULT 'Nenhuma',
    is_archived BOOLEAN DEFAULT FALSE,
    position INTEGER DEFAULT 0,
    created_by INTEGER NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (list_id) REFERENCES lists(id) ON DELETE CASCADE,
    FOREIGN KEY (board_id) REFERENCES boards(id) ON DELETE CASCADE,
    FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE CASCADE
);

-- =====================================================
-- TABELA DE MEMBROS DOS CARDS
-- =====================================================
CREATE TABLE card_members (
    id SERIAL PRIMARY KEY,
    card_id INTEGER NOT NULL,
    user_id INTEGER NOT NULL,
    assigned_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (card_id) REFERENCES cards(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    UNIQUE(card_id, user_id)
);

-- =====================================================
-- TABELA DE SUBTAREFAS
-- =====================================================
CREATE TABLE subtasks (
    id SERIAL PRIMARY KEY,
    card_id INTEGER NOT NULL,
    title VARCHAR(200) NOT NULL,
    description TEXT,
    is_completed BOOLEAN DEFAULT FALSE,
    assigned_to INTEGER,
    position INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (card_id) REFERENCES cards(id) ON DELETE CASCADE,
    FOREIGN KEY (assigned_to) REFERENCES users(id) ON DELETE SET NULL
);

-- =====================================================
-- TABELA DE DEPENDÊNCIAS
-- =====================================================
CREATE TABLE dependencies (
    id SERIAL PRIMARY KEY,
    card_id INTEGER NOT NULL,
    depends_on_card_id INTEGER NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (card_id) REFERENCES cards(id) ON DELETE CASCADE,
    FOREIGN KEY (depends_on_card_id) REFERENCES cards(id) ON DELETE CASCADE,
    UNIQUE(card_id, depends_on_card_id)
);

-- =====================================================
-- TABELA DE HISTÓRICO DE ATIVIDADES
-- =====================================================
CREATE TABLE activity_history (
    id SERIAL PRIMARY KEY,
    card_id INTEGER,
    user_id INTEGER NOT NULL,
    action VARCHAR(100) NOT NULL,
    details TEXT,
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (card_id) REFERENCES cards(id) ON DELETE SET NULL,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- =====================================================
-- TABELA DE CATEGORIAS
-- =====================================================
CREATE TABLE categories (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE,
    color VARCHAR(7) DEFAULT '#3498db', -- Hex color
    created_by INTEGER,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL
);

-- =====================================================
-- TABELA DE OBJETIVOS
-- =====================================================
CREATE TABLE goals (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE,
    description TEXT,
    created_by INTEGER,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL
);

-- =====================================================
-- TABELA DE ASSUNTOS
-- =====================================================
CREATE TABLE subjects (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE,
    type subject_type DEFAULT 'unified',
    created_by INTEGER,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL
);

-- =====================================================
-- TABELA DE TAREFAS POMODORO
-- =====================================================
CREATE TABLE pomodoro_tasks (
    id SERIAL PRIMARY KEY,
    title VARCHAR(200) NOT NULL,
    description TEXT,
    status pomodoro_status DEFAULT 'Pendente',
    subject VARCHAR(100),
    goal VARCHAR(100),
    estimated_pomodoros INTEGER DEFAULT 1,
    completed_pomodoros INTEGER DEFAULT 0,
    created_by INTEGER NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE CASCADE
);

-- =====================================================
-- TABELA DE LOGS POMODORO
-- =====================================================
CREATE TABLE pomodoro_logs (
    id SERIAL PRIMARY KEY,
    task_id INTEGER,
    user_id INTEGER NOT NULL,
    start_time TIMESTAMP NOT NULL,
    end_time TIMESTAMP,
    duration_minutes INTEGER,
    cycle_number INTEGER,
    is_break BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (task_id) REFERENCES pomodoro_tasks(id) ON DELETE SET NULL,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- =====================================================
-- TABELA DE CONFIGURAÇÕES
-- =====================================================
CREATE TABLE settings (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL,
    setting_key VARCHAR(100) NOT NULL,
    setting_value TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    UNIQUE(user_id, setting_key)
);

-- =====================================================
-- TABELA DE FINANÇAS - CONTAS BANCÁRIAS
-- =====================================================
CREATE TABLE bank_accounts (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL,
    name VARCHAR(100) NOT NULL,
    balance DECIMAL(15,2) DEFAULT 0.00,
    account_type VARCHAR(50),
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- =====================================================
-- TABELA DE FINANÇAS - CATEGORIAS
-- =====================================================
CREATE TABLE finance_categories (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL,
    name VARCHAR(100) NOT NULL,
    type finance_type DEFAULT 'both',
    color VARCHAR(7) DEFAULT '#3498db',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    UNIQUE(user_id, name)
);

-- =====================================================
-- TABELA DE FINANÇAS - MEIOS DE PAGAMENTO
-- =====================================================
CREATE TABLE payment_methods (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL,
    name VARCHAR(100) NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    UNIQUE(user_id, name)
);

-- =====================================================
-- TABELA DE FINANÇAS - TRANSAÇÕES
-- =====================================================
CREATE TABLE transactions (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL,
    type transaction_type NOT NULL,
    amount DECIMAL(15,2) NOT NULL,
    description VARCHAR(200),
    category_id INTEGER,
    account_id INTEGER NOT NULL,
    payment_method_id INTEGER,
    transaction_date DATE NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (category_id) REFERENCES finance_categories(id) ON DELETE SET NULL,
    FOREIGN KEY (account_id) REFERENCES bank_accounts(id) ON DELETE CASCADE,
    FOREIGN KEY (payment_method_id) REFERENCES payment_methods(id) ON DELETE SET NULL
);

-- =====================================================
-- TABELA DE CHAT
-- =====================================================
CREATE TABLE chat_messages (
    id SERIAL PRIMARY KEY,
    project_name VARCHAR(100) NOT NULL,
    user_id INTEGER NOT NULL,
    message TEXT NOT NULL,
    mentions JSONB, -- Array de usuários mencionados
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- =====================================================
-- TABELA DE COMENTÁRIOS DOS CARDS
-- =====================================================
CREATE TABLE card_comments (
    id SERIAL PRIMARY KEY,
    card_id INTEGER NOT NULL,
    user_id INTEGER NOT NULL,
    comment TEXT NOT NULL,
    mentions JSONB, -- Array de usuários mencionados
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (card_id) REFERENCES cards(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- =====================================================
-- TABELA DE REUNIÕES
-- =====================================================
CREATE TABLE meetings (
    id SERIAL PRIMARY KEY,
    meeting_id VARCHAR(100) UNIQUE NOT NULL,
    title VARCHAR(200) NOT NULL,
    description TEXT,
    platform meeting_platform NOT NULL,
    meeting_link VARCHAR(500),
    password VARCHAR(50),
    meeting_date DATE NOT NULL,
    meeting_time TIME NOT NULL,
    duration_minutes INTEGER DEFAULT 60,
    status meeting_status DEFAULT 'scheduled',
    created_by INTEGER NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE CASCADE
);

-- =====================================================
-- TABELA DE PARTICIPANTES DAS REUNIÕES
-- =====================================================
CREATE TABLE meeting_participants (
    id SERIAL PRIMARY KEY,
    meeting_id INTEGER NOT NULL,
    user_id INTEGER NOT NULL,
    role participant_role DEFAULT 'participant',
    joined_at TIMESTAMP,
    left_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (meeting_id) REFERENCES meetings(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    UNIQUE(meeting_id, user_id)
);

-- =====================================================
-- TABELA DE NOTIFICAÇÕES
-- =====================================================
CREATE TABLE notifications (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL,
    type VARCHAR(50) NOT NULL,
    title VARCHAR(200) NOT NULL,
    message TEXT,
    is_read BOOLEAN DEFAULT FALSE,
    data JSONB, -- Dados adicionais da notificação
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    read_at TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- =====================================================
-- TABELA DE MENSAGENS MOTIVACIONAIS
-- =====================================================
CREATE TABLE motivational_messages (
    id SERIAL PRIMARY KEY,
    message TEXT NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    created_by INTEGER,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL
);

-- =====================================================
-- TABELA DE LOGS DO SISTEMA
-- =====================================================
CREATE TABLE system_logs (
    id SERIAL PRIMARY KEY,
    user_id INTEGER,
    action VARCHAR(100) NOT NULL,
    details TEXT,
    ip_address INET,
    user_agent TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
);

-- =====================================================
-- CRIAR ÍNDICES PARA PERFORMANCE
-- =====================================================

-- Índices para users
CREATE INDEX idx_users_username ON users(username);
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_role ON users(role);

-- Índices para cards
CREATE INDEX idx_cards_card_id ON cards(card_id);
CREATE INDEX idx_cards_list_id ON cards(list_id);
CREATE INDEX idx_cards_board_id ON cards(board_id);
CREATE INDEX idx_cards_importance ON cards(importance);
CREATE INDEX idx_cards_due_date ON cards(due_date);
CREATE INDEX idx_cards_created_by ON cards(created_by);
CREATE INDEX idx_cards_board_list ON cards(board_id, list_id);
CREATE INDEX idx_cards_due_date_status ON cards(due_date, is_archived);
CREATE INDEX idx_cards_importance_status ON cards(importance, is_archived);

-- Índices para activity_history
CREATE INDEX idx_activity_card_user ON activity_history(card_id, user_id);
CREATE INDEX idx_activity_timestamp ON activity_history(timestamp);

-- Índices para transactions
CREATE INDEX idx_transactions_user_date ON transactions(user_id, transaction_date);

-- Índices para meetings
CREATE INDEX idx_meetings_date_status ON meetings(meeting_date, status);

-- Índices para notifications
CREATE INDEX idx_notifications_user_read ON notifications(user_id, is_read);
CREATE INDEX idx_notifications_created ON notifications(created_at);

-- Índices para JSONB
CREATE INDEX idx_chat_mentions ON chat_messages USING GIN (mentions);
CREATE INDEX idx_comments_mentions ON card_comments USING GIN (mentions);
CREATE INDEX idx_notifications_data ON notifications USING GIN (data);

-- Índices para busca de texto
CREATE INDEX idx_cards_title_gin ON cards USING GIN (to_tsvector('portuguese', title));
CREATE INDEX idx_cards_description_gin ON cards USING GIN (to_tsvector('portuguese', description));

-- =====================================================
-- CRIAR TRIGGERS PARA ATUALIZAÇÃO AUTOMÁTICA
-- =====================================================

-- Função para atualizar updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers para atualizar updated_at
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_members_updated_at BEFORE UPDATE ON members FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_boards_updated_at BEFORE UPDATE ON boards FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_lists_updated_at BEFORE UPDATE ON lists FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_cards_updated_at BEFORE UPDATE ON cards FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_subtasks_updated_at BEFORE UPDATE ON subtasks FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_categories_updated_at BEFORE UPDATE ON categories FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_goals_updated_at BEFORE UPDATE ON goals FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_subjects_updated_at BEFORE UPDATE ON subjects FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_pomodoro_tasks_updated_at BEFORE UPDATE ON pomodoro_tasks FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_settings_updated_at BEFORE UPDATE ON settings FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_bank_accounts_updated_at BEFORE UPDATE ON bank_accounts FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_finance_categories_updated_at BEFORE UPDATE ON finance_categories FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_payment_methods_updated_at BEFORE UPDATE ON payment_methods FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_transactions_updated_at BEFORE UPDATE ON transactions FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_meetings_updated_at BEFORE UPDATE ON meetings FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_motivational_messages_updated_at BEFORE UPDATE ON motivational_messages FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- CRIAR FUNÇÕES ÚTEIS
-- =====================================================

-- Função para criar novo card
CREATE OR REPLACE FUNCTION create_card(
    p_title VARCHAR(200),
    p_description TEXT,
    p_list_id INTEGER,
    p_board_id INTEGER,
    p_importance card_importance,
    p_category VARCHAR(100),
    p_goal VARCHAR(100),
    p_due_date DATE,
    p_due_time TIME,
    p_recurrence card_recurrence,
    p_created_by INTEGER
) RETURNS INTEGER AS $$
DECLARE
    v_card_id INTEGER;
    v_position INTEGER;
BEGIN
    -- Obter próxima posição na lista
    SELECT COALESCE(MAX(position), 0) + 1 INTO v_position
    FROM cards WHERE list_id = p_list_id;
    
    -- Inserir card
    INSERT INTO cards (
        title, description, list_id, board_id, importance,
        category, goal, due_date, due_time, recurrence, position, created_by
    ) VALUES (
        p_title, p_description, p_list_id, p_board_id, p_importance,
        p_category, p_goal, p_due_date, p_due_time, p_recurrence, v_position, p_created_by
    ) RETURNING id INTO v_card_id;
    
    -- Registrar atividade
    INSERT INTO activity_history (card_id, user_id, action, details)
    VALUES (v_card_id, p_created_by, 'Card criado', 'Card "' || p_title || '" criado');
    
    RETURN v_card_id;
END;
$$ LANGUAGE plpgsql;

-- Função para mover card entre listas
CREATE OR REPLACE FUNCTION move_card(
    p_card_id INTEGER,
    p_new_list_id INTEGER,
    p_user_id INTEGER
) RETURNS VOID AS $$
DECLARE
    v_old_list_id INTEGER;
    v_title VARCHAR(200);
    v_new_position INTEGER;
BEGIN
    -- Obter lista atual e título
    SELECT list_id, title INTO v_old_list_id, v_title
    FROM cards WHERE id = p_card_id;
    
    -- Obter próxima posição na nova lista
    SELECT COALESCE(MAX(position), 0) + 1 INTO v_new_position
    FROM cards WHERE list_id = p_new_list_id;
    
    -- Atualizar card
    UPDATE cards 
    SET list_id = p_new_list_id, position = v_new_position
    WHERE id = p_card_id;
    
    -- Registrar atividade
    INSERT INTO activity_history (card_id, user_id, action, details)
    VALUES (p_card_id, p_user_id, 'Card movido', 'Card "' || v_title || '" movido');
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- INSERIR DADOS INICIAIS
-- =====================================================

-- Inserir usuário administrador padrão
INSERT INTO users (username, email, password_hash, role, cargo) VALUES 
('admin', 'admin@boodesk.com', '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj4J/HS.iK8i', 'admin', 'Administrador')
ON CONFLICT (username) DO NOTHING;

-- Inserir categorias padrão
INSERT INTO categories (name, color) VALUES 
('Desenvolvimento', '#3498db'),
('Design', '#e74c3c'),
('Marketing', '#f39c12'),
('Vendas', '#27ae60'),
('Suporte', '#9b59b6')
ON CONFLICT (name) DO NOTHING;

-- Inserir objetivos padrão
INSERT INTO goals (name) VALUES 
('Melhorar Produtividade'),
('Desenvolver Novos Recursos'),
('Manter Qualidade'),
('Aumentar Vendas')
ON CONFLICT (name) DO NOTHING;

-- Inserir assuntos padrão
INSERT INTO subjects (name, type) VALUES 
('Desenvolvimento', 'unified'),
('Design', 'unified'),
('Marketing', 'unified'),
('Vendas', 'unified'),
('Suporte', 'unified')
ON CONFLICT (name) DO NOTHING;

-- Inserir mensagens motivacionais padrão
INSERT INTO motivational_messages (message) VALUES 
('Bem-vindo!'),
('Foco total!'),
('Você consegue!'),
('Persistência é a chave!'),
('Cada passo conta!')
ON CONFLICT DO NOTHING;

-- =====================================================
-- CRIAR VIEWS ÚTEIS
-- =====================================================

-- View para cards com informações completas
CREATE VIEW v_cards_complete AS
SELECT 
    c.id,
    c.card_id,
    c.title,
    c.description,
    c.importance,
    c.category,
    c.goal,
    c.due_date,
    c.due_time,
    c.recurrence,
    c.is_archived,
    c.position,
    c.created_at,
    c.updated_at,
    b.name as board_name,
    l.name as list_name,
    u.username as created_by_username,
    COUNT(DISTINCT cm.user_id) as member_count,
    COUNT(DISTINCT s.id) as subtask_count,
    COUNT(DISTINCT CASE WHEN s.is_completed = TRUE THEN s.id END) as completed_subtasks,
    COUNT(DISTINCT d.id) as dependency_count
FROM cards c
LEFT JOIN lists l ON c.list_id = l.id
LEFT JOIN boards b ON c.board_id = b.id
LEFT JOIN users u ON c.created_by = u.id
LEFT JOIN card_members cm ON c.id = cm.card_id
LEFT JOIN subtasks s ON c.id = s.card_id
LEFT JOIN dependencies d ON c.id = d.card_id
GROUP BY c.id, b.name, l.name, u.username;

-- View para estatísticas de usuário
CREATE VIEW v_user_stats AS
SELECT 
    u.id,
    u.username,
    u.role,
    COUNT(DISTINCT c.id) as total_cards,
    COUNT(DISTINCT CASE WHEN c.is_archived = FALSE THEN c.id END) as active_cards,
    COUNT(DISTINCT CASE WHEN c.importance = 'Crítica' THEN c.id END) as critical_cards,
    COUNT(DISTINCT CASE WHEN c.due_date < CURRENT_DATE AND c.is_archived = FALSE THEN c.id END) as overdue_cards,
    COUNT(DISTINCT pl.id) as total_pomodoros,
    SUM(pl.duration_minutes) as total_pomodoro_minutes
FROM users u
LEFT JOIN cards c ON u.id = c.created_by
LEFT JOIN pomodoro_logs pl ON u.id = pl.user_id
GROUP BY u.id, u.username, u.role;

-- =====================================================
-- CRIAR USUÁRIO DA APLICAÇÃO
-- =====================================================

-- Criar usuário específico para a aplicação
CREATE USER boodesk_app WITH PASSWORD 'BoodeskApp2024!';

-- Dar permissões
GRANT CONNECT ON DATABASE boodesk_db TO boodesk_app;
GRANT USAGE ON SCHEMA public TO boodesk_app;
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO boodesk_app;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO boodesk_app;
GRANT ALL PRIVILEGES ON ALL FUNCTIONS IN SCHEMA public TO boodesk_app;

-- Dar permissões para futuras tabelas
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON TABLES TO boodesk_app;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON SEQUENCES TO boodesk_app;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON FUNCTIONS TO boodesk_app;

-- =====================================================
-- FIM DO SCRIPT
-- =====================================================
