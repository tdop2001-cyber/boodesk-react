-- Script para criar tabela versoes_sistema completa
-- Execute este SQL no Supabase SQL Editor

-- Remover tabela se existir (CUIDADO: isso apaga todos os dados!)
-- DROP TABLE IF EXISTS versoes_sistema;

-- Criar tabela versoes_sistema completa
CREATE TABLE IF NOT EXISTS versoes_sistema (
    id SERIAL PRIMARY KEY,
    versao TEXT NOT NULL,
    data_lancamento TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    changelog TEXT,
    forcar_atualizacao BOOLEAN DEFAULT FALSE,
    ativo BOOLEAN DEFAULT TRUE,
    arquivos JSONB,
    plataformas JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Criar índices para melhor performance
CREATE INDEX IF NOT EXISTS idx_versoes_sistema_versao ON versoes_sistema(versao);
CREATE INDEX IF NOT EXISTS idx_versoes_sistema_ativo ON versoes_sistema(ativo);
CREATE INDEX IF NOT EXISTS idx_versoes_sistema_data_lancamento ON versoes_sistema(data_lancamento);

-- Habilitar Row Level Security (RLS)
ALTER TABLE versoes_sistema ENABLE ROW LEVEL SECURITY;

-- Criar política para permitir leitura pública
CREATE POLICY "Permitir leitura pública de versões" ON versoes_sistema
    FOR SELECT USING (true);

-- Criar política para permitir inserção apenas por usuários autenticados
CREATE POLICY "Permitir inserção por usuários autenticados" ON versoes_sistema
    FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- Verificar se a tabela foi criada corretamente
SELECT 
    column_name, 
    data_type, 
    is_nullable, 
    column_default
FROM information_schema.columns 
WHERE table_name = 'versoes_sistema'
ORDER BY ordinal_position;

-- Inserir dados de teste
INSERT INTO versoes_sistema (versao, changelog, forcar_atualizacao, ativo, arquivos, plataformas)
VALUES (
    '2.4.0',
    'Versão inicial do sistema de deploy',
    false,
    true,
    '[]'::jsonb,
    '{"windows": true, "linux": false, "macos": false}'::jsonb
) ON CONFLICT (versao) DO NOTHING;

-- Verificar dados inseridos
SELECT * FROM versoes_sistema ORDER BY data_lancamento DESC LIMIT 5;




