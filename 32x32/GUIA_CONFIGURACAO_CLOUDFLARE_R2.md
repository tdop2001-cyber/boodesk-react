# 🚀 GUIA DE CONFIGURAÇÃO CLOUDFLARE R2

## 📋 Pré-requisitos

Para fazer upload do `boodesk_latest.exe` para o bucket `boodesk-cdn`, você precisa configurar as credenciais do Cloudflare R2.

## 🔑 Configuração das Credenciais

### 1. Acesse o Cloudflare Dashboard
- Vá para [https://dash.cloudflare.com](https://dash.cloudflare.com)
- Faça login na sua conta

### 2. Configure o R2 Storage
- No menu lateral, clique em **"R2 Object Storage"**
- Se não tiver R2 habilitado, ative-o primeiro

### 3. Crie um Bucket
- Clique em **"Create bucket"**
- Nome do bucket: `boodesk-cdn`
- Clique em **"Create bucket"**

### 4. Crie uma API Token
- No menu lateral, clique em **"My Profile"**
- Vá para **"API Tokens"**
- Clique em **"Create Token"**
- Selecione **"Custom token"**

### 5. Configure as Permissões
```json
{
  "permissions": {
    "Object Storage": {
      "resources": {
        "bucket": {
          "name": "boodesk-cdn"
        }
      },
      "permissions": [
        "Object Read",
        "Object Write",
        "Object Delete"
      ]
    }
  }
}
```

### 6. Obtenha as Credenciais
- **Account ID**: Encontrado no dashboard principal
- **Access Key ID**: Gerado ao criar o token
- **Secret Access Key**: Mostrado apenas uma vez

## ⚙️ Configuração no Projeto

### 1. Edite o arquivo `.env`
Adicione as seguintes variáveis:

```env
# Cloudflare R2 Credentials
R2_ACCESS_KEY_ID=sua_access_key_id_aqui
R2_SECRET_ACCESS_KEY=sua_secret_access_key_aqui
CLOUDFLARE_ACCOUNT_ID=seu_account_id_aqui
```

### 2. Exemplo de configuração:
```env
R2_ACCESS_KEY_ID=abc123def456ghi789
R2_SECRET_ACCESS_KEY=xyz789uvw456rst123
CLOUDFLARE_ACCOUNT_ID=d20101af9dd64057603c4871abeb1b0c
```

## 🚀 Executar o Upload

Após configurar as credenciais, execute:

```bash
python upload_to_cloudflare.py
```

## 📦 Arquivos que serão criados

O script criará automaticamente:

1. **`boodesk_latest.exe`** - Executável principal
2. **`version.json`** - Informações da versão
3. **`changelog.txt`** - Lista de mudanças

## 🔗 URLs de Acesso

Após o upload, os arquivos estarão disponíveis em:

- **Executável**: `https://d20101af9dd64057603c4871abeb1b0c.r2.cloudflarestorage.com/boodesk-cdn/boodesk_latest.exe`
- **Versão**: `https://d20101af9dd64057603c4871abeb1b0c.r2.cloudflarestorage.com/boodesk-cdn/version.json`
- **Changelog**: `https://d20101af9dd64057603c4871abeb1b0c.r2.cloudflarestorage.com/boodesk-cdn/changelog.txt`

## 🎯 Sistema de Atualizações

Com o upload concluído, o sistema de atualizações do Boodesk poderá:

1. **Verificar atualizações** no Cloudflare R2
2. **Baixar automaticamente** a nova versão
3. **Instalar** a atualização
4. **Manter histórico** no banco de dados

## 🔒 Segurança

- As credenciais são armazenadas no arquivo `.env` (não versionado)
- O bucket está configurado para acesso público (apenas leitura)
- Uploads requerem autenticação

## 📞 Suporte

Se precisar de ajuda:
1. Verifique se as credenciais estão corretas
2. Confirme se o bucket `boodesk-cdn` existe
3. Verifique se o R2 está habilitado na sua conta
4. Teste a conectividade com o Cloudflare R2

---

**✅ Após configurar as credenciais, execute novamente o script de upload!**



