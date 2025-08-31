# 🔧 Correção da Integração com Google Calendar

## ❌ Problemas Identificados

### 1. **Autenticação Inconsistente**
- ❌ Não verificava se as bibliotecas estavam instaladas
- ❌ Não suportava dois métodos de autenticação (JSON e ID/Chave)
- ❌ Tratamento de erro inadequado para tokens expirados
- ❌ Falta de validação de credenciais

### 2. **Teste de Conexão Deficiente**
- ❌ Não validava formato do arquivo JSON
- ❌ Não verificava formato do Client ID
- ❌ Falta de tratamento de erros da API
- ❌ Tokens de teste misturados com tokens de produção

### 3. **Configuração Incompleta**
- ❌ Não validava configurações antes de salvar
- ❌ Falta de instruções claras para o usuário
- ❌ Interface confusa para configuração

## ✅ Correções Implementadas

### 1. **Classe GoogleCalendarIntegration Melhorada**

#### Autenticação Robusta:
```python
def authenticate(self):
    """Autentica com Google Calendar API"""
    try:
        # Verificar se as bibliotecas estão disponíveis
        try:
            from google.auth.transport.requests import Request
            from google_auth_oauthlib.flow import InstalledAppFlow
            from googleapiclient.discovery import build
            from googleapiclient.errors import HttpError
            import pickle
        except ImportError as e:
            print(f"❌ Bibliotecas do Google Calendar não disponíveis: {e}")
            messagebox.showerror("Erro", 
                               f"Bibliotecas do Google Calendar não estão instaladas.\n\n"
                               f"Execute: pip install google-auth google-auth-oauthlib google-auth-httplib2 google-api-python-client")
            return False
        
        # Verificar se há credenciais configuradas
        calendar_settings = self.app.settings.get('calendar_integration', {})
        
        if calendar_settings.get('auth_type') == 'json':
            # Usar arquivo JSON
            credentials_file = calendar_settings.get('credentials_file', '')
            if not credentials_file or not os.path.exists(credentials_file):
                messagebox.showwarning(
                    "Configuração Necessária",
                    "Arquivo de credenciais do Google Calendar não encontrado.\n"
                    "Por favor, configure as credenciais nas configurações."
                )
                return False
            
            self.credentials_file = credentials_file
            
        elif calendar_settings.get('auth_type') == 'key':
            # Usar ID e chave privada
            client_id = calendar_settings.get('client_id', '').strip()
            client_secret = calendar_settings.get('client_secret', '').strip()
            
            if not client_id or not client_secret:
                messagebox.showwarning(
                    "Configuração Necessária",
                    "Client ID e Client Secret do Google Calendar não configurados.\n"
                    "Por favor, configure as credenciais nas configurações."
                )
                return False
            
            # Criar arquivo temporário de credenciais
            temp_creds = {
                "installed": {
                    "client_id": client_id,
                    "client_secret": client_secret,
                    "auth_uri": "https://accounts.google.com/o/oauth2/auth",
                    "token_uri": "https://oauth2.googleapis.com/token",
                    "auth_provider_x509_cert_url": "https://www.googleapis.com/oauth2/v1/certs",
                    "redirect_uris": ["http://localhost"]
                }
            }
            
            import tempfile
            import json
            
            with tempfile.NamedTemporaryFile(mode='w', suffix='.json', delete=False) as f:
                json.dump(temp_creds, f)
                self.credentials_file = f.name
        else:
            messagebox.showwarning(
                "Configuração Necessária",
                "Tipo de autenticação do Google Calendar não configurado.\n"
                "Por favor, configure as credenciais nas configurações."
            )
            return False
        
        # Tentar carregar token existente
        if os.path.exists(self.token_file):
            try:
                with open(self.token_file, 'rb') as token:
                    self.credentials = pickle.load(token)
            except Exception as e:
                print(f"Erro ao carregar token: {e}")
                self.credentials = None
        
        # Verificar se as credenciais são válidas
        if not self.credentials or not self.credentials.valid:
            if self.credentials and self.credentials.expired and self.credentials.refresh_token:
                try:
                    self.credentials.refresh(Request())
                except Exception as e:
                    print(f"Erro ao renovar token: {e}")
                    self.credentials = None
            
            # Se ainda não há credenciais válidas, fazer nova autenticação
            if not self.credentials:
                try:
                    flow = InstalledAppFlow.from_client_secrets_file(
                        self.credentials_file, self.SCOPES)
                    self.credentials = flow.run_local_server(port=0)
                    
                    # Salvar token
                    with open(self.token_file, 'wb') as token:
                        pickle.dump(self.credentials, token)
                        
                except Exception as e:
                    print(f"Erro na autenticação OAuth: {e}")
                    messagebox.showerror("Erro", f"Erro na autenticação OAuth:\n{e}")
                    return False
        
        # Criar serviço
        self.service = build('calendar', 'v3', credentials=self.credentials)
        self.is_authenticated = True
        
        print("✅ Autenticação com Google Calendar bem-sucedida!")
        return True
        
    except Exception as e:
        print(f"❌ Erro na autenticação do Google Calendar: {e}")
        messagebox.showerror("Erro", f"Erro na autenticação do Google Calendar:\n{e}")
        return False
```

