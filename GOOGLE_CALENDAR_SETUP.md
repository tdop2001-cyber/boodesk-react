# Configuração da Integração com Google Calendar

Este guia explica como configurar a integração com Google Calendar para criar reuniões automaticamente com Google Meet.

## 📋 Pré-requisitos

1. Conta Google com acesso ao Google Calendar
2. Projeto no Google Cloud Console
3. API do Google Calendar habilitada

## 🚀 Passo a Passo

### 1. Criar Projeto no Google Cloud Console

1. Acesse [Google Cloud Console](https://console.cloud.google.com/)
2. Crie um novo projeto ou selecione um existente
3. Anote o **Project ID** para uso posterior

### 2. Habilitar Google Calendar API

1. No Google Cloud Console, vá para **APIs & Services > Library**
2. Procure por "Google Calendar API"
3. Clique em "Enable"

### 3. Criar Service Account

1. Vá para **APIs & Services > Credentials**
2. Clique em **"Create Credentials"** > **"Service Account"**
3. Preencha os dados:
   - **Name**: `boodesk-calendar-integration`
   - **Description**: `Service account for Boodesk Google Calendar integration`
4. Clique em **"Create and Continue"**
5. Pule as etapas de permissões (Role) e clique em **"Done"**

### 4. Gerar Credenciais

1. Na lista de Service Accounts, clique no que você criou
2. Vá para a aba **"Keys"**
3. Clique em **"Add Key"** > **"Create new key"**
4. Selecione **"JSON"** e clique em **"Create"**
5. O arquivo será baixado automaticamente

### 5. Configurar Permissões do Google Calendar

1. Acesse [Google Calendar](https://calendar.google.com/)
2. Vá em **Settings** (ícone de engrenagem)
3. Na seção **"Share with specific people"**, clique em **"+ Add people"**
4. Adicione o email do Service Account (encontrado no arquivo JSON)
5. Dê permissão **"Make changes to events"**

### 6. Configurar no Boodesk

1. Renomeie o arquivo JSON baixado para `credentials.json`
2. Mova o arquivo para a pasta `public/` do projeto
3. O arquivo deve estar em: `public/credentials.json`

### 7. Estrutura do Arquivo credentials.json

```json
{
  "type": "service_account",
  "project_id": "seu-project-id",
  "private_key_id": "sua-private-key-id",
  "private_key": "-----BEGIN PRIVATE KEY-----\nSUA_CHAVE_PRIVADA_AQUI\n-----END PRIVATE KEY-----\n",
  "client_email": "seu-service-account@seu-project-id.iam.gserviceaccount.com",
  "client_id": "seu-client-id",
  "auth_uri": "https://accounts.google.com/o/oauth2/auth",
  "token_uri": "https://oauth2.googleapis.com/token",
  "auth_provider_x509_cert_url": "https://www.googleapis.com/oauth2/v1/certs",
  "client_x509_cert_url": "https://www.googleapis.com/robot/v1/metadata/x509/seu-service-account%40seu-project-id.iam.gserviceaccount.com"
}
```

## 🔧 Funcionalidades

### Criação de Reuniões
- ✅ Cria eventos no Google Calendar
- ✅ Gera links do Google Meet automaticamente
- ✅ Sincroniza com o calendário principal

### Gerenciamento
- ✅ Edita reuniões existentes
- ✅ Cancela reuniões (remove do Google Calendar)
- ✅ Lista próximas reuniões

### Plataformas Suportadas
- ✅ **Google Meet** (com integração completa)
- ✅ **Zoom** (links simulados)
- ✅ **Microsoft Teams** (links simulados)

## 🛡️ Segurança

### ⚠️ Importante
- **NUNCA** commite o arquivo `credentials.json` no Git
- Adicione `public/credentials.json` ao `.gitignore`
- Mantenha as credenciais seguras e não as compartilhe

### .gitignore
```gitignore
# Google Calendar Credentials
public/credentials.json
```

## 🐛 Troubleshooting

### Erro: "Credenciais não encontradas"
- Verifique se o arquivo `credentials.json` está em `public/`
- Confirme se o nome do arquivo está correto

### Erro: "Não foi possível autenticar"
- Verifique se a API do Google Calendar está habilitada
- Confirme se o Service Account tem permissões no calendário

### Erro: "Erro ao criar reunião"
- Verifique se o Service Account tem permissão "Make changes to events"
- Confirme se o calendário está compartilhado corretamente

## 📞 Suporte

Se encontrar problemas:
1. Verifique os logs no console do navegador
2. Confirme se todas as etapas foram seguidas
3. Teste a API diretamente no Google Cloud Console

## 🔄 Atualizações

Para atualizar as credenciais:
1. Gere um novo arquivo JSON no Google Cloud Console
2. Substitua o arquivo `public/credentials.json`
3. Reinicie a aplicação

---

**Nota**: Esta integração usa Service Account para autenticação. Para uso em produção, considere implementar OAuth 2.0 para autenticação de usuários individuais.




