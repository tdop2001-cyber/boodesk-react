-- =====================================================
-- MIGRAÇÃO 003: INTEGRAÇÃO GOOGLE MEET NO POSTGRESQL
-- =====================================================
-- Data: 2024-01-XX
-- Descrição: Integração completa do Google Meet no PostgreSQL
-- Autor: Sistema Boodesk
-- =====================================================

-- =====================================================
-- TABELA DE CREDENCIAIS DA API GOOGLE
-- =====================================================
CREATE TABLE IF NOT EXISTS google_api_credentials (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    service_name VARCHAR(50) NOT NULL CHECK (service_name IN ('calendar', 'meet', 'drive', 'gmail')),
    client_id VARCHAR(255) NOT NULL,
    client_secret VARCHAR(255) NOT NULL,
    project_id VARCHAR(255),
    auth_uri VARCHAR(255) DEFAULT 'https://accounts.google.com/o/oauth2/auth',
    token_uri VARCHAR(255) DEFAULT 'https://oauth2.googleapis.com/token',
    auth_provider_x509_cert_url VARCHAR(255) DEFAULT 'https://www.googleapis.com/oauth2/v1/certs',
    redirect_uris JSONB DEFAULT '["http://localhost"]',
    scopes JSONB DEFAULT '["https://www.googleapis.com/auth/calendar"]',
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    UNIQUE(user_id, service_name)
);

-- =====================================================
-- TABELA DE TOKENS DE ACESSO
-- =====================================================
CREATE TABLE IF NOT EXISTS google_api_tokens (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    service_name VARCHAR(50) NOT NULL CHECK (service_name IN ('calendar', 'meet', 'drive', 'gmail')),
    access_token TEXT NOT NULL,
    refresh_token TEXT,
    token_type VARCHAR(50) DEFAULT 'Bearer',
    expires_at TIMESTAMP,
    scope TEXT,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    UNIQUE(user_id, service_name)
);

-- =====================================================
-- TABELA DE CONFIGURAÇÕES DO GOOGLE MEET
-- =====================================================
CREATE TABLE IF NOT EXISTS google_meet_settings (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    setting_key VARCHAR(100) NOT NULL,
    setting_value JSONB,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    UNIQUE(user_id, setting_key)
);