### 2. **Teste de Conexão Melhorado**

#### Validação de JSON:
```python
def test_json_connection(self):
    """Testa conexão usando arquivo JSON"""
    try:
        # Verificar se as bibliotecas estão instaladas
        try:
            from google.oauth2.credentials import Credentials
            from google_auth_oauthlib.flow import InstalledAppFlow
            from google.auth.transport.requests import Request
            from googleapiclient.discovery import build
            from googleapiclient.errors import HttpError
            import pickle
        except ImportError as e:
            messagebox.showerror("Erro", 
                               f"❌ Bibliotecas não instaladas: {e}\n\n"
                               f"💡 Execute:\n"
                               f"pip install google-auth google-auth-oauthlib google-auth-httplib2 google-api-python-client")
            return
        
        # Verificar arquivo de credenciais
        file_path = self.credentials_file_var.get()
        if not file_path or not os.path.exists(file_path):
            messagebox.showerror("Erro", "❌ Arquivo de credenciais não encontrado!\n\nSelecione um arquivo válido primeiro.")
            return
        
        # Validar formato do arquivo JSON
        try:
            with open(file_path, 'r', encoding='utf-8') as f:
                json_data = json.load(f)
            
            if 'installed' not in json_data:
                messagebox.showerror("Erro", "❌ Formato de arquivo inválido!\n\nO arquivo deve conter credenciais OAuth 2.0 para aplicação instalada.")
                return
                
        except json.JSONDecodeError:
            messagebox.showerror("Erro", "❌ Arquivo JSON inválido!")
            return
        
        # Tentar autenticação
        SCOPES = ['https://www.googleapis.com/auth/calendar']
        
        creds = None
        token_file = os.path.join(self.app.base_dir, 'test_token.pickle')
        
        if os.path.exists(token_file):
            try:
                with open(token_file, 'rb') as token:
                    creds = pickle.load(token)
            except Exception as e:
                print(f"Erro ao carregar token de teste: {e}")
                creds = None
        
        if not creds or not creds.valid:
            if creds and creds.expired and creds.refresh_token:
                try:
                    creds.refresh(Request())
                except Exception as e:
                    print(f"Erro ao renovar token: {e}")
                    creds = None
            
            if not creds:
                try:
                    flow = InstalledAppFlow.from_client_secrets_file(file_path, SCOPES)
                    creds = flow.run_local_server(port=0)
                    
                    # Salvar token de teste
                    with open(token_file, 'wb') as token:
                        pickle.dump(creds, token)
                except Exception as e:
                    messagebox.showerror("Erro", f"❌ Erro na autenticação OAuth:\n\n{e}")
                    return
        
        # Testar API
        service = build('calendar', 'v3', credentials=creds)
        
        try:
            calendar_list = service.calendarList().list().execute()
            calendars = calendar_list.get('items', [])
            
            if calendars:
                self.validation_status_var.set("Status: ✅ Conectado (JSON) - Calendários disponíveis")
                messagebox.showinfo("Sucesso", 
                                  f"🎉 Conexão bem-sucedida!\n\n"
                                  f"📅 Calendários encontrados: {len(calendars)}\n"
                                  f"📝 Primeiro calendário: {calendars[0]['summary']}\n"
                                  f"🔗 Tipo: Arquivo JSON")
            else:
                self.validation_status_var.set("Status: ⚠️ Conectado (JSON) - Nenhum calendário")
                messagebox.showwarning("Aviso", "⚠️ Conexão bem-sucedida, mas nenhum calendário encontrado!")
                
        except HttpError as e:
            error_details = f"Erro {e.resp.status}: {e.content.decode()}"
            self.validation_status_var.set("Status: ❌ Erro de API (JSON)")
            messagebox.showerror("Erro de API", f"❌ Erro na API do Google Calendar:\n\n{error_details}")
            
    except Exception as e:
        self.validation_status_var.set("Status: ❌ Erro de conexão (JSON)")
        messagebox.showerror("Erro de Conexão", f"❌ Erro ao conectar com Google Calendar:\n\n{e}")
```

