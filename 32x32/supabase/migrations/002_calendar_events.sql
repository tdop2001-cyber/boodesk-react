-- =====================================================
-- MIGRAÇÃO 002 - TABELA DE EVENTOS DO CALENDÁRIO
-- =====================================================

-- =====================================================
-- TABELA DE EVENTOS DO CALENDÁRIO
-- =====================================================
CREATE TABLE IF NOT EXISTS calendar_events (
    id SERIAL PRIMARY KEY,
    title VARCHAR(200) NOT NULL,
    description TEXT,
    start_datetime TIMESTAMP NOT NULL,
    end_datetime TIMESTAMP NOT NULL,
    location VARCHAR(200),
    attendees JSONB DEFAULT '[]',
    google_event_id VARCHAR(100),
    google_calendar_id VARCHAR(100) DEFAULT 'primary',
    event_type VARCHAR(50) DEFAULT 'local' CHECK (event_type IN ('local', 'google', 'meeting', 'card_due')),
    source VARCHAR(50) DEFAULT 'boodesk' CHECK (source IN ('boodesk', 'google_calendar', 'manual')),
    status VARCHAR(20) DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'completed', 'cancelled', 'postponed')),
    priority VARCHAR(20) DEFAULT 'normal' CHECK (priority IN ('low', 'normal', 'high', 'urgent')),
    color VARCHAR(7) DEFAULT '#2563eb',
    is_all_day BOOLEAN DEFAULT FALSE,
    recurrence_rule TEXT,
    reminders JSONB DEFAULT '[]',
    metadata JSONB DEFAULT '{}',
    created_by INTEGER REFERENCES users(id) ON DELETE SET NULL,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    synced_at TIMESTAMP
);

-- =====================================================
-- TABELA DE SINCRONIZAÇÃO GOOGLE CALENDAR
-- =====================================================
CREATE TABLE IF NOT EXISTS google_calendar_sync (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    google_event_id VARCHAR(100) NOT NULL,
    local_event_id INTEGER REFERENCES calendar_events(id) ON DELETE CASCADE,
    sync_status VARCHAR(20) DEFAULT 'synced' CHECK (sync_status IN ('synced', 'pending', 'failed', 'conflict')),
    last_sync_at TIMESTAMP DEFAULT NOW(),
    sync_direction VARCHAR(10) DEFAULT 'bidirectional' CHECK (sync_direction IN ('to_google', 'from_google', 'bidirectional')),
    error_message TEXT,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    UNIQUE(google_event_id, local_event_id)
);

-- =====================================================
-- TABELA DE CONFIGURAÇÕES DO CALENDÁRIO
-- =====================================================
CREATE TABLE IF NOT EXISTS calendar_settings (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    setting_key VARCHAR(100) NOT NULL,
    setting_value JSONB,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    UNIQUE(user_id, setting_key)
);

-- =====================================================
-- ÍNDICES PARA PERFORMANCE
-- =====================================================

-- Índices para eventos do calendário
CREATE INDEX idx_calendar_events_start_datetime ON calendar_events(start_datetime);
CREATE INDEX idx_calendar_events_end_datetime ON calendar_events(end_datetime);
CREATE INDEX idx_calendar_events_created_by ON calendar_events(created_by);
CREATE INDEX idx_calendar_events_event_type ON calendar_events(event_type);
CREATE INDEX idx_calendar_events_status ON calendar_events(status);
CREATE INDEX idx_calendar_events_google_event_id ON calendar_events(google_event_id);
CREATE INDEX idx_calendar_events_date_range ON calendar_events(start_datetime, end_datetime);

-- Índices para sincronização
CREATE INDEX idx_google_calendar_sync_user_id ON google_calendar_sync(user_id);
CREATE INDEX idx_google_calendar_sync_google_event_id ON google_calendar_sync(google_event_id);
CREATE INDEX idx_google_calendar_sync_local_event_id ON google_calendar_sync(local_event_id);
CREATE INDEX idx_google_calendar_sync_status ON google_calendar_sync(sync_status);

-- Índices para configurações
CREATE INDEX idx_calendar_settings_user_id ON calendar_settings(user_id);
CREATE INDEX idx_calendar_settings_key ON calendar_settings(setting_key);

-- =====================================================
-- FUNÇÕES E TRIGGERS
-- =====================================================

