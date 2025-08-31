-- Criar tabela board_templates
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

-- Inserir templates padrão
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
('Vendas', 'Template para pipeline de vendas', 'sales', 'vendas', 'bg-teal-500', '["Lead", "Qualificado", "Proposta", "Negociação", "Fechado"]', true);

-- Criar índice para melhor performance
CREATE INDEX IF NOT EXISTS idx_board_templates_category ON board_templates(category);
CREATE INDEX IF NOT EXISTS idx_board_templates_is_default ON board_templates(is_default);
