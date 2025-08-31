-- Script para criar a tabela de arquivos no Supabase
-- Execute este script no SQL Editor do Supabase

-- Criar tabela de arquivos
CREATE TABLE IF NOT EXISTS files (
    id BIGSERIAL PRIMARY KEY,
    file_id TEXT UNIQUE NOT NULL,
    name TEXT NOT NULL,
    original_name TEXT NOT NULL,
    size BIGINT NOT NULL,
    type TEXT NOT NULL,
    url TEXT NOT NULL,
    r2_key TEXT NOT NULL,
    folder TEXT DEFAULT 'root',
    category TEXT CHECK (category IN ('image', 'document', 'archive', 'other')) DEFAULT 'other',
    uploaded_by BIGINT REFERENCES users(id) ON DELETE SET NULL,
    is_public BOOLEAN DEFAULT true,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Criar índices para melhor performance
CREATE INDEX IF NOT EXISTS idx_files_uploaded_by ON files(uploaded_by);
CREATE INDEX IF NOT EXISTS idx_files_folder ON files(folder);
CREATE INDEX IF NOT EXISTS idx_files_category ON files(category);
CREATE INDEX IF NOT EXISTS idx_files_created_at ON files(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_files_name ON files USING gin(to_tsvector('portuguese', name));
CREATE INDEX IF NOT EXISTS idx_files_original_name ON files USING gin(to_tsvector('portuguese', original_name));

-- Criar função para atualizar updated_at automaticamente
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Criar trigger para atualizar updated_at
CREATE TRIGGER update_files_updated_at 
    BEFORE UPDATE ON files 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- Configurar RLS (Row Level Security)
ALTER TABLE files ENABLE ROW LEVEL SECURITY;

-- Política para usuários autenticados verem seus próprios arquivos
CREATE POLICY "Users can view their own files" ON files
    FOR SELECT USING (auth.uid()::bigint = uploaded_by);

-- Política para usuários autenticados verem arquivos públicos
CREATE POLICY "Users can view public files" ON files
    FOR SELECT USING (is_public = true);

-- Política para usuários autenticados inserirem seus próprios arquivos
CREATE POLICY "Users can insert their own files" ON files
    FOR INSERT WITH CHECK (auth.uid()::bigint = uploaded_by);

-- Política para usuários autenticados atualizarem seus próprios arquivos
CREATE POLICY "Users can update their own files" ON files
    FOR UPDATE USING (auth.uid()::bigint = uploaded_by);

-- Política para usuários autenticados deletarem seus próprios arquivos
CREATE POLICY "Users can delete their own files" ON files
    FOR DELETE USING (auth.uid()::bigint = uploaded_by);

-- Comentários para documentação
COMMENT ON TABLE files IS 'Tabela para armazenar metadados de arquivos enviados para o R2';
COMMENT ON COLUMN files.file_id IS 'Identificador único do arquivo (chave no R2)';
COMMENT ON COLUMN files.r2_key IS 'Chave do arquivo no Cloudflare R2';
COMMENT ON COLUMN files.folder IS 'Pasta onde o arquivo está organizado';
COMMENT ON COLUMN files.category IS 'Categoria do arquivo: image, document, archive, other';
COMMENT ON COLUMN files.uploaded_by IS 'ID do usuário que fez o upload';
COMMENT ON COLUMN files.is_public IS 'Se o arquivo é público ou privado';
COMMENT ON COLUMN files.metadata IS 'Metadados adicionais do arquivo em formato JSON';
