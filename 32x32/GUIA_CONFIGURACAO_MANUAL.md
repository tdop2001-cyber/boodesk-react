# 🔧 Guia de Configuração Manual do PostgreSQL

## 📋 **Situação Atual:**
- ✅ PostgreSQL 17 instalado e rodando
- ❌ Senha do usuário `postgres` não está correta
- ❌ Banco `boodesk_db` não foi criado

## 🛠️ **Solução Manual:**

### **Passo 1: Conectar ao PostgreSQL**
```bash
# Adicionar PostgreSQL ao PATH (se necessário)
$env:PATH += ";C:\Program Files\PostgreSQL\17\bin"

# Conectar como usuário postgres
psql -U postgres -h localhost
```

### **Passo 2: Executar Comandos SQL**
Quando conectado ao psql, execute estes comandos:

```sql
-- 1. Criar banco de dados
CREATE DATABASE boodesk_db;

-- 2. Criar usuário para a aplicação
CREATE USER boodesk_app WITH PASSWORD 'boodesk123';

-- 3. Conceder privilégios
GRANT ALL PRIVILEGES ON DATABASE boodesk_db TO boodesk_app;

-- 4. Conectar ao banco boodesk_db
\c boodesk_db

-- 5. Criar tabelas básicas
CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(100),
    password_hash VARCHAR(255),
    role VARCHAR(20) DEFAULT 'user',
    cargo VARCHAR(50) DEFAULT 'Usuário',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS boards (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    color VARCHAR(7) DEFAULT '#0079BF',
    owner_id INTEGER REFERENCES users(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS cards (
    id SERIAL PRIMARY KEY,
    board_id INTEGER REFERENCES boards(id),
    title VARCHAR(200) NOT NULL,
    description TEXT,
    status VARCHAR(20) DEFAULT 'to_do',
    importance VARCHAR(20) DEFAULT 'medium',
    due_date DATE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS pomodoro_tasks (
    id SERIAL PRIMARY KEY,
    title VARCHAR(200) NOT NULL,
    description TEXT,
    status VARCHAR(20) DEFAULT 'pending',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 6. Inserir usuário admin padrão
INSERT INTO users (username, email, password_hash, role, cargo) 
VALUES ('admin', 'admin@boodesk.com', 'admin_hash', 'admin', 'Administrador')
ON CONFLICT (username) DO NOTHING;

-- 7. Conceder privilégios nas tabelas
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO boodesk_app;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO boodesk_app;

-- 8. Verificar configuração
SELECT 'Banco configurado com sucesso!' as status;

-- 9. Sair do psql
\q
```

### **Passo 3: Testar a Configuração**
```bash
# Testar conexão com o novo usuário
psql -U boodesk_app -d boodesk_db -h localhost
# Senha: boodesk123

# Verificar tabelas
\dt

# Sair
\q
```

### **Passo 4: Executar Scripts Python**
```bash
# Testar integração
python test_postgresql_integration.py

# Migrar dados (se houver)
python database_migration.py

# Executar o app
python app20a.py
```

## 🔍 **Comandos Úteis do psql:**

- `\l` - Listar bancos de dados
- `\dt` - Listar tabelas
- `\du` - Listar usuários
- `\q` - Sair do psql
- `\c nome_banco` - Conectar a um banco
- `\d nome_tabela` - Descrever estrutura da tabela

## ⚠️ **Se a Senha do postgres Não Funcionar:**

1. **Redefinir senha do postgres:**
   ```bash
   # Parar o serviço
   net stop postgresql-x64-17
   
   # Iniciar em modo single user
   "C:\Program Files\PostgreSQL\17\bin\postgres.exe" --single -D "C:\Program Files\PostgreSQL\17\data" postgres
   
   # No prompt do PostgreSQL, digite:
   ALTER USER postgres PASSWORD 'nova_senha';
   \q
   
   # Reiniciar o serviço
   net start postgresql-x64-17
   ```

2. **Ou usar autenticação trust temporariamente:**
   - Editar `pg_hba.conf` em `C:\Program Files\PostgreSQL\17\data\`
   - Mudar `md5` para `trust` na linha do localhost
   - Reiniciar o serviço

## 🎯 **Próximos Passos Após Configuração:**

1. ✅ Configurar banco
2. ✅ Testar conexão
3. ✅ Migrar dados existentes
4. ✅ Executar aplicação




