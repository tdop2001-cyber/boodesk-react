# Migração do App23a: SQLite → PostgreSQL

Este guia explica como migrar o aplicativo Boodesk (app23a) do banco de dados SQLite para PostgreSQL.

## 📋 Pré-requisitos

### 1. Instalar PostgreSQL

#### Windows:
1. Baixe o PostgreSQL do site oficial: https://www.postgresql.org/download/windows/
2. Execute o instalador e siga as instruções
3. Anote a senha do usuário `postgres` que você definir
4. Mantenha a porta padrão (5432)

#### Linux (Ubuntu/Debian):
```bash
sudo apt update
sudo apt install postgresql postgresql-contrib
sudo systemctl start postgresql
sudo systemctl enable postgresql
```

#### macOS:
```bash
brew install postgresql
brew services start postgresql
```

### 2. Instalar psycopg2 (driver Python para PostgreSQL)

```bash
pip install psycopg2-binary
```

### 3. Criar banco de dados

1. Abra o terminal/prompt de comando
2. Conecte ao PostgreSQL:
   ```bash
   psql -U postgres
   ```
3. Crie o banco de dados:
   ```sql
   CREATE DATABASE boodesk_db;
   \q
   ```

## 🚀 Processo de Migração

### Passo 1: Backup do banco SQLite

Antes de começar, faça um backup do seu banco SQLite atual:

```bash
# No Windows
copy boodesk_new.db boodesk_new_backup.db

# No Linux/macOS
cp boodesk_new.db boodesk_new_backup.db
```

### Passo 2: Executar o script de migração

1. Abra o terminal na pasta do projeto
2. Execute o script de migração:

```bash
python migrate_app23a_to_postgresql.py
```

3. O script irá:
   - Solicitar as credenciais do PostgreSQL
   - Criar o esquema do banco (tabelas, tipos ENUM, etc.)
   - Migrar todos os dados do SQLite para PostgreSQL
   - Criar índices para melhorar performance

### Passo 3: Configurar o app23a para usar PostgreSQL

1. Execute o script de configuração:

```bash
python postgres_config.py
```

2. Configure as mesmas credenciais usadas na migração

### Passo 4: Atualizar o app23a

Você precisará modificar o arquivo `_app23a.py` para usar PostgreSQL em vez de SQLite. As principais mudanças são:

1. **Importar a configuração PostgreSQL:**
```python
from postgres_config import PostgreSQLDatabase
```

2. **Substituir conexões SQLite por PostgreSQL:**
```python
# Antes (SQLite)
import sqlite3
conn = sqlite3.connect('boodesk_new.db')

# Depois (PostgreSQL)
from postgres_config import PostgreSQLDatabase
db = PostgreSQLDatabase()
db.connect()
```

3. **Atualizar queries SQL:**
```python
# Antes (SQLite)
cursor.execute("SELECT * FROM users WHERE username = ?", (username,))

# Depois (PostgreSQL)
db.execute_query("SELECT * FROM users WHERE username = %s", (username,))
```

## 📁 Arquivos Criados

- `migrate_app23a_to_postgresql.py` - Script de migração
- `postgres_config.py` - Configuração e classes para PostgreSQL
- `postgres_config.json` - Arquivo com credenciais (criado automaticamente)
- `create_boodesk_postgresql.sql` - Esquema completo do banco

## 🔧 Configuração Manual (Opcional)

Se preferir configurar manualmente:

### 1. Criar o esquema do banco

Execute o arquivo SQL no PostgreSQL:

```bash
psql -U postgres -d boodesk_db -f create_boodesk_postgresql.sql
```

### 2. Configurar credenciais

Edite o arquivo `postgres_config.py` e atualize as configurações:

```python
self.config = {
    'host': 'localhost',
    'database': 'boodesk_db',
    'user': 'postgres',
    'password': 'sua_senha_aqui',
    'port': '5432'
}
```

## 🧪 Testando a Migração

### 1. Testar conexão

```bash
python postgres_config.py
```

### 2. Verificar dados migrados

Conecte ao PostgreSQL e verifique se os dados foram migrados:

```sql
-- Conectar ao banco
psql -U postgres -d boodesk_db

-- Verificar tabelas
\dt

-- Verificar usuários
SELECT COUNT(*) FROM users;

-- Verificar cards
SELECT COUNT(*) FROM cards;

-- Verificar quadros
SELECT COUNT(*) FROM boards;
```

## ⚠️ Problemas Comuns

### 1. Erro de conexão
- Verifique se o PostgreSQL está rodando
- Confirme as credenciais (usuário, senha, host, porta)
- Verifique se o banco `boodesk_db` existe

### 2. Erro de permissão
- Certifique-se de que o usuário tem permissões no banco
- Execute como administrador se necessário

### 3. Erro de tipo ENUM
- Se houver erro com tipos ENUM, execute o script SQL manualmente
- Verifique se a versão do PostgreSQL suporta os tipos usados

### 4. Dados não migrados
- Verifique se o arquivo `boodesk_new.db` existe
- Confirme se o arquivo não está corrompido
- Execute o script de migração novamente

## 🔄 Rollback (Voltar ao SQLite)

Se precisar voltar ao SQLite:

1. Restaure o backup:
```bash
copy boodesk_new_backup.db boodesk_new.db
```

2. Modifique o app23a para usar SQLite novamente

## 📊 Vantagens do PostgreSQL

- **Performance**: Melhor para grandes volumes de dados
- **Concorrência**: Suporte a múltiplos usuários simultâneos
- **Integridade**: Constraints e foreign keys mais robustas
- **Escalabilidade**: Pode crescer com sua aplicação
- **Recursos avançados**: JSONB, full-text search, etc.

## 🆘 Suporte

Se encontrar problemas:

1. Verifique os logs de erro
2. Confirme se todos os pré-requisitos foram atendidos
3. Teste a conexão PostgreSQL separadamente
4. Verifique se o banco SQLite não está corrompido

## 📝 Notas Importantes

- **Backup**: Sempre faça backup antes da migração
- **Teste**: Teste em ambiente de desenvolvimento primeiro
- **Dados**: Verifique se todos os dados foram migrados corretamente
- **Performance**: O PostgreSQL pode ser mais lento inicialmente, mas melhora com o tempo

## 🎯 Próximos Passos

Após a migração bem-sucedida:

1. Teste todas as funcionalidades do app23a
2. Configure backups automáticos do PostgreSQL
3. Monitore a performance
4. Considere otimizações específicas do PostgreSQL

---

**Data de criação**: Dezembro 2024  
**Versão**: 1.0  
**Compatível com**: app23a
