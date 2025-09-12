-- ============================================================================
-- SCHEMA OTIMIZADO PARA CHAT - PLANO GRATUITO SUPABASE
-- ============================================================================
-- Este schema foi otimizado para manter dentro dos limites do plano gratuito:
-- - 500MB de armazenamento
-- - 50.000 mensagens Realtime/mês
-- - 2GB de transferência/mês

-- ============================================================================
-- TABELA DE CHATS OTIMIZADA
-- ============================================================================
CREATE TABLE IF NOT EXISTS chats (
  id BIGSERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  chat_type TEXT CHECK (chat_type IN ('direct', 'board', 'card', 'group')) DEFAULT 'direct',
  board_id BIGINT REFERENCES boards(id) ON DELETE CASCADE,
  card_id BIGINT REFERENCES cards(id) ON DELETE CASCADE,
  created_by BIGINT REFERENCES users(id) ON DELETE CASCADE,
  is_active BOOLEAN DEFAULT true,
  last_message_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================================================
-- TABELA DE PARTICIPANTES DE CHAT
-- ============================================================================
CREATE TABLE IF NOT EXISTS chat_participants (
  id BIGSERIAL PRIMARY KEY,
  chat_id BIGINT REFERENCES chats(id) ON DELETE CASCADE,
  user_id BIGINT REFERENCES users(id) ON DELETE CASCADE,
  joined_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  last_read_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  is_active BOOLEAN DEFAULT true,
  UNIQUE(chat_id, user_id)
);

-- ============================================================================
-- TABELA DE MENSAGENS OTIMIZADA
-- ============================================================================
CREATE TABLE IF NOT EXISTS chat_messages (
  id BIGSERIAL PRIMARY KEY,
  chat_id BIGINT REFERENCES chats(id) ON DELETE CASCADE,
  sender_id BIGINT REFERENCES users(id) ON DELETE CASCADE,
  message TEXT NOT NULL CHECK (length(message) <= 1000), -- Limite de 1000 caracteres
  message_type TEXT CHECK (message_type IN ('text', 'system', 'file')) DEFAULT 'text',
  file_path TEXT, -- Para arquivos
  file_name TEXT, -- Nome do arquivo
  file_size BIGINT, -- Tamanho em bytes
  reply_to_id BIGINT REFERENCES chat_messages(id) ON DELETE SET NULL,
  is_edited BOOLEAN DEFAULT false,
  edited_at TIMESTAMP WITH TIME ZONE,
  is_deleted BOOLEAN DEFAULT false,
  deleted_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================================================
-- ÍNDICES PARA PERFORMANCE
-- ============================================================================
CREATE INDEX IF NOT EXISTS idx_chats_type ON chats(chat_type);
CREATE INDEX IF NOT EXISTS idx_chats_board_id ON chats(board_id);
CREATE INDEX IF NOT EXISTS idx_chats_card_id ON chats(card_id);
CREATE INDEX IF NOT EXISTS idx_chats_created_by ON chats(created_by);
CREATE INDEX IF NOT EXISTS idx_chats_last_message ON chats(last_message_at DESC);

CREATE INDEX IF NOT EXISTS idx_chat_participants_chat_id ON chat_participants(chat_id);
CREATE INDEX IF NOT EXISTS idx_chat_participants_user_id ON chat_participants(user_id);
CREATE INDEX IF NOT EXISTS idx_chat_participants_active ON chat_participants(is_active);

CREATE INDEX IF NOT EXISTS idx_chat_messages_chat_id ON chat_messages(chat_id);
CREATE INDEX IF NOT EXISTS idx_chat_messages_sender_id ON chat_messages(sender_id);
CREATE INDEX IF NOT EXISTS idx_chat_messages_created_at ON chat_messages(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_chat_messages_not_deleted ON chat_messages(is_deleted) WHERE is_deleted = false;

-- ============================================================================
-- FUNÇÕES PARA OTIMIZAÇÃO
-- ============================================================================

-- Função para atualizar last_message_at automaticamente
CREATE OR REPLACE FUNCTION update_chat_last_message()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE chats 
  SET last_message_at = NEW.created_at, updated_at = NOW()
  WHERE id = NEW.chat_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger para atualizar last_message_at
DROP TRIGGER IF EXISTS trigger_update_chat_last_message ON chat_messages;
CREATE TRIGGER trigger_update_chat_last_message
  AFTER INSERT ON chat_messages
  FOR EACH ROW
  EXECUTE FUNCTION update_chat_last_message();

-- ============================================================================
-- FUNÇÃO PARA LIMPEZA AUTOMÁTICA (OTIMIZAÇÃO)
-- ============================================================================
CREATE OR REPLACE FUNCTION cleanup_old_messages()
RETURNS void AS $$
BEGIN
  -- Manter apenas as últimas 1000 mensagens por chat
  DELETE FROM chat_messages 
  WHERE id NOT IN (
    SELECT id FROM chat_messages 
    WHERE chat_id = chat_messages.chat_id 
    ORDER BY created_at DESC 
    LIMIT 1000
  );
  
  -- Remover mensagens deletadas há mais de 30 dias
  DELETE FROM chat_messages 
  WHERE is_deleted = true 
  AND deleted_at < NOW() - INTERVAL '30 days';
  
  -- Remover chats inativos há mais de 90 dias
  DELETE FROM chats 
  WHERE is_active = false 
  AND updated_at < NOW() - INTERVAL '90 days';
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- POLÍTICAS RLS (ROW LEVEL SECURITY)
-- ============================================================================
ALTER TABLE chats ENABLE ROW LEVEL SECURITY;
ALTER TABLE chat_participants ENABLE ROW LEVEL SECURITY;
ALTER TABLE chat_messages ENABLE ROW LEVEL SECURITY;

-- Política para chats: usuários só podem ver chats que participam
CREATE POLICY "Users can view chats they participate in" ON chats
  FOR SELECT USING (
    id IN (
      SELECT chat_id FROM chat_participants 
      WHERE user_id = auth.uid()::bigint AND is_active = true
    )
  );

-- Política para participantes: usuários só podem ver participantes de seus chats
CREATE POLICY "Users can view participants of their chats" ON chat_participants
  FOR SELECT USING (
    chat_id IN (
      SELECT chat_id FROM chat_participants 
      WHERE user_id = auth.uid()::bigint AND is_active = true
    )
  );

-- Política para mensagens: usuários só podem ver mensagens de seus chats
CREATE POLICY "Users can view messages of their chats" ON chat_messages
  FOR SELECT USING (
    chat_id IN (
      SELECT chat_id FROM chat_participants 
      WHERE user_id = auth.uid()::bigint AND is_active = true
    )
  );

-- ============================================================================
-- DADOS INICIAIS
-- ============================================================================

-- Inserir chat geral do sistema
INSERT INTO chats (name, chat_type, created_by) 
VALUES ('Chat Geral', 'group', 1)
ON CONFLICT DO NOTHING;

-- Adicionar participantes ao chat geral
INSERT INTO chat_participants (chat_id, user_id)
SELECT 1, id FROM users WHERE is_active = true
ON CONFLICT DO NOTHING;

-- ============================================================================
-- COMENTÁRIOS DE OTIMIZAÇÃO
-- ============================================================================
COMMENT ON TABLE chats IS 'Tabela de chats otimizada para plano gratuito - máximo 1000 mensagens por chat';
COMMENT ON TABLE chat_messages IS 'Mensagens com limite de 1000 caracteres e limpeza automática';
COMMENT ON FUNCTION cleanup_old_messages() IS 'Função para manter apenas mensagens recentes e economizar espaço';
