-- Criar tabela de preferências do usuário (versão corrigida)
CREATE TABLE IF NOT EXISTS user_preferences (
    id SERIAL PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
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

-- RLS (Row Level Security)
ALTER TABLE user_preferences ENABLE ROW LEVEL SECURITY;

-- Política: usuários só podem ver e modificar suas próprias preferências
DROP POLICY IF EXISTS "Users can view own preferences" ON user_preferences;
CREATE POLICY "Users can view own preferences" ON user_preferences
    FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert own preferences" ON user_preferences;
CREATE POLICY "Users can insert own preferences" ON user_preferences
    FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own preferences" ON user_preferences;
CREATE POLICY "Users can update own preferences" ON user_preferences
    FOR UPDATE USING (auth.uid() = user_id);

-- Comentário sobre a tabela
COMMENT ON TABLE user_preferences IS 'Armazena preferências personalizadas de cada usuário (filtros, modo de visualização, etc.)';
COMMENT ON COLUMN user_preferences.preferences IS 'JSONB contendo todas as preferências do usuário';
