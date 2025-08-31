# 🗄️ Guia de Visualização do Banco PostgreSQL

## 📊 **OPÇÕES PARA VISUALIZAR O BANCO**

### 1. 🐍 **Script Python (RECOMENDADO)**
```bash
python visualizar_banco_simples.py
```
**Vantagens:**
- ✅ Já funciona
- ✅ Mostra todas as tabelas
- ✅ Exibe estrutura e dados
- ✅ Não precisa instalar nada

### 2. 🌐 **pgAdmin (Interface Web)**
- **URL:** http://localhost:5050
- **Download:** https://www.pgadmin.org/download/pgadmin-4-windows/
- **Configuração:**
  - Host: localhost
  - Port: 5432
  - Database: boodesk_db
  - Username: boodesk_app
  - Password: boodesk123

### 3. 🦫 **DBeaver (Interface Desktop)**
- **Download:** https://dbeaver.io/download/
- **Configuração:**
  - Host: localhost
  - Port: 5432
  - Database: boodesk_db
  - Username: boodesk_app
  - Password: boodesk123

### 4. 💻 **psql (Terminal)**
```bash
psql -h localhost -p 5432 -U boodesk_app -d boodesk_db
```
**Comandos úteis:**
- `\dt` - Listar tabelas
- `\d nome_tabela` - Ver estrutura da tabela
- `SELECT * FROM users;` - Ver usuários
- `\q` - Sair

## 📋 **ESTRUTURA ATUAL DO BANCO**

### Tabelas criadas:
1. **users** - Usuários do sistema
2. **boards** - Quadros/Kanban
3. **lists** - Listas dentro dos quadros
4. **cards** - Cartões/Tarefas
5. **comments** - Comentários nos cartões
6. **attachments** - Anexos dos cartões
7. **pomodoro_tasks** - Tarefas do Pomodoro

### Dados atuais:
- ✅ **users**: 1 registro (admin)
- 📭 **outras tabelas**: Vazias (normal para banco novo)

## 🔧 **CONFIGURAÇÃO DE CONEXÃO**

```
Host: localhost
Port: 5432
Database: boodesk_db
Username: boodesk_app
Password: boodesk123
```

## 🚀 **COMO USAR**

### Opção 1: Script Python (Mais Fácil)
```bash
python visualizar_banco_simples.py
```

### Opção 2: pgAdmin
1. Baixe e instale o pgAdmin
2. Abra http://localhost:5050
3. Configure a conexão com os dados acima

### Opção 3: DBeaver
1. Baixe e instale o DBeaver
2. Crie nova conexão PostgreSQL
3. Use os dados de configuração acima

## 📊 **O QUE VOCÊ VERÁ**

### Estrutura das Tabelas:
- **users**: id, username, email, password_hash, role, cargo, created_at, updated_at
- **boards**: id, name, description, color, owner_id, is_archived, created_at, updated_at
- **lists**: id, board_id, name, position, is_archived, created_at, updated_at
- **cards**: id, board_id, list_id, title, description, status, importance, due_date, position, is_archived, assignee_id, created_by, created_at, updated_at
- **comments**: id, card_id, user_id, content, created_at, updated_at
- **attachments**: id, card_id, filename, file_path, file_size, mime_type, created_at
- **pomodoro_tasks**: id, title, description, status, created_at, updated_at

### Dados Atuais:
- 1 usuário admin criado
- Todas as outras tabelas estão vazias (prontas para receber dados)

## 🎯 **RECOMENDAÇÃO**

**Use o script Python** (`python visualizar_banco_simples.py`) pois:
- ✅ Funciona imediatamente
- ✅ Não precisa instalar nada
- ✅ Mostra todas as informações importantes
- ✅ Interface clara e organizada

---

**Status**: ✅ **BANCO CONFIGURADO E PRONTO PARA USO**



