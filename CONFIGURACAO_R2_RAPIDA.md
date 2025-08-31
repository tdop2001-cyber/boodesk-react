# 🚀 Configuração Rápida - Cloudflare R2

## ✅ **Status Atual**
- **Bucket R2**: ✅ Configurado e funcionando
- **Endpoint**: `https://d20101af9dd64057603c4871abeb1b0c.r2.cloudflarestorage.com`
- **Bucket**: `boodesk-cdn`
- **Sistema Python**: ✅ Funcionando (pasta 32x32)

## 🔧 **Passos para Configurar**

### 1. Obter Credenciais R2
1. Acesse: https://dash.cloudflare.com/
2. Vá em **R2 Object Storage**
3. Clique em **"Manage R2 API tokens"**
4. Crie um novo token ou use um existente
5. Anote o **Access Key ID** e **Secret Access Key**

### 2. Configurar Variáveis de Ambiente

Crie um arquivo `.env` na raiz do projeto:

```env
# Cloudflare R2 Configuration
REACT_APP_R2_ACCESS_KEY_ID=sua_access_key_id_aqui
REACT_APP_R2_SECRET_ACCESS_KEY=sua_secret_access_key_aqui
REACT_APP_R2_BUCKET=boodesk-cdn
REACT_APP_R2_ENDPOINT=https://d20101af9dd64057603c4871abeb1b0c.r2.cloudflarestorage.com
```

### 3. Testar Configuração

Execute o script de teste:

```bash
node test_r2_config.js
```

### 4. Acessar o Sistema

1. Inicie o servidor: `npm start`
2. Acesse: `http://localhost:3000`
3. Vá para **Arquivos** no menu lateral
4. Teste o upload de arquivos

## 📁 **Estrutura de Pastas R2**

```
boodesk-cdn/
├── images/          # Imagens (comprimidas)
├── documents/       # Documentos
├── archives/        # Arquivos compactados
├── uploads/         # Uploads gerais
├── cards/           # Anexos de cards
│   └── {cardId}/
│       └── attachments/
└── avatars/         # Avatares de usuários
```

## 🔒 **Configuração CORS (Opcional)**

Se precisar configurar CORS no bucket:

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

## 🧪 **Teste Rápido**

1. **Upload de imagem**: Teste com uma imagem pequena
2. **Upload de documento**: Teste com um PDF
3. **Visualização**: Verifique se os arquivos aparecem na lista
4. **Download**: Teste o download dos arquivos

## ❓ **Problemas Comuns**

### Erro: "Access Denied"
- Verifique se as credenciais estão corretas
- Confirme se o token tem permissões de leitura/escrita

### Erro: "File too large"
- Ajuste os limites em `MAX_FILE_SIZES`
- Use compressão para imagens

### Erro: "CORS"
- Configure CORS no bucket R2
- Verifique se o domínio está permitido

## 🎯 **Próximos Passos**

1. ✅ Configure as credenciais
2. ✅ Teste o upload
3. ✅ Integre com os cards do Kanban
4. ✅ Configure backup automático (opcional)

---

**💡 Dica**: O sistema já está funcionando no Python (pasta 32x32), então o bucket está configurado corretamente. Você só precisa adicionar suas credenciais de API.
