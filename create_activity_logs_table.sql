-- Script para criar tabela de logs de atividades do usuário
-- 
-- Esta tabela armazenará todos os logs de atividades dos usuários
-- 
-- Como usar:
-- 1. Conecte-se ao seu banco Supabase
-- 2. Execute este script no SQL Editor

-- Criar tabela activity_logs
CREATE TABLE IF NOT EXISTS activity_logs (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL,
    activity_type VARCHAR(50) NOT NULL,
    activity_description TEXT NOT NULL,
    entity_type VARCHAR(50), -- 'board', 'card', 'subtask', 'meeting', etc.
    entity_id VARCHAR(100), -- ID da entidade afetada
    entity_name VARCHAR(255), -- Nome da entidade para exibição
    metadata JSONB DEFAULT '{}', -- Dados adicionais em JSON
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Criar índices para melhor performance
CREATE INDEX IF NOT EXISTS idx_activity_logs_user_id ON activity_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_activity_logs_created_at ON activity_logs(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_activity_logs_activity_type ON activity_logs(activity_type);
CREATE INDEX IF NOT EXISTS idx_activity_logs_entity_type ON activity_logs(entity_type);

-- Adicionar comentários explicativos
COMMENT ON TABLE activity_logs IS 'Logs de todas as atividades dos usuários no sistema';
COMMENT ON COLUMN activity_logs.user_id IS 'ID do usuário que realizou a atividade';
COMMENT ON COLUMN activity_logs.activity_type IS 'Tipo da atividade (create_board, create_card, move_card, etc.)';
COMMENT ON COLUMN activity_logs.activity_description IS 'Descrição legível da atividade';
COMMENT ON COLUMN activity_logs.entity_type IS 'Tipo da entidade afetada (board, card, subtask, etc.)';
COMMENT ON COLUMN activity_logs.entity_id IS 'ID da entidade afetada';
COMMENT ON COLUMN activity_logs.entity_name IS 'Nome da entidade para exibição';
COMMENT ON COLUMN activity_logs.metadata IS 'Dados adicionais em formato JSON';

-- Inserir alguns logs de exemplo (opcional)
INSERT INTO activity_logs (user_id, activity_type, activity_description, entity_type, entity_id, entity_name, metadata) VALUES
(1, 'login', 'Usuário fez login no sistema', 'user', '1', 'admin', '{"ip": "127.0.0.1", "user_agent": "Mozilla/5.0"}'),
(1, 'create_board', 'Criou um novo quadro', 'board', '1', 'Quadro de Teste', '{"board_id": "board-123", "template": "default"}'),
(1, 'create_card', 'Criou um novo card', 'card', '1', 'Card de Teste', '{"board_id": "board-123", "priority": "medium"}'),
(1, 'move_card', 'Moveu card entre colunas', 'card', '1', 'Card de Teste', '{"from_column": "A Fazer", "to_column": "Em Progresso"}'),
(1, 'complete_subtask', 'Concluiu uma subtarefa', 'subtask', '1', 'Subtarefa de Teste', '{"card_id": "1", "completion_time": "2024-01-15T10:30:00Z"}');

-- Verificar se a tabela foi criada corretamente
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'activity_logs' 
ORDER BY ordinal_position;

-- Verificar os logs de exemplo
SELECT * FROM activity_logs ORDER BY created_at DESC LIMIT 10;
