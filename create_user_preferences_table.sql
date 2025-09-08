-- Criar tabela de preferências do usuário
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
CREATE TRIGGER trigger_update_user_preferences_updated_at
    BEFORE UPDATE ON user_preferences
    FOR EACH ROW
    EXECUTE FUNCTION update_user_preferences_updated_at();

-- RLS (Row Level Security)
ALTER TABLE user_preferences ENABLE ROW LEVEL SECURITY;

-- Política: usuários só podem ver e modificar suas próprias preferências
CREATE POLICY "Users can view own preferences" ON user_preferences
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own preferences" ON user_preferences
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own preferences" ON user_preferences
    FOR UPDATE USING (auth.uid() = user_id);

-- Política para admins (se necessário) - comentada até criar tabela user_roles
-- CREATE POLICY "Admins can view all preferences" ON user_preferences
--     FOR SELECT USING (
--         EXISTS (
--             SELECT 1 FROM user_roles 
--             WHERE user_id = auth.uid() 
--             AND role = 'admin'
--         )
--     );

