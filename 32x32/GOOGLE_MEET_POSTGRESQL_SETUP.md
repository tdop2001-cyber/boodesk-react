# Google Meet PostgreSQL Integration
====================================

## 🎯 Visão Geral

A integração do Google Meet agora usa **PostgreSQL** em vez de arquivos JSON, oferecendo:

- ✅ **Segurança**: Credenciais armazenadas no banco com criptografia
- ✅ **Multi-usuário**: Cada usuário tem suas próprias credenciais
- ✅ **Centralização**: Tudo gerenciado no banco de dados
- ✅ **Backup**: Credenciais incluídas nos backups do banco
- ✅ **Isolamento**: Row Level Security (RLS) por usuário

## 🚀 Instalação

### 1. Aplicar Migração

Execute o script de migração:

```bash
python apply_google_meet_migration.py
```

### 2. Verificar Instalação

O script irá:
- ✅ Criar tabelas necessárias
- ✅ Configurar funções auxiliares
- ✅ Aplicar políticas RLS
- ✅ Criar dados iniciais

## 📊 Estrutura do Banco

### Tabelas Criadas

#### `google_api_credentials`
Armazena credenciais da API Google por usuário:

```sql
CREATE TABLE google_api_credentials (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id),
    service_name VARCHAR(50), -- 'calendar', 'meet', 'drive', 'gmail'
    client_id VARCHAR(255),
    client_secret VARCHAR(255),
    project_id VARCHAR(255),
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT NOW()
);
```

#### `google_api_tokens`
Armazena tokens de acesso:

```sql
CREATE TABLE google_api_tokens (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id),
    service_name VARCHAR(50),
    access_token TEXT,
    refresh_token TEXT,
    expires_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT NOW()
);
```

#### `google_meet_settings`
Configurações do Google Meet por usuário:

```sql
CREATE TABLE google_meet_settings (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id),
    setting_key VARCHAR(100),
    setting_value JSONB,
    created_at TIMESTAMP DEFAULT NOW()
);
```

#### `google_meet_meetings`
Sincronização de reuniões:

```sql
CREATE TABLE google_meet_meetings (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id),
    local_meeting_id INTEGER REFERENCES meetings(id),
    google_event_id VARCHAR(255),
    google_meet_link TEXT,
    sync_status VARCHAR(20),
    created_at TIMESTAMP DEFAULT NOW()
);
```

## 🔧 Configuração

### 1. Configurar Credenciais

#### Via Interface Gráfica
1. Abra o aplicativo
2. Vá em **Configurações** → **Google Meet**
3. Clique em **"Configurar Credenciais"**
4. Selecione o arquivo `credentials.json` do Google Cloud Console

#### Via Código
```python
from google_meet_postgres_manager import GoogleMeetPostgresManager

# Criar gerenciador para usuário específico
manager = GoogleMeetPostgresManager(user_id=1)

# Configurar credenciais
manager.setup_credentials_from_file("path/to/credentials.json")
```

### 2. Obter Credenciais Google

