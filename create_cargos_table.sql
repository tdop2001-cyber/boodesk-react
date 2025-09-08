-- Script para criar a tabela de cargos
-- Execute este script no SQL Editor do Supabase

-- Tabela de cargos
CREATE TABLE IF NOT EXISTS cargos (
    id SERIAL PRIMARY KEY,
    nome VARCHAR(100) UNIQUE NOT NULL,
    descricao TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Inserir cargos padrão
INSERT INTO cargos (nome, descricao) VALUES
    ('Administrador', 'Administrador do sistema'),
    ('Gerente de Projetos', 'Gerencia projetos e equipes'),
    ('Desenvolvedor', 'Desenvolve funcionalidades'),
    ('Designer', 'Cria interfaces e experiências'),
    ('Analista', 'Analisa requisitos e processos'),
    ('Usuário', 'Usuário padrão do sistema')
ON CONFLICT (nome) DO NOTHING;

-- Adicionar índice para melhor performance
CREATE INDEX IF NOT EXISTS idx_cargos_nome ON cargos(nome);
CREATE INDEX IF NOT EXISTS idx_cargos_active ON cargos(is_active);

-- Verificar criação
SELECT 'Tabela de cargos criada com sucesso!' as status;
