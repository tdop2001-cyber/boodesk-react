# 🚀 Guia de Integração: Supabase + Cloudflare R2

Este guia explica como configurar a integração híbrida onde:
- **Supabase**: Banco de dados para metadados dos arquivos
- **Cloudflare R2**: Armazenamento dos arquivos

## 📋 Pré-requisitos

1. ✅ Conta no Supabase
2. ✅ Conta no Cloudflare R2
3. ✅ Credenciais configuradas no `.env`

## 🔧 Configuração do Supabase

### 1. Criar a Tabela de Arquivos

Execute o script SQL no **SQL Editor** do Supabase:

```sql
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
```

### 2. Verificar Configuração

No Supabase Dashboard:
1. Vá para **Table Editor**
2. Verifique se a tabela `files` foi criada
3. Vá para **Authentication > Policies**
4. Verifique se as políticas RLS estão ativas

## 🔧 Configuração do Cloudflare R2

### 1. Verificar Bucket

Certifique-se de que o bucket `boodesk-cdn` existe no R2.

### 2. Configurar CORS (se necessário)

Se houver problemas de CORS, configure no R2:

```json
[
  {
    "AllowedOrigins": ["*"],
    "AllowedMethods": ["GET", "PUT", "POST", "DELETE"],
    "AllowedHeaders": ["*"],
    "MaxAgeSeconds": 3000
  }
]
```

## 🔧 Configuração do React App

### 1. Variáveis de Ambiente

Certifique-se de que o arquivo `.env` contém:

```env
# Supabase
REACT_APP_SUPABASE_URL=https://seu-projeto.supabase.co
REACT_APP_SUPABASE_ANON_KEY=sua-chave-anonima

# Cloudflare R2
REACT_APP_R2_ACCESS_KEY_ID=sua-access-key
REACT_APP_R2_SECRET_ACCESS_KEY=sua-secret-key
```

### 2. Testar Integração

Execute o script de teste:

```bash
node test_supabase_integration.js
```

## 🚀 Como Funciona a Integração

### Fluxo de Upload:

1. **Frontend**: Usuário seleciona arquivo
2. **R2**: Arquivo é enviado para Cloudflare R2
3. **Supabase**: Metadados são salvos no banco
4. **Frontend**: Lista é atualizada

### Fluxo de Listagem:

1. **Frontend**: Solicita lista de arquivos
2. **Supabase**: Retorna metadados dos arquivos
3. **Frontend**: Exibe lista com URLs do R2

### Fluxo de Download:

1. **Frontend**: Usuário clica em download
2. **R2**: Arquivo é baixado diretamente do R2

## 📁 Estrutura de Arquivos

```
src/
├── services/
│   ├── database.ts              # Cliente Supabase
│   ├── uploadService.ts         # Upload para R2
│   └── fileDatabaseService.ts   # Serviço híbrido
├── components/
│   ├── FileUploadSupabase.tsx   # Componente de upload
│   └── FileList.tsx            # Lista de arquivos
└── pages/
    └── FileManager.tsx         # Página principal
```

## 🔍 Testando a Integração

### 1. Teste de Upload

1. Acesse `http://localhost:3000/files`
2. Faça upload de um arquivo
3. Verifique se aparece na lista
4. Verifique se foi salvo no R2
5. Verifique se os metadados estão no Supabase

### 2. Teste de Listagem

1. Recarregue a página
2. Verifique se os arquivos aparecem
3. Teste os filtros (busca, tipo, pasta)

### 3. Teste de Download

1. Clique em "Download" em um arquivo
2. Verifique se o download funciona
3. Verifique se o arquivo está correto

## 🛠️ Troubleshooting

### Erro: "relation 'files' does not exist"

- Execute o script SQL no Supabase
- Verifique se a tabela foi criada

### Erro: "Access denied"

- Verifique as políticas RLS no Supabase
- Verifique se o usuário está autenticado

### Erro: "Failed to fetch"

- Verifique as credenciais do R2
- Verifique se o bucket existe

### Arquivos não aparecem na lista

- Verifique se o `uploaded_by` está correto
- Verifique se as políticas RLS permitem acesso

## 📊 Monitoramento

### Supabase Dashboard

- **Table Editor**: Verificar dados na tabela `files`
- **Logs**: Verificar erros de consulta
- **Authentication**: Verificar usuários logados

### Cloudflare R2 Dashboard

- **Objects**: Verificar arquivos enviados
- **Analytics**: Verificar uso de banda

## 🔒 Segurança

### RLS (Row Level Security)

- Usuários só veem seus próprios arquivos
- Arquivos públicos são visíveis para todos
- Operações são restritas por usuário

### CORS

- Configurado para permitir uploads do frontend
- Restrições podem ser aplicadas conforme necessário

## 📈 Próximos Passos

1. **Implementar autenticação real** com Supabase Auth
2. **Adicionar compressão** de imagens
3. **Implementar cache** para melhor performance
4. **Adicionar backup** automático
5. **Implementar versionamento** de arquivos

## 🆘 Suporte

Se encontrar problemas:

1. Verifique os logs do console
2. Execute o script de teste
3. Verifique as configurações no Supabase
4. Verifique as credenciais do R2
5. Consulte a documentação oficial

---

**🎉 Parabéns!** Sua integração Supabase + R2 está funcionando!
