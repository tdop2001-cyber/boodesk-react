-- Script para criar sistema completo de arquivamento de cards
-- Execute este SQL no Editor SQL do Supabase
-- Versão corrigida para compatibilidade de tipos

-- 1. Criar tabela de pastas de arquivo
CREATE TABLE IF NOT EXISTS archive_folders (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    color VARCHAR(7) DEFAULT '#6B7280',
    icon VARCHAR(50) DEFAULT 'folder',
    created_by INTEGER NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    is_active BOOLEAN DEFAULT true
);

-- 2. Criar tabela de arquivo de cards
CREATE TABLE IF NOT EXISTS archived_cards (
    id SERIAL PRIMARY KEY,
    original_card_id INTEGER NOT NULL,
    archive_folder_id INTEGER,
    archived_by INTEGER NOT NULL,
    archived_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    archive_reason VARCHAR(255) DEFAULT 'Concluído',
    retention_period INTEGER DEFAULT 365,
    auto_archived BOOLEAN DEFAULT false,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Criar tabela de configurações de arquivamento automático
CREATE TABLE IF NOT EXISTS archive_settings (
    id SERIAL PRIMARY KEY,
    board_id INTEGER,
    auto_archive_enabled BOOLEAN DEFAULT false,
    archive_after_days INTEGER DEFAULT 30,
    default_folder_id INTEGER,
    notification_enabled BOOLEAN DEFAULT true,
    created_by INTEGER NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. Criar tabela de histórico de arquivamento
CREATE TABLE IF NOT EXISTS archive_history (
    id SERIAL PRIMARY KEY,
    card_id INTEGER NOT NULL,
    action VARCHAR(50) NOT NULL,
    performed_by INTEGER NOT NULL,
    performed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    details JSONB DEFAULT '{}',
    archive_folder_id INTEGER
);

-- 5. Adicionar colunas de arquivamento na tabela cards (se não existirem)
ALTER TABLE cards 
ADD COLUMN IF NOT EXISTS is_archived BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS archived_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS archived_by INTEGER,
ADD COLUMN IF NOT EXISTS archive_folder_id INTEGER,
ADD COLUMN IF NOT EXISTS completed_at TIMESTAMP WITH TIME ZONE;

-- 6. Criar índices para melhor performance
CREATE INDEX IF NOT EXISTS idx_archived_cards_original_id ON archived_cards(original_card_id);
CREATE INDEX IF NOT EXISTS idx_archived_cards_folder_id ON archived_cards(archive_folder_id);
CREATE INDEX IF NOT EXISTS idx_archived_cards_archived_at ON archived_cards(archived_at);
CREATE INDEX IF NOT EXISTS idx_cards_is_archived ON cards(is_archived);
CREATE INDEX IF NOT EXISTS idx_cards_archived_at ON cards(archived_at);
CREATE INDEX IF NOT EXISTS idx_archive_settings_board_id ON archive_settings(board_id);

-- 7. Criar função para arquivamento automático
CREATE OR REPLACE FUNCTION auto_archive_completed_cards()
RETURNS INTEGER AS $$
DECLARE
    archived_count INTEGER := 0;
    card_record RECORD;
    settings_record RECORD;
BEGIN
    -- Buscar configurações de arquivamento automático ativas
    FOR settings_record IN 
        SELECT * FROM archive_settings 
        WHERE auto_archive_enabled = true
    LOOP
        -- Buscar cards concluídos para arquivar baseado nas configurações
        FOR card_record IN 
            SELECT c.* FROM cards c
            WHERE c.is_archived = false 
            AND c.status = 'done'
            AND c.completed_at IS NOT NULL
            AND c.completed_at <= NOW() - INTERVAL '1 day' * settings_record.archive_after_days
            AND (
                settings_record.board_id IS NULL 
                OR c.board_id::integer = settings_record.board_id
            )
        LOOP
            -- Arquivar o card
            UPDATE cards 
            SET 
                is_archived = true,
                archived_at = NOW(),
                archived_by = card_record.created_by,
                archive_folder_id = COALESCE(settings_record.default_folder_id, 1)
            WHERE id = card_record.id;
            
            -- Inserir no histórico de arquivo
            INSERT INTO archived_cards (
                original_card_id,
                archive_folder_id,
                archived_by,
                archive_reason,
                auto_archived
            ) VALUES (
                card_record.id,
                COALESCE(settings_record.default_folder_id, 1),
                card_record.created_by,
                'Arquivamento automático após ' || settings_record.archive_after_days || ' dias',
                true
            );
            
            -- Inserir no histórico
            INSERT INTO archive_history (
                card_id,
                action,
                performed_by,
                archive_folder_id,
                details
            ) VALUES (
                card_record.id,
                'archived',
                card_record.created_by,
                COALESCE(settings_record.default_folder_id, 1),
                jsonb_build_object(
                    'auto_archived', true,
                    'archive_after_days', settings_record.archive_after_days,
                    'completed_at', card_record.completed_at
                )
            );
            
            archived_count := archived_count + 1;
        END LOOP;
    END LOOP;
    
    RETURN archived_count;
END;
$$ LANGUAGE plpgsql;

-- 8. Criar função para restaurar card do arquivo
CREATE OR REPLACE FUNCTION restore_archived_card(card_id INTEGER, restored_by INTEGER)
RETURNS BOOLEAN AS $$
BEGIN
    -- Verificar se o card está arquivado
    IF NOT EXISTS (SELECT 1 FROM cards WHERE id = card_id AND is_archived = true) THEN
        RETURN false;
    END IF;
    
    -- Restaurar o card
    UPDATE cards 
    SET 
        is_archived = false,
        archived_at = NULL,
        archived_by = NULL,
        archive_folder_id = NULL
    WHERE id = card_id;
    
    -- Inserir no histórico
    INSERT INTO archive_history (
        card_id,
        action,
        performed_by,
        details
    ) VALUES (
        card_id,
        'restored',
        restored_by,
        jsonb_build_object('restored_at', NOW())
    );
    
    RETURN true;
END;
$$ LANGUAGE plpgsql;

-- 9. Criar trigger para atualizar completed_at quando status muda para 'done'
CREATE OR REPLACE FUNCTION update_completed_at()
RETURNS TRIGGER AS $$
BEGIN
    -- Se o status mudou para 'done' e completed_at é NULL, definir a data atual
    IF NEW.status = 'done' AND (OLD.status IS NULL OR OLD.status != 'done') AND NEW.completed_at IS NULL THEN
        NEW.completed_at := NOW();
    END IF;
    
    -- Se o status mudou de 'done' para outro, limpar completed_at
    IF OLD.status = 'done' AND NEW.status != 'done' THEN
        NEW.completed_at := NULL;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Criar o trigger (remover se existir)
DROP TRIGGER IF EXISTS trigger_update_completed_at ON cards;
CREATE TRIGGER trigger_update_completed_at
    BEFORE UPDATE ON cards
    FOR EACH ROW
    EXECUTE FUNCTION update_completed_at();

-- 10. Inserir pastas padrão
INSERT INTO archive_folders (name, description, color, icon, created_by) VALUES
('Concluídos 2024', 'Cards concluídos em 2024', '#10B981', 'check-circle', 1),
('Projetos Finalizados', 'Projetos que foram completados', '#3B82F6', 'folder-check', 1),
('Tarefas de Manutenção', 'Tarefas de manutenção concluídas', '#F59E0B', 'wrench', 1),
('Arquivo Geral', 'Pasta geral para cards arquivados', '#6B7280', 'archive', 1)
ON CONFLICT DO NOTHING;

-- 11. Inserir configurações padrão de arquivamento
INSERT INTO archive_settings (board_id, auto_archive_enabled, archive_after_days, default_folder_id, created_by) VALUES
(NULL, false, 30, 4, 1)
ON CONFLICT DO NOTHING;

-- 12. Criar view para cards arquivados com informações completas
CREATE OR REPLACE VIEW archived_cards_view AS
SELECT 
    c.id,
    c.title,
    c.description,
    c.priority,
    c.status,
    c.created_at,
    c.completed_at,
    c.archived_at,
    c.is_archived,
    af.name as archive_folder_name,
    af.color as archive_folder_color,
    af.icon as archive_folder_icon,
    u.username as archived_by_username,
    u.nome_completo as archived_by_name,
    b.name as board_name,
    col.name as column_name
FROM cards c
LEFT JOIN archive_folders af ON c.archive_folder_id = af.id
LEFT JOIN users u ON c.archived_by = u.id
LEFT JOIN boards b ON (c.board_id::text)::integer = b.id
LEFT JOIN lists col ON c.column_id = col.id
WHERE c.is_archived = true;

-- 13. Verificar se as tabelas foram criadas corretamente
SELECT 
    'Verificação das tabelas criadas' as status,
    COUNT(*) as total_tables
FROM information_schema.tables 
WHERE table_name IN ('archive_folders', 'archived_cards', 'archive_settings', 'archive_history');

-- 14. Verificar se as colunas foram adicionadas na tabela cards
SELECT 
    'Verificação das colunas adicionadas em cards' as status,
    column_name,
    data_type,
    is_nullable
FROM information_schema.columns 
WHERE table_name = 'cards' 
AND column_name IN ('is_archived', 'archived_at', 'archived_by', 'archive_folder_id', 'completed_at')
ORDER BY column_name;

-- Mensagem de sucesso
SELECT 'Sistema de arquivamento criado com sucesso!' as resultado;