-- Trigger para atualizar updated_at
CREATE TRIGGER update_calendar_events_updated_at BEFORE UPDATE ON calendar_events
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_google_calendar_sync_updated_at BEFORE UPDATE ON google_calendar_sync
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_calendar_settings_updated_at BEFORE UPDATE ON calendar_settings
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Função para buscar eventos por período
CREATE OR REPLACE FUNCTION get_calendar_events_by_period(
    p_user_id INTEGER,
    p_start_date DATE,
    p_end_date DATE,
    p_include_google BOOLEAN DEFAULT TRUE
)
RETURNS TABLE (
    id INTEGER,
    title VARCHAR(200),
    description TEXT,
    start_datetime TIMESTAMP,
    end_datetime TIMESTAMP,
    location VARCHAR(200),
    attendees JSONB,
    event_type VARCHAR(50),
    source VARCHAR(50),
    status VARCHAR(20),
    priority VARCHAR(20),
    color VARCHAR(7),
    is_all_day BOOLEAN,
    google_event_id VARCHAR(100),
    created_by INTEGER
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        ce.id,
        ce.title,
        ce.description,
        ce.start_datetime,
        ce.end_datetime,
        ce.location,
        ce.attendees,
        ce.event_type,
        ce.source,
        ce.status,
        ce.priority,
        ce.color,
        ce.is_all_day,
        ce.google_event_id,
        ce.created_by
    FROM calendar_events ce
    WHERE ce.created_by = p_user_id
      AND DATE(ce.start_datetime) BETWEEN p_start_date AND p_end_date
      AND ce.status != 'cancelled'
    ORDER BY ce.start_datetime;
END;
$$ LANGUAGE plpgsql;

-- Função para sincronizar evento com Google Calendar
CREATE OR REPLACE FUNCTION sync_event_with_google(
    p_local_event_id INTEGER,
    p_google_event_id VARCHAR(100),
    p_sync_status VARCHAR(20) DEFAULT 'synced'
)
RETURNS INTEGER AS $$
DECLARE
    sync_id INTEGER;
BEGIN
    -- Inserir ou atualizar registro de sincronização
    INSERT INTO google_calendar_sync (
        local_event_id, 
        google_event_id, 
        sync_status, 
        last_sync_at
    ) VALUES (
        p_local_event_id, 
        p_google_event_id, 
        p_sync_status, 
        NOW()
    )
    ON CONFLICT (google_event_id, local_event_id) 
    DO UPDATE SET 
        sync_status = EXCLUDED.sync_status,
        last_sync_at = EXCLUDED.last_sync_at,
        updated_at = NOW()
    RETURNING id INTO sync_id;
    
    -- Atualizar evento local com ID do Google
    UPDATE calendar_events 
    SET google_event_id = p_google_event_id,
        synced_at = NOW(),
        updated_at = NOW()
    WHERE id = p_local_event_id;
    
    RETURN sync_id;
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- DADOS INICIAIS
-- =====================================================

-- Inserir configurações padrão do calendário
INSERT INTO calendar_settings (user_id, setting_key, setting_value) VALUES
(1, 'calendar_view', '"month"'),
(1, 'default_event_duration', '60'),
(1, 'working_hours', '{"start": "09:00", "end": "18:00"}'),
(1, 'weekend_visible', 'true'),
(1, 'google_calendar_sync', 'true'),
(1, 'event_colors', '{"meeting": "#2563eb", "task": "#10b981", "reminder": "#f59e0b", "deadline": "#ef4444"}'),
(1, 'reminder_settings', '{"email": true, "popup": true, "minutes_before": 15}');

-- =====================================================
-- COMENTÁRIOS
-- =====================================================

COMMENT ON TABLE calendar_events IS 'Tabela de eventos do calendário local e sincronizados';
COMMENT ON TABLE google_calendar_sync IS 'Tabela de controle de sincronização com Google Calendar';
COMMENT ON TABLE calendar_settings IS 'Configurações personalizadas do calendário por usuário';

COMMENT ON COLUMN calendar_events.google_event_id IS 'ID do evento no Google Calendar (se sincronizado)';
COMMENT ON COLUMN calendar_events.event_type IS 'Tipo do evento: local, google, meeting, card_due';
COMMENT ON COLUMN calendar_events.source IS 'Origem do evento: boodesk, google_calendar, manual';
COMMENT ON COLUMN calendar_events.metadata IS 'Metadados adicionais do evento (JSON)';
COMMENT ON COLUMN calendar_events.synced_at IS 'Data/hora da última sincronização com Google Calendar';

-- =====================================================
-- FINALIZAR MIGRAÇÃO
-- =====================================================

SELECT 'Migração 002 - Tabela de eventos do calendário criada com sucesso!' as status;


