# 🔑 GUIA COMPLETO - CONFIGURAÇÃO GOOGLE CALENDAR

## 📋 VISÃO GERAL

Este guia explica como configurar a integração com Google Calendar no sistema Boodesk. A integração permite:

- ✅ **Sincronização automática** de eventos
- ✅ **Criação de eventos** no Google Calendar
- ✅ **Integração com emails** cadastrados
- ✅ **Sincronização bidirecional** (Boodesk ↔ Google Calendar)
- ✅ **Lembretes automáticos** por email

---

## 🚀 PASSO A PASSO - CONFIGURAÇÃO

### **📱 PASSO 1: Acessar o Sistema**

1. **Execute o aplicativo**:
   ```bash
   python app23a.py
   ```

2. **Acesse as configurações**:
   - Clique em **"Configurações"** no menu principal
   - Ou use o atalho: **Ctrl + ,**

3. **Vá para a aba "Calendário"**:
   - Clique na aba **"Calendário"** nas configurações

### **🌐 PASSO 2: Configurar Google Cloud Console**

#### **2.1 Acessar Google Cloud Console**
1. **Abra o navegador** e acesse: https://console.cloud.google.com/
2. **Faça login** com sua conta Google
3. **Aceite os termos** se solicitado

#### **2.2 Criar/Selecionar Projeto**
1. **No topo da página**, clique no seletor de projetos
2. **Clique em**: "Novo Projeto" ou selecione um existente
3. **Digite um nome** para o projeto (ex: "Boodesk Calendar")
4. **Clique em**: "Criar"

#### **2.3 Habilitar Google Calendar API**
1. **No menu lateral esquerdo**, clique em "APIs e Serviços" > "Biblioteca"
2. **Na barra de pesquisa**, digite: "Google Calendar API"
3. **Clique na API** "Google Calendar API"
4. **Clique em**: "Habilitar"

#### **2.4 Configurar Tela de Consentimento OAuth**
1. **No menu lateral**, clique em "APIs e Serviços" > "Tela de consentimento OAuth"
2. **Selecione**: "Externo" (se não for organização Google Workspace)
3. **Preencha os campos**:
   - **Nome do app**: "Boodesk Calendar Integration"
   - **Email de suporte**: Seu email
   - **Domínio do desenvolvedor**: Seu domínio (ou deixe em branco)
4. **Clique em**: "Salvar e continuar"
5. **Pule as seções** de escopos e usuários de teste
6. **Clique em**: "Salvar e continuar"

#### **2.5 Criar Credenciais OAuth 2.0**
1. **No menu lateral**, clique em "APIs e Serviços" > "Credenciais"
2. **Clique em**: "Criar Credenciais" > "ID do Cliente OAuth 2.0"
3. **Tipo de aplicativo**: Selecione "Aplicativo da área de trabalho"
4. **Nome**: Digite "Boodesk Desktop App"
5. **Clique em**: "Criar"

#### **2.6 Baixar Credenciais**
1. **Após criar as credenciais**, clique no nome do cliente OAuth criado
2. **Na seção "Chaves"**, clique em "Baixar JSON"
3. **Salve o arquivo** com um nome como `google_credentials.json`
4. **Guarde o arquivo** em um local seguro

### **⚙️ PASSO 3: Configurar no Boodesk**

#### **3.1 Habilitar Integração**
1. **Na aba "Calendário"** das configurações
2. **Marque a caixa**: "Habilitar Integração com Google Calendar"

#### **3.2 Escolher Método de Autenticação**

**OPÇÃO A: Arquivo JSON (Recomendado)**
1. **Selecione**: "Arquivo JSON"
2. **Clique em "Procurar"**
3. **Selecione** o arquivo `google_credentials.json` baixado
4. **O caminho aparecerá** no campo

**OPÇÃO B: ID e Chave Privada**
1. **Selecione**: "ID e Chave Privada"
2. **Abra o arquivo JSON** baixado
3. **Copie o "client_id"** e cole no campo "Client ID"
4. **Copie o "client_secret"** e cole no campo "Client Secret"

#### **3.3 Configurar Sincronização**
1. **Marque**: "Sincronizar automaticamente"
2. **Marque**: "Sincronizar cartões com prazo"
3. **Marque**: "Sincronizar eventos do calendário"

#### **3.4 Salvar Configurações**
1. **Clique em "Salvar"** na parte inferior
2. **Aguarde** a confirmação de salvamento

### **🔗 PASSO 4: Testar a Integração**

#### **4.1 Primeira Autenticação**
1. **Crie um evento** no sistema ou Google Calendar
2. **O navegador abrirá** automaticamente
3. **Faça login** com sua conta Google
4. **Autorize o aplicativo** a acessar seu Google Calendar
5. **Clique em "Permitir"**

#### **4.2 Verificar Sincronização**
1. **Crie um cartão** com data de vencimento no Boodesk
2. **Verifique** se aparece no Google Calendar
3. **Crie um evento** no Google Calendar
4. **Verifique** se aparece no Boodesk

