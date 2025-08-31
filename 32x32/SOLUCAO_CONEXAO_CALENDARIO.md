# 🔧 Solução para Problemas de Conexão com Google Calendar

## ❌ Problema Identificado

O arquivo de credenciais está configurado nas configurações, mas o calendário ainda não está conectando. Isso pode ser causado por:

1. **Arquivo de credenciais inválido** ou corrompido
2. **Bibliotecas não instaladas** do Google API
3. **Token de autenticação expirado** ou inválido
4. **Configuração incorreta** no app
5. **Permissões insuficientes** na API

## ✅ Solução Passo a Passo

### **Passo 1: Verificar Credenciais**

Execute o verificador automático:
```bash
python verificar_credenciais.py
```

Este script vai:
- ✅ **Verificar se o arquivo existe**
- ✅ **Analisar a estrutura do JSON**
- ✅ **Testar a conexão** com Google Calendar
- ✅ **Identificar problemas** específicos

### **Passo 2: Instalar Bibliotecas Necessárias**

Se as bibliotecas não estiverem instaladas:
```bash
pip install google-auth google-auth-oauthlib google-auth-httplib2 google-api-python-client
```

### **Passo 3: Verificar Configuração no App**

1. **Abra as Configurações** no app
2. **Vá para aba "Calendário"**
3. **Verifique se o caminho** do arquivo está correto
4. **Confirme que "Habilitar Integração"** está marcado

### **Passo 4: Testar Conexão Manual**

Execute o teste de conexão:
```bash
python verificar_credenciais.py
```

Clique em **"🔄 Testar Conexão"** para verificar se a API está funcionando.

## 🔍 Diagnóstico Específico

### **Se o arquivo não é encontrado:**

1. **Verifique o caminho** nas configurações
2. **Confirme que o arquivo existe** no local especificado
3. **Use o configurador automático**:
   ```bash
   python config_google_calendar.py
   ```

### **Se o arquivo é inválido:**

1. **Baixe um novo arquivo** do Google Cloud Console
2. **Verifique se contém** `installed` ou `web`
3. **Confirme que tem** `client_id` e `client_secret`

### **Se a API não responde:**

1. **Verifique se a API está habilitada** no Google Cloud Console
2. **Confirme as permissões** do projeto
3. **Teste com uma conta diferente**

### **Se o token expirou:**

1. **Delete o arquivo** `token.pickle` (se existir)
2. **Reinicie o app**
3. **Faça nova autenticação**

## 🛠️ Soluções Rápidas

### **Solução 1: Reconfigurar Credenciais**

1. **Execute**: `python config_google_calendar.py`
2. **Selecione o arquivo JSON** correto
3. **Salve a configuração**
4. **Reinicie o app**

### **Solução 2: Verificar Google Cloud Console**

1. **Acesse**: https://console.cloud.google.com/
2. **Selecione o projeto**
3. **Vá para "APIs e Serviços" > "Credenciais"**
4. **Verifique se as credenciais estão ativas**
5. **Confirme que a API Calendar está habilitada**

### **Solução 3: Limpar Cache de Autenticação**

1. **Delete arquivos temporários**:
   ```bash
   # Windows
   del token.pickle
   
   # Linux/Mac
   rm token.pickle
   ```

2. **Reinicie o app**
3. **Faça nova autenticação**

## 📋 Checklist de Verificação

### **Arquivo de Credenciais:**
- [ ] **Arquivo existe** no caminho especificado
- [ ] **Formato JSON válido**
- [ ] **Contém `installed` ou `web`**
- [ ] **Tem `client_id` e `client_secret`**
- [ ] **Projeto ativo** no Google Cloud Console

### **Configuração no App:**
- [ ] **Integração habilitada** nas configurações
- [ ] **Caminho do arquivo** correto
- [ ] **Sincronização automática** ativada
- [ ] **Configurações salvas** corretamente

### **Bibliotecas e Dependências:**
- [ ] **google-auth** instalado
- [ ] **google-auth-oauthlib** instalado
- [ ] **google-auth-httplib2** instalado
- [ ] **google-api-python-client** instalado

### **API e Permissões:**
- [ ] **Google Calendar API** habilitada
- [ ] **Credenciais OAuth 2.0** ativas
- [ ] **Escopo correto** (`https://www.googleapis.com/auth/calendar`)
- [ ] **Projeto tem permissões** suficientes

## 🚨 Problemas Comuns e Soluções

### **Erro: "Arquivo não encontrado"**
```bash
# Solução: Reconfigurar caminho
python config_google_calendar.py
```

### **Erro: "Credenciais inválidas"**
```bash
# Solução: Baixar novo arquivo do Google Cloud Console
# Verificar se a API está habilitada
```

### **Erro: "Bibliotecas não instaladas"**
```bash
# Solução: Instalar dependências
pip install google-auth google-auth-oauthlib google-auth-httplib2 google-api-python-client
```

### **Erro: "Token expirado"**
```bash
# Solução: Limpar cache
rm token.pickle  # Linux/Mac
del token.pickle  # Windows
```

### **Erro: "Permissão negada"**
```bash
# Solução: Verificar Google Cloud Console
# Confirmar que a API está habilitada
# Verificar permissões do projeto
```

## 🧪 Teste Final

Após aplicar as correções:

1. **Execute**: `python verificar_credenciais.py`
2. **Clique em "🔄 Testar Conexão"**
3. **Verifique se aparece**: "Conexão bem-sucedida!"
4. **Teste no app**: Abra o calendário e verifique se sincroniza

## 🆘 Suporte

Se o problema persistir:

1. **Execute o verificador**: `python verificar_credenciais.py`
2. **Compartilhe a saída** do verificador
3. **Inclua mensagens de erro** específicas
4. **Especifique o sistema operacional**

## 🎉 Sucesso!

Após seguir estes passos, o Google Calendar deve conectar corretamente e você verá:

- ✅ **Status**: "Conectado" no app
- ✅ **Sincronização**: Eventos aparecendo no calendário
- ✅ **Criação**: Novos eventos sendo criados automaticamente
- ✅ **Atualização**: Mudanças sincronizadas em tempo real
