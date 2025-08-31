# 🔧 Solução para Arquivo de Credenciais Incorreto

## ❌ **Problema Identificado**

O erro **"Arquivo de credenciais do Google Calendar não encontrado"** está ocorrendo porque:

### **1. Caminho Incorreto**
- **Caminho atual**: `C:/Users/thall/Documents/Automatização Relatorios/pomodoro/app2/app_trell`
- **Problema**: Este é um **DIRETÓRIO**, não um **arquivo JSON**
- **Resultado**: O app não consegue encontrar o arquivo de credenciais

### **2. Arquivo Faltando**
- **Esperado**: Arquivo `.json` com credenciais do Google
- **Atual**: Apenas um caminho de diretório
- **Exemplo correto**: `client_secret_123456789-abcdefghijklmnop.apps.googleusercontent.com.json`

## ✅ **Soluções Disponíveis**

### **Opção 1: Corretor Automático (Recomendado)**
```bash
python corrigir_credenciais.py
```

Este script vai:
- ✅ **Identificar** o problema automaticamente
- ✅ **Procurar** por arquivos JSON existentes
- ✅ **Configurar** o arquivo correto automaticamente
- ✅ **Atualizar** as configurações do app

### **Opção 2: Configuração Manual**

#### **Passo 1: Encontrar o Arquivo JSON**
1. **Procure** por arquivos que terminam em `.json`
2. **Locais comuns**:
   - Downloads: `C:/Users/thall/Downloads/`
   - Desktop: `C:/Users/thall/Desktop/`
   - Documentos: `C:/Users/thall/Documents/`
3. **Nomes típicos**:
   - `client_secret_*.json`
   - `google_credentials.json`
   - `credentials.json`

#### **Passo 2: Configurar no App**
1. **Abra as Configurações** no app
2. **Vá para aba "Calendário"**
3. **Clique em "Procurar"** ao lado do campo de credenciais
4. **Selecione** o arquivo `.json` correto
5. **Clique em "Salvar"**

#### **Passo 3: Baixar Novo Arquivo (se necessário)**
1. **Execute**: `python config_google_calendar.py`
2. **Siga** as instruções para baixar credenciais
3. **Configure** o arquivo baixado

## 🔧 **Como Usar o Corretor Automático**

### **1. Execute o Script**
```bash
python corrigir_credenciais.py
```

### **2. Escolha uma Opção**

#### **Opção A: Procurar Arquivo Existente**
- ✅ **Clique em**: "🔍 1. Procurar arquivo JSON existente"
- ✅ **Aguarde** a busca automática
- ✅ **Selecione** o arquivo correto da lista
- ✅ **Confirme** a seleção

#### **Opção B: Baixar Novo Arquivo**
- ✅ **Clique em**: "📥 2. Baixar novo arquivo de credenciais"
- ✅ **Siga** as instruções do configurador
- ✅ **Baixe** o arquivo JSON
- ✅ **Configure** automaticamente

#### **Opção C: Configuração Automática**
- ✅ **Clique em**: "⚙️ 3. Configurar automaticamente"
- ✅ **Aguarde** a busca e configuração
- ✅ **Confirme** se encontrou o arquivo

### **3. Reinicie o App**
- ✅ **Feche** o app completamente
- ✅ **Abra** novamente
- ✅ **Teste** a conexão com Google Calendar

## 📋 **Estrutura Correta do Arquivo**

### **Exemplo de Arquivo Válido**
```json
{
  "installed": {
    "client_id": "123456789-abcdefghijklmnop.apps.googleusercontent.com",
    "project_id": "meu-projeto-calendar",
    "auth_uri": "https://accounts.google.com/o/oauth2/auth",
    "token_uri": "https://oauth2.googleapis.com/token",
    "auth_provider_x509_cert_url": "https://www.googleapis.com/oauth2/v1/certs",
    "client_secret": "GOCSPX-abcdefghijklmnopqrstuvwxyz",
    "redirect_uris": ["http://localhost"]
  }
}
```

### **Verificação de Validade**
- ✅ **Contém** `"installed"` ou `"web"`
- ✅ **Tem** `client_id` e `client_secret`
- ✅ **Termina** com `.json`
- ✅ **É um arquivo**, não um diretório

## 🎯 **Passos de Verificação**

### **1. Verificar Configuração Atual**
```bash
python verificar_credenciais.py
```

### **2. Corrigir Automaticamente**
```bash
python corrigir_credenciais.py
```

### **3. Testar Conexão**
```bash
python test_google_libs.py
```

## 🔍 **Solução de Problemas**

### **Se "Procurar arquivo JSON" não encontrar nada:**
1. **Verifique** se você baixou o arquivo do Google Cloud Console
2. **Procure** em Downloads, Desktop, Documentos
3. **Use** "Baixar novo arquivo" para obter credenciais

### **Se "Configurar automaticamente" falhar:**
1. **Execute** o configurador manual: `python config_google_calendar.py`
2. **Siga** o guia: `GUIA_GOOGLE_CALENDAR.md`
3. **Baixe** um novo arquivo de credenciais

### **Se o arquivo for inválido:**
1. **Verifique** se é um JSON válido
2. **Confirme** que contém credenciais do Google
3. **Baixe** um novo arquivo se necessário

## 🎉 **Resultado Esperado**

Após a correção:

- ✅ **Caminho correto**: `C:/path/to/client_secret_xxx.json`
- ✅ **Arquivo válido**: JSON com credenciais do Google
- ✅ **Configuração salva**: No `settings.json`
- ✅ **Conexão funcionando**: Google Calendar conectado
- ✅ **Sincronização ativa**: Eventos sincronizados

## 🚀 **Comandos Rápidos**

```bash
# 1. Corrigir automaticamente
python corrigir_credenciais.py

# 2. Verificar se funcionou
python verificar_credenciais.py

# 3. Testar bibliotecas
python test_google_libs.py

# 4. Baixar novo arquivo (se necessário)
python config_google_calendar.py
```

**Execute o corretor automático e o problema será resolvido!** 🎯
