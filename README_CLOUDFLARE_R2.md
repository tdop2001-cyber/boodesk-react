# Configuração do Cloudflare R2 para Upload de Arquivos

## 📋 Pré-requisitos

1. Conta no Cloudflare
2. Bucket R2 criado
3. Credenciais de API (Access Key ID e Secret Access Key)

## 🔧 Configuração

### 1. Bucket R2 já configurado

✅ **Bucket já existe e está configurado:**
- **Endpoint**: `https://d20101af9dd64057603c4871abeb1b0c.r2.cloudflarestorage.com`
- **Bucket**: `boodesk-cdn`
- **Status**: Ativo e funcionando

O bucket já está configurado e sendo usado pelo sistema Python na pasta 32x32.

### 2. Criar Credenciais de API

1. No Cloudflare Dashboard, vá para "R2 Object Storage"
2. Clique em "Manage R2 API tokens"
3. Clique em "Create API token"
4. Configure as permissões:
   - **Permissions**: Object Read & Write
   - **Resources**: Specific bucket - `boodesk-cdn`
5. Salve o Access Key ID e Secret Access Key

### 3. Configurar Variáveis de Ambiente

Adicione as seguintes variáveis ao seu arquivo `.env`:

```env
# Cloudflare R2 Configuration
REACT_APP_R2_ACCESS_KEY_ID=sua_access_key_id_aqui
REACT_APP_R2_SECRET_ACCESS_KEY=sua_secret_access_key_aqui
REACT_APP_R2_BUCKET=boodesk-cdn
REACT_APP_R2_ENDPOINT=https://d20101af9dd64057603c4871abeb1b0c.r2.cloudflarestorage.com
```

**Nota**: O bucket e endpoint já estão configurados. Você só precisa adicionar suas credenciais de API (Access Key ID e Secret Access Key).

### 4. Configuração do Bucket

#### Configuração CORS (Cross-Origin Resource Sharing)

Para permitir uploads diretos do navegador, configure o CORS no seu bucket:

```json
[
  {
    "AllowedOrigins": ["http://localhost:3000", "https://seu-dominio.com"],
    "AllowedMethods": ["GET", "PUT", "POST", "DELETE"],
    "AllowedHeaders": ["*"],
    "MaxAgeSeconds": 3000
  }
]
```

#### Política de Bucket (Opcional)

Para controle de acesso mais granular:

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Sid": "PublicReadGetObject",
      "Effect": "Allow",
      "Principal": "*",
      "Action": "s3:GetObject",
      "Resource": "arn:aws:s3:::boodesk-cdn/*"
    }
  ]
}
```

## 🚀 Funcionalidades Implementadas

### Upload de Arquivos
- ✅ Drag & drop
- ✅ Múltiplos arquivos
- ✅ Validação de tipo e tamanho
- ✅ Preview de imagens
- ✅ Compressão automática de imagens
- ✅ Progresso em tempo real

### Gerenciamento
- ✅ Lista de arquivos
- ✅ Busca e filtros
- ✅ Visualização em grid/lista
- ✅ Download de arquivos
- ✅ Exclusão de arquivos
- ✅ URLs assinadas para download privado

### Tipos de Arquivo Suportados

#### Imagens
- JPEG, PNG, GIF, WebP
- Tamanho máximo: 10MB
- Compressão automática

#### Documentos
- PDF, DOC, DOCX
- Tamanho máximo: 50MB

#### Planilhas
- XLS, XLSX
- Tamanho máximo: 50MB

#### Apresentações
- PPT, PPTX
- Tamanho máximo: 100MB

#### Arquivos Compactados
- ZIP, RAR, 7Z
- Tamanho máximo: 200MB

## 📁 Estrutura de Pastas

```
boodesk-cdn/
├── images/          # Imagens (comprimidas)
├── documents/       # Documentos
├── archives/        # Arquivos compactados
├── uploads/         # Uploads gerais
└── avatars/         # Avatares de usuários
```

## 🔒 Segurança

### URLs Públicas vs Privadas
- **URLs Públicas**: Para imagens e arquivos que podem ser acessados diretamente
- **URLs Assinadas**: Para arquivos privados, com expiração configurável

### Validação de Arquivos
- Verificação de tipo MIME
- Limite de tamanho por categoria
- Sanitização de nomes de arquivo
- Geração de nomes únicos

## 🛠️ Uso no Código

### Upload Simples
```typescript
import { uploadService } from '../services/uploadService';

const result = await uploadService.uploadFile({
  file: selectedFile,
  folder: 'images'
});
```

### Upload com Compressão
```typescript
const result = await uploadService.uploadImageWithCompression(
  imageFile,
  'images',
  0.8 // qualidade
);
```

### Download Privado
```typescript
const downloadUrl = await uploadService.getSignedDownloadUrl(
  'documents/arquivo.pdf',
  3600 // expira em 1 hora
);
```

### Deletar Arquivo
```typescript
const success = await uploadService.deleteFile('images/logo.png');
```

## 📊 Monitoramento

### Métricas Importantes
- Total de arquivos
- Tamanho total usado
- Uploads por dia
- Downloads por dia
- Erros de upload

### Logs
- Todos os uploads são logados com metadados
- Erros são capturados e reportados
- Performance é monitorada

## 🔧 Troubleshooting

### Erro: "Access Denied"
- Verifique as credenciais de API
- Confirme as permissões do bucket
- Verifique a configuração CORS

### Erro: "File too large"
- Ajuste os limites em `MAX_FILE_SIZES`
- Configure compressão para imagens
- Considere chunked upload para arquivos grandes

### Erro: "Invalid file type"
- Verifique `ALLOWED_FILE_TYPES`
- Confirme o MIME type do arquivo
- Adicione novos tipos se necessário

## 📈 Otimizações

### Performance
- Compressão automática de imagens
- Lazy loading de previews
- Cache de URLs assinadas
- Upload em chunks para arquivos grandes

### Custo
- Compressão reduz uso de banda
- URLs assinadas com expiração
- Limpeza automática de arquivos temporários
- Monitoramento de uso

## 🔄 Backup e Recuperação

### Backup Automático
- Configurar backup do bucket R2
- Retenção de versões antigas
- Replicação cross-region (se necessário)

### Recuperação
- Procedimentos de restore
- Validação de integridade
- Testes de recuperação regulares

## 📞 Suporte

Para problemas específicos:
1. Verifique os logs do console
2. Confirme a configuração CORS
3. Teste as credenciais de API
4. Verifique os limites do bucket

---

**Nota**: Mantenha suas credenciais seguras e nunca as compartilhe no código fonte público.
