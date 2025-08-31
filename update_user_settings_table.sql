-- Script para atualizar a tabela user_settings
-- Execute este script no seu banco de dados Supabase

-- 1. Fazer backup dos dados existentes (se houver)
CREATE TABLE IF NOT EXISTS user_settings_backup AS 
SELECT * FROM user_settings;

-- 2. Dropar a tabela atual
DROP TABLE IF EXISTS user_settings;

-- 3. Criar a nova tabela com estrutura flexível
CREATE TABLE IF NOT EXISTS user_settings (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id),
  setting_key VARCHAR(255) NOT NULL,
  setting_value TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, setting_key)
);

-- 4. Criar trigger para atualizar updated_at
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

-- 5. Migrar dados antigos (se existirem e se as colunas existirem)
DO $$
BEGIN
  -- Verificar se a coluna theme existe antes de migrar
  IF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'user_settings_backup' AND column_name = 'theme'
  ) THEN
    INSERT INTO user_settings (user_id, setting_key, setting_value)
    SELECT 
      user_id,
      'theme',
      theme
    FROM user_settings_backup
    WHERE theme IS NOT NULL;
  END IF;

  -- Verificar se a coluna language existe antes de migrar
  IF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'user_settings_backup' AND column_name = 'language'
  ) THEN
    INSERT INTO user_settings (user_id, setting_key, setting_value)
    SELECT 
      user_id,
      'language',
      language
    FROM user_settings_backup
    WHERE language IS NOT NULL;
  END IF;

  -- Verificar se a coluna notifications existe antes de migrar
  IF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'user_settings_backup' AND column_name = 'notifications'
  ) THEN
    INSERT INTO user_settings (user_id, setting_key, setting_value)
    SELECT 
      user_id,
      'notifications',
      notifications::text
    FROM user_settings_backup
    WHERE notifications IS NOT NULL;
  END IF;
END $$;

-- 6. Remover tabela de backup (opcional)
-- DROP TABLE user_settings_backup;
