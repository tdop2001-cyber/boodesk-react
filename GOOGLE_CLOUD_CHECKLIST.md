# Checklist de Configuração Google Cloud Console

Este checklist garante que todas as configurações necessárias estejam corretas para a integração com Google Meet.

## ✅ **1. APIs Habilitadas**

### **Verificar APIs**
1. Vá em [Google Cloud Console](https://console.cloud.google.com/)
2. Selecione seu projeto: `boodesk-meet-integration`
3. **"APIs e serviços"** → **"APIs habilitadas"**
4. Verifique se estão habilitadas:
   - ✅ **Google Meet API** (nova API REST)
   - ✅ **Google Calendar API**

### **Se não estiverem habilitadas:**
1. Clique em **"+ HABILITAR APIS E SERVIÇOS"**
2. Procure por "Google Meet API"
3. Clique em **"Habilitar"**
4. Repita para "Google Calendar API"

## ✅ **2. Tela de Consentimento OAuth**

### **Configurar Tela de Consentimento**
1. **"APIs e serviços"** → **"Tela de consentimento OAuth"**
2. Selecione **"Externo"** (para contas pessoais)
3. Preencha:
   - **Nome do aplicativo**: "Boodesk Meet Integration"
   - **Email de suporte**: Seu email
   - **Email de contato do desenvolvedor**: Seu email
   - **Domínio do aplicativo**: `localhost`

### **Adicionar Escopos**
1. Clique em **"Adicionar ou remover escopos"**
2. Adicione:
   - `https://www.googleapis.com/auth/meet.spaces`
   - `https://www.googleapis.com/auth/meet.conferenceRecords.readonly`
   - `https://www.googleapis.com/auth/calendar`

### **Adicionar Usuários de Teste**
1. **"Usuários de teste"** → **"Adicionar usuários"**
2. Adicione seu email
3. Clique em **"Salvar"**

## ✅ **3. Credenciais OAuth 2.0**

### **Verificar Credenciais**
1. **"APIs e serviços"** → **"Credenciais"**
2. Clique no seu OAuth 2.0 Client ID
3. Verifique:

#### **Origens JavaScript autorizadas:**
```
http://localhost:3000
```

#### **URIs de redirecionamento autorizados:**
```
http://localhost:3000
http://localhost:3000/callback
```

### **Se precisar atualizar:**
1. Clique em **"Editar"**
2. Adicione as URLs corretas
3. Clique em **"Salvar"**

## ✅ **4. Service Account (Opcional mas Recomendado)**

### **Criar Service Account**
1. **"APIs e serviços"** → **"Credenciais"**
2. **"Criar credenciais"** → **"Conta de serviço"**
3. Configure:
   - **Nome**: `boodesk-meet-service`
   - **Descrição**: `Service account for Google Meet integration`

### **Gerar Chave JSON**
1. Clique na conta de serviço criada
2. **"Chaves"** → **"Adicionar chave"** → **"Criar nova chave"**
3. Selecione **"JSON"**
4. Baixe o arquivo

## ✅ **5. Permissões do Google Workspace**

### **Para Contas Corporativas**
1. Acesse [Google Workspace Admin](https://admin.google.com/)
2. **"Apps"** → **"Google Workspace"** → **"Google Meet"**
3. Configure permissões para o Service Account

### **Para Contas Pessoais**
1. Vá em [Google Cloud Console](https://console.cloud.google.com/)
2. **"APIs e serviços"** → **"Tela de consentimento OAuth"**
3. Adicione seu email como usuário de teste

## ✅ **6. Arquivo credentials.json**

### **Verificar Arquivo**
1. Confirme que `public/credentials.json` existe
2. Verifique se tem o conteúdo correto:

```json
{
  "type": "service_account",
  "project_id": "boodesk-meet-integration",
  "client_id": "519128865980-0r6erkvt88vi263e1ut09qj9lorqdo23.apps.googleusercontent.com",
  "oauth2": {
    "client_id": "519128865980-0r6erkvt88vi263e1ut09qj9lorqdo23.apps.googleusercontent.com",
    "client_secret": "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",
    "redirect_uris": [
      "http://localhost:3000",
      "http://localhost:3000/callback"
    ]
  },
  "meet_api": {
    "enabled": true,
    "scopes": [
      "https://www.googleapis.com/auth/meet.spaces",
      "https://www.googleapis.com/auth/meet.conferenceRecords.readonly",
      "https://www.googleapis.com/auth/calendar"
    ]
  }
}
```

## ✅ **7. Teste de Conexão**

### **Reiniciar Aplicação**
```bash
npm start
```

### **Verificar Status**
1. Acesse: `http://localhost:3000/meetings`
2. Status deve ser: **"Google Conectado"**
3. Console deve mostrar:
   ```
   ✅ Credenciais OAuth 2.0 do Google Meet encontradas
   🔑 Client ID: 519128865980-0r6erkvt88vi263e1ut09qj9lorqdo23.apps.googleusercontent.com
   🔐 Iniciando autenticação OAuth 2.0 com Google Meet API...
   ✅ Autenticação OAuth 2.0 com Google Meet API bem-sucedida!
   ```

### **Teste de Reunião**
1. Clique em **"Nova Reunião"**
2. Configure:
   - **Título**: "Teste Configuração"
   - **Plataforma**: Google Meet
   - **Sincronizar com Google**: ✅ Marcar
3. Clique em **"Criar Reunião"**
4. O link deve funcionar no Google Meet

## ❌ **Problemas Comuns**

### **"Google Desconectado"**
- ❌ APIs não habilitadas
- ❌ Escopos não configurados
- ❌ URLs não autorizadas
- ❌ Usuário não adicionado como teste

### **"Verifique o código da reunião"**
- ❌ API do Google Meet não habilitada
- ❌ Permissões insuficientes
- ❌ Credenciais inválidas

### **Erro de CORS**
- ❌ Origens JavaScript não configuradas
- ❌ URLs de redirecionamento incorretas

## 🔧 **Solução de Problemas**

### **1. Verificar APIs**
```bash
# No Google Cloud Console
# APIs e serviços > APIs habilitadas
# Verificar se Google Meet API está habilitada
```

### **2. Verificar Credenciais**
```bash
# Verificar arquivo credentials.json
ls public/credentials.json
cat public/credentials.json
```

### **3. Verificar Console**
```bash
# No navegador, F12 > Console
# Verificar mensagens de erro
```

### **4. Testar API Diretamente**
```bash
# No Google Cloud Console
# APIs Explorer > Google Meet API
# Testar endpoint /spaces
```

## 🎯 **Status Final Esperado**

Após completar o checklist:
- ✅ **APIs habilitadas**
- ✅ **OAuth configurado**
- ✅ **Credenciais corretas**
- ✅ **Status**: "Google Conectado"
- ✅ **Links funcionais** do Google Meet

---

## 📞 **Suporte**

Se ainda tiver problemas:
1. Verifique cada item do checklist
2. Confirme se todas as APIs estão habilitadas
3. Teste a API diretamente no Google Cloud Console
4. Verifique os logs no console do navegador

