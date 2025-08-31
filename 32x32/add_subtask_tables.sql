-- Tabelas para sistema avançado de subtarefas

-- Tabela de arquivos de subtarefas
CREATE TABLE IF NOT EXISTS subtask_files (
    id SERIAL PRIMARY KEY,
    subtask_id INTEGER NOT NULL,
    file_name VARCHAR(255) NOT NULL,
    file_path VARCHAR(500) NOT NULL,
    file_type VARCHAR(100),
    file_size INTEGER,
    uploaded_by INTEGER NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (subtask_id) REFERENCES subtasks(id) ON DELETE CASCADE,
    FOREIGN KEY (uploaded_by) REFERENCES users(id) ON DELETE CASCADE
);

-- Tabela de comentários de subtarefas
CREATE TABLE IF NOT EXISTS subtask_comments (
    id SERIAL PRIMARY KEY,
    subtask_id INTEGER NOT NULL,
    user_id INTEGER NOT NULL,
    comment_text TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (subtask_id) REFERENCES subtasks(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Tabela de histórico de subtarefas
CREATE TABLE IF NOT EXISTS subtask_history (
    id SERIAL PRIMARY KEY,
    subtask_id INTEGER NOT NULL,
    user_id INTEGER NOT NULL,
    action_type VARCHAR(50) NOT NULL, -- 'created', 'updated', 'status_changed', 'assigned', 'commented'
    action_description TEXT,
    old_value TEXT,
    new_value TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (subtask_id) REFERENCES subtasks(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Atualizar tabela de subtarefas para incluir campos adicionais
ALTER TABLE subtasks ADD COLUMN IF NOT EXISTS user_id INTEGER REFERENCES users(id);
ALTER TABLE subtasks ADD COLUMN IF NOT EXISTS priority VARCHAR(20) DEFAULT 'Normal';
ALTER TABLE subtasks ADD COLUMN IF NOT EXISTS assigned_member VARCHAR(255);
ALTER TABLE subtasks ADD COLUMN IF NOT EXISTS completed_at TIMESTAMP;

-- Índices para melhor performance
CREATE INDEX IF NOT EXISTS idx_subtask_files_subtask_id ON subtask_files(subtask_id);
CREATE INDEX IF NOT EXISTS idx_subtask_comments_subtask_id ON subtask_comments(subtask_id);
CREATE INDEX IF NOT EXISTS idx_subtask_history_subtask_id ON subtask_history(subtask_id);
CREATE INDEX IF NOT EXISTS idx_subtasks_user_id ON subtasks(user_id);
CREATE INDEX IF NOT EXISTS idx_subtasks_assigned_member ON subtasks(assigned_member);

