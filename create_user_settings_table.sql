-- Script para criar a tabela user_settings do zero
-- Execute este script no seu banco de dados Supabase

-- 1. Dropar a tabela se existir (CUIDADO: isso apagará todos os dados existentes)
DROP TABLE IF EXISTS user_settings CASCADE;

-- 2. Criar a nova tabela com estrutura flexível
CREATE TABLE user_settings (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  setting_key VARCHAR(255) NOT NULL,
  setting_value TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, setting_key)
);

-- 3. Criar trigger para atualizar updated_at automaticamente
CREATE OR REPLACE FUNCTION update_user_settings_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_user_settings_updated_at 
  BEFORE UPDATE ON user_settings 
  FOR EACH ROW 
  EXECUTE FUNCTION update_user_settings_updated_at();

-- 4. Criar índices para melhor performance
CREATE INDEX idx_user_settings_user_id ON user_settings(user_id);
CREATE INDEX idx_user_settings_key ON user_settings(setting_key);

-- 5. Inserir algumas configurações padrão para teste (opcional)
INSERT INTO user_settings (user_id, setting_key, setting_value) VALUES
(1, 'boardSettings', '{"defaultColumns":["A Fazer","Em Progresso","Concluído"],"autoSave":true,"showCardCount":true}'),
(1, 'cardSettings', '{"defaultPriority":"medium","showDueDate":true,"showAssignee":true}'),
(1, 'visualSettings', '{"theme":"light","cardStyle":"rounded","showAvatars":true}'),
(1, 'userSettings', '{"language":"pt-BR","timezone":"America/Sao_Paulo"}');

-- 6. Verificar se a tabela foi criada corretamente
SELECT 'Tabela user_settings criada com sucesso!' as status;
