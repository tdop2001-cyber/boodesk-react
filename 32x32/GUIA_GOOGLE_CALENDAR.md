# 🔑 Guia Completo - Configurar Google Calendar

## 📋 Pré-requisitos

- Conta Google
- Acesso à internet
- Python instalado

## 🚀 Passo a Passo Detalhado

### **Passo 1: Acessar Google Cloud Console**

1. **Abra o navegador** e acesse: https://console.cloud.google.com/
2. **Faça login** com sua conta Google
3. **Aceite os termos** se solicitado

### **Passo 2: Criar/Selecionar Projeto**

1. **No topo da página**, clique no seletor de projetos
2. **Clique em**: "Novo Projeto" ou selecione um existente
3. **Digite um nome** para o projeto (ex: "Pomodoro Calendar")
4. **Clique em**: "Criar"

### **Passo 3: Habilitar Google Calendar API**

1. **No menu lateral esquerdo**, clique em "APIs e Serviços" > "Biblioteca"
2. **Na barra de pesquisa**, digite: "Google Calendar API"
3. **Clique na API** "Google Calendar API"
4. **Clique em**: "Habilitar"

### **Passo 4: Criar Credenciais OAuth 2.0**

1. **No menu lateral**, clique em "APIs e Serviços" > "Credenciais"
2. **Clique em**: "Criar Credenciais" > "ID do Cliente OAuth 2.0"
3. **Se for a primeira vez**, configure a tela de consentimento:
   - **Tipo de usuário**: Externo
   - **Nome do app**: "Pomodoro App"
   - **Email de suporte**: Seu email
   - **Domínio do desenvolvedor**: Seu domínio (ou deixe em branco)
4. **Volte para "Credenciais"** e clique em "Criar Credenciais" > "ID do Cliente OAuth 2.0"
5. **Tipo de aplicativo**: Selecione "Aplicativo da área de trabalho"
6. **Nome**: Digite "Pomodoro Calendar App"
7. **Clique em**: "Criar"

### **Passo 5: Baixar Arquivo JSON**

1. **Após criar as credenciais**, clique no nome do cliente OAuth criado
2. **Na seção "Chaves"**, clique em "Baixar JSON"
3. **Salve o arquivo** com um nome como `credentials.json`
4. **Guarde o arquivo** em um local seguro

## 🛠️ Usando o Configurador Automático

### **Opção 1: Script Automático**

1. **Execute o script**:
   ```bash
   python config_google_calendar.py
   ```

2. **Siga as instruções** na tela
3. **Selecione o arquivo JSON** baixado
4. **Clique em "Salvar Configuração"**

### **Opção 2: Configuração Manual**

1. **Copie o arquivo JSON** para a pasta do app
2. **Renomeie para**: `google_credentials.json`
3. **Configure no app** nas configurações de calendário

## 📁 Estrutura do Arquivo JSON

O arquivo JSON deve ter esta estrutura:

```json
{
  "installed": {
    "client_id": "seu-client-id.apps.googleusercontent.com",
    "project_id": "nome-do-projeto",
    "auth_uri": "https://accounts.google.com/o/oauth2/auth",
    "token_uri": "https://oauth2.googleapis.com/token",
    "auth_provider_x509_cert_url": "https://www.googleapis.com/oauth2/v1/certs",
    "client_secret": "seu-client-secret",
    "redirect_uris": ["http://localhost"]
  }
}
```

## 🔧 Configuração no App

### **1. Abrir Configurações**
1. Execute `python app20a.py`
2. Abra as **Configurações**
3. Vá para a aba **"Calendário"**

### **2. Configurar Credenciais**
1. **Marque**: "Habilitar Integração com Calendário"
2. **Selecione**: "Google Calendar"
3. **Tipo**: "Individual"
4. **Cole o Client ID** do arquivo JSON
5. **Cole o Client Secret** do arquivo JSON

### **3. Testar Conexão**
1. **Clique em "Salvar"**
2. **Teste a sincronização** criando uma tarefa
3. **Verifique se aparece** no Google Calendar

## 🚨 Problemas Comuns

### **Erro: "Arquivo não encontrado"**
- ✅ Verifique se o arquivo JSON está na pasta correta
- ✅ Confirme se o nome está correto: `google_credentials.json`

### **Erro: "Credenciais inválidas"**
- ✅ Verifique se o Client ID está correto
- ✅ Confirme se o Client Secret está correto
- ✅ Certifique-se de que a API está habilitada

### **Erro: "Permissão negada"**
- ✅ Verifique se o projeto tem a API habilitada
- ✅ Confirme se as credenciais são do tipo correto
- ✅ Teste com uma conta Google diferente

### **Erro: "Quota excedida"**
- ✅ Google Calendar API tem limite de 10.000 requisições/dia
- ✅ Para uso intensivo, considere upgrade do projeto

## 📊 Monitoramento

### **Verificar Uso da API**
1. **Google Cloud Console** > "APIs e Serviços" > "Painel"
2. **Selecione**: "Google Calendar API"
3. **Verifique**: Requisições, erros, latência

### **Logs de Erro**
- Os erros aparecem no console do app
- Verifique as mensagens de debug
- Use o modo desenvolvedor para mais detalhes

## 🔒 Segurança

### **Boas Práticas**
- ✅ **Nunca compartilhe** o arquivo JSON
- ✅ **Não commite** credenciais no Git
- ✅ **Use variáveis de ambiente** em produção
- ✅ **Rotacione credenciais** periodicamente

### **Arquivo .gitignore**
Adicione ao `.gitignore`:
```
google_credentials.json
*.json
credentials/
```

## 🎯 Próximos Passos

1. **Teste a integração** criando algumas tarefas
2. **Configure sincronização automática**
3. **Ajuste as configurações** conforme necessário
4. **Monitore o uso** da API

## 🆘 Suporte

Se encontrar problemas:
1. **Verifique os logs** do console
2. **Teste com o script** `config_google_calendar.py`
3. **Confirme as credenciais** no Google Cloud Console
4. **Verifique a documentação** oficial do Google

## 🎉 Sucesso!

Após configurar corretamente, você terá:
- ✅ **Sincronização automática** com Google Calendar
- ✅ **Criação de eventos** a partir de tarefas
- ✅ **Atualização de prazos** em tempo real
- ✅ **Integração completa** com seu fluxo de trabalho