### 3. **Validação de Configurações**

#### Antes de Salvar:
```python
# Validar configurações do Google Calendar antes de salvar
if calendar_settings['enabled']:
    if calendar_settings['auth_type'] == 'json':
        if not calendar_settings['credentials_file'] or not os.path.exists(calendar_settings['credentials_file']):
            messagebox.showerror("Erro", "❌ Arquivo de credenciais JSON não encontrado!\n\nConfigure um arquivo válido primeiro.")
            return
    elif calendar_settings['auth_type'] == 'key':
        if not calendar_settings['client_id'].strip() or not calendar_settings['client_secret'].strip():
            messagebox.showerror("Erro", "❌ Client ID e Client Secret são obrigatórios!\n\nConfigure as credenciais primeiro.")
            return
    else:
        messagebox.showerror("Erro", "❌ Tipo de autenticação inválido!")
        return
```

## 🆕 Arquivos Criados

### 1. **test_google_calendar_integration.py**
- Testa bibliotecas do Google Calendar
- Verifica integração básica
- Interface de configuração de teste

### 2. **config_google_calendar.py**
- Configurador independente do Google Calendar
- Instalação automática de bibliotecas
- Validação e teste de credenciais
- Interface amigável para configuração

## 🧪 Como Testar

### 1. **Teste Básico:**
```bash
python test_google_calendar_integration.py
```

### 2. **Configurador Independente:**
```bash
python config_google_calendar.py
```

### 3. **No App Principal:**
1. Abra o app20a.py
2. Vá em Configurações → Calendário
3. Configure as credenciais
4. Teste a conexão

## 📋 Checklist de Verificação

- [ ] Bibliotecas do Google Calendar instaladas
- [ ] Credenciais configuradas (JSON ou ID/Chave)
- [ ] Autenticação OAuth funcionando
- [ ] Teste de conexão bem-sucedido
- [ ] Validação de configurações funcionando
- [ ] Sincronização de eventos funcionando
- [ ] Tratamento de erros adequado

## 🔧 Instalação de Bibliotecas

Se as bibliotecas não estiverem instaladas:

```bash
pip install google-auth google-auth-oauthlib google-auth-httplib2 google-api-python-client
```

## 🎯 Resultado Esperado

Após as correções:
- ✅ Autenticação robusta com dois métodos
- ✅ Validação completa de credenciais
- ✅ Teste de conexão confiável
- ✅ Tratamento adequado de erros
- ✅ Interface de configuração melhorada
- ✅ Documentação completa

## 🆘 Solução de Problemas

### Se a autenticação falhar:
1. Verifique se as bibliotecas estão instaladas
2. Confirme se as credenciais estão corretas
3. Verifique se a Google Calendar API está ativada
4. Teste com o configurador independente

### Se o teste de conexão falhar:
1. Verifique o formato do arquivo JSON
2. Confirme se o Client ID termina com `.apps.googleusercontent.com`
3. Verifique se o Client Secret tem pelo menos 10 caracteres
4. Teste a conexão manualmente no console do Google

### Se a sincronização não funcionar:
1. Verifique se a integração está habilitada
2. Confirme se há eventos para sincronizar
3. Verifique os logs de erro
4. Teste a criação manual de eventos
