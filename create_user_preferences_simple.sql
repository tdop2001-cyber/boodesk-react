-- Script simples para criar tabela de preferências do usuário
-- Execute este script no Supabase SQL Editor

-- Criar tabela de preferências do usuário
CREATE TABLE IF NOT EXISTS user_preferences (
    id SERIAL PRIMARY KEY,
    user_id UUID NOT NULL,
    preferences JSONB NOT NULL DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id)
);

-- Índice para melhor performance
CREATE INDEX IF NOT EXISTS idx_user_preferences_user_id ON user_preferences(user_id);

-- Função para atualizar updated_at automaticamente
CREATE OR REPLACE FUNCTION update_user_preferences_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger para atualizar updated_at
DROP TRIGGER IF EXISTS trigger_update_user_preferences_updated_at ON user_preferences;
CREATE TRIGGER trigger_update_user_preferences_updated_at
    BEFORE UPDATE ON user_preferences
    FOR EACH ROW
    EXECUTE FUNCTION update_user_preferences_updated_at();

-- Comentários
COMMENT ON TABLE user_preferences IS 'Armazena preferências personalizadas de cada usuário';
COMMENT ON COLUMN user_preferences.preferences IS 'JSONB contendo todas as preferências do usuário';

-- Teste básico
SELECT 'Tabela user_preferences criada com sucesso!' as status;
