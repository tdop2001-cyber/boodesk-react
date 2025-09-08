-- Script para adicionar novos campos à tabela users
-- Execute este script no seu banco de dados Supabase

-- Adicionar novos campos à tabela users
ALTER TABLE users 
ADD COLUMN IF NOT EXISTS nome_completo VARCHAR(255),
ADD COLUMN IF NOT EXISTS telefone VARCHAR(20),
ADD COLUMN IF NOT EXISTS biografia TEXT,
ADD COLUMN IF NOT EXISTS fuso_horario VARCHAR(50) DEFAULT 'America/Sao_Paulo',
ADD COLUMN IF NOT EXISTS pais VARCHAR(3) DEFAULT 'BR',
ADD COLUMN IF NOT EXISTS tipo_localizacao VARCHAR(20) DEFAULT 'brasil',
ADD COLUMN IF NOT EXISTS cidade VARCHAR(100),
ADD COLUMN IF NOT EXISTS estado VARCHAR(3),
ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT true,
ADD COLUMN IF NOT EXISTS password_hash VARCHAR(255);

-- Atualizar usuários existentes com valores padrão
UPDATE users 
SET 
  fuso_horario = 'America/Sao_Paulo',
  pais = 'BR',
  tipo_localizacao = 'brasil'
WHERE fuso_horario IS NULL OR pais IS NULL OR tipo_localizacao IS NULL;

-- Comentários para documentar os novos campos
COMMENT ON COLUMN users.nome_completo IS 'Nome completo do usuário';
COMMENT ON COLUMN users.telefone IS 'Número de telefone do usuário';
COMMENT ON COLUMN users.biografia IS 'Biografia ou descrição do usuário';
COMMENT ON COLUMN users.fuso_horario IS 'Fuso horário do usuário (ex: America/Sao_Paulo)';
COMMENT ON COLUMN users.pais IS 'Código do país (ex: BR, US, etc.)';
COMMENT ON COLUMN users.tipo_localizacao IS 'Tipo de localização: brasil ou internacional';
COMMENT ON COLUMN users.cidade IS 'Nome da cidade';
COMMENT ON COLUMN users.estado IS 'Código do estado (apenas para Brasil)';

