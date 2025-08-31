# 🚀 Guia Completo: Migração SQLite → PostgreSQL (Supabase)

## 📋 Pré-requisitos

- Python 3.8+
- Conta no Supabase (gratuita)
- Acesso ao banco SQLite atual (`boodesk_new.db`)

## 🔧 Passo 1: Configurar o Supabase

### 1.1 Criar conta no Supabase
1. Acesse [supabase.com](https://supabase.com)
2. Clique em "Start your project"
3. Faça login com GitHub ou Google
4. Clique em "New Project"

### 1.2 Configurar o projeto
1. **Nome do projeto**: `boodesk-app`
2. **Database Password**: Crie uma senha forte (guarde-a!)
3. **Region**: Escolha a mais próxima (ex: São Paulo)
4. Clique em "Create new project"

### 1.3 Obter credenciais
1. No dashboard do Supabase, vá em **Settings** → **Database**
2. Copie as seguintes informações:
   - **Host**: `db.xxxxxxxxxxxxx.supabase.co`
   - **Database name**: `postgres`
   - **Port**: `5432`
   - **User**: `postgres`
   - **Password**: (a senha que você criou)

## 📦 Passo 2: Instalar Dependências

Execute o script de instalação:

```bash
python install_dependencies.py
```

Ou instale manualmente:

```bash
pip install psycopg2-binary python-dotenv
```

## ⚙️ Passo 3: Configurar Credenciais

### 3.1 Editar arquivo de configuração
Abra o arquivo `supabase_setup.py` e substitua as credenciais:

```python
# Substitua pelos seus dados reais do Supabase
self.config = {
    'host': 'db.xxxxxxxxxxxxx.supabase.co',  # Seu host real
    'database': 'postgres',
    'user': 'postgres',
    'password': 'sua_senha_real_aqui',       # Sua senha real
    'port': '5432'
}

# URL e chave do Supabase (opcional, para API REST)
self.supabase_url = "https://xxxxxxxxxxxxx.supabase.co"  # Sua URL real
self.supabase_key = "sua_chave_anon_key_aqui"           # Sua chave real
```

### 3.2 Obter URL e chave (opcional)
1. No Supabase, vá em **Settings** → **API**
2. Copie:
   - **Project URL**: `https://xxxxxxxxxxxxx.supabase.co`
   - **anon public**: `sua_chave_aqui`

## 🗄️ Passo 4: Criar Schema no PostgreSQL

### 4.1 Acessar SQL Editor
1. No Supabase, vá em **SQL Editor**
2. Clique em **New query**

### 4.2 Executar script SQL
1. Abra o arquivo `create_postgres_schema.sql`
2. Copie todo o conteúdo
3. Cole no SQL Editor do Supabase
4. Clique em **Run**

**✅ Resultado esperado:**
- Todas as tabelas criadas
- Índices criados
- Dados padrão inseridos
- Triggers configurados

## 🔄 Passo 5: Migrar Dados

### 5.1 Executar migração
```bash
python migrate_to_postgres.py
```

**✅ Resultado esperado:**
```
🚀 Iniciando migração SQLite → PostgreSQL
==================================================
✅ Conectado ao SQLite
✅ Conectado ao PostgreSQL

🔄 Migrando usuários...
✅ 6 usuários migrados

🔄 Migrando quadros...
✅ 2 quadros migrados

🔄 Migrando cards...
✅ 15 cards migrados

🔄 Migrando anotações...
✅ 8 anotações migradas

==================================================
✅ Migração concluída com sucesso!
🎉 Todos os dados foram migrados para o PostgreSQL/Supabase
```

### 5.2 Verificar migração
No Supabase, vá em **Table Editor** e verifique se os dados estão presentes.

## 🔄 Passo 6: Atualizar Aplicação

### 6.1 Fazer backup do banco atual
```bash
cp boodesk_new.db boodesk_new_backup.db
```

### 6.2 Substituir classe Database
1. Renomeie `database.py` para `database_sqlite_backup.py`
2. Renomeie `database_postgres.py` para `database.py`

### 6.3 Atualizar imports
No arquivo `app23a.py`, certifique-se de que está importando a nova classe:

```python
from database import DatabasePostgres as Database
# ou
from database import db
```

## 🧪 Passo 7: Testar Aplicação

### 7.1 Executar aplicação
```bash
python app23a.py
```

### 7.2 Verificar funcionalidades
- ✅ Login de usuários
- ✅ Carregamento de quadros
- ✅ Visualização de cards
- ✅ Sistema de anotações
- ✅ Configurações de usuário

## 🔧 Passo 8: Configurações Avançadas (Opcional)

### 8.1 Variáveis de ambiente
Crie um arquivo `.env`:

```env
SUPABASE_HOST=db.xxxxxxxxxxxxx.supabase.co
SUPABASE_DB=postgres
SUPABASE_USER=postgres
SUPABASE_PASSWORD=sua_senha_aqui
SUPABASE_PORT=5432
```

### 8.2 Configurar RLS (Row Level Security)
No Supabase, você pode configurar políticas de segurança:

```sql
-- Exemplo: Usuários só veem seus próprios dados
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own data" ON users
    FOR SELECT USING (auth.uid() = id);
```

### 8.3 Configurar backups automáticos
No Supabase:
1. **Settings** → **Database**
2. **Backups** → **Enable automatic backups**

## 🚨 Solução de Problemas

### Erro de conexão
```
❌ Falha ao conectar ao PostgreSQL
```
**Solução:**
1. Verifique as credenciais no `supabase_setup.py`
2. Confirme se o projeto está ativo no Supabase
3. Verifique se o IP não está bloqueado

### Erro de migração
```
❌ Erro ao migrar cards: relation "cards" does not exist
```
**Solução:**
1. Execute novamente o script SQL no Supabase
2. Verifique se todas as tabelas foram criadas

### Erro de importação
```
ModuleNotFoundError: No module named 'psycopg2'
```
**Solução:**
```bash
pip install psycopg2-binary
```

### Erro de permissão
```
permission denied for table users
```
**Solução:**
1. Verifique se o usuário `postgres` tem permissões
2. Execute o script SQL como superuser

## 📊 Vantagens da Migração

### ✅ Performance
- **SQLite**: ~1000 operações/segundo
- **PostgreSQL**: ~10.000+ operações/segundo

### ✅ Escalabilidade
- **SQLite**: Arquivo local, sem concorrência
- **PostgreSQL**: Banco em nuvem, múltiplos usuários

### ✅ Recursos Avançados
- **JSONB**: Melhor performance para dados JSON
- **Índices**: Consultas mais rápidas
- **Triggers**: Atualizações automáticas
- **RLS**: Segurança em nível de linha

### ✅ Backup e Recuperação
- **Backups automáticos**
- **Point-in-time recovery**
- **Replicação geográfica**

## 🔄 Rollback (Se necessário)

Se precisar voltar ao SQLite:

1. **Restaurar backup:**
```bash
cp boodesk_new_backup.db boodesk_new.db
```

2. **Restaurar classe Database:**
```bash
cp database_sqlite_backup.py database.py
```

3. **Reinstalar dependências SQLite:**
```bash
pip install sqlite3
```

## 📞 Suporte

Se encontrar problemas:

1. **Verifique os logs** no terminal
2. **Consulte a documentação** do Supabase
3. **Teste a conexão** com um script simples
4. **Verifique as credenciais** no dashboard

## 🎉 Conclusão

Após seguir todos os passos, você terá:

- ✅ Banco PostgreSQL em nuvem
- ✅ Dados migrados com sucesso
- ✅ Aplicação funcionando
- ✅ Melhor performance e escalabilidade
- ✅ Backup automático
- ✅ Acesso remoto

**🎯 Próximos passos sugeridos:**
1. Configurar monitoramento
2. Implementar cache Redis
3. Configurar CDN para assets
4. Implementar autenticação OAuth





