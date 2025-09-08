-- Script para adicionar suporte a múltiplos membros em subtarefas
-- Execute este SQL no Editor SQL do Supabase

-- Adicionar campo members na tabela subtasks (similar ao cards)
ALTER TABLE subtasks ADD COLUMN IF NOT EXISTS members JSONB DEFAULT '[]';

-- Criar tabela de membros de subtarefas (opcional - para relacionamento mais robusto)
CREATE TABLE IF NOT EXISTS subtask_members (
    id SERIAL PRIMARY KEY,
    subtask_id INTEGER NOT NULL,
    user_id INTEGER NOT NULL,
    assigned_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (subtask_id) REFERENCES subtasks(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    UNIQUE(subtask_id, user_id)
);

-- Índices para melhor performance
CREATE INDEX IF NOT EXISTS idx_subtask_members_subtask_id ON subtask_members(subtask_id);
CREATE INDEX IF NOT EXISTS idx_subtask_members_user_id ON subtask_members(user_id);

-- Atualizar subtarefas existentes para ter array vazio de membros
UPDATE subtasks SET members = '[]' WHERE members IS NULL;

-- Comentário: O campo members JSONB será usado para armazenar array de IDs dos usuários
-- Exemplo: [1, 2, 3] onde 1, 2, 3 são IDs dos usuários membros da subtarefa
