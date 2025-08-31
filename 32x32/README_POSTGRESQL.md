# 🐘 PostgreSQL para Boodesk

Este guia explica como configurar o PostgreSQL para o aplicativo Boodesk.

## 📋 Pré-requisitos

- Windows 10/11
- Python 3.8+
- PowerShell (como administrador)

## 🚀 Instalação Rápida

### 1. Instalar PostgreSQL

#### Opção A - Download Manual (Recomendado)
1. Acesse: https://www.postgresql.org/download/windows/
2. Baixe a versão mais recente (ex: PostgreSQL 15)
3. Execute o instalador como **administrador**
4. Durante a instalação:
   - Mantenha a porta padrão (5432)
   - **ANOTE A SENHA** do usuário `postgres`
   - Mantenha as opções padrão

#### Opção B - Chocolatey
```powershell
# Instalar Chocolatey primeiro
Set-ExecutionPolicy Bypass -Scope Process -Force; [System.Net.ServicePointManager]::SecurityProtocol = [System.Net.ServicePointManager]::SecurityProtocol -bor 3072; iex ((New-Object System.Net.WebClient).DownloadString('https://community.chocolatey.org/install.ps1'))

# Instalar PostgreSQL
choco install postgresql
```

### 2. Verificar Instalação

Abra PowerShell como administrador e execute:

```powershell
# Verificar se o serviço está rodando
Get-Service -Name "*postgresql*"

# Se não estiver rodando, inicie:
net start postgresql-x64-15
```

### 3. Executar Instalador Automático

```powershell
# Navegar para a pasta do projeto
cd "C:\Users\thall\Documents\Automação Relatorios\pomodoro\app2\app_trello_pomodoro\32x32"

# Executar o instalador
python install_postgresql.py
```

## 🔧 Instalação Manual (Se o automático falhar)

### 1. Instalar Dependências Python

```powershell
pip install psycopg2-binary sqlalchemy alembic
```

### 2. Criar Banco de Dados

```powershell
# Conectar como postgres
psql -U postgres -h localhost

# No prompt do PostgreSQL:
CREATE DATABASE boodesk_db;
CREATE USER boodesk_app WITH PASSWORD 'BoodeskApp2024!';
GRANT ALL PRIVILEGES ON DATABASE boodesk_db TO boodesk_app;
\q
```

### 3. Executar Scripts SQL

```powershell
# Conectar com o usuário da aplicação
psql -U boodesk_app -d boodesk_db -h localhost

# Executar os scripts (copie e cole):
\i create_enums.sql
\i create_boodesk_postgresql.sql
```

## 🧪 Testar Instalação

### Teste Rápido

```powershell
python database_config_postgresql.py
```

### Teste Manual

```powershell
psql -U boodesk_app -d boodesk_db -h localhost

# No PostgreSQL:
SELECT COUNT(*) FROM users;
SELECT * FROM categories;
\dt
\q
```

## 📊 Estrutura do Banco

### Tabelas Principais

- **users** - Usuários do sistema
- **boards** - Quadros de projetos
- **lists** - Listas/colunas dos quadros
- **cards** - Tarefas/cards
- **members** - Membros da equipe
- **subtasks** - Subtarefas
- **dependencies** - Dependências entre cards
- **activity_history** - Histórico de atividades
- **categories** - Categorias de tarefas
- **goals** - Objetivos
- **pomodoro_tasks** - Tarefas do Pomodoro
- **pomodoro_logs** - Logs do Pomodoro
- **meetings** - Reuniões
- **notifications** - Notificações
- **chat_messages** - Mensagens do chat
- **transactions** - Transações financeiras

### Views Úteis

- **v_cards_complete** - Cards com informações completas
- **v_user_stats** - Estatísticas por usuário

## 🔗 Configuração da Aplicação

### Arquivo de Configuração

O arquivo `database_config_postgresql.py` contém:

```python
class DatabaseConfig:
    def __init__(self):
        self.host = 'localhost'
        self.database = 'boodesk_db'
        self.user = 'boodesk_app'
        self.password = 'BoodeskApp2024!'
        self.port = 5432
```

### Usar no Código

```python
from database_config_postgresql import DatabaseConfig

# Conexão direta
config = DatabaseConfig()
connection = config.get_connection()

# SQLAlchemy
engine = config.get_sqlalchemy_engine()
```

## 🛠️ Comandos Úteis

### Gerenciar Serviço PostgreSQL

```powershell
# Iniciar
net start postgresql-x64-15

# Parar
net stop postgresql-x64-15

# Status
Get-Service -Name "*postgresql*"
```

### Backup e Restore

```powershell
# Backup
pg_dump -U boodesk_app -d boodesk_db -h localhost > backup.sql

# Restore
psql -U boodesk_app -d boodesk_db -h localhost < backup.sql
```

### Conectar ao Banco

```powershell
# Como postgres (administrador)
psql -U postgres -h localhost

# Como usuário da aplicação
psql -U boodesk_app -d boodesk_db -h localhost
```

## 🔍 Solução de Problemas

### Erro: "connection to server failed"

1. Verificar se o PostgreSQL está rodando:
   ```powershell
   Get-Service -Name "*postgresql*"
   ```

2. Iniciar o serviço:
   ```powershell
   net start postgresql-x64-15
   ```

### Erro: "authentication failed"

1. Verificar senha do usuário postgres
2. Tentar conectar sem senha (Windows):
   ```powershell
   psql -U postgres -h localhost
   ```

### Erro: "database does not exist"

1. Criar o banco:
   ```sql
   CREATE DATABASE boodesk_db;
   ```

### Erro: "permission denied"

1. Verificar permissões do usuário:
   ```sql
   GRANT ALL PRIVILEGES ON DATABASE boodesk_db TO boodesk_app;
   ```

## 📈 Vantagens do PostgreSQL

- **Performance**: Excelente para consultas complexas
- **JSON nativo**: Suporte completo a JSONB
- **Tipos personalizados**: ENUMs e tipos customizados
- **Transações ACID**: Garantia de integridade
- **Índices avançados**: GIN, GiST, etc.
- **Funções e triggers**: Lógica no banco
- **Escalabilidade**: Suporte a grandes volumes
- **Confiabilidade**: Muito estável e maduro

## 🔄 Migração de Dados

Para migrar dados existentes do sistema de arquivos:

1. **Backup dos dados atuais**:
   - Copie os arquivos JSON/Excel existentes
   - Documente a estrutura atual

2. **Script de migração**:
   ```python
   # Exemplo de migração
   import json
   from database_config_postgresql import DatabaseConfig
   
   config = DatabaseConfig()
   connection = config.get_connection()
   cursor = connection.cursor()
   
   # Ler dados antigos
   with open('dados_antigos.json', 'r') as f:
       dados = json.load(f)
   
   # Inserir no PostgreSQL
   for item in dados:
       cursor.execute("INSERT INTO tabela (campo) VALUES (%s)", (item['valor'],))
   
   connection.commit()
   ```

## 📞 Suporte

Se encontrar problemas:

1. Verificar logs do PostgreSQL
2. Testar conexão manual
3. Verificar permissões de usuário
4. Consultar documentação oficial: https://www.postgresql.org/docs/

## 🎯 Próximos Passos

Após a instalação do PostgreSQL:

1. **Integrar com o app**: Modificar `app20a.py` para usar PostgreSQL
2. **Migrar dados**: Transferir dados existentes
3. **Testar funcionalidades**: Verificar todas as features
4. **Configurar backup**: Implementar backup automático
5. **Otimizar performance**: Ajustar índices conforme necessário
