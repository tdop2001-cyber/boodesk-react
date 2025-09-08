-- Script para corrigir problemas do banco de dados
-- Execute este SQL no Editor SQL do Supabase

-- 1. Criar tabela board_templates se não existir
CREATE TABLE IF NOT EXISTS board_templates (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    category VARCHAR(50) NOT NULL DEFAULT 'custom',
    icon VARCHAR(100),
    color VARCHAR(50) DEFAULT 'bg-gray-500',
    columns JSONB NOT NULL DEFAULT '[]',
    is_default BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Inserir templates padrão se não existirem
INSERT INTO board_templates (name, description, category, icon, color, columns, is_default) VALUES
('Desenvolvimento', 'Template para projetos de desenvolvimento de software', 'development', 'desenvolvimento', 'bg-blue-500', '["Backlog", "Em Desenvolvimento", "Em Teste", "Pronto para Deploy", "Deployado"]', true),
('Design', 'Template para projetos de design e UX/UI', 'design', 'design', 'bg-purple-500', '["Briefing", "Em Design", "Em Revisão", "Aprovado", "Finalizado"]', true),
('Manutenção', 'Template para tarefas de manutenção e suporte', 'maintenance', 'manutencao', 'bg-orange-500', '["Reportado", "Em Análise", "Em Correção", "Em Teste", "Resolvido"]', true),
('Marketing', 'Template para campanhas e estratégias de marketing', 'marketing', 'marketing', 'bg-green-500', '["Planejamento", "Em Execução", "Em Revisão", "Aprovado", "Finalizado"]', true),
('Produto', 'Template para desenvolvimento de produtos', 'product', 'produto', 'bg-indigo-500', '["Ideação", "Validação", "Desenvolvimento", "Teste", "Lançamento"]', true),
('Projeto', 'Template para gerenciamento de projetos gerais', 'project', 'projeto', 'bg-red-500', '["Início", "Em Andamento", "Em Revisão", "Finalização", "Concluído"]', true),
('RH', 'Template para processos de recursos humanos', 'hr', 'rh', 'bg-pink-500', '["Candidatura", "Em Análise", "Entrevista", "Avaliação", "Contratado"]', true),
('Suporte', 'Template para tickets de suporte técnico', 'support', 'suporte', 'bg-yellow-500', '["Aberto", "Em Análise", "Em Andamento", "Aguardando Cliente", "Fechado"]', true),
('Tarefas', 'Template simples para gerenciamento de tarefas', 'tasks', 'tarefas', 'bg-gray-500', '["A Fazer", "Em Progresso", "Concluído"]', true),
('Vendas', 'Template para pipeline de vendas', 'sales', 'vendas', 'bg-teal-500', '["Lead", "Qualificado", "Proposta", "Negociação", "Fechado"]', true)
ON CONFLICT DO NOTHING;

-- 3. Criar índices para melhor performance
CREATE INDEX IF NOT EXISTS idx_board_templates_category ON board_templates(category);
CREATE INDEX IF NOT EXISTS idx_board_templates_is_default ON board_templates(is_default);

-- 4. Verificar e corrigir dados JSON inválidos na tabela cards
-- Primeiro, vamos verificar se há dados JSON inválidos
SELECT id, title, members, dependencies, history 
FROM cards 
WHERE members::text ~ '[^\[\]{}",:0-9\s]' 
   OR dependencies::text ~ '[^\[\]{}",:0-9\s]'
   OR history::text ~ '[^\[\]{}",:0-9\s]'
LIMIT 10;

-- 5. Corrigir dados JSON inválidos
-- Se houver dados inválidos, vamos corrigi-los
UPDATE cards 
SET members = '[]' 
WHERE members IS NULL 
   OR members::text = '' 
   OR members::text ~ '[^\[\]{}",:0-9\s]';

UPDATE cards 
SET dependencies = '[]' 
WHERE dependencies IS NULL 
   OR dependencies::text = '' 
   OR dependencies::text ~ '[^\[\]{}",:0-9\s]';

UPDATE cards 
SET history = '[]' 
WHERE history IS NULL 
   OR history::text = '' 
   OR history::text ~ '[^\[\]{}",:0-9\s]';

-- 6. Verificar se a coluna members existe e tem o tipo correto
DO $$
BEGIN
    -- Verificar se a coluna members existe
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'cards' AND column_name = 'members'
    ) THEN
        ALTER TABLE cards ADD COLUMN members JSONB DEFAULT '[]';
    END IF;
    
    -- Verificar se a coluna dependencies existe
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'cards' AND column_name = 'dependencies'
    ) THEN
        ALTER TABLE cards ADD COLUMN dependencies JSONB DEFAULT '[]';
    END IF;
    
    -- Verificar se a coluna history existe
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'cards' AND column_name = 'history'
    ) THEN
        ALTER TABLE cards ADD COLUMN history JSONB DEFAULT '[]';
    END IF;
END $$;

-- 7. Verificar se a coluna members tem o valor padrão correto
ALTER TABLE cards ALTER COLUMN members SET DEFAULT '[]';
ALTER TABLE cards ALTER COLUMN dependencies SET DEFAULT '[]';
ALTER TABLE cards ALTER COLUMN history SET DEFAULT '[]';

-- 8. Atualizar registros existentes com valores padrão
UPDATE cards SET members = '[]' WHERE members IS NULL;
UPDATE cards SET dependencies = '[]' WHERE dependencies IS NULL;
UPDATE cards SET history = '[]' WHERE history IS NULL;

-- 9. Verificar se a tabela board_templates foi criada corretamente
SELECT 'board_templates criada com sucesso' as status, COUNT(*) as total_templates 
FROM board_templates;

-- 10. Verificar se os dados JSON estão válidos agora
SELECT 'Verificação de dados JSON válidos' as status, COUNT(*) as total_cards_validos
FROM cards 
WHERE members::text ~ '^[\[\]{}",:0-9\s]*$' 
  AND dependencies::text ~ '^[\[\]{}",:0-9\s]*$'
  AND history::text ~ '^[\[\]{}",:0-9\s]*$';