---

## 📊 ESTRUTURA DO ARQUIVO JSON

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

---

## 🔧 CONFIGURAÇÕES AVANÇADAS

### **📅 Configurações de Sincronização**

#### **Sincronização Automática**
- **Ativada**: Eventos são sincronizados automaticamente
- **Desativada**: Sincronização manual apenas

#### **Sincronização de Cartões**
- **Cartões com prazo**: Aparecem como eventos no Google Calendar
- **Cores por prioridade**: 
  - 🔴 Alta: Vermelho
  - 🟡 Normal: Amarelo  
  - 🔵 Baixa: Azul

#### **Sincronização de Eventos**
- **Eventos do Google Calendar**: Aparecem no Boodesk
- **Integração com emails**: Usa emails cadastrados no sistema

### **📧 Integração com Emails**

#### **Emails Automáticos**
1. **Acesse**: Usuários → Gerenciar Emails
2. **Cadastre emails** com categorias
3. **Configure** quais categorias usar em eventos
4. **Sistema usará** automaticamente nos eventos

#### **Categorias de Email**
- **Padrão**: Usado em eventos gerais
- **Notificações**: Para lembretes automáticos
- **Relatórios**: Para relatórios semanais/mensais
- **Administração**: Para comunicações administrativas

---

## 🚨 SOLUÇÃO DE PROBLEMAS

### **❌ Erro: "Arquivo não encontrado"**
```
✅ Verificar se o arquivo JSON está na pasta correta
✅ Confirme se o nome está correto
✅ Verifique se o arquivo não está corrompido
```

### **❌ Erro: "Credenciais inválidas"**
```
✅ Verificar se o Client ID está correto
✅ Confirme se o Client Secret está correto
✅ Certifique-se de que a API está habilitada
✅ Verifique se o projeto está selecionado
```

### **❌ Erro: "Permissão negada"**
```
✅ Verificar se o projeto tem a API habilitada
✅ Confirme se as credenciais são do tipo correto
✅ Verifique se a tela de consentimento está configurada
```

### **❌ Erro: "Bibliotecas não encontradas"**
```
✅ Execute: pip install google-auth google-auth-oauthlib google-auth-httplib2 google-api-python-client
✅ Reinicie o aplicativo após instalar
```

### **❌ Erro: "Token expirado"**
```
✅ Delete o arquivo token.pickle se existir
✅ Refaça a autenticação
✅ Verifique se as credenciais ainda são válidas
```

---

## 🔄 FUNCIONALIDADES DISPONÍVEIS

### **📅 Criação de Eventos**
- **Eventos manuais**: Crie eventos diretamente no sistema
- **Eventos automáticos**: Cartões com prazo viram eventos
- **Lembretes**: Notificações por email e popup
- **Participantes**: Adicione emails automaticamente

### **🔄 Sincronização Bidirecional**
- **Boodesk → Google Calendar**: Cartões e eventos criados no sistema
- **Google Calendar → Boodesk**: Eventos criados no Google Calendar
- **Atualizações**: Mudanças sincronizadas automaticamente

### **📧 Integração com Email**
- **Convites automáticos**: Enviados para participantes
- **Lembretes**: Notificações por email
- **Relatórios**: Envio automático de relatórios

### **🎯 Categorização**
- **Por prioridade**: Cores diferentes no Google Calendar
- **Por tipo**: Eventos, reuniões, prazos
- **Por projeto**: Organização por quadros

---

## 📈 PRÓXIMAS MELHORIAS

### **🚀 Funcionalidades Planejadas**
- [ ] **Templates de evento** personalizáveis
- [ ] **Agendamento inteligente** de reuniões
- [ ] **Integração com Google Meet**
- [ ] **Relatórios avançados** de uso
- [ ] **Sincronização com outros calendários**

### **🔧 Melhorias Técnicas**
- [ ] **Cache inteligente** para performance
- [ ] **Sincronização em tempo real**
- [ ] **Backup automático** de configurações
- [ ] **Logs detalhados** de sincronização

---

## 📞 SUPORTE

### **🆘 Como Obter Ajuda**
```
1. Verificar este guia
2. Executar: python test_calendar_integration.py
3. Verificar logs do sistema
4. Contatar suporte técnico
```

### **📋 Informações Úteis**
- **Arquivo de teste**: `test_calendar_integration.py`
- **Token salvo**: `google_calendar_token.pickle`
- **Configurações**: Salvas no banco PostgreSQL
- **Logs**: Console do aplicativo

---

## 🎉 CONCLUSÃO

A integração com Google Calendar está **100% funcional** e permite sincronização completa entre o Boodesk e o Google Calendar. 

**✅ Sistema pronto para uso em produção!**

### **💡 DICAS IMPORTANTES**
- **Mantenha as credenciais seguras**
- **Faça backup das configurações**
- **Teste regularmente** a sincronização
- **Monitore os logs** para problemas
- **Atualize as bibliotecas** quando necessário


