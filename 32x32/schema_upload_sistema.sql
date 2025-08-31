-- Esquema SQL para Sistema de Upload Completo
-- Tabelas para gerenciar uploads de arquivos e versões do sistema

-- Tabela para armazenar metadados de arquivos uploadados
CREATE TABLE IF NOT EXISTS arquivos_upload (
    id SERIAL PRIMARY KEY,
    nome_arquivo VARCHAR(255) NOT NULL,
    caminho_arquivo VARCHAR(500) NOT NULL,
    tamanho_bytes BIGINT NOT NULL,
    hash_arquivo VARCHAR(64) NOT NULL,
    url_download TEXT NOT NULL,
    provedor VARCHAR(50) NOT NULL CHECK (provedor IN ('supabase', 'cdn_externo')),
    categoria VARCHAR(100) NOT NULL,
    tipo_mime VARCHAR(100),
    data_upload TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    usuario_upload_id INTEGER REFERENCES users(id),
    ativo BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela para versões do sistema
CREATE TABLE IF NOT EXISTS versoes_sistema (
    id SERIAL PRIMARY KEY,
    versao VARCHAR(50) NOT NULL,
    plataforma VARCHAR(20) NOT NULL CHECK (plataforma IN ('windows', 'linux', 'mac')),
    url_download TEXT NOT NULL,
    tamanho_bytes BIGINT,
    hash_arquivo VARCHAR(64),
    notas_lancamento TEXT,
    data_lancamento TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    ativo BOOLEAN DEFAULT TRUE,
    downloads_count INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(versao, plataforma)
);

-- Tabela para categorias de arquivos
CREATE TABLE IF NOT EXISTS categorias_arquivos (
    id SERIAL PRIMARY KEY,
    nome VARCHAR(100) NOT NULL UNIQUE,
    descricao TEXT,
    max_tamanho_bytes BIGINT DEFAULT 52428800, -- 50MB padrão
    tipos_permitidos TEXT[], -- Array de extensões permitidas
    ativo BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela para logs de download
CREATE TABLE IF NOT EXISTS logs_download (
    id SERIAL PRIMARY KEY,
    arquivo_id INTEGER REFERENCES arquivos_upload(id),
    versao_id INTEGER REFERENCES versoes_sistema(id),
    usuario_id INTEGER REFERENCES users(id),
    ip_address INET,
    user_agent TEXT,
    data_download TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    sucesso BOOLEAN DEFAULT TRUE,
    erro_mensagem TEXT
);

-- Tabela para configurações do sistema de upload
CREATE TABLE IF NOT EXISTS config_upload (
    id SERIAL PRIMARY KEY,
    chave VARCHAR(100) NOT NULL UNIQUE,
    valor TEXT NOT NULL,
    descricao TEXT,
    tipo VARCHAR(50) DEFAULT 'string',
    ativo BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índices para performance
CREATE INDEX IF NOT EXISTS idx_arquivos_upload_categoria ON arquivos_upload(categoria);
CREATE INDEX IF NOT EXISTS idx_arquivos_upload_provedor ON arquivos_upload(provedor);
CREATE INDEX IF NOT EXISTS idx_arquivos_upload_data ON arquivos_upload(data_upload);
CREATE INDEX IF NOT EXISTS idx_versoes_sistema_plataforma ON versoes_sistema(plataforma);
CREATE INDEX IF NOT EXISTS idx_versoes_sistema_ativo ON versoes_sistema(ativo);
CREATE INDEX IF NOT EXISTS idx_logs_download_data ON logs_download(data_download);

-- Inserir categorias padrão
INSERT INTO categorias_arquivos (nome, descricao, max_tamanho_bytes, tipos_permitidos) VALUES
('versoes', 'Executáveis de versões do sistema', 104857600, ARRAY['.exe', '.msi', '.deb', '.rpm', '.dmg', '.app']),
('documentos', 'Documentos e arquivos de texto', 52428800, ARRAY['.pdf', '.doc', '.docx', '.xls', '.xlsx', '.ppt', '.pptx', '.txt']),
('imagens', 'Imagens e fotos', 10485760, ARRAY['.jpg', '.jpeg', '.png', '.gif', '.bmp', '.svg']),
('audios', 'Arquivos de áudio', 52428800, ARRAY['.mp3', '.wav', '.flac', '.aac', '.ogg']),
('videos', 'Arquivos de vídeo', 104857600, ARRAY['.mp4', '.avi', '.mov', '.mkv', '.wmv']),
('anexos', 'Anexos gerais', 52428800, ARRAY['.zip', '.rar', '.7z', '.tar', '.gz']),
('geral', 'Arquivos gerais', 52428800, ARRAY['*'])
ON CONFLICT (nome) DO NOTHING;

-- Inserir configurações padrão
INSERT INTO config_upload (chave, valor, descricao, tipo) VALUES
('max_file_size_supabase', '52428800', 'Tamanho máximo para upload no Supabase (50MB)', 'integer'),
('max_file_size_cdn', '104857600', 'Tamanho máximo para upload no CDN (100MB)', 'integer'),
('enable_cdn', 'true', 'Habilitar CDN externo para arquivos grandes', 'boolean'),
('cdn_provider', 'cloudflare_r2', 'Provedor de CDN (cloudflare_r2, aws_s3, google_cloud)', 'string'),
('storage_bucket', 'boodesk-files', 'Bucket padrão do Supabase Storage', 'string'),
('cdn_bucket', 'boodesk-cdn', 'Bucket padrão do CDN externo', 'string'),
('enable_compression', 'true', 'Habilitar compressão de imagens', 'boolean'),
('enable_virus_scan', 'false', 'Habilitar verificação de vírus', 'boolean')
ON CONFLICT (chave) DO NOTHING;

-- Função para atualizar timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers para atualizar timestamps
CREATE TRIGGER update_arquivos_upload_updated_at 
    BEFORE UPDATE ON arquivos_upload 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_versoes_sistema_updated_at 
    BEFORE UPDATE ON versoes_sistema 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_config_upload_updated_at 
    BEFORE UPDATE ON config_upload 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Função para incrementar contador de downloads
CREATE OR REPLACE FUNCTION increment_download_count()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.versao_id IS NOT NULL THEN
        UPDATE versoes_sistema 
        SET downloads_count = downloads_count + 1 
        WHERE id = NEW.versao_id;
    END IF;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger para incrementar downloads
CREATE TRIGGER increment_download_trigger
    AFTER INSERT ON logs_download
    FOR EACH ROW EXECUTE FUNCTION increment_download_count();

-- Função para verificar tamanho do arquivo
CREATE OR REPLACE FUNCTION verificar_tamanho_arquivo(
    p_categoria VARCHAR(100),
    p_tamanho_bytes BIGINT
) RETURNS BOOLEAN AS $$
DECLARE
    max_tamanho BIGINT;
BEGIN
    SELECT max_tamanho_bytes INTO max_tamanho
    FROM categorias_arquivos
    WHERE nome = p_categoria AND ativo = TRUE;
    
    IF max_tamanho IS NULL THEN
        RETURN FALSE;
    END IF;
    
    RETURN p_tamanho_bytes <= max_tamanho;
END;
$$ language 'plpgsql';

-- Função para verificar tipo de arquivo
CREATE OR REPLACE FUNCTION verificar_tipo_arquivo(
    p_categoria VARCHAR(100),
    p_nome_arquivo VARCHAR(255)
) RETURNS BOOLEAN AS $$
DECLARE
    extensao VARCHAR(10);
    tipos_permitidos TEXT[];
BEGIN
    extensao := LOWER(SUBSTRING(p_nome_arquivo FROM '\.([^.]*)$'));
    
    SELECT tipos_permitidos INTO tipos_permitidos
    FROM categorias_arquivos
    WHERE nome = p_categoria AND ativo = TRUE;
    
    IF tipos_permitidos IS NULL THEN
        RETURN FALSE;
    END IF;
    
    -- Se permitir todos os tipos
    IF '*' = ANY(tipos_permitidos) THEN
        RETURN TRUE;
    END IF;
    
    -- Verificar se a extensão está na lista
    RETURN ('.' || extensao) = ANY(tipos_permitidos);
END;
$$ language 'plpgsql';

-- Comentários nas tabelas
COMMENT ON TABLE arquivos_upload IS 'Armazena metadados de arquivos uploadados no sistema';
COMMENT ON TABLE versoes_sistema IS 'Controla versões do sistema para diferentes plataformas';
COMMENT ON TABLE categorias_arquivos IS 'Define categorias e regras para upload de arquivos';
COMMENT ON TABLE logs_download IS 'Registra logs de downloads de arquivos e versões';
COMMENT ON TABLE config_upload IS 'Configurações do sistema de upload';