1. Acesse [Google Cloud Console](https://console.cloud.google.com)
2. Crie um projeto ou selecione existente
3. Ative a **Google Calendar API**
4. Crie credenciais **OAuth 2.0**
5. Baixe o arquivo JSON

## 💻 Uso

### Criar Reunião

```python
from google_meet_postgres_manager import GoogleMeetPostgresManager

# Inicializar gerenciador
manager = GoogleMeetPostgresManager(user_id=1)

# Criar reunião
meeting = manager.create_meeting(
    title="Reunião de Teste",
    date="2024-01-15",
    time_str="14:00",
    duration=60,
    description="Reunião de teste do sistema"
)

if meeting:
    print(f"✅ Reunião criada: {meeting['link']}")
else:
    print("❌ Erro ao criar reunião")
```

### Cancelar Reunião

```python
# Cancelar reunião
success = manager.cancel_meeting("google_event_id_here")
if success:
    print("✅ Reunião cancelada")
```

### Configurações

```python
# Obter configurações
settings = manager.get_meet_settings()
print(f"Duração padrão: {settings.get('default_duration', 60)}")

# Salvar configurações
new_settings = {
    'default_duration': 90,
    'timezone': 'America/Sao_Paulo',
    'notification_minutes': 30
}
manager.save_meet_settings(new_settings)
```

## 🔐 Segurança

### Row Level Security (RLS)

Todas as tabelas têm políticas RLS:

- **Usuário comum**: Vê apenas seus próprios dados
- **Admin**: Acesso a todos os dados
- **Isolamento**: Dados completamente separados por usuário

### Políticas Implementadas

```sql
-- Usuário vê apenas suas credenciais
CREATE POLICY "users_own_credentials" ON google_api_credentials
    FOR ALL USING (user_id = auth.uid());

-- Admin vê todas as credenciais
CREATE POLICY "admin_all_credentials" ON google_api_credentials
    FOR ALL USING (
        EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin')
    );
```

## 🛠️ Funções Auxiliares

### `get_active_google_credentials(user_id, service_name)`
Retorna credenciais ativas do usuário.

### `get_valid_google_token(user_id, service_name)`
Retorna token válido (não expirado).

### `update_google_token(user_id, service_name, access_token, ...)`
Atualiza token de acesso.

## 🔄 Migração do Sistema Antigo

### Antes (Arquivos JSON)
```python
# Sistema antigo
CREDENTIALS_FILE = 'credentials.json'
TOKEN_FILE = 'token.pickle'

# Problemas:
# ❌ Arquivos locais
# ❌ Sem isolamento por usuário
# ❌ Difícil backup
# ❌ Sem segurança
```

### Depois (PostgreSQL)
```python
# Sistema novo
manager = GoogleMeetPostgresManager(user_id=1)
manager.authenticate()  # Usa banco de dados

# Benefícios:
# ✅ Centralizado no banco
# ✅ Isolamento por usuário
# ✅ Backup automático
# ✅ Segurança RLS
```

## 🧪 Testes

### Testar Conexão
```python
# Testar autenticação
if manager.authenticate():
    print("✅ Conexão OK")
else:
    print("❌ Erro na conexão")
```

### Testar Criação de Reunião
```python
# Criar reunião de teste
test_meeting = manager.create_meeting(
    title="Teste",
    date=datetime.now().strftime('%Y-%m-%d'),
    time_str="15:00",
    duration=30
)

if test_meeting:
    print(f"✅ Reunião criada: {test_meeting['link']}")
    # Limpar teste
    manager.cancel_meeting(test_meeting['google_event_id'])
```

## 🐛 Solução de Problemas

### Erro: "Credenciais não encontradas"
1. Verifique se executou a migração
2. Configure credenciais via interface
3. Verifique se o usuário existe

### Erro: "Token expirado"
- O sistema renova automaticamente
- Se persistir, reconfigure credenciais

### Erro: "Permissão negada"
- Verifique políticas RLS
- Confirme se o usuário está autenticado

## 📈 Monitoramento

### Verificar Status
```python
# Verificar se tem credenciais
if manager.has_valid_credentials():
    print("✅ Credenciais configuradas")
else:
    print("❌ Credenciais não configuradas")

# Verificar configurações
settings = manager.get_meet_settings()
print(f"Configurações: {settings}")
```

### Logs
O sistema gera logs detalhados:
- ✅ Operações bem-sucedidas
- ⚠️ Avisos e fallbacks
- ❌ Erros e exceções

## 🔄 Atualizações

### Migração Automática
O sistema detecta automaticamente:
- Se está usando PostgreSQL
- Se precisa migrar dados antigos
- Se há conflitos de configuração

### Compatibilidade
- ✅ Sistema antigo ainda funciona como fallback
- ✅ Migração gradual possível
- ✅ Dados preservados durante migração

## 📚 Recursos Adicionais

### Documentação
- `google_meet_postgres_manager.py` - Código fonte
- `apply_google_meet_migration.py` - Script de migração
- `GOOGLE_MEET_SETUP.md` - Configuração Google Cloud

### Exemplos
- Configuração de credenciais
- Criação de reuniões
- Gerenciamento de configurações
- Tratamento de erros

---

**🎉 Parabéns!** Agora você tem uma integração completa e segura do Google Meet no PostgreSQL!