-- =====================================================
-- TABELA DE REUNIÕES DO GOOGLE MEET
-- =====================================================
CREATE TABLE IF NOT EXISTS google_meet_meetings (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    local_meeting_id INTEGER REFERENCES meetings(id) ON DELETE CASCADE,
    google_event_id VARCHAR(255) UNIQUE,
    google_meet_link TEXT,
    google_calendar_link TEXT,
    sync_status VARCHAR(20) DEFAULT 'synced' CHECK (sync_status IN ('synced', 'pending', 'failed', 'conflict')),
    last_sync_at TIMESTAMP DEFAULT NOW(),
    error_message TEXT,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- =====================================================
-- ÍNDICES PARA PERFORMANCE
-- =====================================================

-- Índices para credenciais da API
CREATE INDEX idx_google_api_credentials_user_id ON google_api_credentials(user_id);
CREATE INDEX idx_google_api_credentials_service ON google_api_credentials(service_name);
CREATE INDEX idx_google_api_credentials_active ON google_api_credentials(is_active);

-- Índices para tokens
CREATE INDEX idx_google_api_tokens_user_id ON google_api_tokens(user_id);
CREATE INDEX idx_google_api_tokens_service ON google_api_tokens(service_name);
CREATE INDEX idx_google_api_tokens_expires ON google_api_tokens(expires_at);

-- Índices para configurações do Meet
CREATE INDEX idx_google_meet_settings_user_id ON google_meet_settings(user_id);
CREATE INDEX idx_google_meet_settings_key ON google_meet_settings(setting_key);

-- Índices para reuniões do Meet
CREATE INDEX idx_google_meet_meetings_user_id ON google_meet_meetings(user_id);
CREATE INDEX idx_google_meet_meetings_local_id ON google_meet_meetings(local_meeting_id);
CREATE INDEX idx_google_meet_meetings_google_id ON google_meet_meetings(google_event_id);
CREATE INDEX idx_google_meet_meetings_sync_status ON google_meet_meetings(sync_status);

-- =====================================================
-- FUNÇÕES AUXILIARES
-- =====================================================

-- Função para obter credenciais ativas
CREATE OR REPLACE FUNCTION get_active_google_credentials(
    p_user_id INTEGER,
    p_service_name VARCHAR(50)
)
RETURNS TABLE (
    client_id VARCHAR(255),
    client_secret VARCHAR(255),
    project_id VARCHAR(255),
    auth_uri VARCHAR(255),
    token_uri VARCHAR(255),
    auth_provider_x509_cert_url VARCHAR(255),
    redirect_uris JSONB,
    scopes JSONB
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        gac.client_id,
        gac.client_secret,
        gac.project_id,
        gac.auth_uri,
        gac.token_uri,
        gac.auth_provider_x509_cert_url,
        gac.redirect_uris,
        gac.scopes
    FROM google_api_credentials gac
    WHERE gac.user_id = p_user_id 
      AND gac.service_name = p_service_name 
      AND gac.is_active = TRUE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Função para obter token válido
CREATE OR REPLACE FUNCTION get_valid_google_token(
    p_user_id INTEGER,
    p_service_name VARCHAR(50)
)
RETURNS TABLE (
    access_token TEXT,
    refresh_token TEXT,
    token_type VARCHAR(50),
    expires_at TIMESTAMP,
    scope TEXT
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        gat.access_token,
        gat.refresh_token,
        gat.token_type,
        gat.expires_at,
        gat.scope
    FROM google_api_tokens gat
    WHERE gat.user_id = p_user_id 
      AND gat.service_name = p_service_name
      AND (gat.expires_at IS NULL OR gat.expires_at > NOW());
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Função para atualizar token
CREATE OR REPLACE FUNCTION update_google_token(
    p_user_id INTEGER,
    p_service_name VARCHAR(50),
    p_access_token TEXT,
    p_refresh_token TEXT DEFAULT NULL,
    p_expires_at TIMESTAMP DEFAULT NULL,
    p_scope TEXT DEFAULT NULL
)
RETURNS BOOLEAN AS $$
BEGIN
    INSERT INTO google_api_tokens (user_id, service_name, access_token, refresh_token, expires_at, scope, updated_at)
    VALUES (p_user_id, p_service_name, p_access_token, p_refresh_token, p_expires_at, p_scope, NOW())
    ON CONFLICT (user_id, service_name)
    DO UPDATE SET
        access_token = EXCLUDED.access_token,
        refresh_token = COALESCE(EXCLUDED.refresh_token, google_api_tokens.refresh_token),
        expires_at = EXCLUDED.expires_at,
        scope = EXCLUDED.scope,
        updated_at = NOW();
    
    RETURN TRUE;
EXCEPTION
    WHEN OTHERS THEN
        RETURN FALSE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- POLÍTICAS RLS (ROW LEVEL SECURITY)
-- =====================================================

-- Habilitar RLS nas tabelas
ALTER TABLE google_api_credentials ENABLE ROW LEVEL SECURITY;
ALTER TABLE google_api_tokens ENABLE ROW LEVEL SECURITY;
ALTER TABLE google_meet_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE google_meet_meetings ENABLE ROW LEVEL SECURITY;

-- Políticas para google_api_credentials
CREATE POLICY "users_own_credentials" ON google_api_credentials
    FOR ALL USING (user_id = auth.uid());

CREATE POLICY "admin_all_credentials" ON google_api_credentials
    FOR ALL USING (
        EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin')
    );

-- Políticas para google_api_tokens
CREATE POLICY "users_own_tokens" ON google_api_tokens
    FOR ALL USING (user_id = auth.uid());

CREATE POLICY "admin_all_tokens" ON google_api_tokens
    FOR ALL USING (
        EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin')
    );

-- Políticas para google_meet_settings
CREATE POLICY "users_own_meet_settings" ON google_meet_settings
    FOR ALL USING (user_id = auth.uid());

CREATE POLICY "admin_all_meet_settings" ON google_meet_settings
    FOR ALL USING (
        EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin')
    );

-- Políticas para google_meet_meetings
CREATE POLICY "users_own_meet_meetings" ON google_meet_meetings
    FOR ALL USING (user_id = auth.uid());

CREATE POLICY "admin_all_meet_meetings" ON google_meet_meetings
    FOR ALL USING (
        EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin')
    );

-- =====================================================
-- DADOS INICIAIS
-- =====================================================

-- Configurações padrão do Google Meet para usuário admin
INSERT INTO google_meet_settings (user_id, setting_key, setting_value) VALUES
(1, 'auto_create_meet', 'true'),
(1, 'default_duration', '60'),
(1, 'timezone', '"America/Sao_Paulo"'),
(1, 'notification_minutes', '15'),
(1, 'sync_with_calendar', 'true'),
(1, 'meeting_templates', '[
    {"name": "Reunião Padrão", "duration": 60, "description": "Reunião de trabalho"},
    {"name": "Daily Standup", "duration": 15, "description": "Reunião diária rápida"},
    {"name": "Sprint Planning", "duration": 120, "description": "Planejamento de sprint"}
]')
ON CONFLICT (user_id, setting_key) DO NOTHING;

-- =====================================================
-- COMENTÁRIOS
-- =====================================================

COMMENT ON TABLE google_api_credentials IS 'Credenciais da API Google por usuário e serviço';
COMMENT ON TABLE google_api_tokens IS 'Tokens de acesso da API Google por usuário e serviço';
COMMENT ON TABLE google_meet_settings IS 'Configurações do Google Meet por usuário';
COMMENT ON TABLE google_meet_meetings IS 'Reuniões do Google Meet sincronizadas';

COMMENT ON COLUMN google_api_credentials.service_name IS 'Nome do serviço: calendar, meet, drive, gmail';
COMMENT ON COLUMN google_api_credentials.is_active IS 'Se as credenciais estão ativas';
COMMENT ON COLUMN google_api_tokens.expires_at IS 'Data/hora de expiração do token';
COMMENT ON COLUMN google_meet_meetings.sync_status IS 'Status da sincronização: synced, pending, failed, conflict';

-- =====================================================
-- FINALIZAR MIGRAÇÃO
-- =====================================================

SELECT 'Migração 003 - Integração Google Meet no PostgreSQL criada com sucesso!' as status;

